"use client";

/**
 * ตัวเลขที่เป็นจุดขายบนเวที
 *   <StatPill label="ย่อหน้าที่มีหลักฐาน" value="12/12" tone="good" />
 *   <StatPill label="Claim ที่ถูกทิ้งเพราะตรวจไม่ผ่าน" value={2} tone="warn" />
 *
 * props ห้ามเปลี่ยน
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
        // ⚠️ สีชุดนี้ถูกเขียนไว้ตอนเว็บยังเป็นธีมมืด (night/mist)
        // พอเปลี่ยนมาเป็นกระดาษสว่าง ตัวอักษรอ่อนบนพื้นอ่อนจึงจางจนอ่านไม่ออก
        // ตอนนี้ใช้ตัวอักษรเข้มบนพื้นอ่อน ให้คอนทราสต์พอสำหรับผู้สูงอายุ
        "inline-flex items-baseline gap-2 rounded-full border px-3 py-1 text-sm",
        tone === "neutral" && "border-paper-400 bg-paper-200 text-earth-700",
        tone === "good" && "border-verified-600/35 bg-verified-400/25 text-verified-600",
        tone === "warn" && "border-warn-500/55 bg-warn-200/70 text-warn-900"
      )}
    >
      <span>{label}</span>
      <strong className="tabular-nums text-earth-900">{value}</strong>
    </span>
  );
}
