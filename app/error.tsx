"use client";

/**
 * ขอบรับ error ของทั้งแอป
 *
 * ก่อนหน้านี้ไม่มี error.tsx เลยสักไฟล์ หน้า "ไม่พบข้อมูล" 4 จุดเป็นแค่ return
 * ธรรมดาในตัว page ซึ่งไม่ใช่ boundary จริง error ที่เกิดที่อื่นจึงตกไปที่
 * หน้า 500 ของ Next ที่เป็นภาษาอังกฤษล้วนและไม่มีทางออกให้ผู้ใช้
 *
 * หน้านี้จึงต้องทำสองอย่าง: บอกด้วยภาษาที่เข้าใจได้ และให้ทางไปต่อเสมอ
 */

import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <main className="relative grid min-h-[70vh] place-items-center px-5 py-16 text-center">
      <div className="aurora opacity-50" aria-hidden />

      <div className="relative max-w-md">
        <h1 className="font-serif text-3xl text-earth-900">มีบางอย่างผิดพลาด</h1>
        <p className="mt-3 leading-relaxed text-earth-700">
          เรื่องที่คุณเก็บไว้ยังอยู่ครบ ไม่ได้หายไปไหน
          ลองกดโหลดใหม่อีกครั้ง ถ้ายังไม่ได้ให้กลับไปที่คลังความทรงจำ
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-14 items-center gap-2 rounded-2xl bg-ink-800 px-7 font-medium text-paper-50 transition hover:bg-ink-700"
          >
            <RefreshCw size={18} /> ลองใหม่
          </button>
          <Link
            href="/library"
            className="inline-flex min-h-14 items-center gap-2 rounded-2xl border border-paper-400 px-6 text-earth-800 transition hover:border-gold-400 hover:bg-paper-100"
          >
            <RotateCcw size={17} /> กลับคลังความทรงจำ
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 font-mono text-xs text-earth-400">รหัสอ้างอิง {error.digest}</p>
        )}
      </div>
    </main>
  );
}
