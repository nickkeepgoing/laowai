"use client";

/**
 * เมนูบัญชีแบบแผ่นเลื่อนขึ้น
 *
 * แยกออกมาเพราะมีสองที่เปิดมัน: แท็บ "บัญชี" ในแถบล่างบนมือถือ
 * และอวาตาร์ท้ายแถบไอคอนซ้ายบนเดสก์ท็อป ถ้าเขียนซ้ำสองที่จะค่อย ๆ ไม่เหมือนกัน
 *
 * เป็นแผ่น ไม่ใช่หน้าใหม่ เพราะมีให้ทำแค่ 2 อย่าง ไม่คุ้มให้ผู้ใช้หลงไปอีกหน้า
 */

import Link from "next/link";
import { BookOpen, LogOut } from "lucide-react";
import Sheet from "./Sheet";
import { DEMO_BOOK } from "@/lib/chrome";

export default function AccountSheet({
  open,
  onClose,
  name,
  avatar,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  avatar?: string;
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={name ? `สวัสดี คุณ${name}` : "บัญชีของคุณ"}
      description="เรื่องทั้งหมดผูกกับบัญชีนี้ คนอื่นเห็นได้เฉพาะหนังสือที่คุณแชร์ลิงก์ให้"
    >
      {avatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt=""
          className="mb-5 h-14 w-14 rounded-full border border-paper-300 object-cover"
        />
      )}
      <div className="flex flex-col gap-2">
        <Link
          href={DEMO_BOOK}
          onClick={onClose}
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
  );
}
