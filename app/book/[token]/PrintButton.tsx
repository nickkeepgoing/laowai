"use client";

import { Printer } from "lucide-react";

/**
 * แถบลอยสำหรับสั่งพิมพ์ — ซ่อนตอนพิมพ์จริงด้วยคลาส no-print
 *
 * ตอน demo: กดปุ่มนี้แล้วเลือก "Save as PDF" ได้ไฟล์หนังสือจริง
 * เบราว์เซอร์จัดหน้า A5 ตาม @page ใน globals.css ให้เอง
 */
export default function PrintButton() {
  return (
    <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#d9cdb9] bg-[#f6f1e7]/95 px-5 py-3 backdrop-blur">
      <p className="text-sm text-[#6b5c48]">
        หน้านี้จัดขนาด A5 ไว้แล้ว — กดพิมพ์แล้วเลือก “Save as PDF” เพื่อเก็บไฟล์
      </p>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#231c14] px-4 py-2 text-sm font-medium text-[#fdfbf6] hover:bg-[#3d3124]"
      >
        <Printer size={15} /> พิมพ์ / บันทึก PDF
      </button>
    </div>
  );
}
