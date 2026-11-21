import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import { hasSupabase } from "@/lib/env";
import { currentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "เข้าสู่ระบบ — เล่าไว้" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; next?: string }>;
}) {
  const { error, sent, next } = await searchParams;
  const user = await currentUser();
  if (user) redirect(next ?? "/library");

  const target = next ?? "/library";

  return (
    <main className="relative grid min-h-screen place-items-center px-5 py-16">
      <div className="aurora" aria-hidden />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-earth-700 hover:text-earth-900"
        >
          <ArrowLeft size={15} /> กลับหน้าแรก
        </Link>

        <div className="ring-glow rounded-3xl border border-paper-300 bg-paper-50 p-8 backdrop-blur-xl">
          <Logo size={44} />

          <h1 className="mt-6 font-serif text-3xl text-earth-900">
            เข้าสู่คลังความทรงจำ
          </h1>
          <p className="mt-2.5 leading-relaxed text-earth-700">
            เรื่องเล่าของครอบครัวเป็นของครอบครัว
            เราจึงให้เข้าถึงได้เฉพาะคนที่คุณอนุญาตเท่านั้น
          </p>

          {!hasSupabase() && (
            <p className="mt-6 rounded-xl border border-warn-500/50 bg-warn-200/70 px-4 py-3 text-sm text-warn-900">
              ยังไม่ได้ตั้งค่า Supabase — ใช้งานโหมดสาธิตได้โดยไม่ต้องเข้าสู่ระบบ
            </p>
          )}

          {error && (
            <p className="mt-6 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </p>
          )}

          {sent ? (
            <div className="mt-7 rounded-2xl border border-verified-600/35 bg-verified-400/15 p-5 text-center">
              <Mail size={24} className="mx-auto text-verified-600" />
              <p className="mt-3 font-medium text-earth-900">ส่งลิงก์เข้าสู่ระบบแล้ว</p>
              <p className="mt-1.5 text-sm leading-relaxed text-earth-700">
                เปิดอีเมล <strong className="text-earth-800">{sent}</strong> แล้วกดลิงก์ในนั้น
                <br />
                ลิงก์ใช้ได้ครั้งเดียวและหมดอายุใน 1 ชั่วโมง
              </p>
            </div>
          ) : (
            <>
              <form action="/auth/signin" method="post" className="mt-8">
                <input type="hidden" name="provider" value="google" />
                <input type="hidden" name="next" value={target} />
                <button
                  type="submit"
                  className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-paper-400 bg-paper-50 px-5 font-medium text-earth-900 transition hover:border-gold-400 hover:bg-paper-100"
                >
                  <GoogleMark />
                  เข้าสู่ระบบด้วย Google
                </button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-paper-200" />
                <span className="text-xs text-earth-500">หรือใช้อีเมล</span>
                <span className="h-px flex-1 bg-paper-200" />
              </div>

              <form action="/auth/signin" method="post" className="space-y-3">
                <input type="hidden" name="next" value={target} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-paper-300 bg-paper-200 px-4 py-3 text-earth-900 placeholder:text-earth-500 focus:border-gold-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl border border-paper-300 px-5 py-3 font-medium text-earth-800 transition hover:border-gold-400/60 hover:bg-paper-200"
                >
                  ส่งลิงก์เข้าสู่ระบบให้ทางอีเมล
                </button>
              </form>
            </>
          )}

          <p className="mt-7 flex items-start gap-2 text-xs leading-relaxed text-earth-500">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-verified-400" />
            เราไม่ขอสิทธิ์เข้าถึงอีเมลหรือไฟล์ของคุณ ใช้เพียงเพื่อยืนยันว่าเป็นคุณ
            และผูกคลังความทรงจำเข้ากับบัญชีของคุณเท่านั้น
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-earth-500">
          อยากลองก่อน?{" "}
          <Link href="/book/demo-token-7f3a9c2e" className="text-gold-300 hover:text-gold-200">
            ดูตัวอย่างหนังสือ
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.77 24c0-1.6.27-3.15.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
