/**
 * ภาพประกอบวาดเป็น SVG เอง
 *
 * ทำไมไม่ใช้ภาพถ่าย:
 *   1. เราไม่มีสิทธิ์ใช้ภาพใคร และภาพ stock ของ "ครอบครัวเอเชีย" ดูปลอมทันที
 *   2. ภาพคนที่สร้างด้วย AI จะขัดกับจุดยืนต่อต้าน deepfake ของเราเองแบบย้อนแย้ง
 *      ถ้ากรรมการจับได้จะเสียมากกว่าได้
 *   3. SVG คมทุกขนาด ไฟล์เล็ก และคุมสีให้ตรงแบรนด์ได้เป๊ะ
 *
 * ทีมสามารถแทนด้วยภาพถ่ายจริงของปู่ย่าตายายตัวเอง (ที่ได้รับความยินยอมแล้ว) ได้ทีหลัง
 * ซึ่งจะดีที่สุด เพราะเป็นของจริงและตรงกับเรื่องที่เราเล่า
 */

export function ListeningScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 320" className={className} role="img" aria-label="หลานนั่งฟังคุณยายเล่าเรื่อง">
      <defs>
        <linearGradient id="il-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8e3ad" />
          <stop offset="100%" stopColor="#e3b254" />
        </linearGradient>
        <linearGradient id="il-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf8ef" />
          <stop offset="100%" stopColor="#f6eee0" />
        </linearGradient>
      </defs>

      <rect width="420" height="320" rx="24" fill="url(#il-warm)" />

      {/* หน้าต่างบ้าน — บอกว่าเกิดขึ้นที่บ้าน ไม่ใช่สตูดิโอ */}
      <rect x="36" y="34" width="104" height="112" rx="8" fill="#fffdf9" stroke="#d9c7ab" strokeWidth="2" />
      <path d="M88 34v112M36 90h104" stroke="#d9c7ab" strokeWidth="2" />
      <circle cx="112" cy="62" r="13" fill="#f8e3ad" opacity="0.8" />

      {/* ต้นไม้ในบ้าน */}
      <path d="M368 196c0-26 10-44 22-44s22 18 22 44" fill="#cfd9c4" opacity="0.7" />
      <rect x="384" y="194" width="12" height="40" rx="3" fill="#a08d76" />

      {/* ม้านั่งไม้ */}
      <rect x="54" y="236" width="300" height="12" rx="6" fill="#a08d76" />
      <rect x="72" y="248" width="10" height="40" rx="4" fill="#83705a" />
      <rect x="326" y="248" width="10" height="40" rx="4" fill="#83705a" />

      {/* คุณยาย — ผมขาว นั่งซ้าย */}
      <g>
        <path d="M126 236c0-30 12-50 32-50s32 20 32 50z" fill="#8c7bb0" />
        <circle cx="158" cy="166" r="24" fill="#f2d6bd" />
        <path d="M134 164c0-16 11-26 24-26s24 10 24 26c-6-8-14-10-24-10s-18 2-24 10z" fill="#e8e6e3" />
        <circle cx="150" cy="168" r="2.2" fill="#3a2e20" />
        <circle cx="167" cy="168" r="2.2" fill="#3a2e20" />
        <path d="M152 178c3 3 9 3 12 0" stroke="#3a2e20" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* มือวางบนตัก */}
        <ellipse cx="176" cy="226" rx="12" ry="8" fill="#f2d6bd" />
      </g>

      {/* หลานสาว — นั่งขวา ถือโทรศัพท์ */}
      <g>
        <path d="M232 236c0-30 12-50 32-50s32 20 32 50z" fill="#7a9cc6" />
        <circle cx="264" cy="166" r="23" fill="#f6ddc6" />
        <path d="M241 162c0-14 10-24 23-24s23 10 23 24v6c-4-10-12-14-23-14s-19 4-23 14z" fill="#3a2e20" />
        <circle cx="256" cy="168" r="2.2" fill="#3a2e20" />
        <circle cx="273" cy="168" r="2.2" fill="#3a2e20" />
        <path d="M258 177c3 3 9 3 12 0" stroke="#3a2e20" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* โทรศัพท์ที่ถือไว้ระหว่างกัน */}
        <rect x="206" y="196" width="26" height="42" rx="5" fill="#211a12" />
        <rect x="209" y="200" width="20" height="30" rx="2" fill="#fffdf9" />
        <circle cx="219" cy="234" r="2.5" fill="#83705a" />
        {/* แท่งคลื่นเสียงเล็ก ๆ บนจอ */}
        <g fill="url(#il-gold)">
          <rect x="212" y="212" width="2.5" height="8" rx="1.2" />
          <rect x="216" y="208" width="2.5" height="16" rx="1.2" />
          <rect x="220" y="205" width="2.5" height="22" rx="1.2" />
          <rect x="224" y="210" width="2.5" height="12" rx="1.2" />
        </g>
      </g>

      {/* คลื่นเสียงลอยจากคุณยายไปหาหนังสือ */}
      <g stroke="url(#il-gold)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M196 150c14-10 28-10 42 0" />
        <path d="M204 136c16-12 34-12 50 0" opacity="0.7" />
        <path d="M212 122c18-13 38-13 56 0" opacity="0.45" />
      </g>

      {/* หนังสือเปิด — ปลายทางของเสียง */}
      <g transform="translate(300 96)">
        <path d="M0 40c14-10 34-10 48 0v44c-14-10-34-10-48 0z" fill="#fffdf9" stroke="#d9c7ab" strokeWidth="2" />
        <path d="M48 40c14-10 34-10 48 0v44c-14-10-34-10-48 0z" fill="#fffdf9" stroke="#d9c7ab" strokeWidth="2" />
        <g stroke="#e3b254" strokeWidth="2" strokeLinecap="round" opacity="0.65">
          <path d="M10 52h28M10 60h24M10 68h28" />
          <path d="M58 52h28M58 60h24M58 68h28" />
        </g>
      </g>
    </svg>
  );
}

/** ไอคอนประกอบเรื่อง QR ในหนังสือ */
export function BookQrScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 220" className={className} role="img" aria-label="หนังสือที่มี QR ให้สแกนฟังเสียง">
      <rect width="320" height="220" rx="20" fill="#f6eee0" />

      {/* เล่มหนังสือ */}
      <g transform="rotate(-6 110 110)">
        <rect x="52" y="44" width="116" height="140" rx="8" fill="#fffdf9" stroke="#d9c7ab" strokeWidth="2" />
        <rect x="52" y="44" width="12" height="140" rx="4" fill="#e3b254" opacity="0.5" />
        <g stroke="#d9c7ab" strokeWidth="3" strokeLinecap="round">
          <path d="M78 72h66M78 86h50M78 100h62M78 114h44" />
        </g>
        {/* QR เล็กในเล่ม */}
        <g transform="translate(78 128)">
          <rect width="44" height="44" rx="4" fill="#fffdf9" stroke="#211a12" strokeWidth="1.5" />
          {[
            [4, 4], [12, 4], [28, 4], [36, 4],
            [4, 12], [20, 12], [36, 12],
            [4, 20], [12, 20], [28, 20],
            [12, 28], [20, 28], [36, 28],
            [4, 36], [20, 36], [28, 36], [36, 36],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="5" height="5" fill="#211a12" />
          ))}
        </g>
      </g>

      {/* มือถือที่สแกน */}
      <g transform="translate(196 42)">
        <rect width="80" height="140" rx="14" fill="#211a12" />
        <rect x="6" y="8" width="68" height="118" rx="8" fill="#fdf8ef" />
        <g fill="#e3b254">
          {[46, 70, 92, 60, 100, 74, 50].map((h, i) => (
            <rect key={i} x={14 + i * 8} y={70 - h / 2.6} width="4" height={h / 1.3} rx="2" />
          ))}
        </g>
        <circle cx="40" cy="106" r="11" fill="#211a12" />
        <path d="M37 101l9 5-9 5z" fill="#fdf8ef" />
      </g>

      {/* เส้นสแกน */}
      <path
        d="M150 150c20 10 36 2 44-12"
        stroke="#e3b254"
        strokeWidth="2.5"
        strokeDasharray="5 5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
