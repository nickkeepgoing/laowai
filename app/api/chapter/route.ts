/**
 * PATCH /api/chapter — ครอบครัวแก้ข้อความและกดยืนยัน
 *
 * ⚠️ การยืนยันโดยมนุษย์เป็นขั้นบังคับ AI ไม่มีสิทธิ์พิมพ์อะไรเองทั้งสิ้น
 * หนังสือจะสร้างได้ก็ต่อเมื่อ approved = true เท่านั้น
 *
 * body JSON: { chapterId, paragraphs?, approved?, title? }
 * คืน: { chapter, shareUrl }
 */

import { NextResponse } from "next/server";
import { getChapter, updateChapter } from "@/lib/store";
import { SITE_URL } from "@/lib/env";

export async function PATCH(req: Request) {
  try {
    const { chapterId, paragraphs, approved, title } = await req.json();
    if (!chapterId) {
      return NextResponse.json({ error: "ต้องระบุ chapterId" }, { status: 400 });
    }

    const current = await getChapter(String(chapterId));
    if (!current) {
      return NextResponse.json({ error: "ไม่พบบทนี้" }, { status: 404 });
    }

    // กันย่อหน้าไม่มีหลักฐานหลุดเข้ามาตอนแก้ไข
    if (paragraphs) {
      const bad = (paragraphs as { claimIds?: string[] }[]).filter(
        (p) => !p.claimIds || p.claimIds.length === 0
      );
      if (bad.length > 0) {
        return NextResponse.json(
          { error: `มี ${bad.length} ย่อหน้าที่ไม่ได้อ้างอิงเสียงต้นฉบับ` },
          { status: 400 }
        );
      }
    }

    const chapter = await updateChapter(String(chapterId), {
      ...(paragraphs ? { paragraphs } : {}),
      ...(approved !== undefined ? { approved: Boolean(approved) } : {}),
      ...(title ? { title: String(title) } : {}),
    });

    return NextResponse.json({
      chapter,
      shareUrl: chapter ? `${SITE_URL}/book/${chapter.shareToken}` : null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก";
    console.error("[/api/chapter]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
