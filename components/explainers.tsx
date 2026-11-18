"use client";

/**
 * ภาพที่ "อธิบายกลไก" ไม่ใช่ภาพประดับ
 *
 * หลักที่ใช้: ถ้าภาพนั้นลบออกแล้วผู้อ่านยังเข้าใจเท่าเดิม แปลว่าภาพนั้นไม่ได้ทำงาน
 * ทุกชิ้นในไฟล์นี้ต้องอธิบายสิ่งที่ตัวหนังสืออธิบายได้ช้ากว่า
 */

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ══════════════════════════════════════════════════════════
 * 1. เส้นทางของเสียง — ตั้งแต่ปากคุณยายจนถึง QR ในหนังสือ
 *    นี่คือภาพที่อธิบายทั้งผลิตภัณฑ์ได้ในภาพเดียว
 * ══════════════════════════════════════════════════════════ */

const STAGES = [
  { k: "voice", label: "เสียงของท่าน", sub: "อัด 1–3 นาที" },
  { k: "text", label: "ข้อความถอดเสียง", sub: "AI ถอดคำต่อคำ" },
  { k: "claim", label: "ข้อมูลที่ตรวจแล้ว", sub: "โค้ดเช็กว่ามีจริงในเสียง" },
  { k: "book", label: "ย่อหน้าในหนังสือ", sub: "คนยืนยันก่อนพิมพ์" },
  { k: "qr", label: "QR ฟังเสียงเดิม", sub: "กลับไปที่เสียงต้นฉบับ" },
] as const;

export function VoicePipeline() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setSeen(true),
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // เดินทีละขั้นให้เห็นว่าข้อมูล "ไหล" ไปทางไหน ไม่ใช่กล่องวางเรียงเฉย ๆ
  useEffect(() => {
    if (!seen) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STAGES.length), 1900);
    return () => clearInterval(id);
  }, [seen]);

  return (
    <div ref={ref} className="w-full">
      <div className="grid gap-3 lg:grid-cols-5">
        {STAGES.map((s, i) => {
          const on = i === active;
          const past = i < active;
          return (
            <div key={s.k} className="relative">
              <div
                className={`h-full rounded-2xl border p-4 transition-all duration-500 ${
                  on
                    ? "border-gold-400 bg-paper-50 shadow-[0_16px_40px_-18px_rgba(201,149,58,0.7)]"
                    : past
                      ? "border-verified-400/50 bg-verified-400/10"
                      : "border-paper-300 bg-paper-50/60"
                }`}
              >
                <div className="flex h-14 items-center justify-center">
                  <StageArt k={s.k} on={on} />
                </div>
                <p
                  className={`mt-3 text-center font-medium transition ${
                    on ? "text-earth-900" : "text-earth-700"
                  }`}
                >
                  {s.label}
                </p>
                <p className="mt-1 text-center text-sm text-earth-500">{s.sub}</p>
              </div>

              {/* ลูกศรบอกทิศทางการไหล */}
              {i < STAGES.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-1/2 -right-2 z-10 hidden -translate-y-1/2 text-gold-400 lg:block"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 8h12m0 0-4-4m4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-center text-earth-700">
        จุดสำคัญอยู่ที่ขั้นที่ 3 — ถ้าถ้อยคำนั้นหาไม่เจอในเสียงจริง
        <strong className="text-earth-900"> ระบบทิ้งทันที ไม่ให้เข้าหนังสือ</strong>
      </p>
    </div>
  );
}

function StageArt({ k, on }: { k: string; on: boolean }) {
  const c = on ? "#c9953a" : "#d9c7ab";

  if (k === "voice")
    return (
      <span className="flex items-end gap-[3px]" aria-hidden>
        {[12, 26, 40, 20, 34, 16, 28].map((h, i) => (
          <motion.span
            key={i}
            className="w-1.5 rounded-full"
            style={{ background: c }}
            animate={on ? { height: [h * 0.5, h, h * 0.6, h * 0.9] } : { height: h * 0.6 }}
            transition={{ duration: 1.1, repeat: on ? Infinity : 0, delay: i * 0.07 }}
          />
        ))}
      </span>
    );

  if (k === "text")
    return (
      <span className="flex w-20 flex-col gap-1.5" aria-hidden>
        {[100, 78, 92, 60].map((w, i) => (
          <motion.span
            key={i}
            className="h-1.5 rounded-full"
            style={{ background: c, width: `${w}%` }}
            animate={on ? { opacity: [0.35, 1, 0.75] } : { opacity: 0.45 }}
            transition={{ duration: 1.3, repeat: on ? Infinity : 0, delay: i * 0.12 }}
          />
        ))}
      </span>
    );

  if (k === "claim")
    return (
      <span className="relative" aria-hidden>
        <span
          className="block h-9 w-20 rounded-lg border-2"
          style={{ borderColor: c, background: on ? "rgba(201,149,58,0.12)" : "transparent" }}
        />
        <motion.span
          className="absolute -right-2 -bottom-2 grid h-7 w-7 place-items-center rounded-full text-paper-50"
          style={{ background: on ? "#1f8a63" : "#d9c7ab" }}
          animate={on ? { scale: [0.8, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </span>
    );

  if (k === "book")
    return (
      <span className="flex gap-1" aria-hidden>
        <span className="h-11 w-8 rounded-l border-2 border-r-0" style={{ borderColor: c }} />
        <span className="h-11 w-8 rounded-r border-2 border-l-0" style={{ borderColor: c }} />
      </span>
    );

  return (
    <span className="grid grid-cols-4 gap-[3px]" aria-hidden>
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-[2px]"
          style={{ background: i % 3 === 0 ? c : "transparent", border: `1px solid ${c}` }}
          animate={on ? { opacity: [0.3, 1] } : { opacity: 0.5 }}
          transition={{ duration: 0.5, delay: i * 0.02 }}
        />
      ))}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
 * 2. หลักฐาน — ลากเส้นจากย่อหน้าในหนังสือกลับไปหาถ้อยคำในเสียง
 *    อธิบาย "ตรวจสอบย้อนกลับได้" ได้เร็วกว่าการอ่านสามย่อหน้า
 * ══════════════════════════════════════════════════════════ */

export function TraceabilityProof() {
  return (
    <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr]">
      {/* ฝั่งเสียง */}
      <div className="rounded-2xl border border-paper-300 bg-paper-50 p-5">
        <p className="mb-3 text-sm tracking-wide text-earth-500 uppercase">
          เสียงต้นฉบับ · นาทีที่ 0:15
        </p>
        <p className="leading-[2] text-earth-800">
          ตอนเด็ก ๆ ยายอยู่บ้านริมคลอง{" "}
          <mark className="rounded bg-verified-400/35 px-1 py-0.5 font-medium text-earth-900">
            ยายตื่นตีห้าทุกวันไปช่วยแม่หาบขนมไปขาย
          </mark>{" "}
          ขนมที่แม่ทำอร่อยที่สุดคือขนมกล้วย
        </p>
      </div>

      {/* เส้นเชื่อม */}
      <div className="flex items-center justify-center lg:flex-col">
        <svg width="120" height="60" viewBox="0 0 120 60" className="lg:rotate-90" aria-hidden>
          <motion.path
            d="M4 30h112"
            stroke="#c9953a"
            strokeWidth="2.5"
            strokeDasharray="7 6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1 }}
          />
          <circle cx="110" cy="30" r="5" fill="#c9953a" />
        </svg>
        <span className="rounded-full border border-gold-400 bg-gold-200/40 px-3 py-1 text-sm whitespace-nowrap text-earth-800">
          ตรวจด้วยโค้ด
        </span>
      </div>

      {/* ฝั่งหนังสือ */}
      <div className="paper rounded-2xl border border-[#d9c7ab] p-5">
        <p className="mb-3 text-sm tracking-wide text-[#8a7a63] uppercase">
          ย่อหน้าในหนังสือ · บทวัยเด็ก
        </p>
        <p className="font-serif leading-[2] text-[#231c14]">
          <mark className="rounded bg-[#f8e3ad] px-1 py-0.5 text-[#231c14]">
            ยายตื่นตีห้าทุกวันไปช่วยแม่หาบขนมไปขาย
          </mark>{" "}
          เป็นหน้าที่ประจำตั้งแต่ยังเล็ก
        </p>
        <p className="mt-4 text-sm text-[#6b5c48]">
          ทุกย่อหน้าผูกกลับไปที่วินาทีที่ท่านพูดจริง
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
 * 3. แผนที่ภาษาถิ่น — อธิบาย flywheel และความเป็นไทยพร้อมกัน
 * ══════════════════════════════════════════════════════════ */

const REGIONS = [
  { id: "north", name: "เหนือ", word: "“ซาวบาท”", mean: "ยี่สิบบาท", status: "ยังไม่มีผลทดสอบ", ok: false, cx: 112, cy: 92 },
  { id: "northeast", name: "อีสาน", word: "“เบิ่ง”", mean: "ดู", status: "CER 8.85%", ok: true, cx: 196, cy: 150 },
  { id: "central", name: "กลาง", word: "“กะปิ”", mean: "กะปิ", status: "รองรับแล้ว", ok: true, cx: 128, cy: 196 },
  { id: "south", name: "ใต้", word: "“หร็อย”", mean: "อร่อย", status: "ยังไม่มีผลทดสอบ", ok: false, cx: 118, cy: 300 },
];

export function DialectMap() {
  const [sel, setSel] = useState(1);
  const r = REGIONS[sel];

  return (
    <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
      <svg viewBox="0 0 280 360" className="mx-auto h-80 w-auto" role="img" aria-label="แผนที่ภาษาถิ่นของประเทศไทย">
        {/* รูปร่างประเทศไทยแบบย่อ ไม่ใช่แผนที่ความแม่นยำเชิงภูมิศาสตร์ */}
        <path
          d="M118 28c16-6 34 2 40 18 7 18-2 30 4 44 7 16 26 18 40 30 12 10 14 26 6 38-9 14-28 14-38 26-9 11-6 26-14 38-9 14-28 16-38 30-9 13-6 30-14 44-7 12-24 16-34 8-12-9-10-28-6-42 5-19 14-36 14-56 0-18-10-34-18-50-9-18-18-38-14-58 4-18 20-32 38-38 12-4 24-6 34-12z"
          fill="#f6eee0"
          stroke="#d9c7ab"
          strokeWidth="2"
        />
        {REGIONS.map((reg, i) => (
          <g
            key={reg.id}
            onClick={() => setSel(i)}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setSel(i)}
          >
            <circle
              cx={reg.cx}
              cy={reg.cy}
              r={i === sel ? 17 : 13}
              fill={reg.ok ? "#5fd6a4" : "#e3b254"}
              opacity={i === sel ? 1 : 0.5}
              className="transition-all"
            />
            {i === sel && (
              <circle cx={reg.cx} cy={reg.cy} r="24" fill="none" stroke="#c9953a" strokeWidth="2">
                <animate attributeName="r" values="18;30;18" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0;0.9" dur="2.2s" repeatCount="indefinite" />
              </circle>
            )}
            <text
              x={reg.cx}
              y={reg.cy + 5}
              textAnchor="middle"
              className="pointer-events-none fill-earth-900 text-[13px] font-medium"
            >
              {reg.name}
            </text>
          </g>
        ))}
      </svg>

      <div>
        <p className="text-sm tracking-wide text-earth-500 uppercase">
          ภาษาถิ่นภาค{r.name}
        </p>
        <p className="mt-3 font-serif text-4xl text-earth-900">{r.word}</p>
        <p className="mt-2 text-lg text-earth-700">แปลว่า {r.mean}</p>

        <p
          className={`mt-5 inline-block rounded-full px-4 py-1.5 ${
            r.ok
              ? "border border-verified-400/60 bg-verified-400/15 text-earth-800"
              : "border border-gold-400/70 bg-gold-200/40 text-earth-800"
          }`}
        >
          {r.status}
        </p>

        <p className="mt-6 leading-relaxed text-earth-700">
          เราไม่เคลมว่ารองรับทุกภาษาถิ่น เพราะยังไม่จริง
          แต่ทุกครั้งที่ครอบครัวแก้คำที่ AI ถอดผิด
          <strong className="text-earth-900"> วงกลมสีทองจะค่อย ๆ กลายเป็นสีเขียว</strong>
        </p>
        <p className="mt-3 text-sm text-earth-500">
          กดที่วงกลมบนแผนที่เพื่อดูคำถิ่นของแต่ละภาค
        </p>
      </div>
    </div>
  );
}
