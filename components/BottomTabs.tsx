"use client";

/**
 * แถบแท็บด้านล่าง — โครงนำทางหลักบนมือถือ
 *
 * ทำไมต้องมี:
 * ก่อนหน้านี้ทั้งแอปมี <nav> เดียวคือแถบลอยด้านบน และลิงก์กลางของมันเป็น
 * `hidden lg:flex` แปลว่าตั้งแต่ 0 ถึง 1024px ผู้ใช้เหลือทางเดียวคือแฮมเบอร์เกอร์
 * ซึ่งต้องกดสองจังหวะทุกครั้งที่อยากย้ายหน้า
 *
 * อุปกรณ์หลักของผลิตภัณฑ์นี้คือมือถือ เพราะลูกหลานนั่งข้างท่านแล้วถือโทรศัพท์
 * แถบล่างจึงเป็นที่ที่ถูกต้อง นิ้วโป้งเอื้อมถึงโดยไม่ต้องขยับมือ
 * และเป็นภาษาที่คนไทยคุ้นอยู่แล้วจาก LINE กับ Facebook
 *
 * 3 ปลายทางเท่านั้น เพราะแอปมีงานให้ทำจริง ๆ แค่ 3 อย่าง
 * ปุ่มกลางยกสูงแบบปุ่ม + ของ Instagram เพราะ "เริ่มสัมภาษณ์" คือเหตุผลที่คนเปิดแอป
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, LayoutGrid, LogOut, Mic, UserRound } from "lucide-react";
import clsx from "clsx";
import Sheet from "./Sheet";

/**
 * หน้าที่ต้องไม่มีแถบแท็บ และเหตุผลของแต่ละอัน
 *   /book   เครื่องอ่านล็อกความสูงจอและไม่เลื่อน แถบจะไปกินพื้นที่หน้ากระดาษ
 *   /deck   สไลด์ขนาดตายตัว 1280x720
 *   /clip   หน้าที่คนนอกสแกน QR เข้ามา เขาไม่ใช่เจ้าของบัญชี
 *   /interview/[id]  งานที่ต้องโฟกัส ถ้าเผลอแตะแท็บกลางอัดจะเสียคลิปที่กำลังทำ
 */
function hiddenOn(pathname: string): boolean {
  if (pathname.startsWith("/book") || pathname.startsWith("/deck")) return true;
  if (pathname.startsWith("/clip")) return true;
  // /interview/new ยังแสดง แต่ /interview/<id> ซึ่งเป็นหน้าอัดเสียงไม่แสดง
  if (pathname.startsWith("/interview/") && pathname !== "/interview/new") return true;
  return false;
}

export default function BottomTabs({
  signedIn,
  name,
  avatar,
}: {
  signedIn: boolean;
  name: string;
  avatar?: string;
}) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);

  // เปลี่ยนหน้าแล้วต้องปิดแผ่นเสมอ ไม่งั้นมันค้างทับหน้าใหม่
  useEffect(() => setAccountOpen(false), [pathname]);

  if (!signedIn || hiddenOn(pathname)) return null;

  const atLibrary = pathname === "/library";

  return (
    <>
      {/*
       * แถบนี้ซ่อนบนเดสก์ท็อป (lg ขึ้นไป) เพราะแถบลอยด้านบนแสดงลิงก์ครบอยู่แล้ว
       * ไม่มีเหตุผลให้มีแถบนำทางสองอันพร้อมกัน
       */}
      <nav
        className="bottom-tabs no-print fixed inset-x-0 bottom-0 z-50 border-t border-paper-300 bg-paper-50/97 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="เมนูหลัก"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
          <Tab
            href="/library"
            icon={LayoutGrid}
            label="คลังความทรงจำ"
            active={atLibrary}
          />

          {/* ปุ่มกลาง — งานหลักของแอป จึงยกสูงและใช้สีปุ่มหลัก */}
          <Link
            href="/interview/new"
            aria-label="เริ่มสัมภาษณ์"
            aria-current={pathname === "/interview/new" ? "page" : undefined}
            className="group relative -mt-5 flex w-20 shrink-0 flex-col items-center"
          >
            <span
              className={clsx(
                "grid h-14 w-14 place-items-center rounded-full text-paper-50 shadow-[0_10px_26px_-8px_rgba(26,37,57,0.7)] transition",
                pathname === "/interview/new"
                  ? "bg-ink-900 ring-4 ring-gold-200"
                  : "bg-ink-800 group-hover:bg-ink-700"
              )}
            >
              <Mic size={24} />
            </span>
            <span className="mt-1 text-[11px] leading-tight text-earth-700">เริ่มเล่า</span>
          </Link>

          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={accountOpen}
            className="flex min-h-15 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl text-earth-700 transition hover:bg-paper-200"
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt=""
                className="h-6 w-6 rounded-full border border-paper-300 object-cover"
              />
            ) : (
              <UserRound size={22} />
            )}
            <span className="text-[11px] leading-tight">บัญชี</span>
          </button>
        </div>
      </nav>

      {/* บัญชีเป็นแผ่นเลื่อนขึ้น ไม่ใช่หน้าใหม่ เพราะมีให้ทำแค่ 3 อย่าง */}
      <Sheet
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        title={name ? `สวัสดี คุณ${name}` : "บัญชีของคุณ"}
        description="เรื่องทั้งหมดผูกกับบัญชีนี้ คนอื่นเห็นได้เฉพาะหนังสือที่คุณแชร์ลิงก์ให้"
      >
        <div className="flex flex-col gap-2">
          <Link
            href="/book/demo-token-7f3a9c2e"
            className="flex min-h-14 items-center gap-3 rounded-2xl border border-paper-300 px-5 text-earth-800 transition hover:border-gold-400 hover:bg-paper-100"
          >
            <BookOpen size={19} className="text-gold-500" />
            ดูตัวอย่างหนังสือ
          </Link>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-paper-300 px-5 text-left text-earth-800 transition hover:border-gold-400 hover:bg-paper-100"
            >
              <LogOut size={19} className="text-earth-500" />
              ออกจากระบบ
            </button>
          </form>
        </div>
      </Sheet>
    </>
  );
}

function Tab({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        // min-h-15 = 60px ใหญ่กว่าเกณฑ์ 44px เพราะเป็นปลายทางหลักที่ถูกกดบ่อยที่สุด
        "flex min-h-15 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl transition",
        active ? "text-earth-900" : "text-earth-700 hover:bg-paper-200"
      )}
    >
      <Icon size={22} />
      <span className="text-[11px] leading-tight">{label}</span>
      {/* ขีดทองใต้แท็บที่กำลังอยู่ — บอกตำแหน่งโดยไม่ต้องพึ่งสีตัวอักษรอย่างเดียว */}
      <span
        className={clsx(
          "h-0.5 w-6 rounded-full transition",
          active ? "bg-gold-400" : "bg-transparent"
        )}
        aria-hidden
      />
    </Link>
  );
}
