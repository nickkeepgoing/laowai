"use client";

/** UI primitive เล็ก ๆ ที่ใช้ซ้ำทุกหน้า รวมไว้ไฟล์เดียวเพื่อไม่ให้ไฟล์เยอะเกินจำเป็น */

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
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2.5",
        size === "lg" && "px-6 py-3.5 text-lg",
        variant === "primary" && "bg-ember-400 text-ink-950 hover:bg-ember-300",
        variant === "ghost" &&
          "border border-cream-500/30 text-cream-100 hover:border-ember-400/60 hover:bg-ink-800",
        variant === "danger" &&
          "border border-red-400/40 text-red-200 hover:bg-red-950/40 hover:border-red-400/70",
        variant === "quiet" && "text-cream-300 hover:text-cream-50",
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
  return (
    <div
      className={clsx(
        "rounded-2xl border border-cream-500/15 bg-ink-900/70 p-5 backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-sm font-medium text-cream-300">{children}</span>
  );
}

export const inputClass =
  "w-full rounded-xl border border-cream-500/25 bg-ink-800/80 px-4 py-2.5 text-cream-50 placeholder:text-cream-500/60 focus:border-ember-400 focus:outline-none";

/**
 * waveform ที่วิ่งตามเสียงจริงขณะอัด
 *
 * ไม่ใช่ของประดับ — มันคือหลักฐานให้ผู้สูงอายุและหลานเห็นว่า "ไมค์ได้ยินอยู่"
 * ตอนทดสอบกับคนจริง คนมักกังวลว่าอัดติดไหม ถ้าไม่มีอะไรขยับ
 */
export function LiveWaveform({ level, active }: { level: number; active: boolean }) {
  const bars = 40;
  return (
    <div className="flex h-16 items-center justify-center gap-[3px]" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        // ให้แท่งกลางสูงกว่าขอบ ดูเป็นธรรมชาติกว่าสุ่มล้วน
        const shape = Math.sin((i / (bars - 1)) * Math.PI) * 0.6 + 0.4;
        const h = active ? Math.max(6, level * shape * 100 + Math.random() * 8) : 6;
        return (
          <span
            key={i}
            className={clsx(
              "w-1.5 rounded-full transition-[height] duration-75",
              active ? "bg-ember-400" : "bg-cream-500/25"
            )}
            style={{ height: `${Math.min(100, h)}%` }}
          />
        );
      })}
    </div>
  );
}

/** แถบเตือนเล็ก ๆ ใช้แสดง error แบบไม่ขัดจังหวะ flow */
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
        "rounded-xl border px-4 py-3 text-sm",
        tone === "info" && "border-cream-500/25 bg-ink-800/60 text-cream-300",
        tone === "warn" && "border-warn-500/40 bg-warn-900/20 text-warn-200",
        tone === "error" && "border-red-400/40 bg-red-950/30 text-red-200"
      )}
    >
      {children}
    </p>
  );
}
