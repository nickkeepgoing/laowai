/**
 * POST /api/correct — Dialect Correction Flywheel
 *
 * ยิงทุกครั้งที่ครอบครัวแก้ข้อความที่ AI ถอดผิดในหน้าตรวจ
 *
 * mentor แนะว่าต้องเก็บตัวอย่างคำถิ่น และบอกว่ามนุษย์ต้องเป็นคนแก้
 * สองอย่างนี้คืออันเดียวกัน ทุกการแก้ = ข้อมูล 1 คู่ที่คู่แข่งไม่มี
 *
 * ⚠️ ความเป็นส่วนตัวเป็นค่าตั้งต้น ไม่ใช่ตัวเลือก
 * เก็บเฉพาะ asrText → humanText + ภาค
 * clipId/spanStartMs เก็บต่อเมื่อ optIn === true เท่านั้น
 * (proposal เราประกาศว่าไม่เอาเสียงไปฝึกโมเดลโดยไม่มีความยินยอมแยก)
 *
 * body JSON: { asrText, humanText, region?, clipId?, spanStartMs?, optIn? }
 * คืน: { saved, totalPairs, linkedToAudio }
 */

import { NextResponse } from "next/server";
import { countCorrections, saveCorrection } from "@/lib/store";
import { normalizeThai } from "@/lib/verify";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const asrText = String(body.asrText ?? "").trim();
    const humanText = String(body.humanText ?? "").trim();
    const optIn = body.optIn === true;

    if (!asrText || !humanText) {
      return NextResponse.json({ error: "ต้องมีทั้งข้อความเดิมและข้อความที่แก้" }, { status: 400 });
    }

    // แก้แค่เครื่องหมายวรรคตอนหรือช่องว่าง ไม่ถือเป็นข้อมูลภาษาถิ่น ไม่ต้องเก็บ
    if (normalizeThai(asrText) === normalizeThai(humanText)) {
      return NextResponse.json({ saved: false, reason: "ไม่ได้เปลี่ยนถ้อยคำ" });
    }

    // ถ้าแก้ยาวมากคือเขียนใหม่ทั้งย่อหน้า ไม่ใช่การแก้คำที่ถอดผิด → ไม่เอาเข้า dataset
    if (asrText.length > 400 || humanText.length > 400) {
      return NextResponse.json({ saved: false, reason: "ข้อความยาวเกินกว่าจะเป็นคู่คำ" });
    }

    await saveCorrection({
      asrText,
      humanText,
      region: body.region,
      // ⬇️ จุดบังคับเรื่องความยินยอม
      clipId: optIn ? (body.clipId ?? null) : null,
      spanStartMs: optIn ? (body.spanStartMs ?? null) : null,
    });

    return NextResponse.json({
      saved: true,
      totalPairs: await countCorrections(),
      linkedToAudio: optIn,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก";
    console.error("[/api/correct]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
