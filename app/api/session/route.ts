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
 *   region          string  central|north|northeast|south — ติดป้ายให้ dataset ภาษาถิ่น
 *   visitFrequency  string  together|weekly|monthly|fewTimesAYear — ข้อมูล persona
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

    const REGIONS = ["central", "north", "northeast", "south"] as const;
    const FREQ = ["together", "weekly", "monthly", "fewTimesAYear"] as const;
    const pick = <T extends readonly string[]>(v: unknown, allowed: T) =>
      allowed.includes(String(v) as T[number]) ? (String(v) as T[number]) : undefined;

    const consentAudioUrl = await putAudio(consent, `consent-${Date.now()}.webm`);
    const session = await createSession({
      elderName,
      relation,
      topic,
      consentAudioUrl,
      region: pick(form.get("region"), REGIONS),
      visitFrequency: pick(form.get("visitFrequency"), FREQ),
    });

    return NextResponse.json({ session, mode: runtimeMode() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก";
    console.error("[/api/session]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
