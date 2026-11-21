"use client";

/**
 * ไฮไลต์ประโยคที่ระบบจับได้ว่า AI เขียนเกินจากเสียงต้นฉบับ
 *
 * ⚠️ นี่คือของเด็ดที่สุดตอน demo — มันคือหลักฐานว่าระบบ "จับ AI ตัวเองได้"
 * ซึ่งเป็นสิ่งที่ทีมอื่นไม่มี ฉะนั้นต้องเห็นชัดจากหลังห้อง อย่าทำให้จืด
 *
 * props ห้ามเปลี่ยน — หน้า /review และ landing ใช้อยู่
 */

import clsx from "clsx";

export type HighlightProps = {
  level: "warn" | "ok";
  children: React.ReactNode;
  /** เหตุผลที่ถูกไฮไลต์ แสดงเป็น tooltip */
  reason?: string;
};

export default function Highlight({ level, children, reason }: HighlightProps) {
  return (
    <mark
      title={reason}
      data-level={level}
      className={clsx(
        "rounded px-1 py-0.5",
        level === "warn"
          ? "bg-warn-200 font-medium text-warn-900 underline decoration-warn-500 decoration-wavy decoration-2 underline-offset-4"
          : "bg-verified-400/25 text-earth-900"
      )}
    >
      {children}
    </mark>
  );
}
