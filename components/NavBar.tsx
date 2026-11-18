"use client";

/**
 * แถบนำทางแบบลอย
 *
 * ทำไมไม่ใช้แถบติดขอบบนเต็มความกว้างแบบเดิม:
 * แถบเต็มความกว้างทำให้หน้าเว็บถูก "ตัดหัว" ด้วยเส้นตรงแข็ง ๆ
 * แบบลอยทำให้เนื้อหาไหลต่อเนื่องใต้แถบ และให้ความรู้สึกเป็นชั้น ๆ
 * ซึ่งแก้ปัญหา "หน้าแบน" ตั้งแต่สิ่งแรกที่ผู้ใช้เห็น
 *
 * ตอนเลื่อนลงแถบจะหดและทึบขึ้น เพื่อให้อ่านง่ายบนเนื้อหาที่ซับซ้อน
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, LayoutDashboard, LogOut, Menu, Mic, X } from "lucide-react";
import clsx from "clsx";
import Logo from "./Logo";

const LINKS = [
  { href: "/#how", label: "วิธีใช้งาน" },
  { href: "/#proof", label: "ตรวจสอบได้" },
  { href: "/#pricing", label: "ราคา" },
  { href: "/#faq", label: "คำถามที่พบบ่อย" },
];

export default function NavBar({
  signedIn,
  name,
  avatar,
}: {
  signedIn: boolean;
  name: string;
  avatar?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="no-print pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        className={clsx(
          "pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border transition-all duration-300",
          scrolled
            ? "border-paper-300 bg-paper-50/92 px-3 py-2 shadow-[0_10px_30px_-14px_rgba(87,70,52,0.45)] backdrop-blur-xl sm:px-4"
            : "border-paper-300/60 bg-paper-50/70 px-3 py-2.5 backdrop-blur-md sm:px-5 sm:py-3"
        )}
      >
        <Link href="/" className="transition hover:opacity-80">
          <Logo size={scrolled ? 32 : 36} withWordmark />
        </Link>

        {/* ลิงก์กลาง — ซ่อนบนจอเล็กเพื่อไม่ให้แถบแน่นเกิน */}
        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-earth-700 transition hover:bg-paper-200 hover:text-earth-900"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Link
                href="/library"
                className="hidden min-h-11 items-center gap-2 rounded-full px-4 text-earth-700 transition hover:bg-paper-200 sm:inline-flex"
              >
                <LayoutDashboard size={17} />
                หน้าหลัก
              </Link>
              <Link
                href="/interview/new"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink-800 px-4 font-medium text-paper-50 transition hover:bg-ink-700 sm:px-5"
              >
                <Mic size={17} />
                <span className="hidden sm:inline">เริ่มสัมภาษณ์</span>
              </Link>
              <span className="flex items-center gap-1">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt=""
                    className="h-9 w-9 rounded-full border-2 border-paper-300 object-cover"
                  />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-paper-300 bg-gold-200 text-sm font-medium text-earth-800">
                    {name.slice(0, 1).toUpperCase() || "?"}
                  </span>
                )}
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    title="ออกจากระบบ"
                    aria-label="ออกจากระบบ"
                    className="grid h-9 w-9 place-items-center rounded-full text-earth-500 transition hover:bg-paper-200 hover:text-earth-900"
                  >
                    <LogOut size={16} />
                  </button>
                </form>
              </span>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden min-h-11 items-center rounded-full px-4 text-earth-700 transition hover:bg-paper-200 sm:inline-flex"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/interview/new"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink-800 px-5 font-medium text-paper-50 transition hover:bg-ink-700"
              >
                <Mic size={17} />
                เริ่มเลย
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center rounded-full text-earth-700 transition hover:bg-paper-200 lg:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* เมนูบนจอเล็ก — ปุ่มใหญ่ตามแนวทาง accessibility ของเรา */}
      {open && (
        <div className="pointer-events-auto mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-paper-300 bg-paper-50/97 p-2 shadow-[0_18px_40px_-18px_rgba(87,70,52,0.5)] backdrop-blur-xl lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex min-h-13 items-center rounded-2xl px-5 text-earth-800 transition hover:bg-paper-200"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/book/demo-token-7f3a9c2e"
            onClick={() => setOpen(false)}
            className="flex min-h-13 items-center gap-2 rounded-2xl px-5 text-earth-800 transition hover:bg-paper-200"
          >
            <BookOpen size={18} /> ตัวอย่างหนังสือ
          </Link>
          {!signedIn && (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex min-h-13 items-center rounded-2xl px-5 text-earth-800 transition hover:bg-paper-200 sm:hidden"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
