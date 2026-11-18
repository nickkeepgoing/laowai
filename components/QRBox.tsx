"use client";

/**
 * 🧩 STUB — เจ้าของไฟล์: ศิลป (สาย Face)
 * ⚠️ props ห้ามเปลี่ยน — หน้า /book และ /review ใช้อยู่
 *
 * ใช้ใน 2 ที่:
 * 1. ท้ายบทในหนังสือ → กรรมการสแกนแล้วได้ยินเสียงจริง (นาทีทองตอน demo)
 * 2. ข้างย่อหน้าในหน้าตรวจ
 */

import { QRCodeSVG } from "qrcode.react";

export type QRBoxProps = {
  /** URL เต็มที่จะให้สแกน เช่น https://laowai-th.vercel.app/clip/abc123 */
  value: string;
  size?: number;
  /** ข้อความใต้ QR */
  caption?: string;
};

export default function QRBox({ value, size = 120, caption }: QRBoxProps) {
  return (
    <figure className="inline-flex flex-col items-center gap-2">
      {/* พื้นขาวเสมอ ห้ามใส่ QR บนพื้นมืด เพราะกล้องมือถือจะอ่านไม่ออก */}
      <div className="rounded-lg bg-white p-2">
        <QRCodeSVG value={value} size={size} level="M" marginSize={0} />
      </div>
      {caption && (
        <figcaption className="max-w-[160px] text-center text-xs opacity-70">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
