/**
 * POST /api/compose
 *
 * รวม claim ที่ verified แล้วของทั้งหัวข้อ → เรียบเรียงเป็นบทหนังสือ
 *
 * body JSON: { sessionId, title, elderName? }
 * คืน: { chapter, verifiedParagraphs, totalParagraphs, claimsUsed, mode }
 *
 * verifiedParagraphs/totalParagraphs คือตัวเลขที่เอาไปพูดบนเวที
 * ควรเป็น x/x เสมอ เพราะย่อหน้าที่ไม่มีหลักฐานถูกตัดทิ้งก่อนบันทึก
 */

import { NextResponse } from "next/server";
import { composeChapter } from "@/lib/gemini";
import { listClips, saveChapter } from "@/lib/store";
import { indexClaims, verifyChapter, verifyParagraph } from "@/lib/verify";
import { runtimeMode, TimeoutError, withTimeout } from "@/lib/env";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { sessionId, title, elderName } = await req.json();
    if (!sessionId || !title) {
      return NextResponse.json({ error: "ต้องระบุ sessionId และ title" }, { status: 400 });
    }

    const clips = await listClips(String(sessionId));
    if (clips.length === 0) {
      return NextResponse.json(
        { error: "ยังไม่มีคลิปในหัวข้อนี้ กรุณาอัดเสียงก่อน" },
        { status: 400 }
      );
    }

    // เอาเฉพาะ claim ที่ผ่านการตรวจเท่านั้นเข้าสู่ขั้นเรียบเรียง
    const claims = clips.flatMap((c) => c.claims).filter((c) => c.verified);
    if (claims.length === 0) {
      return NextResponse.json(
        { error: "ไม่มีข้อมูลที่ตรวจสอบได้จากเสียงที่อัดไว้" },
        { status: 400 }
      );
    }

    const drafted = await withTimeout(
      composeChapter(String(title), String(elderName ?? "ท่าน"), claims),
      45_000,
      "การเรียบเรียงบท"
    );

    // ด่านสุดท้าย: ย่อหน้าที่อ้าง claim ที่ตรวจไม่ผ่าน หรือไม่อ้างอะไรเลย → ตัดทิ้ง
    const byId = indexClaims(claims);
    const paragraphs = drafted.filter((p) => verifyParagraph(p, byId));

    const chapter = await saveChapter({
      sessionId: String(sessionId),
      title: String(title),
      paragraphs,
      approved: false,
    });

    const r = verifyChapter(paragraphs, claims);
    return NextResponse.json({
      chapter,
      verifiedParagraphs: r.verified,
      totalParagraphs: r.total,
      droppedParagraphs: drafted.length - paragraphs.length,
      claimsUsed: claims.length,
      mode: runtimeMode(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก";
    console.error("[/api/compose]", msg);
    if (e instanceof TimeoutError) {
      return NextResponse.json(
        { error: msg + " — บทนี้มีข้อมูลมาก ลองลบคลิปที่ไม่ต้องการออกบ้างแล้วกดเรียบเรียงใหม่" },
        { status: 504 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
