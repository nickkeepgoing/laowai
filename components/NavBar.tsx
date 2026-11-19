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
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, LayoutDashboard, LogOut, Menu, Mic, X } from "lucide-react";
import clsx from "clsx";
import Logo from "./Logo";

/**
 * แถบนำทางมีสองชุด แยกตามว่าผู้ใช้ล็อกอินหรือยัง
 *
 * ⚠️ เหตุผล: ก่อนหน้านี้ใช้ชุดเดียวกันทั้งสองสถานะ คนที่ล็อกอินแล้ว
 * จึงยังเห็น "วิธีใช้งาน ราคา คำถามที่พบบ่อย" ซึ่งเป็นลิงก์สำหรับคนที่
 * ยังไม่ตัดสินใจ เขาอ่านและตัดสินใจไปแล้วตั้งแต่ตอนสมัคร
 * การคงไว้ทำให้เว็บไม่รู้ว่าตัวเองเป็น "หน้าขายของ" หรือ "เครื่องมือ"
 *
 * คนที่ล็อกอินแล้วต้องการรู้แค่สองอย่าง: เรื่องที่เก็บไว้อยู่ไหน
 * และจะเริ่มเก็บเรื่องใหม่ยังไง
 */

/** ก่อนล็อกอิน — ลิงก์ชวนให้เข้าใจและตัดสินใจ */
const PUBLIC_LINKS = [
  { href: "/#how", label: "วิธีใช้งาน" },
  { href: "/#proof", label: "ตรวจสอบได้" },
  { href: "/#pricing", label: "ราคา" },
  { href: "/#faq", label: "คำถามที่พบบ่อย" },
];

/** หลังล็อกอิน — ลิงก์ใช้งานจริง ทุกอันเป็นหน้าของตัวเอง จึงไฮไลต์ได้ */
const APP_LINKS = [
  { href: "/library", label: "คลังความทรงจำ" },
  { href: "/interview/new", label: "เริ่มสัมภาษณ์" },
  { href: "/book/demo-token-7f3a9c2e", label: "ตัวอย่างหนังสือ" },
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
  const pathname = usePathname();

  const links = signedIn ? APP_LINKS : PUBLIC_LINKS;
  /** ลิงก์แบบ hash บนหน้าแรกไม่มีสถานะ "กำลังอยู่" จึงไฮไลต์เฉพาะลิงก์ของแอป */
  const isActive = (href: string) =>
    signedIn && (href === "/library" ? pathname === "/library" : pathname.startsWith(href));

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
            ? "border-paper-300 bg-paper-50/95 px-2.5 py-1.5 shadow-[0_10px_28px_-14px_rgba(87,70,52,0.45)] backdrop-blur-xl sm:px-3"
            : "border-paper-300 bg-paper-50/88 px-2.5 py-2 shadow-[0_6px_22px_-16px_rgba(87,70,52,0.35)] backdrop-blur-xl sm:px-4"
        )}
      >
        <Link href="/" className="transition hover:opacity-80">
          <Logo size={scrolled ? 28 : 31} withWordmark />
        </Link>

        {/* ลิงก์กลาง — ซ่อนบนจอเล็กเพื่อไม่ให้แถบแน่นเกิน */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "rounded-full px-3.5 py-1.5 text-sm transition",
                  active
                    ? "bg-gold-200/70 font-medium text-earth-900"
                    : "text-earth-700 hover:bg-paper-200 hover:text-earth-900"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Link
                href="/library"
                className="hidden min-h-9 items-center gap-1.5 rounded-full px-3 text-sm text-earth-700 transition hover:bg-paper-200 sm:inline-flex"
              >
                <LayoutDashboard size={15} />
                หน้าหลัก
              </Link>
              <Link
                href="/interview/new"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-ink-800 px-4 text-sm font-medium text-paper-50 transition hover:bg-ink-700"
              >
                <Mic size={15} />
                <span className="hidden sm:inline">เริ่มสัมภาษณ์</span>
              </Link>
              <span className="flex items-center gap-1">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt=""
                    className="h-8 w-8 rounded-full border border-paper-300 object-cover"
                  />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-paper-300 bg-gold-200 text-sm font-medium text-earth-800">
                    {name.slice(0, 1).toUpperCase() || "?"}
                  </span>
                )}
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    title="ออกจากระบบ"
                    aria-label="ออกจากระบบ"
                    className="grid h-8 w-8 place-items-center rounded-full text-earth-500 transition hover:bg-paper-200 hover:text-earth-900"
                  >
                    <LogOut size={14} />
                  </button>
                </form>
              </span>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden min-h-9 items-center rounded-full px-3 text-sm text-earth-700 transition hover:bg-paper-200 sm:inline-flex"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/interview/new"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-ink-800 px-4 text-sm font-medium text-paper-50 transition hover:bg-ink-700"
              >
                <Mic size={15} />
                เริ่มเลย
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-full text-earth-700 transition hover:bg-paper-200 lg:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* เมนูบนจอเล็ก — ปุ่มใหญ่ตามแนวทาง accessibility ของเรา */}
      {open && (
        <div className="pointer-events-auto mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-paper-300 bg-paper-50/97 p-2 shadow-[0_18px_40px_-18px_rgba(87,70,52,0.5)] backdrop-blur-xl lg:hidden">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex min-h-13 items-center rounded-2xl px-5 transition",
                  active
                    ? "bg-gold-200/70 font-medium text-earth-900"
                    : "text-earth-800 hover:bg-paper-200"
                )}
              >
                {l.label}
              </Link>
            );
          })}
          {!signedIn && (
            <Link
              href="/book/demo-token-7f3a9c2e"
              onClick={() => setOpen(false)}
              className="flex min-h-13 items-center gap-2 rounded-2xl px-5 text-earth-800 transition hover:bg-paper-200"
            >
              <BookOpen size={18} /> ตัวอย่างหนังสือ
            </Link>
          )}
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
