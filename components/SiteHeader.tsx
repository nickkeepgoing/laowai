import Link from "next/link";
import { LayoutDashboard, LogOut, Mic } from "lucide-react";
import Logo from "./Logo";
import { currentUser } from "@/lib/supabase/server";

/**
 * แถบบนของทุกหน้า — server component เพราะต้องรู้สถานะล็อกอินตั้งแต่ render แรก
 * ไม่มีจังหวะกระพริบจาก "ยังไม่รู้ว่าใครล็อกอิน" ซึ่งดูไม่โปรตอน demo
 */
export default async function SiteHeader() {
  const user = await currentUser();
  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "";
  const avatar = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-paper-300/70 bg-paper-50/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
        <Link href="/" className="transition hover:opacity-80">
          <Logo size={38} withWordmark />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                href="/library"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-earth-700 transition hover:bg-paper-200"
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">หน้าหลัก</span>
              </Link>

              <Link
                href="/interview/new"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-earth-900 px-4 font-medium text-paper-50 transition hover:bg-earth-800"
              >
                <Mic size={17} />
                <span className="hidden sm:inline">เริ่มสัมภาษณ์</span>
              </Link>

              <span className="ml-1 flex items-center gap-1.5">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt=""
                    className="h-10 w-10 rounded-full border-2 border-paper-300 object-cover"
                  />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-paper-300 bg-gold-200 font-medium text-earth-800">
                    {name.slice(0, 1).toUpperCase() || "?"}
                  </span>
                )}
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    title="ออกจากระบบ"
                    aria-label="ออกจากระบบ"
                    className="grid h-10 w-10 place-items-center rounded-xl text-earth-500 transition hover:bg-paper-200 hover:text-earth-800"
                  >
                    <LogOut size={17} />
                  </button>
                </form>
              </span>
            </>
          ) : (
            <>
              <Link
                href="/book/demo-token-7f3a9c2e"
                className="hidden min-h-11 items-center rounded-xl px-3.5 text-earth-700 transition hover:bg-paper-200 sm:inline-flex"
              >
                ตัวอย่างหนังสือ
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center rounded-xl border border-paper-400 bg-paper-50 px-4 text-earth-800 transition hover:border-gold-400"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/interview/new"
                className="inline-flex min-h-11 items-center rounded-xl bg-earth-900 px-4 font-medium text-paper-50 transition hover:bg-earth-800"
              >
                เริ่มเลย
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
