"use client";

/**
 * UI primitive — ออกแบบบนโทนกระดาษ สำหรับผู้ใช้ที่มีทั้งวัยทำงานและผู้สูงอายุ
 *
 * กติกาที่ยึดทั้งไฟล์:
 *   - ปุ่มสูงอย่างน้อย 44px (ขนาด lg = 56px) เพื่อให้นิ้วผู้สูงอายุกดไม่พลาด
 *   - ไม่ใช้สีเทาอ่อนบนพื้นขาวเป็นตัวหนังสือหลัก คอนทราสต์ต้องผ่าน
 *   - เงานุ่มแทนเส้นขอบแข็ง ให้ความรู้สึกเหมือนกระดาษซ้อนกัน
 */

import clsx from "clsx";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "quiet";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
        // 44px คือเกณฑ์ขั้นต่ำที่หัวไฟล์นี้เขียนไว้เอง ของเดิม sm เป็น 40px จึงผิดกฎตัวเอง
        size === "sm" && "min-h-11 px-4 py-2 text-sm",
        size === "md" && "min-h-12 px-5 py-2.5",
        size === "lg" && "min-h-14 px-7 py-3.5 text-lg",
        variant === "primary" &&
          "bg-ink-800 text-paper-50 shadow-[0_8px_24px_-10px_rgba(33,26,18,0.6)] hover:bg-ink-700",
        variant === "ghost" &&
          "border border-paper-400 bg-paper-50 text-earth-800 hover:border-gold-400 hover:bg-paper-100",
        variant === "danger" &&
          "border border-red-300 bg-red-50 text-red-700 hover:border-red-400 hover:bg-red-100",
        variant === "quiet" && "text-earth-500 hover:bg-paper-200 hover:text-earth-800",
        className
      )}
    />
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={clsx("card-soft rounded-3xl p-6", className)}>{children}</div>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-sm font-medium text-earth-700">{children}</span>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-paper-400 bg-paper-50 px-4 py-3 text-earth-900 placeholder:text-earth-400 focus:border-gold-400 focus:outline-none focus:ring-4 focus:ring-gold-200/50";

/**
 * waveform ที่วิ่งตามเสียงจริงขณะอัด
 *
 * ไม่ใช่ของประดับ — มันคือหลักฐานให้ผู้สูงอายุและหลานเห็นว่า "ไมค์ได้ยินอยู่"
 * ตอนทดสอบกับคนจริง คนมักกังวลว่าอัดติดไหมถ้าไม่มีอะไรขยับบนจอ
 */
const WAVE_BARS = 40;
/** ความไม่เท่ากันแบบคงที่ คำนวณครั้งเดียว ไม่ใช่ทุก render */
const WAVE_JITTER = Array.from({ length: WAVE_BARS }, (_, i) =>
  ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1
);

export function LiveWaveform({ level, active }: { level: number; active: boolean }) {
  const bars = WAVE_BARS;
  return (
    <div className="flex h-20 items-center justify-center gap-[3px]" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        const shape = Math.sin((i / (bars - 1)) * Math.PI) * 0.6 + 0.4;
        const h = active ? Math.max(8, level * shape * 100 + WAVE_JITTER[i] * 8) : 8;
        return (
          <span
            key={i}
            className={clsx(
              "w-2 rounded-full transition-[height] duration-75",
              active ? "bg-gold-500" : "bg-paper-400"
            )}
            style={{ height: `${Math.min(100, h)}%` }}
          />
        );
      })}
    </div>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "error";
  children: React.ReactNode;
}) {
  return (
    <p
      className={clsx(
        "rounded-2xl border px-5 py-3.5",
        tone === "info" && "border-paper-400 bg-paper-200 text-earth-700",
        tone === "warn" && "border-warn-500/50 bg-warn-200/50 text-warn-900",
        tone === "error" && "border-red-300 bg-red-50 text-red-700"
      )}
    >
      {children}
    </p>
  );
}

/** แถบความคืบหน้า ใช้ในหน้า dashboard */
export function Progress({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-paper-300"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-300 transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
