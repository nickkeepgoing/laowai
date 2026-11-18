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

/* ────────────────────────── 1. เสียง → Claim ────────────────────────── */

export async function analyzeAudio(
  audio: Blob,
  question: string,
  durationMs: number
): Promise<AnalyzeResult> {
  if (!hasGemini()) return mockAnalyze();

  const base64 = Buffer.from(await audio.arrayBuffer()).toString("base64");
  const res = await ai().models.generateContent({
    model: GEMINI_MODEL,
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
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: ANALYZE_SCHEMA,
    },
  });

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

  const res = await ai().models.generateContent({
    model: GEMINI_MODEL,
    contents: COMPOSE_PROMPT(title, elderName, claims),
    config: {
      temperature: 0.4,
      responseMimeType: "application/json",
      responseSchema: COMPOSE_SCHEMA,
    },
  });

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
