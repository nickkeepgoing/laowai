/**
 * เรียก Gemini แค่ 2 ครั้งต่อ 1 หัวข้อ
 *
 *   1. analyzeAudio()   ไฟล์เสียง → transcript + claims + คำถามต่อ   (ไม่แยก STT ออกมา)
 *   2. composeChapter() claims    → ย่อหน้าหนังสือ + flags
 *
 * ไม่มี GEMINI_API_KEY → ถอยไปใช้ mock อัตโนมัติ แอปไม่พัง
 *
 * ⚠️ กฎเหล็กของ prompt: `quote` ต้องเป็นถ้อยคำต้นฉบับคำต่อคำ
 * เพราะเราเอาไปตรวจด้วย verifyClaim() ถ้า AI เกลาคำ claim จะตกทันที
 * ย้ำในคำสั่งหลายรอบเพราะนี่คือจุดที่โมเดลชอบพลาดที่สุด
 */

import { GoogleGenAI, Type } from "@google/genai";
import type { Claim, Paragraph } from "./types";
import { GEMINI_API_KEY, GEMINI_MODEL, hasGemini } from "./env";
import { demoClips } from "./demo";
import { verifyClaims } from "./verify";

let _ai: GoogleGenAI | null = null;
const ai = () => (_ai ??= new GoogleGenAI({ apiKey: GEMINI_API_KEY }));

export type AnalyzeResult = {
  transcript: string;
  claims: Claim[];
  nextQuestions: string[];
};

/* ────────────────────────── 1. เสียง → Claim ────────────────────────── */

const ANALYZE_PROMPT = (question: string) => `
คุณคือผู้ช่วยฟังเรื่องเล่าของผู้สูงอายุไทย หลานเพิ่งถามคำถามนี้กับท่าน:
"${question}"

ทำ 3 อย่างจากไฟล์เสียงนี้:

1) transcript — ถอดเสียงเป็นภาษาไทยให้ครบทุกคำที่ได้ยิน
   - คงสำเนียงและคำถิ่นไว้ตามที่ท่านพูด ห้ามแปลงเป็นภาษากลาง
   - ห้ามเติมคำที่ไม่ได้ยิน ห้ามตัดคำที่ได้ยิน
   - ถ้าฟังบางช่วงไม่ออก ให้ใส่ [ฟังไม่ชัด]

2) claims — แยกสิ่งที่ท่านเล่าออกเป็นข้อเท็จจริงย่อย 4-8 ข้อ แต่ละข้อมี
   - quote: ⚠️ สำคัญที่สุด ต้องคัดลอกข้อความจาก transcript ด้านบน "คำต่อคำ"
     ห้ามเกลา ห้ามย่อ ห้ามสลับคำ ห้ามแก้คำผิด ห้ามรวมประโยคที่อยู่คนละที่
     ต้องยาวอย่างน้อย 10 ตัวอักษร และต้องค้นหาเจอใน transcript แบบตรงตัว
     ระบบจะตรวจด้วยโค้ดว่า quote มีอยู่จริงใน transcript ถ้าไม่ตรงข้อนั้นจะถูกทิ้ง
   - summary: ย่อความเป็นภาษาของคุณเอง (ตรงนี้เกลาได้)
   - startMs, endMs: ตำแหน่งโดยประมาณในไฟล์เสียง หน่วยมิลลิวินาที

   ห้ามสร้าง claim จากสิ่งที่ "อนุมานเอา" เช่นความรู้สึกที่ท่านไม่ได้พูด
   ถ้าท่านไม่ได้บอกว่าเสียใจ ห้ามเขียนว่าเสียใจ

3) nextQuestions — คำถามต่อ 3 ข้อที่หลานควรถามต่อ
   - ต้องต่อยอดจากสิ่งที่ท่านเพิ่งเล่าจริง ๆ ไม่ใช่คำถามทั่วไป
   - ถามถึงภาพ กลิ่น เสียง คน สถานที่ ไม่ใช่ถามความรู้สึกตรง ๆ
   - ใช้ภาษาสุภาพแบบหลานคุยกับปู่ย่าตายาย ลงท้ายด้วย คะ/ครับ
`.trim();

const ANALYZE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    transcript: { type: Type.STRING },
    claims: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          quote: { type: Type.STRING },
          summary: { type: Type.STRING },
          startMs: { type: Type.INTEGER },
          endMs: { type: Type.INTEGER },
        },
        required: ["quote", "summary", "startMs", "endMs"],
      },
    },
    nextQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["transcript", "claims", "nextQuestions"],
};

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

const COMPOSE_PROMPT = (title: string, elderName: string, claims: Claim[]) =>
  `
คุณกำลังเรียบเรียง "หนังสือชีวิต" ของ${elderName} บทชื่อ "${title}"

ด้านล่างคือข้อเท็จจริงที่ผ่านการตรวจสอบแล้วว่าท่านพูดจริง:
${claims.map((c) => `[${c.id}] "${c.quote}"`).join("\n")}

เรียบเรียงเป็นย่อหน้าภาษาไทยที่อ่านรื่น โดยมีกฎเหล็ก:

1. ห้ามเพิ่มข้อเท็จจริงใหม่ที่ไม่มีในรายการข้างบนเด็ดขาด
   ห้ามเดาปี ห้ามเดาสถานที่ ห้ามเดาความรู้สึก ห้ามเติมสีสัน
2. ทุกย่อหน้าต้องระบุ claimIds ที่ย่อหน้านั้นใช้ อย่างน้อย 1 รายการ
3. ใช้สำนวนและคำของท่านเองให้มากที่สุด เขียนด้วยสรรพนามบุรุษที่ 3
   (เช่น "${elderName}เล่าว่า..." หรือเล่าต่อเนื่องไปเลย)
4. เรียงตามลำดับเวลาหรือลำดับเหตุการณ์ที่เป็นธรรมชาติ
5. ความยาวย่อหน้าละ 1-3 ประโยค รวมทั้งบท 5-10 ย่อหน้า

6. flags — ตรวจงานตัวเองอีกรอบ: ถ้าประโยคไหนที่คุณเพิ่งเขียน
   มีเนื้อความที่ "เกินไปจาก" ถ้อยคำต้นฉบับ แม้เพียงเล็กน้อย
   ให้ใส่คำอธิบายลงใน flags ของย่อหน้านั้น เช่น
   "ประโยคที่ 2 — \\"...\\" ไม่มีถ้อยคำนี้ในเสียงต้นฉบับ"
   ซื่อสัตย์กับข้อนี้ ครอบครัวจะเห็น flag เหล่านี้เป็นไฮไลต์สีเหลืองและมาตรวจเอง
   ย่อหน้าที่ตรงต้นฉบับทั้งหมดให้ flags เป็น []
`.trim();

const COMPOSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    paragraphs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          claimIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          flags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["text", "claimIds", "flags"],
      },
    },
  },
  required: ["paragraphs"],
};

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
