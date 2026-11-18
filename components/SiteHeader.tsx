import Link from "next/link";
import { LibraryBig, LogOut } from "lucide-react";
import Logo from "./Logo";
import { currentUser } from "@/lib/supabase/server";

/**
 * แถบบนของทุกหน้า — server component เพราะต้องรู้สถานะล็อกอินตั้งแต่ render แรก
 * ไม่มีการกระพริบจาก "ยังไม่รู้ว่าใครล็อกอิน" ซึ่งดูไม่โปรเวลา demo
 */
export default async function SiteHeader() {
  const user = await currentUser();
  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "";
  const avatar = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/5 bg-night-950/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <Link href="/" className="transition hover:opacity-85">
          <Logo size={34} withWordmark />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                href="/library"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-mist-300 transition hover:bg-white/5 hover:text-mist-50"
              >
                <LibraryBig size={16} />
                <span className="hidden sm:inline">คลังความทรงจำ</span>
              </Link>

              <Link
                href="/interview/new"
                className="rounded-xl bg-gold-400 px-4 py-2 text-sm font-medium text-night-950 transition hover:bg-gold-300"
              >
                เริ่มสัมภาษณ์
              </Link>

              <span className="ml-1 flex items-center gap-2">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt=""
                    className="h-8 w-8 rounded-full border border-white/15"
                  />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-night-800 text-xs text-mist-300">
                    {name.slice(0, 1).toUpperCase() || "?"}
                  </span>
                )}
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    title="ออกจากระบบ"
                    aria-label="ออกจากระบบ"
                    className="grid h-8 w-8 place-items-center rounded-lg text-mist-500 transition hover:bg-white/5 hover:text-mist-100"
                  >
                    <LogOut size={15} />
                  </button>
                </form>
              </span>
            </>
          ) : (
            <>
              <Link
                href="/book/demo-token-7f3a9c2e"
                className="hidden rounded-xl px-3 py-2 text-sm text-mist-300 transition hover:bg-white/5 hover:text-mist-50 sm:inline-block"
              >
                ตัวอย่างหนังสือ
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-mist-100 transition hover:border-gold-400/60 hover:bg-white/5"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/interview/new"
                className="rounded-xl bg-gold-400 px-4 py-2 text-sm font-medium text-night-950 transition hover:bg-gold-300"
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
