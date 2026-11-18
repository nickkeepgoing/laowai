/**
 * โลโก้ "เล่าไว้"
 *
 * แนวคิด: คลื่นเสียง 4 แท่งที่ตั้งอยู่บนสันหนังสือ
 * = เสียงที่ถูกเก็บไว้เป็นเล่ม ซึ่งคือทั้งโปรเจกต์ในภาพเดียว
 *
 * แท่งกลางเป็นทอง = เสียงของท่านคือสิ่งมีค่าที่สุดในนั้น
 * ออกแบบให้อ่านออกตั้งแต่ขนาด 20px เพื่อใช้เป็น favicon และมุมสไลด์ได้
 */
export default function Logo({
  size = 32,
  withWordmark = false,
}: {
  size?: number;
  withWordmark?: boolean;
}) {
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
        <linearGradient id="lw-bg" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#1b2740" />
          <stop offset="100%" stopColor="#080c18" />
        </linearGradient>
        <linearGradient id="lw-gold" x1="24" y1="10" x2="24" y2="32">
          <stop offset="0%" stopColor="#f8e3ad" />
          <stop offset="100%" stopColor="#e3b254" />
        </linearGradient>
      </defs>

      <rect width="48" height="48" rx="13" fill="url(#lw-bg)" />
      <rect
        width="47"
        height="47"
        x="0.5"
        y="0.5"
        rx="12.5"
        stroke="#ffffff"
        strokeOpacity="0.1"
      />

      {/* คลื่นเสียง — แท่งกลางสูงสุดและเป็นทอง */}
      <rect x="11" y="19" width="4" height="10" rx="2" fill="#8fb8ff" opacity="0.75" />
      <rect x="18" y="14" width="4" height="20" rx="2" fill="#b9c4d8" />
      <rect x="25" y="9" width="4" height="30" rx="2" fill="url(#lw-gold)" />
      <rect x="32" y="17" width="4" height="14" rx="2" fill="#8fb8ff" opacity="0.75" />

      {/* สันหนังสือที่รองคลื่นเสียงไว้ */}
      <path
        d="M9 38.5h30"
        stroke="url(#lw-gold)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );

  if (!withWordmark) return mark;

  return (
    <span className="inline-flex items-center gap-2.5">
      {mark}
      <span className="flex flex-col leading-none">
        <span className="font-serif text-lg tracking-wide text-earth-900">เล่าไว้</span>
        <span className="mt-0.5 text-[9px] tracking-[0.22em] text-earth-500 uppercase">
          LaoWai
        </span>
      </span>
    </span>
  );
}
