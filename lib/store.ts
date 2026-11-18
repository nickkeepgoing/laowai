/**
 * ที่เก็บข้อมูล — มี 2 โหมดอัตโนมัติ
 *
 *   มี Supabase  → เก็บจริงในฐานข้อมูล + Storage
 *   ไม่มี        → เก็บใน memory (หายเมื่อ restart) แต่ flow ทั้งหมดยังวิ่งครบ
 *
 * ทำแบบนี้เพื่อให้ไม่มีใครถูก block: ศิลปรันเว็บได้ตั้งแต่นาทีแรก
 * และถ้าวันแข่ง Supabase ล่ม เราสลับกลับมาโหมด memory ได้ทันทีโดยไม่ต้องแก้โค้ด
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Chapter, Clip, Session } from "./types";
import { AUDIO_BUCKET, SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "./env";

let _sb: SupabaseClient | null = null;
export function sb(): SupabaseClient | null {
  if (!hasSupabase()) return null;
  _sb ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _sb;
}

/* ── in-memory fallback (ใช้ globalThis เพื่อให้รอด hot reload ของ dev server) ── */
type Mem = { sessions: Session[]; clips: Clip[]; chapters: Chapter[] };
const g = globalThis as unknown as { __laowai?: Mem };
const mem: Mem = (g.__laowai ??= { sessions: [], clips: [], chapters: [] });

const rid = () => Math.random().toString(36).slice(2, 10);
export const newToken = () =>
  Array.from({ length: 3 }, () => Math.random().toString(36).slice(2, 10)).join("");

/* ── เสียง ── */

/**
 * อัปโหลดไฟล์เสียงแล้วคืน URL สาธารณะ
 * ไม่มี Supabase → คืน data URL (ใหญ่แต่ใช้ได้ สำหรับ dev เท่านั้น)
 */
export async function putAudio(file: Blob, name: string): Promise<string> {
  const client = sb();
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
  input: Pick<Session, "elderName" | "relation" | "topic"> & { consentAudioUrl?: string | null }
): Promise<Session> {
  const row: Session = {
    id: rid(),
    elderName: input.elderName,
    relation: input.relation,
    topic: input.topic,
    consentAudioUrl: input.consentAudioUrl ?? null,
    createdAt: new Date().toISOString(),
  };
  const client = sb();
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
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { ...row, id: data.id, createdAt: data.created_at };
}

export async function getSession(id: string): Promise<Session | null> {
  const client = sb();
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
  };
}

/* ── clips ── */

export async function saveClip(clip: Omit<Clip, "id" | "createdAt">): Promise<Clip> {
  const row: Clip = { ...clip, id: rid(), createdAt: new Date().toISOString() };
  const client = sb();
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
  const client = sb();
  if (!client) return mem.clips.filter((c) => c.sessionId === sessionId);
  const { data } = await client
    .from("clips")
    .select()
    .eq("session_id", sessionId)
    .order("created_at");
  return (data ?? []).map(toClip);
}

export async function deleteClip(clipId: string): Promise<void> {
  const client = sb();
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
  const client = sb();
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
  const client = sb();
  if (!client) return mem.chapters.find((c) => c.shareToken === token) ?? null;
  const { data } = await client
    .from("chapters")
    .select()
    .eq("share_token", token)
    .maybeSingle();
  return data ? toChapter(data) : null;
}

export async function getChapter(id: string): Promise<Chapter | null> {
  const client = sb();
  if (!client) return mem.chapters.find((c) => c.id === id) ?? null;
  const { data } = await client.from("chapters").select().eq("id", id).maybeSingle();
  return data ? toChapter(data) : null;
}

export async function updateChapter(
  id: string,
  patch: Partial<Pick<Chapter, "paragraphs" | "approved" | "title">>
): Promise<Chapter | null> {
  const client = sb();
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
