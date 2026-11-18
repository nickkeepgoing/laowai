/**
 * GET /auth/callback — ปลายทางหลังผู้ใช้ยืนยันตัวตน
 *
 * Google OAuth และ magic link จะส่งผู้ใช้กลับมาที่นี่พร้อม ?code=
 * เราแลก code เป็น session แล้วเขียนลง cookie (httpOnly) ฝั่ง server
 * โทเคนจึงไม่เคยผ่านมือ JavaScript ในเบราว์เซอร์เลย
 */

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function safeNext(v: string | null): string {
  const s = v ?? "/library";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/library";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const oauthError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${url.origin}/login?error=${encodeURIComponent(oauthError)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${url.origin}/login?error=${encodeURIComponent("ลิงก์เข้าสู่ระบบไม่สมบูรณ์")}`
    );
  }

  const client = await supabaseServer();
  if (!client) {
    return NextResponse.redirect(
      `${url.origin}/login?error=${encodeURIComponent("ยังไม่ได้ตั้งค่า Supabase")}`
    );
  }

  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${url.origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${url.origin}${next}`);
}
