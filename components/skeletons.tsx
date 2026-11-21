/**
 * โครงร่างระหว่างรอข้อมูล
 *
 * ปัญหาที่มาแก้: ทั้งแอปไม่มี loading.tsx, Suspense หรือ skeleton เลยสักไฟล์
 * /library รอ Promise.all สองชุดเรียงกัน (ชุดที่สองยิงต่อ session) โดยผู้ใช้
 * เห็นจอว่างเปล่าตลอดเวลานั้น ซึ่งแยกไม่ออกจาก "แอปค้าง"
 *
 * ⚠️ โครงร่างต้องมีรูปทรงใกล้ของจริง (rounded-3xl, p-6, ความสูงพอ ๆ กัน)
 * ถ้าไม่เหมือน พอข้อมูลมาถึงหน้าจะกระโดด ซึ่งผู้ใช้อ่านว่าเป็นบั๊ก
 *
 * animate-pulse ถูกปิดอัตโนมัติด้วยกฎ prefers-reduced-motion ที่มีอยู่แล้วใน globals.css
 */

import clsx from "clsx";
import { Page, Section } from "./layout";

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={clsx("h-4 animate-pulse rounded-full bg-paper-300", className)} />;
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-3xl bg-paper-200", className)} />;
}

/** การ์ดเปล่าที่มีสัดส่วนเดียวกับ <Card> จริง */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx("card-soft rounded-3xl p-6", className)}>
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-paper-300" />
        <div className="min-w-0 flex-1">
          <SkeletonLine className="h-6 w-2/3" />
          <SkeletonLine className="mt-2 h-3 w-1/2" />
        </div>
      </div>
      <SkeletonLine className="mt-6 h-2 w-full" />
      <div className="mt-4 flex flex-wrap gap-2">
        {[18, 24, 20, 16, 22].map((w, i) => (
          <div
            key={i}
            className="h-8 animate-pulse rounded-full bg-paper-200"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** แถวสถิติ 4 ใบของหน้าคลัง */
export function StatsSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card-soft rounded-3xl px-5 py-5">
          <div className="h-5 w-5 animate-pulse rounded bg-paper-300" />
          <SkeletonLine className="mt-3 h-7 w-20" />
          <SkeletonLine className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ElderListSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function LibrarySkeleton() {
  return (
    <Page width="app">
      <SkeletonLine className="h-3 w-32" />
      <SkeletonLine className="mt-3 h-9 w-72" />
      <StatsSkeleton />
      <Section title={<SkeletonLine className="h-6 w-28" />}>
        <ElderListSkeleton />
      </Section>
    </Page>
  );
}

export function ReviewSkeleton() {
  return (
    <Page width="read">
      <SkeletonLine className="h-3 w-28" />
      <SkeletonLine className="mt-3 h-9 w-56" />
      <div className="mt-4 flex flex-wrap gap-2">
        {[40, 28, 44].map((w, i) => (
          <div
            key={i}
            className="h-8 animate-pulse rounded-full bg-paper-200"
            style={{ width: `${w}%`, maxWidth: 220 }}
          />
        ))}
      </div>
      <div className="card-soft mt-8 space-y-6 rounded-3xl p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <SkeletonLine className="w-full" />
            <SkeletonLine className="mt-2.5 w-11/12" />
            <SkeletonLine className="mt-2.5 w-3/5" />
          </div>
        ))}
      </div>
    </Page>
  );
}

export function InterviewSkeleton() {
  return (
    <Page width="read">
      <SkeletonLine className="h-3 w-24" />
      <SkeletonLine className="mt-3 h-8 w-64" />
      <div className="card-soft mt-8 rounded-3xl p-6">
        <SkeletonLine className="h-3 w-40" />
        <SkeletonLine className="mt-4 h-7 w-full" />
        <SkeletonLine className="mt-2.5 h-7 w-2/3" />
      </div>
      <SkeletonBlock className="mt-5 h-44" />
    </Page>
  );
}
