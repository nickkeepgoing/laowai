/**
 * ที่เก็บข้อมูล — มี 2 โหมดอัตโนมัติ
 *
 *   มี Supabase  → เก็บจริงในฐานข้อมูล + Storage
 *   ไม่มี        → เก็บใน memory (หายเมื่อ restart) แต่ flow ทั้งหมดยังวิ่งครบ
 *
 * ทำแบบนี้เพื่อให้ไม่มีใครถูก block: ศิลปรันเว็บได้ตั้งแต่นาทีแรก
 * และถ้าวันแข่ง Supabase ล่ม เราสลับกลับมาโหมด memory ได้ทันทีโดยไม่ต้องแก้โค้ด
 */

import type { Chapter, Clip, Correction, Session } from "./types";
import { AUDIO_BUCKET } from "./env";
import { currentUser, supabaseServer } from "./supabase/server";

/**
 * client ที่ผูกกับ cookie ของผู้ใช้ที่กำลังเรียกเข้ามา
 * ทำให้ RLS ที่อิง auth.uid() ทำงานได้จริง แทนที่จะวิ่งด้วย anon แบบไร้ตัวตน
 */
const sb = supabaseServer;

/** id ของผู้ใช้ที่ล็อกอินอยู่ — null ได้ เพราะเรายอมให้ลองใช้โดยไม่ล็อกอิน */
export async function currentUserId(): Promise<string | null> {
  return (await currentUser())?.id ?? null;
}

/* ── in-memory fallback (ใช้ globalThis เพื่อให้รอด hot reload ของ dev server) ── */
type Mem = {
  sessions: Session[];
  clips: Clip[];
  chapters: Chapter[];
  corrections: Correction[];
};
const g = globalThis as unknown as { __laowai?: Mem };
const mem: Mem = (g.__laowai ??= {
  sessions: [],
  clips: [],
  chapters: [],
  corrections: [],
});

const rid = () => Math.random().toString(36).slice(2, 10);
export const newToken = () =>
  Array.from({ length: 3 }, () => Math.random().toString(36).slice(2, 10)).join("");

/* ── เสียง ── */

/**
 * อัปโหลดไฟล์เสียงแล้วคืน URL สาธารณะ
 * ไม่มี Supabase → คืน data URL (ใหญ่แต่ใช้ได้ สำหรับ dev เท่านั้น)
 */
export async function putAudio(file: Blob, name: string): Promise<string> {
  const client = await sb();
  if (!client) {
    const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    return `data:${file.type || "audio/webm"};base64,${b64}`;
  }
  const path = `${Date.now()}-${name}`;
  const { error } = await client.storage
    .from(AUDIO_BUCKET)
    .upload(path, file, { contentType: file.type || "audio/webm", upsert: false });
  if (error) throw new Error(`อัปโหลดเสียงไม่สำเร็จ: ${error.message}`);
  return client.storage.from(AUDIO_BUCKET).getPublicUrl(path).data.publicUrl;
}

/* ── sessions ── */

export async function createSession(
  input: Pick<Session, "elderName" | "relation" | "topic"> & {
    consentAudioUrl?: string | null;
    region?: Session["region"];
    visitFrequency?: Session["visitFrequency"];
  }
): Promise<Session> {
  const row: Session = {
    id: rid(),
    elderName: input.elderName,
    relation: input.relation,
    topic: input.topic,
    consentAudioUrl: input.consentAudioUrl ?? null,
    createdAt: new Date().toISOString(),
    region: input.region,
    visitFrequency: input.visitFrequency,
  };
  const client = await sb();
  if (!client) {
    mem.sessions.push(row);
    return row;
  }
  const { data, error } = await client
    .from("sessions")
    .insert({
      elder_name: row.elderName,
      relation: row.relation,
      topic: row.topic,
      consent_audio_url: row.consentAudioUrl,
      region: row.region ?? null,
      visit_frequency: row.visitFrequency ?? null,
      // ผูกกับบัญชีที่ล็อกอินอยู่ ถ้าไม่ล็อกอินจะเป็น null (โหมดลองใช้)
      user_id: await currentUserId(),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { ...row, id: data.id, createdAt: data.created_at };
}

/** รายการ session ทั้งหมดของผู้ใช้ที่ล็อกอินอยู่ — ใช้ในหน้า /library */
export async function listSessionsOfUser(userId: string): Promise<Session[]> {
  const client = await sb();
  if (!client) return [];
  const { data } = await client
    .from("sessions")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((d) => ({
    id: d.id,
    elderName: d.elder_name,
    relation: d.relation,
    topic: d.topic,
    consentAudioUrl: d.consent_audio_url,
    createdAt: d.created_at,
    region: d.region ?? undefined,
    visitFrequency: d.visit_frequency ?? undefined,
  }));
}

/** บททั้งหมดของผู้ใช้ พร้อม token สำหรับเปิดหนังสือ */
export async function listChaptersOfUser(userId: string): Promise<Chapter[]> {
  const client = await sb();
  if (!client) return [];
  const { data } = await client
    .from("chapters")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(toChapter);
}

export async function getSession(id: string): Promise<Session | null> {
  const client = await sb();
  if (!client) return mem.sessions.find((s) => s.id === id) ?? null;
  const { data } = await client.from("sessions").select().eq("id", id).maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    elderName: data.elder_name,
    relation: data.relation,
    topic: data.topic,
    consentAudioUrl: data.consent_audio_url,
    createdAt: data.created_at,
    region: data.region ?? undefined,
    visitFrequency: data.visit_frequency ?? undefined,
  };
}

/* ── corrections (Dialect Correction Flywheel) ──
 * ⚠️ ค่าตั้งต้นเก็บเฉพาะคู่ข้อความ + ภาค
 * clipId/spanStartMs จะถูกเก็บต่อเมื่อครอบครัวติ๊กยินยอมแยกต่างหาก
 */

export async function saveCorrection(input: {
  asrText: string;
  humanText: string;
  region?: Session["region"];
  /** ส่งมาเฉพาะเมื่อ opt-in */
  clipId?: string | null;
  spanStartMs?: number | null;
}): Promise<Correction> {
  const row: Correction = {
    id: rid(),
    asrText: input.asrText,
    humanText: input.humanText,
    region: input.region,
    clipId: input.clipId ?? null,
    spanStartMs: input.spanStartMs ?? null,
    createdAt: new Date().toISOString(),
  };
  const client = await sb();
  if (!client) {
    mem.corrections.push(row);
    return row;
  }
  const { data, error } = await client
    .from("corrections")
    .insert({
      asr_text: row.asrText,
      human_text: row.humanText,
      region: row.region ?? null,
      clip_id: row.clipId,
      span_start_ms: row.spanStartMs,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { ...row, id: data.id, createdAt: data.created_at };
}

/** จำนวนคู่ข้อมูลใน dataset — ตัวเลขนี้เอาไปโชว์บนเวทีได้ว่า flywheel เริ่มหมุนแล้ว */
export async function countCorrections(): Promise<number> {
  const client = await sb();
  if (!client) return mem.corrections.length;
  const { count } = await client.from("corrections").select("id", { count: "exact", head: true });
  return count ?? 0;
}

/** ปุ่มลืมต้องลืมจริง — ในโหมด Supabase มี on delete cascade ให้แล้ว */
export async function deleteCorrectionsOfClip(clipId: string): Promise<number> {
  const client = await sb();
  if (!client) {
    const before = mem.corrections.length;
    mem.corrections = mem.corrections.filter((c) => c.clipId !== clipId);
    return before - mem.corrections.length;
  }
  const { data } = await client.from("corrections").delete().eq("clip_id", clipId).select("id");
  return data?.length ?? 0;
}

/* ── clips ── */

export async function saveClip(clip: Omit<Clip, "id" | "createdAt">): Promise<Clip> {
  const row: Clip = { ...clip, id: rid(), createdAt: new Date().toISOString() };
  const client = await sb();
  if (!client) {
    mem.clips.push(row);
    return row;
  }
  const { data, error } = await client
    .from("clips")
    .insert({
      session_id: clip.sessionId,
      question: clip.question,
      audio_url: clip.audioUrl,
      duration_ms: clip.durationMs,
      transcript: clip.transcript,
      claims: clip.claims,
      next_questions: clip.nextQuestions,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { ...row, id: data.id, createdAt: data.created_at };
}

const toClip = (d: Record<string, unknown>): Clip => ({
  id: d.id as string,
  sessionId: d.session_id as string,
  question: d.question as string,
  audioUrl: d.audio_url as string,
  durationMs: (d.duration_ms as number) ?? 0,
  transcript: (d.transcript as string) ?? "",
  claims: (d.claims as Clip["claims"]) ?? [],
  nextQuestions: (d.next_questions as string[]) ?? [],
  createdAt: d.created_at as string,
});

export async function listClips(sessionId: string): Promise<Clip[]> {
  const client = await sb();
  if (!client) return mem.clips.filter((c) => c.sessionId === sessionId);
  const { data } = await client
    .from("clips")
    .select()
    .eq("session_id", sessionId)
    .order("created_at");
  return (data ?? []).map(toClip);
}

/**
 * ดึงคลิปของหลาย session ในคำสั่งเดียว
 *
 * ของเดิมหน้าคลังเรียก listClips ทีละ session ผ่าน Promise.all
 * ซึ่งเป็น N+1 ครอบครัวที่มีผู้เล่า 5 คนก็ยิง 5 query
 * ทั้งที่ถามรวดเดียวได้ และหน้านั้นเป็นหน้าที่ว่างนานที่สุดในแอปอยู่แล้ว
 */
export async function listClipsOfSessions(sessionIds: string[]): Promise<Clip[]> {
  if (sessionIds.length === 0) return [];
  const client = await sb();
  if (!client) return mem.clips.filter((c) => sessionIds.includes(c.sessionId));
  const { data } = await client
    .from("clips")
    .select()
    .in("session_id", sessionIds)
    .order("created_at");
  return (data ?? []).map(toClip);
}

export async function deleteClip(clipId: string): Promise<void> {
  const client = await sb();
  if (!client) {
    const i = mem.clips.findIndex((c) => c.id === clipId);
    if (i >= 0) mem.clips.splice(i, 1);
    return;
  }
  await client.from("clips").delete().eq("id", clipId);
}

/* ── chapters ── */

export async function saveChapter(
  ch: Omit<Chapter, "id" | "shareToken"> & { shareToken?: string }
): Promise<Chapter> {
  const row: Chapter = { ...ch, id: rid(), shareToken: ch.shareToken ?? newToken() };
  const client = await sb();
  if (!client) {
    mem.chapters.push(row);
    return row;
  }
  const { data, error } = await client
    .from("chapters")
    .insert({
      session_id: ch.sessionId,
      title: ch.title,
      paragraphs: ch.paragraphs,
      approved: ch.approved,
      user_id: await currentUserId(),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { ...row, id: data.id, shareToken: data.share_token };
}

const toChapter = (d: Record<string, unknown>): Chapter => ({
  id: d.id as string,
  sessionId: d.session_id as string,
  title: d.title as string,
  paragraphs: (d.paragraphs as Chapter["paragraphs"]) ?? [],
  approved: Boolean(d.approved),
  shareToken: d.share_token as string,
});

export async function getChapterByToken(token: string): Promise<Chapter | null> {
  const client = await sb();
  if (!client) return mem.chapters.find((c) => c.shareToken === token) ?? null;
  const { data } = await client
    .from("chapters")
    .select()
    .eq("share_token", token)
    .maybeSingle();
  return data ? toChapter(data) : null;
}

export async function getChapter(id: string): Promise<Chapter | null> {
  const client = await sb();
  if (!client) return mem.chapters.find((c) => c.id === id) ?? null;
  const { data } = await client.from("chapters").select().eq("id", id).maybeSingle();
  return data ? toChapter(data) : null;
}

export async function updateChapter(
  id: string,
  patch: Partial<Pick<Chapter, "paragraphs" | "approved" | "title">>
): Promise<Chapter | null> {
  const client = await sb();
  if (!client) {
    const c = mem.chapters.find((x) => x.id === id);
    if (!c) return null;
    Object.assign(c, patch);
    return c;
  }
  const { data } = await client
    .from("chapters")
    .update({
      ...(patch.paragraphs ? { paragraphs: patch.paragraphs } : {}),
      ...(patch.approved !== undefined ? { approved: patch.approved } : {}),
      ...(patch.title ? { title: patch.title } : {}),
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  return data ? toChapter(data) : null;
}
