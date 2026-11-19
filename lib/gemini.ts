/**
 * เรียก Gemini 2 "แบบ" ไม่ใช่ 2 "ครั้ง"
 *
 *   1. analyzeAudio()   ไฟล์เสียง → transcript + claims + คำถามต่อ   (ไม่แยก STT ออกมา)
 *      ยิง 1 ครั้งต่อ "คลิป"
 *   2. composeChapter() claims    → ย่อหน้าหนังสือ + flags
 *      ยิง 1 ครั้งต่อ "บท"
 *
 * ดังนั้น 1 บทที่มี N คลิป = N+1 ครั้ง เช่น 5 คลิป = 6 ครั้ง
 * (เคยเขียนว่า "2 ครั้งต่อหัวข้อ" ซึ่งผิด และทำให้ประเมินต้นทุนผิดตาม)
 *
 * ไม่มี GEMINI_API_KEY → ถอยไปใช้ mock อัตโนมัติ แอปไม่พัง
 *
 * ⚠️ กฎเหล็กของ prompt: `quote` ต้องเป็นถ้อยคำต้นฉบับคำต่อคำ
 * เพราะเราเอาไปตรวจด้วย verifyClaim() ถ้า AI เกลาคำ claim จะตกทันที
 * ย้ำในคำสั่งหลายรอบเพราะนี่คือจุดที่โมเดลชอบพลาดที่สุด
 */

import { GoogleGenAI } from "@google/genai";
import type { Claim, Paragraph } from "./types";
import { GEMINI_API_KEY, GEMINI_MODEL, hasGemini } from "./env";
import { demoClips } from "./demo";
import { verifyClaims } from "./verify";
import {
  ANALYZE_PROMPT,
  ANALYZE_SCHEMA,
  COMPOSE_PROMPT,
  COMPOSE_SCHEMA,
} from "./prompts";

let _ai: GoogleGenAI | null = null;
// httpOptions.apiVersion: JSON mode (responseSchema) มีเฉพาะใน v1beta
// ถ้าไม่ระบุ SDK จะยิงไป v1 แล้วได้ 400 INVALID_ARGUMENT
const ai = () =>
  (_ai ??= new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: { apiVersion: "v1beta" },
  }));

export type AnalyzeResult = {
  transcript: string;
  claims: Claim[];
  nextQuestions: string[];
};

/* ──────────────── ลองซ้ำเมื่อฝั่ง Google ไม่ว่าง ────────────────
 *
 * เจอจริงตอนซ้อม demo: Gemini ตอบ 503 UNAVAILABLE
 * "This model is currently experiencing high demand"
 *
 * นี่ไม่ใช่ความผิดของโค้ดเรา และหายเองในไม่กี่วินาที
 * แต่ถ้าเกิดตอนสาธิตสดแล้วเราไม่ลองซ้ำ ผู้ใช้จะเห็นแค่ว่าระบบพัง
 *
 * กลยุทธ์: ลองซ้ำแบบถอยเวลาเพิ่มขึ้น และถ้ายังไม่ได้ค่อยสลับไปโมเดลสำรอง
 * ทั้งหมดต้องจบภายในเพดาน 45 วินาทีที่ route ตั้งไว้
 */

export type Candidate = { model: string; thinking: boolean };

/**
 * ลำดับโมเดลที่จะลอง — ทดสอบยิงจริงด้วย config ของเราแล้วทุกตัว (19 พ.ย. 2569)
 *
 * ⚠️ โมเดลตระกูล lite ไม่รองรับ thinkingConfig จะตอบ 400 INVALID_ARGUMENT
 *    จึงต้องกำกับไว้เป็นรายตัว ไม่ใช่ส่ง config ชุดเดียวกันให้ทุกตัว
 *
 * ผลที่วัดได้:
 *   gemini-2.5-flash + thinking   1.4 วิ   ← ตัวหลัก เร็วและคุณภาพดีสุด
 *   gemini-flash-lite-latest      0.75 วิ  ← สำรอง เป็น alias จึงไม่มีวันตกรุ่น
 *   gemini-3.5-flash-lite         1.1 วิ   ← สำรองชั้นสอง
 *   gemini-3.5-flash              83 วิ    ✕ ช้าเกินกว่าจะใช้สำรอง
 *   gemini-2.0-flash              404      ✕ Google ปลดระวางแล้ว
 */
const MODEL_CHAIN: Candidate[] = [
  { model: GEMINI_MODEL, thinking: true },
  { model: "gemini-flash-lite-latest", thinking: false },
  { model: "gemini-3.5-flash-lite", thinking: false },
].filter((c, i, a) => a.findIndex((x) => x.model === c.model) === i);

/** ฝั่งผู้ให้บริการไม่ว่างชั่วคราว = ลองโมเดลเดิมซ้ำแล้วมีโอกาสผ่าน */
function isBusy(e: unknown): boolean {
  const s = e instanceof Error ? e.message : String(e);
  return /\b(429|500|502|503|504)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded|deadline/i.test(
    s
  );
}

/**
 * โมเดลนี้ใช้ไม่ได้ (ถูกปลดระวาง หรือไม่รองรับ config ของเรา) = ข้ามไปตัวถัดไป
 *
 * บทเรียน: ครั้งก่อนผมใส่ gemini-2.5-flash-lite เป็นตัวสำรอง ซึ่ง Google
 * ปลดระวางไปแล้ว พอมันตอบ 404 โค้ดถือว่าเป็น error ร้ายแรงเลยหยุดทั้งห่วงโซ่
 * ตัวสำรองที่เสียจึงทำให้ทั้งระบบพัง ซึ่งแย่กว่าไม่มีตัวสำรองเสียอีก
 */
function isDeadModel(e: unknown): boolean {
  const s = e instanceof Error ? e.message : String(e);
  return /\b404\b|NOT_FOUND|no longer available|INVALID_ARGUMENT|invalid argument/i.test(s);
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * เรียกโมเดลโดยลองซ้ำและสลับโมเดลให้อัตโนมัติ
 * คืน error ตัวสุดท้ายถ้าหมดทุกทางแล้วยังไม่ผ่าน
 */
async function callModel<T>(run: (c: Candidate) => Promise<T>): Promise<T> {
  let last: unknown;

  for (const cand of MODEL_CHAIN) {
    // ตัวหลักลอง 2 ครั้ง (ถอย 1.2 วินาที) ตัวสำรองลองตัวละครั้ง
    const tries = cand === MODEL_CHAIN[0] ? 2 : 1;

    for (let i = 0; i < tries; i++) {
      try {
        return await run(cand);
      } catch (e) {
        last = e;

        if (isDeadModel(e)) {
          // โมเดลนี้ใช้ไม่ได้เลย ลองซ้ำก็ไม่ช่วย — ข้ามไปตัวถัดไปทันที
          console.warn(`[gemini] ${cand.model} ใช้ไม่ได้ — ข้ามไปตัวถัดไป`);
          break;
        }
        if (!isBusy(e)) throw e; // ผิดจริง เช่น prompt พัง — หยุดทันที อย่าเผาเวลา

        console.warn(`[gemini] ${cand.model} ไม่ว่าง (ครั้งที่ ${i + 1}) — ลองต่อ`);
        if (i + 1 < tries) await wait(1200);
      }
    }
  }

  throw new Error(
    "ตอนนี้ผู้ให้บริการ AI มีผู้ใช้งานหนาแน่น ลองกดส่งอีกครั้งในอีกสักครู่ — เสียงที่อัดไว้ยังอยู่ในเครื่อง ไม่ได้หายไปไหน" +
      (last instanceof Error ? ` (${last.message.slice(0, 80)})` : "")
  );
}

/* ────────────────────────── 1. เสียง → Claim ────────────────────────── */

export async function analyzeAudio(
  audio: Blob,
  question: string,
  durationMs: number
): Promise<AnalyzeResult> {
  if (!hasGemini()) return mockAnalyze();

  const base64 = Buffer.from(await audio.arrayBuffer()).toString("base64");
  const res = await callModel((c) =>
    ai().models.generateContent({
    model: c.model,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: audio.type || "audio/webm", data: base64 } },
          { text: ANALYZE_PROMPT(question) },
        ],
      },
    ],
    config: {
      temperature: 0.2, // ต่ำ เพราะเราต้องการความซื่อตรงต่อต้นฉบับ ไม่ใช่ความสร้างสรรค์
      // ปิด thinking: งานถอดเสียงไม่ต้องคิด และ 2.5-flash เผา thinking token
      // จนช้าถึง 4 นาทีตอนเจอเสียงที่ฟังไม่ออก (วัดจริงแล้ว)
      // ⚠️ ส่งเฉพาะโมเดลที่รองรับ — ตระกูล lite จะตอบ 400 ถ้าส่งไปด้วย
      ...(c.thinking ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      responseMimeType: "application/json",
      responseSchema: ANALYZE_SCHEMA,
    },
    })
  );

  const raw = JSON.parse(res.text ?? "{}");
  const transcript: string = raw.transcript ?? "";

  // ติด id + clamp timestamp ให้อยู่ในช่วงไฟล์จริง แล้วค่อยตรวจ
  const claims: Claim[] = (raw.claims ?? []).map(
    (c: Record<string, unknown>, i: number): Claim => ({
      id: `c${i + 1}`,
      quote: String(c.quote ?? ""),
      summary: String(c.summary ?? ""),
      startMs: Math.max(0, Math.min(Number(c.startMs) || 0, durationMs)),
      endMs: Math.max(0, Math.min(Number(c.endMs) || 0, durationMs)),
      verified: false,
    })
  );

  return {
    transcript,
    claims: verifyClaims(transcript, claims), // ← ตรวจด้วยโค้ด ไม่เชื่อ AI
    nextQuestions: (raw.nextQuestions ?? []).slice(0, 3).map(String),
  };
}

/* ─────────────────────── 2. Claim → ย่อหน้าหนังสือ ─────────────────────── */

export async function composeChapter(
  title: string,
  elderName: string,
  claims: Claim[]
): Promise<Paragraph[]> {
  if (!hasGemini()) return mockCompose(claims);

  const res = await callModel((c) =>
    ai().models.generateContent({
    model: c.model,
    contents: COMPOSE_PROMPT(title, elderName, claims),
    config: {
      temperature: 0.4,
      responseMimeType: "application/json",
      responseSchema: COMPOSE_SCHEMA,
    },
    })
  );

  const raw = JSON.parse(res.text ?? "{}");
  const valid = new Set(claims.map((c) => c.id));

  return (raw.paragraphs ?? [])
    .map(
      (p: Record<string, unknown>, i: number): Paragraph => ({
        id: `p${i + 1}`,
        text: String(p.text ?? "").trim(),
        // กัน AI อ้าง claim id ที่ไม่มีอยู่จริง
        claimIds: (p.claimIds as string[] ?? []).filter((id) => valid.has(id)),
        flags: ((p.flags as string[]) ?? []).map(String),
      })
    )
    // ย่อหน้าที่ไม่มีหลักฐานเลย = ไม่มีสิทธิ์อยู่ในหนังสือ
    .filter((p: Paragraph) => p.text.length > 0 && p.claimIds.length > 0);
}

/* ────────────────────────────── mock ────────────────────────────── */

function mockAnalyze(): AnalyzeResult {
  const src = demoClips[Math.floor(Math.random() * demoClips.length)];
  return {
    transcript: src.transcript,
    claims: src.claims,
    nextQuestions: src.nextQuestions,
  };
}

function mockCompose(claims: Claim[]): Paragraph[] {
  return claims
    .filter((c) => c.verified)
    .map((c, i) => ({
      id: `p${i + 1}`,
      text: c.quote,
      claimIds: [c.id],
      flags: [],
    }));
}
