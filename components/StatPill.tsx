"use client";

/**
 * 🧩 STUB — เจ้าของไฟล์: ศิลป (สาย Face)
 * ⚠️ props ห้ามเปลี่ยน
 *
 * ใช้โชว์ตัวเลขที่เป็นจุดขายบนเวที เช่น
 *   <StatPill label="ย่อหน้าที่มีหลักฐาน" value="12/12" tone="good" />
 *   <StatPill label="Claim ที่ถูกทิ้งเพราะตรวจไม่ผ่าน" value={2} tone="warn" />
 */

import clsx from "clsx";

export type StatPillProps = {
  label: string;
  value: string | number;
  tone?: "neutral" | "good" | "warn";
};

export default function StatPill({ label, value, tone = "neutral" }: StatPillProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-baseline gap-2 rounded-full border px-3 py-1 text-sm",
        tone === "good" && "border-emerald-300 bg-emerald-50 text-emerald-900",
        tone === "warn" && "border-amber-300 bg-amber-50 text-amber-900"
      )}
    >
      <span className="opacity-70">{label}</span>
      <strong className="tabular-nums">{value}</strong>
    </span>
  );
}
