/**
 * POST /api/analyze
 *
 * รับไฟล์เสียง 1 คลิป แล้วคืน Clip ที่ claim ทุกอันผ่านการตรวจด้วยโค้ดแล้ว
 *
 * body: multipart/form-data
 *   audio       File     ไฟล์เสียง (webm/mp4/wav)
 *   question    string   คำถามที่หลานถามก่อนกดอัด
 *   sessionId   string
 *   durationMs  string   ความยาวคลิป (วัดจากฝั่ง browser)
 *
 * คืน: { clip, droppedClaims, mode }
 *   droppedClaims = จำนวน claim ที่ AI สร้างมาแต่ตรวจไม่ผ่าน → เอาไปโชว์บน UI ได้เลย
 */

import { NextResponse } from "next/server";
import { analyzeAudio } from "@/lib/gemini";
import { putAudio, saveClip } from "@/lib/store";
import { keepVerified } from "@/lib/verify";
import { runtimeMode } from "@/lib/env";

export const maxDuration = 60; // เสียง 3 นาทีใช้เวลาประมวลผลสักพัก

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get("audio");
    const question = String(form.get("question") ?? "").trim();
    const sessionId = String(form.get("sessionId") ?? "").trim();
    const durationMs = Number(form.get("durationMs") ?? 0);

    if (!(audio instanceof Blob)) {
      return NextResponse.json({ error: "ไม่พบไฟล์เสียง" }, { status: 400 });
    }
    if (!question) {
      return NextResponse.json({ error: "ต้องระบุคำถาม" }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: "ต้องระบุ sessionId" }, { status: 400 });
    }
    // จำกัดความยาวเพื่อคุมเวลาประมวลผลและขนาดไฟล์ (ตามที่เขียนไว้ใน proposal)
    if (durationMs > 5 * 60_000) {
      return NextResponse.json(
        { error: "คลิปยาวเกิน 5 นาที กรุณาแบ่งเป็นหลายคำถาม" },
        { status: 400 }
      );
    }

    const audioUrl = await putAudio(audio, `clip-${Date.now()}.webm`);
    const result = await analyzeAudio(audio, question, durationMs);

    /**
     * ⚠️ ทำให้ claim id ไม่ซ้ำกันข้ามคลิป
     *
     * Gemini คืน id เป็น c1, c2, ... ซึ่งซ้ำกันทุกคลิป
     * แต่ /api/compose เอา claim จาก "ทุกคลิปในหัวข้อ" มารวมกัน
     * ถ้าไม่เติม prefix จะเกิดสองเรื่องนี้:
     *   - ย่อหน้าผูกกับ claim ผิดคลิป (หลักฐานเพี้ยน)
     *   - กด "ปุ่มลืม" คลิปหนึ่ง แล้วย่อหน้าของอีกคลิปหายไปด้วย
     * เจอบั๊กนี้ตอนเทสต์จริง: ลบคลิป 2 แล้วย่อหน้าของคลิป 1 หายไป 5 ย่อหน้า
     */
    const nonce = Math.random().toString(36).slice(2, 8);
    const scoped = result.claims.map((c, i) => ({ ...c, id: `${nonce}-c${i + 1}` }));

    // claim ที่ตรวจไม่ผ่านถูกคัดทิ้งตรงนี้ ไม่ให้ไหลเข้าขั้นเรียบเรียง
    const { kept, dropped } = keepVerified(scoped);

    const clip = await saveClip({
      sessionId,
      question,
      audioUrl,
      durationMs,
      transcript: result.transcript,
      claims: kept,
      nextQuestions: result.nextQuestions,
    });

    return NextResponse.json({ clip, droppedClaims: dropped, mode: runtimeMode() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก";
    console.error("[/api/analyze]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
