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
        "inline-flex items-baseline gap-2 rounded-full border px-3 py-1 text-sm",
        tone === "neutral" && "border-mist-500/25 bg-night-800/60 text-mist-300",
        tone === "good" && "border-verified-400/40 bg-verified-600/15 text-verified-400",
        tone === "warn" && "border-warn-500/40 bg-warn-900/25 text-warn-200"
      )}
    >
      <span className="opacity-80">{label}</span>
      <strong className="tabular-nums text-mist-50">{value}</strong>
    </span>
  );
}
