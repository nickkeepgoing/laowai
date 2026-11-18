/**
 * POST /api/forget — "ปุ่มลืม"
 *
 * ถ้าผู้สูงอายุเผลอเล่าเรื่องที่ไม่อยากให้บันทึก (ความลับครอบครัว เรื่องสุขภาพ)
 * ครอบครัวต้องลบได้ทันที และต้องลบให้ "หมดจริง" ไม่ใช่แค่ซ่อน
 *
 * ลบ 4 ชั้นพร้อมกัน:
 *   1. ตัวคลิปเสียง
 *   2. claim ทุกอันที่มาจากคลิปนั้น
 *   3. ย่อหน้าในหนังสือที่อ้าง claim เหล่านั้น
 *   4. correction ที่ผูกกับคลิปนั้น (เฉพาะที่ opt-in ไว้ — ที่ไม่ opt-in ไม่มี clipId อยู่แล้ว)
 *
 * ข้อ 4 สำคัญ: ถ้าเราบอกผู้ใช้ว่า "ลบได้" แล้วยังเก็บคู่ข้อความไว้ใน dataset
 * เราก็โกหกเขา และจะตอบกรรมการเรื่อง PDPA ไม่ได้
 *
 * body JSON: { clipId, sessionId, chapterId? }
 * คืน: { removedClaimIds, removedParagraphs, removedCorrections, chapter }
 */

import { NextResponse } from "next/server";
import {
  deleteClip,
  deleteCorrectionsOfClip,
  getChapter,
  listClips,
  updateChapter,
} from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { clipId, sessionId, chapterId } = await req.json();
    if (!clipId || !sessionId) {
      return NextResponse.json({ error: "ต้องระบุ clipId และ sessionId" }, { status: 400 });
    }

    const clips = await listClips(String(sessionId));
    const target = clips.find((c) => c.id === clipId);
    if (!target) {
      return NextResponse.json({ error: "ไม่พบคลิปนี้" }, { status: 404 });
    }

    const removedClaimIds = target.claims.map((c) => c.id);

    // ลบ correction ก่อนลบคลิป เพื่อให้นับจำนวนได้ในโหมด memory
    // (โหมด Supabase มี on delete cascade อยู่แล้ว แต่ลบตรง ๆ จะได้ตัวเลขกลับมารายงาน)
    const removedCorrections = await deleteCorrectionsOfClip(String(clipId));
    await deleteClip(String(clipId));

    let removedParagraphs = 0;
    let chapter = null;

    if (chapterId) {
      const ch = await getChapter(String(chapterId));
      if (ch) {
        const kept = ch.paragraphs.filter(
          (p) => !p.claimIds.some((id) => removedClaimIds.includes(id))
        );
        removedParagraphs = ch.paragraphs.length - kept.length;
        chapter = await updateChapter(ch.id, { paragraphs: kept });
      }
    }

    return NextResponse.json({
      removedClaimIds,
      removedParagraphs,
      removedCorrections,
      chapter,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก";
    console.error("[/api/forget]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
