/**
 * ตรวจว่า "สัญญากลาง" ยังถูกต้องอยู่ — รันได้ตลอดเวลา ใช้เวลาไม่ถึงวินาที
 *
 *   npm run check
 *
 * ตรวจ 4 อย่าง:
 *   1. claim ที่ติด verified:true ต้องผ่าน verifyClaim จริง ๆ (ไม่ได้ติดธงมั่ว)
 *   2. claim ที่ติด verified:false ต้องไม่ผ่านจริง ๆ (ตัวอย่าง AI แต่งเกิน)
 *   3. ทุกย่อหน้าในบทต้องอ้าง claim อย่างน้อย 1 อัน และทุกอันต้อง verified
 *   4. ต้องมีอย่างน้อย 1 ย่อหน้าที่ติด flag (ของเด็ดตอน demo ห้ามหาย)
 *
 * สคริปต์นี้คือเครื่องมือกัน regression ตอนที่สองคนเขียนโค้ดพร้อมกัน
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { verifyChapter, verifyClaim } from "../lib/verify.ts";

const read = (p: string) => JSON.parse(readFileSync(join(process.cwd(), p), "utf8"));

const clips = read("data/demo/clips.json");
const chapter = read("data/demo/chapter.json");

let fail = 0;
const bad = (msg: string) => {
  console.error(`  ✗ ${msg}`);
  fail++;
};

console.log("\n🔍 ตรวจ claim ทุกอันเทียบกับ transcript จริง");
let okCount = 0;
let droppedCount = 0;

for (const clip of clips) {
  for (const c of clip.claims) {
    const actual = verifyClaim(clip.transcript, c.quote);
    if (actual !== c.verified) {
      bad(
        `${clip.id}/${c.id} — ไฟล์บอก verified:${c.verified} แต่ตรวจจริงได้ ${actual}\n` +
          `     quote: "${c.quote.slice(0, 50)}..."`
      );
    }
    if (c.verified) okCount++;
    else droppedCount++;
    if (c.startMs >= c.endMs) bad(`${clip.id}/${c.id} — startMs ต้องน้อยกว่า endMs`);
    if (c.endMs > clip.durationMs) bad(`${clip.id}/${c.id} — endMs เกินความยาวคลิป`);
  }
}
console.log(`  claim ที่ผ่าน ${okCount} อัน · ที่ถูกทิ้ง ${droppedCount} อัน`);
if (droppedCount === 0)
  bad("ต้องมี claim ที่ตรวจไม่ผ่านอย่างน้อย 1 อัน ไว้โชว์ว่าระบบจับ AI ได้");

console.log("\n🔍 ตรวจทุกย่อหน้าในบทว่ามีหลักฐานครบ");
const allClaims = clips.flatMap((c: { claims: unknown[] }) => c.claims);
const r = verifyChapter(chapter.paragraphs, allClaims as never);
console.log(`  ย่อหน้าที่มีหลักฐาน ${r.verified}/${r.total}`);
if (!r.ok) bad(`ย่อหน้าที่ไม่มีหลักฐาน: ${r.failedIds.join(", ")}`);

const flagged = chapter.paragraphs.filter((p: { flags: string[] }) => p.flags.length > 0);
console.log(`\n🔍 ย่อหน้าที่ติดไฮไลต์เหลือง ${flagged.length} อัน`);
if (flagged.length === 0)
  bad("ต้องมีย่อหน้าที่ติด flag อย่างน้อย 1 อัน — เป็นจุดขายตอน demo");

if (fail > 0) {
  console.error(`\n❌ ไม่ผ่าน ${fail} ข้อ\n`);
  process.exit(1);
}
console.log("\n✅ สัญญากลางถูกต้องครบทุกข้อ\n");
