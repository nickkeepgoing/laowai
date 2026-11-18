/**
 * โลโก้ "เล่าไว้"
 *
 * ทำไมเปลี่ยนจากสี่เหลี่ยมมืดเป็นตราวงกลม:
 * แบบเดิมเป็นสี่เหลี่ยมมนพื้นเข้มซึ่งเป็นภาษาของ "ไอคอนแอป"
 * ชนกับเว็บที่เป็นกระดาษอบอุ่นและชนกับตัวสินค้าที่เป็นหนังสือเก็บสะสม
 *
 * แบบใหม่คือตราประทับวงกลม เหมือนตราที่ประทับบนหนังสือหรือจดหมายเก่า
 * ข้างในเป็นคลื่นเสียงวางบนเส้นหน้ากระดาษ = เสียงที่ถูกเก็บไว้บนหน้าหนังสือ
 *
 * อ่านออกตั้งแต่ 20px จึงใช้เป็น favicon และมุมสไลด์ได้
 */
export default function Logo({
  size = 36,
  withWordmark = false,
  tone = "light",
}: {
  size?: number;
  withWordmark?: boolean;
  /** "light" = ใช้บนพื้นสว่าง · "dark" = ใช้บนพื้นเข้ม */
  tone?: "light" | "dark";
}) {
  const ink = tone === "dark" ? "#fdf8ef" : "#211a12";
  const sub = tone === "dark" ? "rgba(253,248,239,0.55)" : "#83705a";

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="เล่าไว้"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="lw-g" x1="12" y1="12" x2="36" y2="36">
          <stop offset="0%" stopColor="#f0cd7c" />
          <stop offset="55%" stopColor="#e3b254" />
          <stop offset="100%" stopColor="#c9953a" />
        </linearGradient>
      </defs>

      {/* วงแหวนนอก — ตราประทับ */}
      <circle cx="24" cy="24" r="22" stroke="url(#lw-g)" strokeWidth="2.2" />
      {/* วงในบาง ๆ ให้ความรู้สึกเป็นตราจริง ไม่ใช่วงกลมเปล่า */}
      <circle cx="24" cy="24" r="18.5" stroke="url(#lw-g)" strokeWidth="0.8" opacity="0.5" />

      {/* คลื่นเสียง 5 แท่ง แท่งกลางสูงสุด */}
      <g strokeLinecap="round">
        <path d="M14 24.5v-3" stroke={ink} strokeWidth="2.6" opacity="0.45" />
        <path d="M19 27v-8" stroke={ink} strokeWidth="2.6" opacity="0.7" />
        <path d="M24 30.5v-15" stroke="url(#lw-g)" strokeWidth="3" />
        <path d="M29 27v-8" stroke={ink} strokeWidth="2.6" opacity="0.7" />
        <path d="M34 24.5v-3" stroke={ink} strokeWidth="2.6" opacity="0.45" />
      </g>

      {/* เส้นหน้ากระดาษที่คลื่นเสียงวางอยู่ */}
      <path
        d="M13 34.5c4.2-2.2 7.6-2.2 11 0 3.4 2.2 6.8 2.2 11 0"
        stroke="url(#lw-g)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );

  if (!withWordmark) return mark;

  return (
    <span className="inline-flex items-center gap-2.5">
      {mark}
      <span className="flex flex-col leading-none">
        <span
          className="font-serif text-[1.35rem] tracking-[0.02em]"
          style={{ color: ink }}
        >
          เล่าไว้
        </span>
        <span
          className="mt-[3px] text-[9px] tracking-[0.3em] uppercase"
          style={{ color: sub }}
        >
          LaoWai
        </span>
      </span>
    </span>
  );
}
