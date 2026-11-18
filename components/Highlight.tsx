"use client";

/**
 * 🧩 STUB — เจ้าของไฟล์: ศิลป (สาย Face)
 * ⚠️ props ห้ามเปลี่ยน — หน้า /review ใช้อยู่
 *
 * level="warn" คือของเด็ดที่สุดตอน demo:
 * มันคือประโยคที่ "ระบบจับ AI ตัวเองได้" ว่าเขียนเกินจากเสียงต้นฉบับ
 * อย่าทำให้มันจืด ต้องเห็นชัดจากหลังห้อง
 */

import clsx from "clsx";

export type HighlightProps = {
  level: "warn" | "ok";
  children: React.ReactNode;
  /** ข้อความอธิบายว่าทำไมถึงถูกไฮไลต์ (แสดงเป็น tooltip) */
  reason?: string;
};

export default function Highlight({ level, children, reason }: HighlightProps) {
  return (
    <mark
      title={reason}
      data-level={level}
      className={clsx(
        "rounded px-1 py-0.5 decoration-dotted underline-offset-4",
        level === "warn"
          ? "bg-amber-200/80 text-amber-950 underline"
          : "bg-emerald-100 text-emerald-950"
      )}
    >
      {children}
    </mark>
  );
}
