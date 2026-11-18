/**
 * ❤️ หัวใจของทั้งโปรเจกต์ "เล่าไว้"
 *
 * สิ่งที่ทำให้เราไม่ใช่ ChatGPT wrapper คือบรรทัดพวกนี้:
 * ทุกย่อหน้าในหนังสือต้องอ้าง Claim ที่มีถ้อยคำต้นฉบับอยู่จริงใน transcript
 * และเรา "ตรวจด้วยโค้ด" ไม่ใช่ให้ AI ตรวจ AI
 *
 * ภาษาไทยไม่มีช่องว่างระหว่างคำอยู่แล้ว การลบช่องว่างกับเครื่องหมายทิ้ง
 * แล้วเทียบ substring จึงแม่นและเร็วมาก
 */

import type { Claim, Paragraph } from "./types";

/**
 * ทำให้ข้อความเทียบกันได้ โดยไม่แพ้เรื่องช่องว่าง/เครื่องหมายวรรคตอน
 *
 * เหตุผลที่ต้อง normalize:
 * - Gemini มักเติมหรือตัดช่องว่างไม่ตรงกับ transcript
 * - zero-width space (​) ติดมาบ่อยในข้อความไทย
 * - เครื่องหมายวรรคตอนไม่ควรทำให้การตรวจสอบตก
 *
 * ⚠️ สิ่งที่เรา "ไม่" ทำคือแก้ตัวอักษรไทย สระ หรือวรรณยุกต์
 * เพราะนั่นจะทำให้ AI แต่งคำใหม่แล้วยังผ่านได้
 */
export function normalizeThai(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[\s ​‌‍]/g, "")
    .replace(/[.,!?;:"'`“”‘’()\[\]{}…ฯ]/g, "")
    .replace(/ๆ/g, ""); // ๆ (ไม้ยมก) — Gemini ชอบใส่/ตัดไม่ตรงกัน
}

/**
 * ตรวจว่า quote ของ Claim มีอยู่จริงใน transcript แบบคำต่อคำหรือไม่
 *
 * คืน false เมื่อ:
 * - AI เกลาคำใหม่ (เช่น "ยายเสียใจมาก" ทั้งที่ยายไม่เคยพูด)
 * - AI สรุปรวมหลายประโยคเป็นประโยคเดียว
 * - quote สั้นเกินไปจนไม่มีความหมาย
 */
export function verifyClaim(transcript: string, quote: string): boolean {
  const q = normalizeThai(quote);
  // กันกรณี AI คืน quote สั้นจู๋อย่าง "ยาย" ซึ่งเจอใน transcript แน่นอนแต่ไม่ใช่หลักฐาน
  if (q.length < 8) return false;
  return normalizeThai(transcript).includes(q);
}

/**
 * ตรวจ claim ทั้งชุดในคราวเดียว แล้วคืนชุดใหม่ที่ติดธง verified ให้เรียบร้อย
 * ใช้ตอนรับ response จาก Gemini ใน /api/analyze
 */
export function verifyClaims(transcript: string, claims: Claim[]): Claim[] {
  return claims.map((c) => ({ ...c, verified: verifyClaim(transcript, c.quote) }));
}

/**
 * คัด claim ที่ตรวจไม่ผ่านออก — ของพวกนี้ห้ามเข้าสู่ขั้นเรียบเรียงเด็ดขาด
 * จำนวนที่ถูกทิ้งเอาไปโชว์บน UI ได้ ("ทิ้งไป 2 เพราะตรวจไม่ผ่าน") เป็นจุดขาย
 */
export function keepVerified(claims: Claim[]): { kept: Claim[]; dropped: number } {
  const kept = claims.filter((c) => c.verified);
  return { kept, dropped: claims.length - kept.length };
}

/**
 * ตรวจ 1 ย่อหน้า: ต้องอ้าง claim อย่างน้อย 1 อัน และทุกอันที่อ้างต้อง verified
 * ย่อหน้าที่ไม่ผ่านข้อนี้ = ไม่มีหลักฐาน = ห้ามพิมพ์ลงหนังสือ
 */
export function verifyParagraph(p: Paragraph, byId: Record<string, Claim>): boolean {
  if (p.claimIds.length === 0) return false;
  return p.claimIds.every((id) => byId[id]?.verified === true);
}

/** แปลง array ของ claim เป็น lookup table (ใช้คู่กับ verifyParagraph) */
export function indexClaims(claims: Claim[]): Record<string, Claim> {
  return Object.fromEntries(claims.map((c) => [c.id, c]));
}

/**
 * ตรวจทั้งบท — ตัวเลขที่ได้จากฟังก์ชันนี้คือสิ่งที่พูดบนเวที
 * "ย่อหน้าที่มีหลักฐาน 12 จาก 12"
 */
export function verifyChapter(
  paragraphs: Paragraph[],
  claims: Claim[]
): { ok: boolean; verified: number; total: number; failedIds: string[] } {
  const byId = indexClaims(claims);
  const failedIds = paragraphs.filter((p) => !verifyParagraph(p, byId)).map((p) => p.id);
  return {
    ok: failedIds.length === 0,
    verified: paragraphs.length - failedIds.length,
    total: paragraphs.length,
    failedIds,
  };
}

/**
 * หาช่วงเวลาในไฟล์เสียงของย่อหน้าหนึ่ง เพื่อให้คลิกย่อหน้าแล้วเสียงเล่นตรงจุด
 * คืน claim แรกที่อ้างถึง (เรียงตาม startMs)
 */
export function paragraphAudioAnchor(
  p: Paragraph,
  byId: Record<string, Claim>
): Claim | null {
  const cs = p.claimIds.map((id) => byId[id]).filter(Boolean).sort((a, b) => a.startMs - b.startMs);
  return cs[0] ?? null;
}
