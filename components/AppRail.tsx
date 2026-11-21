"use client";

/**
 * แถบไอคอนด้านซ้ายบนเดสก์ท็อป — ต้นแบบจากหน้าแอปของ Nixtio
 *
 * ทำไมเปลี่ยนจากแถบบนลอยมาเป็นแถบซ้ายเฉพาะในตัวแอป:
 * หน้าแอปมีปลายทางแค่ไม่กี่ที่ แถบบนยาวเต็มจอจึงมีพื้นที่ว่างเยอะเกินจริง
 * และกินความสูงจอซึ่งมีค่าที่สุดบนแล็ปท็อป ส่วนความกว้างจอเหลือเฟือ
 * แถบไอคอนแคบ ๆ ด้านซ้ายคืนความสูงให้เนื้อหา และแยกชัดว่า
 * "ตอนนี้อยู่ในแอปแล้ว ไม่ใช่หน้าขายของ"
 *
 * ไอคอนอย่างเดียวอ่านยากสำหรับผู้สูงอายุ จึงมีป้ายชื่อโผล่ตอนชี้
 * และมี aria-label ทุกปุ่ม
 *
 * โผล่เฉพาะ lg ขึ้นไปและเฉพาะหน้าที่เป็นตัวแอป (ดู lib/chrome.ts)
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, LayoutGrid, Plus, UserRound } from "lucide-react";
import clsx from "clsx";
import Logo from "./Logo";
import AccountSheet from "./AccountSheet";
import { DEMO_BOOK, isAppRoute } from "@/lib/chrome";

export default function AppRail({
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
  useEffect(() => setAccountOpen(false), [pathname]);

  if (!signedIn || !isAppRoute(pathname)) return null;

  return (
    <>
      <aside
        className="app-rail no-print fixed inset-y-0 left-0 z-40 hidden w-[5.75rem] flex-col items-center justify-between py-6 lg:flex"
        aria-label="เมนูหลัก"
      >
        <div className="flex flex-col items-center gap-3">
          <Link href="/library" aria-label="เล่าไว้ — หน้าหลัก" className="mb-4 transition hover:opacity-80">
            <Logo size={40} />
          </Link>

          {/* ปุ่มหลักสีเข้ม — งานที่คนมาที่นี่เพื่อทำ */}
          <RailItem
            href="/interview/new"
            label="เล่าเรื่องใหม่"
            active={pathname === "/interview/new"}
            primary
          >
            <Plus size={22} />
          </RailItem>

          <RailItem href="/library" label="คลังความทรงจำ" active={pathname === "/library"}>
            <LayoutGrid size={20} />
          </RailItem>

          <RailItem href={DEMO_BOOK} label="ตัวอย่างหนังสือ" active={false}>
            <BookOpen size={20} />
          </RailItem>
        </div>

        <button
          type="button"
          onClick={() => setAccountOpen(true)}
          aria-label="บัญชีของคุณ"
          aria-haspopup="dialog"
          className="group relative grid h-12 w-12 place-items-center rounded-full border border-paper-300 bg-paper-50 text-earth-700 shadow-[0_6px_18px_-10px_rgba(60,45,28,0.4)] transition hover:border-gold-400"
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <UserRound size={20} />
          )}
          <Tip>บัญชี</Tip>
        </button>
      </aside>

      <AccountSheet
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        name={name}
        avatar={avatar}
      />
    </>
  );
}

function RailItem({
  href,
  label,
  active,
  primary,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "group relative grid h-12 w-12 place-items-center rounded-full transition",
        primary
          ? "bg-ink-800 text-paper-50 shadow-[0_10px_24px_-10px_rgba(26,37,57,0.75)] hover:bg-ink-700"
          : active
            ? "bg-earth-900 text-paper-50"
            : "border border-paper-300 bg-paper-50 text-earth-700 shadow-[0_6px_18px_-12px_rgba(60,45,28,0.45)] hover:border-gold-400 hover:text-earth-900"
      )}
    >
      {children}
      <Tip>{label}</Tip>
    </Link>
  );
}

/** ป้ายชื่อที่โผล่ตอนชี้หรือโฟกัสด้วยคีย์บอร์ด */
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-[calc(100%+0.75rem)] z-10 rounded-full bg-earth-900 px-3 py-1.5 text-sm whitespace-nowrap text-paper-50 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {children}
    </span>
  );
}
