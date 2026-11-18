"use client";

/**
 * หน้าแรก
 *
 * คนอ่านหน้านี้คือ "ลูกสาววัย 34 ที่กลับบ้านปีละ 3 ครั้ง" ไม่ใช่วิศวกร
 * ทุก section จึงตอบคำถามในใจเธอทีละข้อตามลำดับที่เธอคิดจริง ๆ:
 *
 *   1. นี่คืออะไร           → hero + ได้ยินเสียงทันที
 *   2. ทำยังไง ยากไหม      → 3 ขั้นตอน
 *   3. แม่ฉันใช้เป็นไหม     → ออกแบบสำหรับผู้สูงอายุ
 *   4. AI จะมั่วไหม         → หลักฐานว่า AI ผิดได้ และเราจับได้
 *   5. ได้อะไรกลับมา        → หนังสือ + QR
 *   6. ปลอดภัยไหม          → ไม่ทำ deadbot + ความเป็นส่วนตัว
 *   7. ยังสงสัยอะไรอีก      → FAQ
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  Ear,
  Heart,
  Mic,
  Play,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import Highlight from "@/components/Highlight";
import QRBox from "@/components/QRBox";
import VoiceOrbMount from "@/components/VoiceOrbMount";
import { Card } from "@/components/ui";
import { demoChapter, demoClips } from "@/lib/demo";

/** ⚠️ เปลี่ยนเป็น false เมื่อทับ public/demo/clip-1.wav ด้วยเสียงจริงที่ได้รับความยินยอมแล้ว */
const PLACEHOLDER_AUDIO = true;

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!seen) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString("th-TH")}
    </span>
  );
}

/**
 * ⚠️ framer ใส่ opacity:0 ตั้งแต่ SSR ถ้า hydration ช้าหรือพัง หน้าจะว่างทั้งหน้า
 * mounted guard ทำให้ก่อน mount เรนเดอร์เป็น div ธรรมดาที่มองเห็นได้
 */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** คำที่ AI ถอดผิดจริงจากบทสนทนากับ mentor ในงานนี้ */
const ASR_ERRORS = [
  { wrong: "ภาษาอังกฤษ", right: "ภาษาถิ่น" },
  { wrong: "คลังเรือนจำรายปี", right: "คลังความทรงจำรายปี" },
  { wrong: "ธุรกิจงานสุข", right: "ธุรกิจงานศพ" },
  { wrong: "ซาวด์บาท", right: "ซาวบาท" },
];

export default function Home() {
  const hero = demoClips[0];
  const flagged = demoChapter.paragraphs.find((p) => p.flags.length > 0);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  return (
    <main className="overflow-x-hidden">
      {/* ══════════════ HERO ══════════════ */}
      <section className="relative overflow-hidden px-5 pt-12 pb-20 sm:px-6 sm:pt-20">
        <div className="hero-field" aria-hidden />
        <div className="aurora" aria-hidden />
        <div className="star-field" aria-hidden />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold-400/50 bg-paper-50/80 px-4 py-2 text-sm text-earth-700 backdrop-blur"
            >
              <Heart size={15} className="text-gold-500" />
              สำหรับลูกหลานที่อยากฟังเรื่องของท่าน ก่อนจะสาย
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08 }}
              className="mt-7 font-serif text-[2.7rem] leading-[1.18] text-earth-900 sm:text-[3.6rem] sm:leading-[1.12]"
            >
              ปู่ย่าตายายของคุณ
              <br />
              มีเรื่องเล่าอีกกี่เรื่อง
              <br />
              <span className="text-gradient-gold">ที่คุณยังไม่เคยฟัง</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-6 max-w-lg text-xl leading-relaxed text-earth-700"
            >
              นั่งข้างท่าน กดอัด แล้วให้เราช่วยตั้งคำถามต่อ
              จบออกมาเป็นหนังสือชีวิตที่ทุกย่อหน้า
              <strong className="text-earth-900">กดฟังเสียงจริงของท่านได้</strong>
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.38 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/interview/new"
                className="inline-flex min-h-14 items-center gap-2.5 rounded-2xl bg-earth-900 px-8 text-lg font-medium text-paper-50 shadow-[0_12px_32px_-12px_rgba(33,26,18,0.65)] transition hover:bg-earth-800"
              >
                <Mic size={20} /> เริ่มเก็บเรื่องของท่าน
              </Link>
              <Link
                href="/book/demo-token-7f3a9c2e"
                className="inline-flex min-h-14 items-center gap-2.5 rounded-2xl border border-paper-400 bg-paper-50 px-7 text-lg text-earth-800 transition hover:border-gold-400"
              >
                <BookOpen size={19} /> ดูตัวอย่างหนังสือ
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 rounded-3xl border border-paper-300 bg-paper-50/80 p-4 backdrop-blur"
            >
              <p className="mb-3 flex items-center gap-2 text-sm text-earth-600">
                <Volume2 size={16} className="text-gold-500" />
                กดฟังตัวอย่าง — นี่คือสิ่งที่เรากำลังเก็บรักษา
              </p>
              <AudioPlayer src={hero.audioUrl} clipId="hero" label="ตัวอย่างเสียงผู้เล่า" />
              {PLACEHOLDER_AUDIO && (
                <p className="mt-2.5 text-xs text-earth-400">
                  ไฟล์ตัวอย่างสำหรับทดสอบระบบ — จะแทนด้วยเสียงจริงที่ได้รับความยินยอมแล้ว
                </p>
              )}
            </motion.div>
          </div>

          {/* 3D: ทรงกลมอนุภาค = เสียงหนึ่งเสียงที่ถูกเก็บไว้ */}
          <div className="relative hidden lg:block">
            <VoiceOrbMount className="h-[30rem] w-full" />
            <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center">
              <p className="font-serif text-xl text-earth-700">เสียงหนึ่งเสียง</p>
              <p className="mt-1 text-sm text-earth-500">
                ที่ไม่มีใครสร้างขึ้นมาใหม่ได้อีกแล้ว
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 3 ขั้นตอน ══════════════ */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <Reveal>
          <h2 className="text-center font-serif text-4xl text-earth-900">
            ใช้งานง่ายพอที่จะทำวันนี้เลย
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-earth-700">
            ไม่ต้องเตรียมอะไร ไม่ต้องให้ท่านเรียนรู้อะไรใหม่
            ท่านแค่เล่า คุณแค่ฟัง
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              icon: Mic,
              t: "เปิดคำถามแล้วกดอัด",
              d: "เรามีชุดคำถามตามช่วงชีวิต 5 หัวข้อ 36 คำถาม อ่านให้ท่านฟังแล้วกดปุ่มเดียว อัดทีละ 1–3 นาที ไม่ต้องเปิดแอปทิ้งไว้",
              art: <StepRecord />,
            },
            {
              n: "02",
              icon: Sparkles,
              t: "AI ฟังแล้วช่วยถามต่อ",
              d: "ถอดเสียงเป็นข้อความ จับประเด็นสำคัญ แล้วเสนอคำถามถัดไปจากสิ่งที่ท่านเพิ่งเล่า คุณไม่ต้องคิดเองว่าจะถามอะไรต่อ",
              art: <StepThink />,
            },
            {
              n: "03",
              icon: BookOpen,
              t: "ตรวจแล้วได้หนังสือ",
              d: "คุณตรวจและแก้ได้ทุกบรรทัดก่อนพิมพ์ เสร็จแล้วได้หนังสือ A5 ที่ทุกย่อหน้ามี QR ให้สแกนฟังเสียงของท่าน",
              art: <StepBook />,
            },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <Card className="h-full">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl text-gold-400">{s.n}</span>
                  <s.icon size={24} className="text-gold-500" />
                </div>
                <div className="my-6">{s.art}</div>
                <h3 className="font-serif text-2xl text-earth-900">{s.t}</h3>
                <p className="mt-3 leading-relaxed text-earth-700">{s.d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════ ออกแบบมาเพื่อผู้สูงอายุ ══════════════ */}
      <section className="border-y border-paper-300 bg-paper-200/60">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <Ear size={30} className="text-gold-500" />
              <h2 className="mt-5 font-serif text-4xl leading-tight text-earth-900">
                ท่านไม่ต้องใช้เป็น
                <br />
                เพราะท่านแค่ต้อง<span className="text-gradient-gold">เล่า</span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-earth-700">
                บริการเก็บเรื่องเล่าส่วนใหญ่ให้ผู้สูงอายุพิมพ์ตอบเอง
                ซึ่งใช้ไม่ได้จริงกับคนไทยวัย 70 ขึ้นไป
                เราจึงยกภาระทั้งหมดมาไว้ที่ลูกหลาน แล้วปล่อยให้ท่านทำสิ่งที่ท่านเก่งที่สุด
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "ตัวหนังสือใหญ่กว่าเว็บทั่วไปหนึ่งขั้น พื้นสว่าง ไม่ใช่พื้นดำ",
                  "ปุ่มใหญ่ กดง่าย ไม่มีเมนูซ้อนให้หลง",
                  "ท่านเห็นคลื่นเสียงขยับ จึงมั่นใจว่าเครื่องได้ยินอยู่",
                  "รองรับการเล่าด้วยสำเนียงถิ่น ไม่ต้องพูดภาษากลาง",
                  "ท่านบอกให้ข้ามหรือลบเรื่องไหนก็ได้ทุกเมื่อ",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-lg text-earth-800">
                    <Check size={22} className="mt-1 shrink-0 text-verified-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.15}>
              <ElderScreenMock />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════ ตัวเลข ══════════════ */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-6">
        <Reveal>
          <h2 className="text-center font-serif text-3xl text-earth-900">
            ทำไมเรื่องนี้ต้องรีบ
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {[
            { n: 16800000, l: "ผู้สูงอายุไทย ปี 2567", s: "เดลินิวส์ อ้างรายงานที่ วช. สนับสนุน" },
            { n: 1348397, l: "ผู้สูงอายุที่อยู่ลำพัง ปี 2566", s: "Thai PBS Policy Watch" },
            { n: 559684, l: "ผู้เสียชีวิตในปี 2568", s: "สถาบันวิจัยประชากรและสังคม ม.มหิดล" },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 0.12}>
              <div className="text-center">
                <p className="font-serif text-4xl text-earth-900 sm:text-5xl">
                  <CountUp to={s.n} />
                </p>
                <p className="mt-3 text-lg text-earth-800">{s.l}</p>
                <p className="mt-1 text-sm text-earth-400">{s.s}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════ ทำไมเราไม่เชื่อ AI ของเราเอง ══════════════ */}
      <section className="border-y border-paper-300 bg-earth-900">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-6">
          <Reveal>
            <h2 className="font-serif text-4xl leading-tight text-paper-50">
              ทำไมเราไม่เชื่อ AI ของเราเอง
            </h2>
            <p className="mt-4 text-lg text-paper-300">
              นี่คือคำที่ AI ถอดผิดจาก
              <strong className="text-gold-300">บทสนทนาจริงในงานแข่งนี้</strong> —
              เสียงคนหนุ่มพูดภาษากลางชัด ๆ ในห้องเงียบ
            </p>
          </Reveal>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {ASR_ERRORS.map((e, i) => (
              <Reveal key={e.right} delay={i * 0.08}>
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                  <span className="text-paper-400 line-through decoration-red-400/70">
                    {e.wrong}
                  </span>
                  <ArrowRight size={15} className="text-paper-400" />
                  <span className="font-medium text-gold-300">{e.right}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <p className="mt-10 font-serif text-2xl leading-relaxed text-paper-50">
              ถ้าภาษากลางยังผิดขนาดนี้
              <br />
              เสียงคุณยายอายุ 80 พูดภาษาถิ่นจะผิดแค่ไหน
            </p>
            <p className="mt-4 text-lg leading-relaxed text-paper-300">
              เราจึงไม่ออกแบบระบบที่สมมติว่า AI ถูก
              แต่ออกแบบระบบที่สมมติว่า<strong className="text-paper-50">AI ผิดได้ทุกเมื่อ</strong>
              แล้วทำให้ครอบครัวจับผิดมันได้ง่ายที่สุด
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ ทุกย่อหน้าพิสูจน์ได้ ══════════════ */}
      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-6">
        <Reveal>
          <h2 className="font-serif text-4xl text-earth-900">ทุกย่อหน้าพิสูจน์ได้</h2>
          <p className="mt-4 text-lg text-earth-700">
            ทุกย่อหน้าต้องอ้างถ้อยคำที่มีอยู่จริงในเสียง และเรา
            <strong className="text-earth-900">ตรวจด้วยโค้ด ไม่ใช่ให้ AI ตรวจ AI</strong>
          </p>
        </Reveal>

        {flagged && (
          <Reveal delay={0.15}>
            <div className="mt-9 rounded-3xl border-2 border-warn-500/50 bg-warn-200/35 p-7">
              <p className="mb-4 text-sm font-medium tracking-wide text-warn-900 uppercase">
                ตัวอย่างจริงจากหน้าตรวจ
              </p>
              <p className="font-serif text-xl leading-[1.9] text-earth-900">
                ยายตื่นตีห้าทุกวันไปช่วยแม่หาบขนมไปขาย เป็นหน้าที่ประจำตั้งแต่ยังเล็ก และ
                <Highlight level="warn" reason={flagged.flags[0]}>
                  เป็นช่วงเวลาที่ยายได้อยู่กับแม่มากที่สุดในหนึ่งวัน
                </Highlight>
              </p>
              <p className="mt-5 text-warn-900">
                ระบบจับได้เองว่าประโยคหลังไม่มีถ้อยคำนี้ในเสียงต้นฉบับ
                ครอบครัวจะเห็นไฮไลต์นี้และตัดสินใจก่อนพิมพ์
              </p>
            </div>
          </Reveal>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            { t: "อ้างถ้อยคำต้นฉบับ", d: "ถ้าหาถ้อยคำนั้นไม่เจอในเสียง ระบบทิ้งทันที ไม่เอาเข้าหนังสือ" },
            { t: "กดฟังเทียบได้", d: "คลิกย่อหน้าแล้วเสียงจริงเล่นที่วินาทีนั้นพอดี" },
            { t: "คนยืนยันก่อนพิมพ์", d: "AI ไม่มีสิทธิ์พิมพ์อะไรเอง ครอบครัวต้องกดยืนยันทุกบท" },
          ].map((c, i) => (
            <Reveal key={c.t} delay={0.1 + i * 0.1}>
              <Card className="h-full">
                <ShieldCheck size={22} className="text-verified-600" />
                <h3 className="mt-4 text-lg font-medium text-earth-900">{c.t}</h3>
                <p className="mt-2 leading-relaxed text-earth-700">{c.d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════ หนังสือ + QR ══════════════ */}
      <section className="border-y border-paper-300 bg-paper-200/60">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <h2 className="font-serif text-4xl leading-tight text-earth-900">
              จบลงที่หนังสือที่ถือได้จริง
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-earth-700">
              หนังสือชีวิตขนาด A5 พิมพ์ได้จริง ทุกย่อหน้ามี QR ให้สแกนฟังเสียงท่านตรงประโยคนั้น
              และต่อยอดเป็นหนังสืออนุสรณ์ที่ทำไว้ล่วงหน้า
              <strong className="text-earth-900">ขณะที่ท่านยังเล่าได้</strong>
              ไม่ใช่รวบรวมอย่างเร่งรีบหลังการจากไป
            </p>
            <Link
              href="/book/demo-token-7f3a9c2e"
              className="mt-8 inline-flex min-h-14 items-center gap-2 rounded-2xl bg-earth-900 px-7 text-lg font-medium text-paper-50 transition hover:bg-earth-800"
            >
              <BookOpen size={19} /> เปิดดูตัวอย่างเล่มจริง
            </Link>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="paper ring-glow mx-auto max-w-sm rounded-3xl p-8 text-center">
              <p className="text-[10px] tracking-[0.3em] text-[#8a7a63] uppercase">เล่าไว้</p>
              <h3 className="mt-6 font-serif text-3xl text-[#231c14]">ยายสมจิต</h3>
              <div className="mx-auto my-4 h-px w-12 bg-[#c9b89c]" />
              <p className="font-serif text-lg text-[#3d3124]">วัยเด็กริมคลองบางปะกง</p>
              <div className="mt-7 flex justify-center">
                <QRBox
                  value={origin ? `${origin}/clip/${demoChapter.shareToken}` : "https://laowai-th.vercel.app"}
                  size={120}
                  caption="สแกนเพื่อฟังเสียงจริง"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ ไม่ทำ deadbot ══════════════ */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-6">
        <Reveal>
          <h2 className="font-serif text-4xl leading-tight text-earth-900">
            เราไม่สร้าง AI ที่เลียนแบบคนที่จากไป
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-earth-700">
            มีบริการที่ทำ “deadbot” ให้คุยกับคนที่เสียไปแล้วได้
            นักวิจัยมหาวิทยาลัยเคมบริดจ์ (2024) เตือนว่าอาจทำร้ายจิตใจผู้ใช้
          </p>
          <p className="mt-5 text-xl leading-relaxed text-earth-900">
            เราเลือกทางตรงข้าม — เก็บ<strong className="text-gradient-gold">เสียงจริง</strong>
            ของท่านไว้ ไม่โคลนเสียง ไม่สร้างบุคลิกปลอม
            และใช้ AI เป็นผู้ช่วยฟังที่พาคนในครอบครัวกลับมาคุยกันขณะที่ยังมีโอกาส
          </p>
        </Reveal>
      </section>

      {/* ══════════════ FAQ ══════════════ */}
      <section className="border-t border-paper-300 bg-paper-200/60">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6">
          <Reveal>
            <h2 className="font-serif text-3xl text-earth-900">คำถามที่ครอบครัวถามบ่อย</h2>
          </Reveal>
          <div className="mt-8 space-y-3">
            {[
              {
                q: "แม่ฉันใช้มือถือไม่ค่อยเป็น จะใช้ได้ไหม",
                a: "ท่านไม่ต้องแตะเครื่องเลย คุณเป็นคนถือและกดปุ่มให้ ท่านแค่เล่าเหมือนคุยกันปกติ",
              },
              {
                q: "ต้องเปิดแอปทิ้งไว้เป็นชั่วโมงไหม กินเน็ตกินแบตหรือเปล่า",
                a: "ไม่ต้อง เราอัดทีละคำถาม 1–3 นาทีแล้วหยุด เสียง 3 นาทีใช้เน็ตประมาณ 0.7 MB และจะอัปโหลดหลังกดหยุดเท่านั้น ถ้าเน็ตหลุดจะเก็บไว้ในเครื่องก่อน ไม่เสียเรื่องที่ท่านเล่า",
              },
              {
                q: "ท่านพูดภาษาถิ่น AI จะเข้าใจไหม",
                a: "รองรับได้ระดับหนึ่งและกำลังพัฒนาต่อ จุดสำคัญคือเราไม่ได้เชื่อ AI อยู่แล้ว ทุกคำที่ถอดมาคุณแก้ได้ และทุกครั้งที่คุณแก้ ระบบเรียนรู้คำถิ่นนั้นเพิ่ม",
              },
              {
                q: "เรื่องที่ท่านเล่าจะหลุดไปไหนไหม",
                a: "คุณเห็นเฉพาะเรื่องของครอบครัวตัวเอง ลิงก์ที่แชร์ใช้รหัสที่เดาไม่ได้และเพิกถอนได้ทุกเมื่อ และมีปุ่มลบที่ลบทั้งเสียง ข้อความ และย่อหน้าในหนังสือพร้อมกัน",
              },
              {
                q: "ถ้าท่านเล่าเรื่องที่ไม่อยากให้ใครรู้",
                a: "กดปุ่มลืมได้ทันที เราลบคลิป ข้อมูลที่ดึงไว้ ย่อหน้าในหนังสือ และข้อมูลการแก้คำที่ผูกกับคลิปนั้นพร้อมกันทั้งหมด",
              },
            ].map((f, i) => (
              <Reveal key={f.q} delay={i * 0.06}>
                <details className="card-soft group rounded-2xl px-6 py-5">
                  <summary className="cursor-pointer list-none text-lg font-medium text-earth-900 marker:hidden">
                    <span className="flex items-start justify-between gap-4">
                      {f.q}
                      <span className="mt-1 shrink-0 text-gold-500 transition group-open:rotate-45">
                        <Plus18 />
                      </span>
                    </span>
                  </summary>
                  <p className="mt-4 leading-relaxed text-earth-700">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ ปิด ══════════════ */}
      <footer className="relative overflow-hidden px-5 py-20 text-center sm:px-6">
        <div className="hero-field opacity-80" aria-hidden />
        <div className="relative">
          <p className="mx-auto max-w-2xl font-serif text-3xl leading-snug text-earth-900 sm:text-4xl">
            วันที่อยากฟัง
            <br />
            อาจไม่ใช่วันที่ยังได้ฟัง
          </p>
          <Link
            href="/interview/new"
            className="mt-9 inline-flex min-h-14 items-center gap-2.5 rounded-2xl bg-earth-900 px-8 text-lg font-medium text-paper-50 shadow-[0_12px_32px_-12px_rgba(33,26,18,0.65)] transition hover:bg-earth-800"
          >
            เริ่มวันนี้ <ArrowRight size={19} />
          </Link>
          <p className="mt-12 text-sm text-earth-400">
            เล่าไว้ · ทีม STAR PLATINUM · Thailand AI Extreme Hack 2026
          </p>
        </div>
      </footer>
    </main>
  );
}

function Plus18() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ───────────── ภาพประกอบ 3 ขั้นตอน (วาดด้วย CSS/SVG ไม่ใช้รูปคน) ───────────── */

function StepRecord() {
  return (
    <div className="flex h-28 items-center justify-center gap-1.5 rounded-2xl bg-paper-200/80 px-4">
      {[28, 52, 76, 44, 90, 62, 38, 70, 46, 84, 34, 58].map((h, i) => (
        <span
          key={i}
          className="w-2 rounded-full bg-gold-400"
          style={{ height: `${h}%`, opacity: 0.45 + (h / 100) * 0.55 }}
        />
      ))}
      <span className="ml-3 grid h-11 w-11 place-items-center rounded-full bg-earth-900 text-paper-50">
        <Mic size={18} />
      </span>
    </div>
  );
}

function StepThink() {
  return (
    <div className="flex h-28 flex-col justify-center gap-2 rounded-2xl bg-paper-200/80 px-4">
      <div className="rounded-xl bg-paper-50 px-3 py-2 text-sm text-earth-700 shadow-sm">
        “บ้านอยู่ริมคลองบางปะกง…”
      </div>
      <div className="ml-6 flex items-center gap-2 rounded-xl border border-gold-400/50 bg-gold-200/40 px-3 py-2 text-sm text-earth-800">
        <Sparkles size={14} className="shrink-0 text-gold-500" />
        ถามต่อ: “พายเรือไปโรงเรียนกับใครคะ”
      </div>
    </div>
  );
}

function StepBook() {
  return (
    <div className="flex h-28 items-center justify-center gap-3 rounded-2xl bg-paper-200/80 px-4">
      <div className="paper h-24 w-18 rotate-[-6deg] rounded-lg border border-paper-300 p-2 shadow-md">
        <div className="h-1 w-8 rounded bg-[#c9b89c]" />
        <div className="mt-2 space-y-1">
          {[90, 75, 85, 60].map((w, i) => (
            <div key={i} className="h-1 rounded bg-[#e0d4c0]" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      <div className="grid h-16 w-16 place-items-center rounded-lg bg-paper-50 shadow-md">
        <div className="grid grid-cols-4 gap-0.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className={i % 3 === 0 ? "h-2 w-2 bg-earth-900" : "h-2 w-2 bg-paper-300"}
            />
          ))}
        </div>
      </div>
      <Play size={18} className="text-gold-500" />
    </div>
  );
}

/** ภาพจำลองหน้าจอตอนสัมภาษณ์ — แสดงว่า UI ใหญ่และอ่านง่ายแค่ไหน */
function ElderScreenMock() {
  return (
    <div className="card-soft mx-auto max-w-sm rounded-[2rem] p-5">
      <div className="rounded-2xl bg-paper-200/70 px-5 py-4">
        <p className="text-sm text-earth-500">คำถามที่ 3 จาก 8</p>
        <p className="mt-2 font-serif text-2xl leading-snug text-earth-900">
          ตอนเด็ก ๆ ตื่นมาทำอะไรเป็นอย่างแรกคะ
        </p>
      </div>

      <div className="mt-5 flex h-20 items-center justify-center gap-1.5">
        {[30, 55, 80, 45, 95, 65, 40, 72, 50, 88, 36, 60, 44, 78].map((h, i) => (
          <span
            key={i}
            className="w-2 rounded-full bg-gold-500"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-red-600 text-white shadow-lg">
          <span className="h-5 w-5 rounded bg-white" />
        </span>
      </div>
      <p className="mt-4 text-center text-earth-700">
        0:48 · ประมาณ 0.2 MB
      </p>
      <p className="mt-1 text-center text-sm text-earth-400">หยุดเองที่ 3:00</p>
    </div>
  );
}
