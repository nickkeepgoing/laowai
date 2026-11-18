"use client";

/**
 * ภาพที่ "อธิบายกลไก" ไม่ใช่ภาพประดับ
 *
 * หลักที่ใช้: ถ้าภาพนั้นลบออกแล้วผู้อ่านยังเข้าใจเท่าเดิม แปลว่าภาพนั้นไม่ได้ทำงาน
 * ทุกชิ้นในไฟล์นี้ต้องอธิบายสิ่งที่ตัวหนังสืออธิบายได้ช้ากว่า
 */

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Highlight from "./Highlight";

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
 * 2. เส้นทางหลักฐาน — เสียงต้นฉบับ → ด่านตรวจ → ย่อหน้าในหนังสือ
 *
 * ทำไมถึงเป็นแนวตั้งทุกขนาดจอ:
 * ของเดิมวางการ์ดซ้าย-ขวาแล้วใช้ลูกศรที่ rotate-90 บนจอใหญ่
 * ซึ่งผิดสองชั้น — ทิศกลับด้านกับ layout และ rotate ไม่เปลี่ยนกล่อง
 * ทำให้เส้นล้นไปทับป้าย "ตรวจด้วยโค้ด"
 * แนวตั้งอ่านง่ายกว่าบนมือถือ และไม่มีทางเกิดบั๊กทิศทางอีก
 *
 * ของเดิมเทียบ "เสียง" กับ "หนังสือ" เฉย ๆ ซึ่งไม่ได้อธิบายอะไรเลย
 * ของใหม่โชว์ "ด่านตรวจ" ตรงกลาง: ประโยคหนึ่งผ่าน อีกประโยคไม่ผ่าน
 * นั่นคือกลไกจริงของ verifyClaim() และเป็นสิ่งเดียวที่ต้องจำจากหน้านี้
 * ══════════════════════════════════════════════════════════ */

/** หัวข้อของแต่ละขั้น พร้อมเลขลำดับ ให้สายตารู้ว่ากำลังอ่านขั้นที่เท่าไร */
function StepHead({ n, label, right }: { n: string; label: string; right?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-earth-900 font-mono text-xs text-paper-50">
        {n}
      </span>
      <span className="text-sm font-medium tracking-wide text-earth-500 uppercase">{label}</span>
      {right && <span className="ml-auto font-mono text-sm text-earth-400">{right}</span>}
    </div>
  );
}

/** ตัวเชื่อมระหว่างขั้น — แนวตั้งล้วน ไม่มีการหมุน จึงไม่มีทางทับกัน */
function TrailLink({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-3" aria-hidden>
      <span className="h-6 w-px bg-paper-400" />
      {label && (
        <span className="rounded-full border border-gold-400 bg-gold-200/50 px-4 py-1.5 text-sm font-medium whitespace-nowrap text-earth-800">
          {label}
        </span>
      )}
      <span className="h-6 w-px bg-paper-400" />
      <svg width="13" height="8" viewBox="0 0 13 8" fill="none">
        <path d="M1 1l5.5 5.5L12 1" stroke="#d9c7ab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

const Check = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Warn = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M8 4.5v4.2M8 11.4v.1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export function TraceabilityProof() {
  return (
    <motion.div
      className="mx-auto max-w-2xl"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── ขั้น 1: แหล่งความจริง ───────────────────────────── */}
      <div className="rounded-2xl border border-paper-300 bg-paper-50 p-6 elev-2">
        <StepHead n="01" label="เสียงต้นฉบับ" right="0:15" />
        <p className="leading-[2.1] text-earth-800">
          ตอนเด็ก ๆ ยายอยู่บ้านริมคลอง{" "}
          <mark className="rounded bg-verified-400/35 px-1.5 py-1 font-medium text-earth-900 decoration-verified-600/50 underline-offset-4">
            ยายตื่นตีห้าทุกวันไปช่วยแม่หาบขนมไปขาย
          </mark>{" "}
          ขนมที่แม่ทำอร่อยที่สุดคือขนมกล้วย
        </p>
        <p className="mt-4 border-t border-paper-300 pt-4 text-sm text-earth-500">
          ทุกอย่างหลังจากนี้ต้องพิสูจน์กลับมาที่ข้อความนี้ให้ได้
        </p>
      </div>

      <TrailLink label="ตรวจด้วยโค้ด" />

      {/* ── ขั้น 2: ด่านตรวจ ─────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-earth-900/12 bg-paper-100 p-6 elev-2">
        <StepHead n="02" label="ด่านตรวจหลักฐาน" />

        {/* ⚠️ ห้ามเอาโค้ดจริงมาโชว์ตรงนี้
            คนอ่านหน้านี้คือลูกหลานกับผู้สูงอายุ ไม่ใช่โปรแกรมเมอร์
            โค้ดไม่ได้ทำให้เขาเข้าใจขึ้น มีแต่ทำให้รู้สึกว่านี่ไม่ใช่ของสำหรับเขา
            จึงอธิบายด้วยสิ่งที่ทุกคนเคยทำมาก่อน: การกดค้นหาคำ */}
        <div className="flex items-start gap-4 rounded-xl border border-paper-300 bg-paper-50 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-200/60 text-earth-800">
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden>
              <circle cx="8.5" cy="8.5" r="5.6" stroke="currentColor" strokeWidth="1.9" />
              <path d="M12.8 12.8L17 17" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
          </span>
          <p className="leading-relaxed text-earth-800">
            ระบบ<strong className="text-earth-900">ค้นหาถ้อยคำนั้นในเสียงต้นฉบับ</strong>{" "}
            เหมือนเวลาเรากดค้นหาคำในหนังสือ — เจอคือผ่าน ไม่เจอคือตก
            <span className="mt-1.5 block text-sm text-earth-500">
              เป็นการเทียบตัวอักษรตรง ๆ ไม่ได้ถาม AI ว่าตัวเองถูกไหม
            </span>
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* ผ่าน */}
          <div className="rounded-xl border border-verified-600/30 bg-verified-400/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-verified-600">
              <Check />
              <span className="text-sm font-semibold">ผ่าน · เข้าหนังสือได้</span>
            </div>
            <p className="text-[15px] leading-relaxed text-earth-800">
              “ยายตื่นตีห้าทุกวันไปช่วยแม่หาบขนมไปขาย”
            </p>
            <p className="mt-2.5 text-sm text-earth-500">เจอคำต่อคำในเสียง</p>
          </div>

          {/* ไม่ผ่าน */}
          <div className="rounded-xl border border-warn-500/35 bg-warn-200/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-warn-500">
              <Warn />
              <span className="text-sm font-semibold">ไม่ผ่าน · AI เขียนเกิน</span>
            </div>
            <p className="text-[15px] leading-relaxed text-earth-800">
              “เป็นช่วงเวลาที่ยายได้อยู่กับแม่มากที่สุดในหนึ่งวัน”
            </p>
            <p className="mt-2.5 text-sm text-warn-900/80">ไม่มีถ้อยคำนี้ในเสียง</p>
          </div>
        </div>
      </div>

      <TrailLink label="คนยืนยันก่อนพิมพ์" />

      {/* ── ขั้น 3: ผลลัพธ์ ──────────────────────────────────── */}
      <div className="paper rounded-2xl border border-[#d9c7ab] p-6 elev-3">
        <StepHead n="03" label="ย่อหน้าในหนังสือ" right="บทวัยเด็ก" />
        <p className="font-serif text-lg leading-[2.1] text-[#231c14]">
          ยายตื่นตีห้าทุกวันไปช่วยแม่หาบขนมไปขาย เป็นหน้าที่ประจำตั้งแต่ยังเล็ก{" "}
          {/* ใช้ <Highlight> ตัวเดียวกับหน้า /review เพื่อให้สิ่งที่เห็นบน landing
              เป็นของจริงชิ้นเดียวกับที่ครอบครัวเจอในแอป ไม่ใช่ภาพจำลอง */}
          <Highlight
            level="warn"
            reason='ประโยคที่ 2 — "เป็นช่วงเวลาที่ยายได้อยู่กับแม่มากที่สุดในหนึ่งวัน" ไม่มีถ้อยคำนี้ในเสียงต้นฉบับ'
          >
            เป็นช่วงเวลาที่ยายได้อยู่กับแม่มากที่สุดในหนึ่งวัน
          </Highlight>
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-[#e6d8c0] pt-4 text-sm">
          <span className="inline-flex items-center gap-1.5 text-[#1f8a63]">
            <Check />
            ประโยคแรกมีหลักฐาน
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#b45309]">
            <Warn />
            ประโยคไฮไลต์รอครอบครัวตัดสิน
          </span>
          <span className="ml-auto font-mono text-[#8a7a63]">↩ 0:15</span>
        </div>
      </div>

      <p className="mt-6 text-center text-earth-700">
        หนังสือที่พิมพ์ออกมาจึงมีแต่สิ่งที่ท่านพูดจริง —{" "}
        <strong className="text-earth-900">และสแกน QR กลับไปฟังวินาทีนั้นได้ทุกย่อหน้า</strong>
      </p>
    </motion.div>
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
