/**
 * Prompt + response schema ของ Gemini แยกไว้ไฟล์นี้
 *
 * เหตุผลที่แยก: ไฟล์นี้ไม่ import อะไรที่ต้องใช้ bundler
 * จึงรันตรงด้วย node ได้ ทำให้ scripts/test-gemini.ts ทดสอบ prompt
 * โดยไม่ต้องยิงผ่าน API หรือพึ่ง Supabase
 *
 * ⚠️ นี่คือไฟล์ที่ต้องแก้บ่อยที่สุดเวลา quote ตรวจไม่ผ่าน
 *    แก้ prompt → รัน npm run test:gemini → ดูอัตราผ่านทันที
 */

import { Type } from "@google/genai";
import type { Claim } from "./types";

export const ANALYZE_PROMPT = (question: string) =>
  `
คุณคือผู้ช่วยฟังเรื่องเล่าของผู้สูงอายุไทย หลานเพิ่งถามคำถามนี้กับท่าน:
"${question}"

ทำ 3 อย่างจากไฟล์เสียงนี้:

1) transcript — ถอดเสียงเป็นภาษาไทยให้ครบทุกคำที่ได้ยิน
   - คงสำเนียงและคำถิ่นไว้ตามที่ท่านพูด ห้ามแปลงเป็นภาษากลาง
   - ห้ามเติมคำที่ไม่ได้ยิน ห้ามตัดคำที่ได้ยิน
   - ถ้าฟังบางช่วงไม่ออก ให้ใส่ [ฟังไม่ชัด]

2) claims — แยกสิ่งที่ท่านเล่าออกเป็นข้อเท็จจริงย่อย 4-8 ข้อ แต่ละข้อมี
   - quote: ⚠️ สำคัญที่สุด ต้องคัดลอกข้อความจาก transcript ที่คุณเพิ่งเขียน "คำต่อคำ"
     วิธีที่ถูกต้องคือ: เขียน transcript ให้เสร็จก่อน แล้วค่อย "ตัดแปะ" ช่วงข้อความจาก
     transcript นั้นมาเป็น quote ห้ามพิมพ์ใหม่จากความจำ
     ห้ามเกลา ห้ามย่อ ห้ามสลับคำ ห้ามแก้คำผิด ห้ามแก้เครื่องหมาย
     ห้ามรวมข้อความที่อยู่คนละที่เข้าด้วยกัน (ถ้าอยู่คนละช่วง ให้แยกเป็นสอง claim)
     ต้องยาวอย่างน้อย 10 ตัวอักษร
     ระบบจะตรวจด้วยโค้ดว่า quote เป็น substring ของ transcript จริงหรือไม่
     ถ้าไม่ตรงแม้แต่ตัวอักษรเดียว claim ข้อนั้นจะถูกทิ้งทันที
   - summary: ย่อความเป็นภาษาของคุณเอง (ตรงนี้เกลาได้ตามสบาย)
   - startMs, endMs: ตำแหน่งโดยประมาณในไฟล์เสียง หน่วยมิลลิวินาที

   ห้ามสร้าง claim จากสิ่งที่ "อนุมานเอา" เช่นความรู้สึกที่ท่านไม่ได้พูดออกมา
   ถ้าท่านไม่ได้บอกว่าเสียใจ ห้ามเขียนว่าเสียใจ

3) nextQuestions — คำถามต่อ 3 ข้อที่หลานควรถามต่อ
   - ต้องต่อยอดจากสิ่งที่ท่านเพิ่งเล่าจริง ๆ ไม่ใช่คำถามทั่วไปที่ใช้กับใครก็ได้
   - ถามถึงภาพ กลิ่น เสียง คน สถานที่ ไม่ใช่ถามความรู้สึกตรง ๆ
   - ใช้ภาษาสุภาพแบบหลานคุยกับปู่ย่าตายาย ลงท้ายด้วย คะ/ครับ
`.trim();

export const ANALYZE_SCHEMA = {
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

export const COMPOSE_PROMPT = (title: string, elderName: string, claims: Claim[]) =>
  `
คุณกำลังเรียบเรียง "หนังสือชีวิต" ของ${elderName} บทชื่อ "${title}"

ด้านล่างคือข้อเท็จจริงที่ผ่านการตรวจสอบแล้วว่าท่านพูดจริง:
${claims.map((c) => `[${c.id}] "${c.quote}"`).join("\n")}

เรียบเรียงเป็นย่อหน้าภาษาไทยที่อ่านรื่น โดยมีกฎเหล็ก:

1. ห้ามเพิ่มข้อเท็จจริงใหม่ที่ไม่มีในรายการข้างบนเด็ดขาด
   ห้ามเดาปี ห้ามเดาสถานที่ ห้ามเดาความรู้สึก ห้ามเติมสีสัน
2. ทุกย่อหน้าต้องระบุ claimIds ที่ย่อหน้านั้นใช้ อย่างน้อย 1 รายการ
3. ใช้สำนวนและคำของท่านเองให้มากที่สุด เขียนด้วยสรรพนามบุรุษที่ 3
4. เรียงตามลำดับเวลาหรือลำดับเหตุการณ์ที่เป็นธรรมชาติ
5. ความยาวย่อหน้าละ 1-3 ประโยค รวมทั้งบท 5-10 ย่อหน้า

6. flags — ตรวจงานตัวเองอีกรอบ: ถ้าประโยคไหนที่คุณเพิ่งเขียน
   มีเนื้อความที่ "เกินไปจาก" ถ้อยคำต้นฉบับ แม้เพียงเล็กน้อย
   ให้ใส่คำอธิบายลงใน flags ของย่อหน้านั้น เช่น
   "ประโยคที่ 2 — \\"...\\" ไม่มีถ้อยคำนี้ในเสียงต้นฉบับ"
   ซื่อสัตย์กับข้อนี้ ครอบครัวจะเห็น flag เหล่านี้เป็นไฮไลต์สีเหลืองและมาตรวจเอง
   ย่อหน้าที่ตรงต้นฉบับทั้งหมดให้ flags เป็น []
`.trim();

export const COMPOSE_SCHEMA = {
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
