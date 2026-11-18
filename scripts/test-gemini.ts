/**
 * เทสต์จุดเสี่ยงอันดับ 1 ของโปรเจกต์:
 * "Gemini จะคืน quote ที่ตรงกับ transcript คำต่อคำจริงไหม"
 *
 * ถ้าไม่ตรง → claim ถูกทิ้งหมด → ไม่มีย่อหน้า → ไม่มีหนังสือ → ไม่มี demo
 * เพราะฉะนั้นต้องรู้ให้เร็วที่สุด และต้องวัดเป็นเปอร์เซ็นต์ได้
 *
 * ใช้งาน:
 *   npm run test:gemini public/demo/clip-1.wav
 *   npm run test:gemini "C:/path/to/เสียงยายจริง.m4a" "บ้านตอนเด็กอยู่แถวไหนคะ"
 *
 * ไม่ต้องมี Supabase ไม่ต้องรัน dev server
 */

import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { ANALYZE_PROMPT, ANALYZE_SCHEMA } from "../lib/prompts.ts";
import { normalizeThai, verifyClaim } from "../lib/verify.ts";

const MIME: Record<string, string> = {
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".mp4": "audio/mp4",
  ".webm": "audio/webm",
  ".ogg": "audio/ogg",
  ".aac": "audio/aac",
  ".flac": "audio/flac",
};

const file = process.argv[2];
const question = process.argv[3] ?? "เล่าเรื่องตอนเด็ก ๆ ให้ฟังหน่อยได้ไหมคะ";

if (!file) {
  console.error("ใช้: npm run test:gemini <ไฟล์เสียง> [คำถาม]");
  process.exit(1);
}

const apiKey = process.env.GEMINI_API_KEY?.trim();
if (!apiKey) {
  console.error("❌ ไม่พบ GEMINI_API_KEY — ตรวจว่ามีใน .env.local แล้ว");
  process.exit(1);
}

const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
const mimeType = MIME[extname(file).toLowerCase()] ?? "audio/mpeg";
const bytes = readFileSync(file);

console.log(`\n📁 ${basename(file)}  ${(bytes.length / 1024 / 1024).toFixed(2)} MB  ${mimeType}`);
console.log(`🤖 ${model}`);
console.log(`❓ "${question}"\n`);

const t0 = Date.now();
const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1beta" } });
const res = await ai.models.generateContent({
  model,
  contents: [
    {
      role: "user",
      parts: [
        { inlineData: { mimeType, data: bytes.toString("base64") } },
        { text: ANALYZE_PROMPT(question) },
      ],
    },
  ],
  config: {
    temperature: 0.2,
    thinkingConfig: { thinkingBudget: 0 },
    responseMimeType: "application/json",
    responseSchema: ANALYZE_SCHEMA,
  },
});
const secs = ((Date.now() - t0) / 1000).toFixed(1);

const raw = JSON.parse(res.text ?? "{}");
const transcript: string = raw.transcript ?? "";
const claims: { quote: string; summary: string; startMs: number; endMs: number }[] =
  raw.claims ?? [];

console.log(`⏱️  ${secs} วินาที   (ต้องไม่เกิน 30 วิ ตาม Definition of Done)\n`);
console.log("── TRANSCRIPT ──────────────────────────────");
console.log(transcript || "(ว่าง — โมเดลไม่ได้ยินคำพูด)");
console.log(`\n(${transcript.length} ตัวอักษร)\n`);

console.log("── ตรวจ QUOTE ทีละข้อ ──────────────────────");
let pass = 0;
for (const [i, c] of claims.entries()) {
  const ok = verifyClaim(transcript, c.quote);
  if (ok) pass++;
  console.log(`${ok ? "✅" : "❌"} c${i + 1}  "${c.quote}"`);
  if (!ok) {
    // บอกให้รู้ว่าพลาดเพราะอะไร จะได้แก้ prompt ได้ตรงจุด
    const n = normalizeThai(c.quote);
    if (n.length < 8) {
      console.log(`      ↳ สั้นเกินไป (${n.length} ตัวอักษรหลัง normalize) ไม่นับเป็นหลักฐาน`);
    } else {
      const half = n.slice(0, Math.floor(n.length / 2));
      const partial = normalizeThai(transcript).includes(half);
      console.log(
        `      ↳ ${partial ? "ครึ่งแรกเจอ แต่ครึ่งหลังเพี้ยน → โมเดลเกลาคำ/ต่อประโยคข้ามช่วง" : "ไม่เจอเลย → โมเดลพิมพ์ใหม่จากความจำ ไม่ได้ตัดแปะจาก transcript"}`
      );
    }
  }
}

const pct = claims.length ? Math.round((pass / claims.length) * 100) : 0;
console.log(`\n📊 quote ที่ตรวจผ่าน ${pass}/${claims.length} = ${pct}%`);
console.log("   เกณฑ์:  ≥80% ใช้ได้เลย · 50-79% ต้องแก้ prompt · <50% ต้องเปลี่ยนวิธี\n");

console.log("── คำถามต่อที่ AI เสนอ ─────────────────────");
for (const q of raw.nextQuestions ?? []) console.log(`• ${q}`);
console.log("");

if (pct < 50 && claims.length > 0) process.exit(1);
