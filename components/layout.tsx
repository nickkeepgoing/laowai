/**
 * คอนเทนเนอร์กลางของหน้าหลังล็อกอิน
 *
 * ปัญหาที่มาแก้: ก่อนหน้านี้ความกว้างและระยะขอบไม่มีกฎเลย
 *   /library        max-w-4xl ตอนว่าง · max-w-5xl ตอนมีข้อมูล
 *   interview/new   max-w-2xl px-4
 *   สัมภาษณ์/ตรวจ   max-w-3xl px-4
 *   หน้า error      max-w-xl
 * ผู้ใช้เลยรู้สึกว่าแต่ละหน้า "กว้างไม่เท่ากัน" โดยไม่รู้สาเหตุ
 *
 * ระบบ breakpoint ของโปรเจกต์นี้: sm 640 · md 768 · lg 1024 · xl 1280
 * ก่อนหน้านี้ทั้งแอปใช้ md: แค่ 2 ครั้ง ทำให้ช่วง 640–1024px ไม่มีการปรับอะไรเลย
 */

import clsx from "clsx";

/** ความกว้าง 3 แบบเท่านั้น เลือกตามลักษณะเนื้อหา ไม่ใช่ตามความรู้สึก */
const WIDTH = {
  /** ฟอร์มกรอกข้อมูล — แคบเพื่อให้สายตาไม่ต้องกวาดไกล */
  form: "max-w-2xl",
  /** เนื้อหาที่ต้องอ่านยาว ๆ — ความกว้างบรรทัดกำลังพออ่านสบาย */
  read: "max-w-3xl",
  /** หน้ารวมที่มีการ์ดหลายใบ — กว้างได้บนจอใหญ่ */
  app: "max-w-5xl lg:max-w-6xl",
} as const;

export function Page({
  width = "read",
  className,
  children,
}: {
  width?: keyof typeof WIDTH;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    /*
     * .app-shell คือแผงขาวลอยบนเดสก์ท็อป (ดู globals.css)
     * และเป็นตัวบอก CSS ว่า "นี่คือหน้าในตัวแอป" เพื่อเปลี่ยนพื้นหลังเป็นแสงนุ่ม ๆ
     * บนมือถือมันไม่มีกรอบ เพราะจอแคบอยู่แล้ว กรอบจะกินพื้นที่โดยเปล่าประโยชน์
     */
    <div className="app-shell">
      <main
        className={clsx(
          "relative mx-auto px-5 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12",
          WIDTH[width],
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}

/**
 * หัวหน้า — คำทักทาย/หมวด, ชื่อหน้า, คำอธิบาย และปุ่มหลักของหน้า
 * บนมือถือปุ่มลงไปอยู่บรรทัดล่างเต็มความกว้าง จะได้กดด้วยนิ้วโป้งง่าย
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-earth-500">{eyebrow}</p>}
        <h1 className="mt-1 font-serif text-3xl leading-tight text-earth-900 sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-earth-700">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

/** ระยะห่างแนวตั้งระหว่างบล็อก ใช้ค่าเดียวกันทุกหน้า */
export function Section({
  title,
  className,
  children,
}: {
  title?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={clsx("mt-8 sm:mt-10", className)}>
      {title && <h2 className="mb-4 font-serif text-2xl text-earth-900">{title}</h2>}
      {children}
    </section>
  );
}
