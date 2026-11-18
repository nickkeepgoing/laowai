/**
 * POST /api/session — เริ่มเก็บเรื่องของผู้สูงอายุ 1 ท่าน
 *
 * ⚠️ ต้องมี consentAudio เสมอ: เสียงที่ "ท่านพูดคำว่ายินยอมด้วยตัวเอง"
 * ไม่ใช่หลานติ๊กแทน นี่คือข้อบังคับด้านจริยธรรมของโปรเจกต์
 * บังคับที่ระดับ API เพื่อให้ไม่มีทางข้ามได้แม้แต่ตอน demo
 *
 * body: multipart/form-data
 *   elderName    string
 *   relation     string   เช่น "ยายของนิค"
 *   topic        string   id ของหัวข้อจาก data/questions.json
 *   consentAudio File     เสียงยินยอมของท่าน
 */

import { NextResponse } from "next/server";
import { createSession, putAudio } from "@/lib/store";
import { runtimeMode } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const elderName = String(form.get("elderName") ?? "").trim();
    const relation = String(form.get("relation") ?? "").trim();
    const topic = String(form.get("topic") ?? "").trim();
    const consent = form.get("consentAudio");

    if (!elderName) {
      return NextResponse.json({ error: "ต้องระบุชื่อผู้เล่า" }, { status: 400 });
    }
    if (!(consent instanceof Blob)) {
      return NextResponse.json(
        { error: "ต้องมีเสียงยินยอมจากผู้เล่าก่อนเริ่มบันทึก" },
        { status: 400 }
      );
    }

    const consentAudioUrl = await putAudio(consent, `consent-${Date.now()}.webm`);
    const session = await createSession({ elderName, relation, topic, consentAudioUrl });

    return NextResponse.json({ session, mode: runtimeMode() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก";
    console.error("[/api/session]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
