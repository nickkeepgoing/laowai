/**
 * POST /auth/signin — เริ่มการเข้าสู่ระบบ
 *
 * ทำฝั่ง server ทั้งหมดโดยตั้งใจ เพื่อไม่ต้องส่ง Supabase key ออกไปอยู่ใน bundle ของเบราว์เซอร์
 *
 * รองรับ 2 ทางเพื่อไม่ให้ demo ล่มถ้าทางใดทางหนึ่งตั้งค่าไม่ทัน:
 *   provider=google  → ส่งไป Google OAuth
 *   email=...        → ส่ง magic link เข้าอีเมล (ไม่ต้องตั้งค่าอะไรเพิ่มใน Google Cloud)
 *
 * form fields: provider | email, next (ไปต่อที่ไหนหลังล็อกอิน)
 */

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/env";

/** กัน open redirect — ยอมเฉพาะ path ภายในเว็บเราเท่านั้น */
function safeNext(v: unknown): string {
  const s = String(v ?? "/library");
  return s.startsWith("/") && !s.startsWith("//") ? s : "/library";
}

export async function POST(req: Request) {
  const form = await req.formData();
  const next = safeNext(form.get("next"));
  const origin = new URL(req.url).origin || SITE_URL;
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const client = await supabaseServer();
  if (!client) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("ยังไม่ได้ตั้งค่า Supabase")}`,
      { status: 303 }
    );
  }

  const provider = String(form.get("provider") ?? "");

  if (provider === "google") {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, queryParams: { prompt: "select_account" } },
    });
    if (error || !data?.url) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(
          error?.message ?? "เปิดหน้าเข้าสู่ระบบด้วย Google ไม่ได้"
        )}`,
        { status: 303 }
      );
    }
    return NextResponse.redirect(data.url, { status: 303 });
  }

  const email = String(form.get("email") ?? "").trim();
  if (!email) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("กรุณากรอกอีเมล")}`,
      { status: 303 }
    );
  }

  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
      { status: 303 }
    );
  }

  return NextResponse.redirect(`${origin}/login?sent=${encodeURIComponent(email)}`, {
    status: 303,
  });
}
