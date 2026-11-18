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
import dynamic from "next/dynamic";
import AudioPlayer from "@/components/AudioPlayer";
import Highlight from "@/components/Highlight";
import QRBox from "@/components/QRBox";
import VoiceOrbMount from "@/components/VoiceOrbMount";
import { BookQrScene } from "@/components/illustrations";
import { Card } from "@/components/ui";
import { demoChapter, demoClips } from "@/lib/demo";

import { DialectMap, TraceabilityProof, VoicePipeline } from "@/components/explainers";
import {
  BookMockup,
  BrowserFrame,
  InterviewMockup,
  ReviewMockup,
} from "@/components/AppMockups";

/** three.js โหลดเฉพาะฝั่ง browser เพื่อไม่ถ่วงหน้าแรก */
const MemoryWave = dynamic(() => import("@/components/MemoryWave"), { ssr: false });
const Book3D = dynamic(() => import("@/components/Book3D"), { ssr: false });
const VoiceRecord3D = dynamic(() => import("@/components/VoiceRecord3D"), { ssr: false });
const Hourglass3D = dynamic(() => import("@/components/Hourglass3D"), { ssr: false });

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
      {/**
       * hero ถูกบีบให้จบในจอเดียว
       *
       * ปัญหาเดิม: ระยะห่างกับขนาดตัวอักษรใหญ่เกิน ทำให้ปุ่มกับที่เล่นเสียงตกจอ
       * ผู้ใช้ต้องเลื่อนถึงจะเห็นว่ากดอะไรได้ ซึ่งเสียโอกาสในสิบวินาทีแรก
       * ตอนนี้ min-h คำนวณจากความสูงจอลบ header ให้พอดีหนึ่งหน้าจอ
       */}
      <section className="relative -mt-22 overflow-hidden px-5 pt-28 pb-12 sm:px-6 sm:pt-30 lg:flex lg:min-h-screen lg:items-center lg:pb-8">
        <div className="hero-field" aria-hidden />
        <div className="aurora" aria-hidden />
        <div className="star-field" aria-hidden />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-12">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold-400/50 bg-paper-50/80 px-4 py-1.5 text-sm text-earth-700 backdrop-blur"
            >
              <Heart size={15} className="text-gold-500" />
              สำหรับลูกหลานที่อยากฟังเรื่องของท่าน ก่อนจะสาย
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08 }}
              className="mt-5 font-serif text-[2.1rem] leading-[1.2] text-earth-900 sm:text-[2.6rem] xl:text-[3rem] xl:leading-[1.14]"
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
              className="mt-4 max-w-lg text-lg leading-relaxed text-earth-700"
            >
              นั่งข้างท่าน กดอัด แล้วให้เราช่วยตั้งคำถามต่อ
              จบออกมาเป็นหนังสือชีวิตที่ทุกย่อหน้า
              <strong className="text-earth-900">กดฟังเสียงจริงของท่านได้</strong>
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.38 }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/interview/new"
                className="inline-flex min-h-13 items-center gap-2.5 rounded-2xl bg-earth-900 px-6 py-3 font-medium text-paper-50 shadow-[0_12px_32px_-12px_rgba(33,26,18,0.65)] transition hover:bg-earth-800"
              >
                <Mic size={19} /> เริ่มเก็บเรื่องของท่าน
              </Link>
              <Link
                href="/book/demo-token-7f3a9c2e"
                className="inline-flex min-h-13 items-center gap-2.5 rounded-2xl border border-paper-400 bg-paper-50 px-5 py-3 text-earth-800 transition hover:border-gold-400"
              >
                <BookOpen size={18} /> ดูตัวอย่างหนังสือ
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="elev-2 mt-6 max-w-lg rounded-2xl border border-paper-300 bg-paper-50/90 p-3.5 backdrop-blur"
            >
              <p className="mb-2.5 flex items-center gap-2 text-sm text-earth-600">
                <Volume2 size={15} className="text-gold-500" />
                กดฟังตัวอย่าง — นี่คือสิ่งที่เรากำลังเก็บรักษา
              </p>
              <AudioPlayer src={hero.audioUrl} clipId="hero" label="ตัวอย่างเสียงผู้เล่า" />
              {PLACEHOLDER_AUDIO && (
                <p className="mt-2 text-xs text-earth-400">
                  ไฟล์ตัวอย่างสำหรับทดสอบระบบ — จะแทนด้วยเสียงจริงที่ได้รับความยินยอม
                </p>
              )}
            </motion.div>
          </div>

          {/**
           * เอา particle orb ออกจาก hero
           * บนพื้นสว่างมันจางจนอ่านเป็น "ฝุ่น" ไม่ได้สื่ออะไร และแย่งที่ภาพคนจริง
           * ย้ายไปอยู่ section "ไม่ทำ deadbot" ซึ่งอนุภาคที่สลายตัวมีความหมายจริง
           */}
          <div className="relative hidden lg:block">
            <motion.figure
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/grandma-boy.jpg"
                alt="คุณยายกับหลานชายยืนคุยกันหน้าบ้านในแสงเย็น"
                width={1000}
                height={1500}
                className="elev-4 h-[clamp(26rem,62vh,34rem)] w-full rounded-[2rem] object-cover"
              />

              {/**
               * การ์ดลอยรอบรูป — แสดงขั้นตอนจริงของระบบที่กำลังทำงาน
               * ไม่ใช่ของประดับ: แต่ละใบคือหนึ่งขั้นใน pipeline ที่ผู้ใช้จะเจอจริง
               * เรียงเวลา animation ตามลำดับที่ข้อมูลไหล เพื่อให้อ่านเป็นเรื่องเดียวกัน
               */}

              {/* ① กำลังอัด */}
              <figcaption className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl border border-paper-300 bg-paper-50/95 px-4 py-3 shadow-[0_16px_40px_-18px_rgba(87,70,52,0.5)] backdrop-blur">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-400 text-earth-900">
                  <Mic size={18} />
                </span>
                <span>
                  <span className="block text-sm font-medium text-earth-900">
                    กำลังเก็บเรื่องของยาย
                  </span>
                  <span className="mt-1 flex items-center gap-1" aria-hidden>
                    {[10, 18, 26, 14, 22, 12, 20, 16].map((h, i) => (
                      <motion.span
                        key={i}
                        className="w-1 rounded-full bg-gold-500"
                        animate={{ height: [h * 0.4, h, h * 0.55] }}
                        transition={{
                          duration: 0.9,
                          repeat: Infinity,
                          delay: i * 0.08,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </span>
                </span>
              </figcaption>

              {/* ② AI ถอดเสียงออกมาเป็นข้อความ */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 1.1 }}
                className="absolute top-12 -left-10 hidden max-w-[15rem] rounded-2xl border border-paper-300 bg-paper-50/95 p-3.5 shadow-[0_16px_40px_-18px_rgba(87,70,52,0.45)] backdrop-blur xl:block"
              >
                <p className="mb-2 flex items-center gap-1.5 text-xs text-earth-500">
                  <Sparkles size={12} className="text-gold-500" /> AI ถอดเสียง
                </p>
                <p className="text-sm leading-relaxed text-earth-800">
                  “ยายตื่นตีห้าทุกวันไปช่วยแม่หาบขนมไปขาย”
                </p>
              </motion.div>

              {/* ③ ตรวจแล้วว่ามีถ้อยคำนี้ในเสียงจริง */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.9 }}
                className="absolute top-1/2 -right-7 hidden items-center gap-2 rounded-full border border-verified-400/60 bg-paper-50/95 px-4 py-2.5 shadow-[0_14px_34px_-16px_rgba(87,70,52,0.5)] backdrop-blur lg:flex"
              >
                <Check size={16} className="text-verified-600" />
                <span className="text-sm font-medium text-earth-900">ตรวจแล้ว</span>
                <span className="text-xs text-earth-500">มีในเสียงจริง</span>
              </motion.div>

              {/* ④ กลายเป็นหน้าหนังสือที่สแกนฟังได้ */}
              <motion.div
                initial={{ opacity: 0, y: 24, rotate: 6 }}
                animate={{ opacity: 1, y: 0, rotate: 4 }}
                transition={{ duration: 0.8, delay: 2.5 }}
                className="paper absolute -right-8 -bottom-10 hidden w-40 rounded-2xl border border-[#d9c7ab] p-3 shadow-[0_20px_44px_-18px_rgba(87,70,52,0.55)] lg:block"
              >
                <p className="text-[9px] tracking-[0.25em] text-[#8a7a63] uppercase">เล่าไว้</p>
                <p className="mt-2 font-serif text-[11px] leading-[1.8] text-[#231c14]">
                  ยายตื่นตีห้าทุกวัน ไปช่วยแม่หาบขนมไปขาย
                </p>
                <div className="mt-2 flex items-center gap-2 border-t border-[#d9c7ab] pt-2">
                  <span className="grid h-7 w-7 grid-cols-3 gap-px" aria-hidden>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <span
                        key={i}
                        className={i % 3 === 0 ? "bg-[#231c14]" : "bg-transparent"}
                      />
                    ))}
                  </span>
                  <span className="text-[9px] leading-tight text-[#6b5c48]">
                    สแกนฟัง
                    <br />
                    เสียงจริง
                  </span>
                </div>
              </motion.div>
            </motion.figure>
          </div>
        </div>
      </section>

      {/* ══════════════ 3 ขั้นตอน ══════════════ */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
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

      {/* ══════════════ ของจริงที่ใช้ได้แล้ว — section ที่มืดเพื่อตัดกับทั้งหน้า ══════════════ */}
      <section className="relative overflow-hidden bg-earth-900">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(90% 60% at 50% 0%, rgba(201,149,58,0.3) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-28 sm:px-6">
          <Reveal>
            <p className="text-center text-sm tracking-[0.2em] text-gold-300 uppercase">
              ใช้งานได้จริงแล้ววันนี้
            </p>
            <h2 className="mx-auto mt-5 max-w-3xl text-center font-serif text-4xl leading-tight text-paper-50 sm:text-5xl">
              ไม่ใช่ภาพในสไลด์
              <br />
              นี่คือหน้าจอจริงของระบบ
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-center text-lg text-paper-300">
              ทั้งสามหน้าด้านล่างทำงานอยู่จริง กดเข้าไปลองเองได้ตอนนี้
            </p>
          </Reveal>

          {/* กรอบเบราว์เซอร์เอียงซ้อนกัน — ให้ความลึกแทนการวางเรียงแบน ๆ */}
          <div className="relative mt-16 grid gap-8 lg:grid-cols-3 lg:gap-5">
            <Reveal>
              <div className="tilt-left elev-4 rounded-2xl lg:mt-10">
                <BrowserFrame url="laowai-th.vercel.app/interview">
                  <InterviewMockup />
                </BrowserFrame>
              </div>
              <p className="mt-6 text-center text-paper-300 lg:text-left">
                <span className="block font-medium text-paper-50">หน้าสัมภาษณ์</span>
                อัดทีละคำถาม เห็นขนาดไฟล์สด และ AI เสนอคำถามต่อ
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="tilt-flat elev-4 rounded-2xl lg:-mt-4">
                <BrowserFrame url="laowai-th.vercel.app/review">
                  <ReviewMockup />
                </BrowserFrame>
              </div>
              <p className="mt-6 text-center text-paper-300">
                <span className="block font-medium text-paper-50">หน้าตรวจ</span>
                ระบบจับได้เองว่า AI เขียนเกิน แล้วไฮไลต์ให้คนตัดสิน
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="tilt-right elev-4 rounded-2xl lg:mt-10">
                <BrowserFrame url="laowai-th.vercel.app/book">
                  <BookMockup />
                </BrowserFrame>
              </div>
              <p className="mt-6 text-center text-paper-300 lg:text-right">
                <span className="block font-medium text-paper-50">หน้าหนังสือ</span>
                A5 พร้อมพิมพ์ ทุกย่อหน้ามี QR ฟังเสียงจริง
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.35}>
            <div className="mt-14 flex flex-wrap justify-center gap-4">
              <Link
                href="/interview/new"
                className="inline-flex min-h-14 items-center gap-2 rounded-2xl bg-gold-400 px-7 text-lg font-medium text-earth-900 transition hover:bg-gold-300"
              >
                <Mic size={19} /> ลองใช้เองตอนนี้
              </Link>
              <Link
                href="/book/demo-token-7f3a9c2e"
                className="inline-flex min-h-14 items-center gap-2 rounded-2xl border border-paper-50/30 px-7 text-lg text-paper-50 transition hover:bg-paper-50/10"
              >
                <BookOpen size={18} /> เปิดหนังสือตัวอย่าง
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ แก่นแก้ว + ตัวเลข ══════════════ */}
      <section className="paper-grain relative overflow-hidden border-b border-paper-300">
        <div className="relative mx-auto max-w-5xl px-5 py-20 sm:px-6">
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <h2 className="font-serif text-4xl leading-tight text-earth-900">
                สิ่งที่เราเก็บ
                <br />
                ไม่มีใครผลิตขึ้นใหม่ได้
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-earth-700">
                โมเดลสร้างข้อความได้ สร้างภาพได้ สร้างเสียงเลียนแบบได้
                แต่สิ่งที่สร้างขึ้นใหม่ไม่ได้คือ
                <strong className="text-earth-900">
                  ช่วงเวลาที่คนคนหนึ่งเล่าเรื่องของตัวเองให้ลูกหลานฟัง
                </strong>
              </p>
              <p className="mt-4 text-lg leading-relaxed text-earth-700">
                เราจึงไม่พยายามสร้างมันขึ้นมา เราแค่ทำให้มันไม่หาย
              </p>
            </Reveal>

            <div className="relative h-[24rem]">
              <VoiceRecord3D className="absolute inset-0" />

              {/* ตัวเลขลอยรอบแก่น — ทำเป็น HTML ให้คมและอ่านง่าย */}
              {[
                { t: "16.8 ล้าน", s: "ผู้สูงอายุไทย", pos: "top-2 left-0" },
                { t: "100%", s: "ย่อหน้าที่ตรวจย้อนกลับได้", pos: "top-24 right-0" },
                { t: "0.7 MB", s: "เสียง 3 นาที", pos: "bottom-24 left-0" },
                { t: "0 เสียง", s: "ที่เราสังเคราะห์ขึ้น", pos: "bottom-4 right-2" },
              ].map((p, i) => (
                <motion.span
                  key={p.t}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
                  className={`absolute ${p.pos} card-soft elev-2 rounded-2xl px-4 py-2.5`}
                >
                  <span className="block font-serif text-xl text-earth-900">{p.t}</span>
                  <span className="block text-sm text-earth-500">{p.s}</span>
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ เสียงเดินทางยังไง ══════════════ */}
      <section className="border-y border-paper-300 bg-paper-50">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <Reveal>
            <h2 className="text-center font-serif text-4xl text-earth-900">
              เสียงของท่านเดินทางยังไง
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-earth-700">
              ตั้งแต่วินาทีที่ท่านเริ่มเล่า จนถึงวันที่หลานสแกน QR ในหนังสือ
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-12">
              <VoicePipeline />
            </div>
          </Reveal>
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
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/grandma-smile.jpg"
                  alt="ภาพคุณยายยิ้มในชุดพื้นบ้าน"
                  width={1000}
                  height={1500}
                  className="h-[26rem] w-full rounded-[2rem] object-cover object-top shadow-[0_26px_60px_-28px_rgba(87,70,52,0.65)]"
                />
                {/* หน้าจอตอนสัมภาษณ์ซ้อนมุมขวาล่าง — เห็นทั้งคนและของจริงพร้อมกัน */}
                <div className="absolute -right-4 -bottom-10 w-60 sm:w-72">
                  <ElderScreenMock />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════ ตัวเลข ══════════════ */}
      <section className="relative mx-auto max-w-5xl overflow-hidden px-5 py-20 sm:px-6">
        {/* นาฬิกาทรายอนุภาค — เวลาที่เหลือกับผู้สูงอายุ คือแกนของทั้งโปรเจกต์ */}
        <Hourglass3D className="pointer-events-none absolute -top-4 right-0 h-80 w-72 opacity-70 lg:right-8" />
        <Reveal>
          <h2 className="relative max-w-xl font-serif text-3xl text-earth-900 sm:text-4xl">
            ทำไมเรื่องนี้ต้องรีบ
          </h2>
          <p className="relative mt-4 max-w-lg text-lg text-earth-700">
            ทุกวันที่ผ่านไป มีเรื่องที่ไม่มีใครได้ฟังอีกแล้ว
          </p>
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

      {/* ══════════════ แผนที่ภาษาถิ่น ══════════════ */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-6">
        <Reveal>
          <h2 className="font-serif text-4xl text-earth-900">
            ภาษาถิ่นคือปัญหาที่แก้ด้วยเงินอย่างเดียวไม่ได้
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-earth-700">
            ต้องใช้คนไทยจำนวนมากช่วยกันสอนทีละคำ — ซึ่งเกิดขึ้นเองทุกครั้งที่ครอบครัวแก้ข้อความ
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-12">
            <DialectMap />
          </div>
        </Reveal>
      </section>

      {/* ══════════════ ทุกย่อหน้าพิสูจน์ได้ ══════════════ */}
      <section id="proof" className="mx-auto max-w-4xl px-5 py-20 sm:px-6">
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

        <Reveal delay={0.2}>
          <div className="mt-10">
            <TraceabilityProof />
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
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
            <div className="relative">
              {/* หนังสือ 3D ที่มีเสียงลอยออกมาจากหน้ากระดาษ */}
              <Book3D className="h-80 w-full" />

              {/* QR จริงที่สแกนได้ วางคู่กับหนังสือ 3D */}
              <div className="paper ring-glow mx-auto -mt-6 max-w-xs rounded-3xl p-6 text-center">
                <p className="text-[10px] tracking-[0.3em] text-[#8a7a63] uppercase">
                  ลองสแกนด้วยมือถือตอนนี้
                </p>
                <div className="mt-4 flex justify-center">
                  <QRBox
                    value={
                      origin
                        ? `${origin}/clip/${demoChapter.shareToken}`
                        : "https://laowai-th.vercel.app"
                    }
                    size={118}
                    caption="เสียงจริงจากบทตัวอย่าง"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ ไม่ทำ deadbot ══════════════ */}
      <section className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-6">
        {/* อนุภาคที่รวมตัวแล้วสลาย = เสียงที่สร้างขึ้นใหม่ไม่ได้ — ตรงนี้มันมีความหมายจริง */}
        <VoiceOrbMount className="pointer-events-none absolute inset-x-0 top-6 mx-auto h-72 w-72 opacity-45" />

        <Reveal>
          <h2 className="relative font-serif text-4xl leading-tight text-earth-900">
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

      {/* ══════════════ แถบภาพ ══════════════ */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-center font-serif text-3xl text-earth-900 sm:text-4xl">
            ทุกบ้านมีเรื่องที่ยังไม่ได้เล่า
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-earth-700">
            และเกือบทุกบ้านรู้ตัวตอนที่สายไปแล้ว
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { src: "/img/grandma-hug.jpg", alt: "คุณยายกอดหลานตัวเล็ก", cap: "ความผูกพันที่ไม่มีใครจดไว้" },
            { src: "/img/grandma-outdoor.jpg", alt: "ผู้สูงอายุนั่งอยู่หน้าบ้าน", cap: "เรื่องที่รอคนถาม" },
            { src: "/img/grandma-baking.jpg", alt: "คุณยายทำขนมกับหลานในครัว", cap: "สูตรที่ไม่เคยถูกจด" },
            { src: "/img/grandma-breakfast.jpg", alt: "คุณยายนั่งคุยกับหลานที่โต๊ะอาหาร", cap: "บทสนทนาที่หายไปทุกวัน" },
          ].map((p, i) => (
            <Reveal key={p.src} delay={i * 0.1}>
              <figure className="group relative overflow-hidden rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.alt}
                  width={1200}
                  height={1600}
                  loading="lazy"
                  className="h-64 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-72"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-earth-900/80 via-earth-900/10 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-4 text-paper-50">
                  {p.cap}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <p className="mt-6 text-center text-sm text-earth-400">
            ภาพประกอบจาก Unsplash ใช้ภายใต้ Unsplash License ·
            ทีมจะแทนด้วยภาพของครอบครัวที่ร่วมทดสอบจริงเมื่อได้รับความยินยอมแล้ว
          </p>
        </Reveal>
      </section>

      {/* ══════════════ คลื่นเสียง 3D คั่น ══════════════ */}
      <section className="relative overflow-hidden border-y border-paper-300 bg-paper-100">
        <MemoryWave className="pointer-events-none h-56 w-full" />
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-5 text-center">
          <p className="font-serif text-2xl text-earth-800 sm:text-3xl">
            เสียงของคนรุ่นหนึ่ง ส่งต่อให้อีกรุ่นหนึ่ง
          </p>
        </div>
      </section>

      {/* ══════════════ เทียบกับทางเลือกอื่น ══════════════ */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-6">
        <Reveal>
          <h2 className="font-serif text-4xl text-earth-900">
            ทำไมไม่ใช้วิธีที่มีอยู่แล้ว
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-earth-700">
            ทุกวิธีด้านล่างมีคนใช้จริง และทุกวิธีมีช่องว่างที่ทำให้เรื่องของท่านหายไปอยู่ดี
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[46rem] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  {["วิธี", "ช่องว่างที่ยังไม่มีใครแก้", "เล่าไว้แก้ยังไง"].map((h, i) => (
                    <th
                      key={h}
                      className={`bg-earth-900 px-5 py-4 text-paper-50 ${
                        i === 0 ? "rounded-tl-2xl" : ""
                      } ${i === 2 ? "rounded-tr-2xl" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "อัดคลิปเก็บในมือถือ",
                    "คลิปยาว ไม่มีใครกลับมาฟัง หาเรื่องที่ต้องการไม่เจอ",
                    "จัดเป็นบทตามช่วงชีวิต ค้นได้ อ่านได้ และยังฟังเสียงเดิมได้",
                  ],
                  [
                    "Storyworth (สหรัฐฯ)",
                    "ให้ผู้สูงอายุพิมพ์ตอบเอง เป็นภาษาอังกฤษ และไม่มีเสียง",
                    "ใช้เสียงเป็นหลัก ภาระอยู่ที่ลูกหลาน ท่านแค่เล่า",
                  ],
                  [
                    "Remento (สหรัฐฯ)",
                    "ใกล้เราที่สุด มี QR ฟังเสียงทุกหน้าเหมือนกัน แต่รองรับเฉพาะภาษาอังกฤษ ไม่รองรับภาษาถิ่น และผู้ใช้ตรวจย้อนกลับไม่ได้ว่าประโยคไหนมาจากเสียงช่วงใด",
                    "รองรับไทยและภาษาถิ่น ทุกย่อหน้าตรวจย้อนกลับได้ถึงวินาที ใช้ดิจิทัลฟรี และต่อยอดเป็นหนังสืออนุสรณ์ตามธรรมเนียมไทย",
                  ],
                  [
                    "ChatGPT + อัดเอง",
                    "ไม่มีชุดคำถาม AI แต่งเติมได้โดยไม่มีใครรู้ ตรวจที่มาไม่ได้",
                    "ทุกย่อหน้าอ้างถ้อยคำต้นฉบับ ตรวจด้วยโค้ด และคนต้องยืนยัน",
                  ],
                  [
                    "บริการ deadbot",
                    "จำลองผู้เสียชีวิตให้คุยต่อ เสี่ยงต่อสุขภาวะทางใจ",
                    "เก็บเสียงจริง ไม่โคลนเสียง ไม่สร้างบุคลิกปลอม",
                  ],
                  [
                    "หนังสืองานศพแบบเดิม",
                    "ทำหลังท่านจากไป ญาติต้องเดาเรื่องเอง และไม่มีเสียงท่าน",
                    "ทำล่วงหน้าขณะท่านยังเล่าได้ และมี QR ให้ฟังเสียงจริง",
                  ],
                ].map(([a, b, c], i, arr) => (
                  <tr key={a} className={i % 2 ? "bg-paper-200/50" : "bg-paper-50"}>
                    <td
                      className={`border-b border-paper-300 px-5 py-4 align-top font-medium text-earth-900 ${
                        i === arr.length - 1 ? "rounded-bl-2xl" : ""
                      }`}
                    >
                      {a}
                    </td>
                    <td className="border-b border-paper-300 px-5 py-4 align-top text-earth-700">
                      {b}
                    </td>
                    <td
                      className={`border-b border-paper-300 px-5 py-4 align-top text-earth-800 ${
                        i === arr.length - 1 ? "rounded-br-2xl" : ""
                      }`}
                    >
                      <span className="flex gap-2">
                        <Check size={18} className="mt-1 shrink-0 text-verified-600" />
                        {c}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ══════════════ โมเดลธุรกิจ ══════════════ */}
      <section id="pricing" className="border-y border-paper-300 bg-paper-200/60">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6">
          <Reveal>
            <h2 className="font-serif text-4xl text-earth-900">ใช้ฟรี จ่ายเมื่ออยากได้เล่ม</h2>
            <p className="mt-4 max-w-2xl text-lg text-earth-700">
              ของฟรีทำให้ครอบครัวกล้าเริ่ม และการเริ่มคือสิ่งที่ยากที่สุดในปัญหานี้
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "ดิจิทัล",
                price: "ฟรี",
                note: "ตลอดไป",
                feats: [
                  "สัมภาษณ์ได้ไม่จำกัด",
                  "ถอดเสียงและเรียบเรียงด้วย AI",
                  "อ่านและฟังบนเว็บได้ทุกเครื่อง",
                  "ปุ่มลืมและสิทธิ์ลบข้อมูลเต็มรูปแบบ",
                ],
                highlight: false,
              },
              {
                name: "หนังสือเล่มจริง",
                price: "จ่ายต่อเล่ม",
                note: "ราคาตามต้นทุนพิมพ์จริง",
                feats: [
                  "ทุกอย่างในแบบดิจิทัล",
                  "หนังสือ A5 พิมพ์จริง ส่งถึงบ้าน",
                  "QR ทุกย่อหน้า ฟังเสียงท่านได้",
                  "เหมาะเป็นของขวัญวันแม่ วันพ่อ สงกรานต์",
                ],
                highlight: true,
              },
              {
                name: "ผ่านพาร์ทเนอร์",
                price: "ติดต่อเรา",
                note: "ธุรกิจงานศพ · ศูนย์ดูแลผู้สูงอายุ · อบต.",
                feats: [
                  "หนังสืออนุสรณ์ที่ทำไว้ล่วงหน้า",
                  "มีทีมช่วยสัมภาษณ์ให้",
                  "เหมาะกับครอบครัวที่ไม่ถนัดทำเอง",
                  "แบ่งรายได้กับพาร์ทเนอร์",
                ],
                highlight: false,
              },
            ].map((p, i) => (
              <Reveal key={p.name} delay={i * 0.1}>
                <div
                  className={
                    p.highlight
                      ? "ring-glow relative h-full rounded-3xl border-2 border-gold-400 bg-paper-50 p-7"
                      : "card-soft h-full rounded-3xl p-7"
                  }
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-7 rounded-full bg-gold-400 px-3 py-1 text-sm font-medium text-earth-900">
                      คนเลือกมากที่สุด
                    </span>
                  )}
                  <h3 className="font-serif text-2xl text-earth-900">{p.name}</h3>
                  <p className="mt-3 font-serif text-3xl text-earth-900">{p.price}</p>
                  <p className="mt-1 text-sm text-earth-500">{p.note}</p>
                  <ul className="mt-6 space-y-3">
                    {p.feats.map((f) => (
                      <li key={f} className="flex gap-2.5 text-earth-700">
                        <Check size={18} className="mt-1 shrink-0 text-verified-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <p className="mt-8 text-sm text-earth-500">
              ราคาจะกำหนดหลังได้ต้นทุนพิมพ์จริงจากโรงพิมพ์
              และหลังทดสอบความเต็มใจจ่ายกับครอบครัวจริง — เราไม่ตั้งตัวเลขที่ยังพิสูจน์ไม่ได้
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ หนังสือ + QR พร้อมภาพประกอบ ══════════════ */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <BookQrScene className="w-full rounded-3xl shadow-[0_20px_50px_-24px_rgba(87,70,52,0.4)]" />
          </Reveal>
          <Reveal delay={0.12}>
            <h2 className="font-serif text-4xl leading-tight text-earth-900">
              สแกนแล้วได้ยินเสียงท่านทันที
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-earth-700">
              หนังสือเล่มอื่นเล่าได้แค่ว่าท่านพูดอะไร
              เล่มนี้ให้คุณ<strong className="text-earth-900">ได้ยินว่าท่านพูดยังไง</strong>
              — น้ำเสียง จังหวะ เสียงหัวเราะ และสำเนียงบ้านเกิดของท่าน
            </p>
            <p className="mt-4 text-lg leading-relaxed text-earth-700">
              หลานที่ยังไม่เกิดในวันนี้ จะได้ยินเสียงของท่านในอีกยี่สิบปีข้างหน้า
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ อ้างอิงงานวิจัย ══════════════ */}
      <section className="border-y border-paper-300 bg-paper-200/50">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
          <Reveal>
            <p className="text-center text-sm tracking-[0.2em] text-earth-500 uppercase">
              ตั้งอยู่บนข้อมูลและงานวิจัย
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "สถาบันวิจัยประชากรและสังคม", s: "ม.มหิดล — สถานการณ์ประชากรไทย 2569" },
              { t: "Thai PBS Policy Watch", s: "ผู้สูงอายุที่อยู่ลำพังในประเทศไทย" },
              { t: "University of Cambridge", s: "งานวิจัย 2024 เรื่องความเสี่ยงของ deadbot" },
              { t: "Typhoon ASR", s: "arXiv — ถอดเสียงภาษาอีสาน CER 8.85%" },
            ].map((r, i) => (
              <Reveal key={r.t} delay={i * 0.08}>
                <div className="card-soft h-full rounded-2xl px-5 py-4">
                  <p className="font-medium text-earth-900">{r.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-earth-500">{r.s}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ ทำไมเราถึงทำ ══════════════ */}
      <section className="mx-auto max-w-3xl px-5 py-20 sm:px-6">
        <Reveal>
          <div className="card-soft rounded-3xl p-8 sm:p-10">
            <Heart size={26} className="text-gold-500" />
            <h2 className="mt-5 font-serif text-3xl leading-snug text-earth-900">
              เราไม่ได้คิดเรื่องนี้จากในห้องเรียน
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-earth-700">
              ในทีม 4 คน มี 2 คนที่เจอปัญหานี้กับตัวเอง —
              คนหนึ่งเสียคุณยายไปก่อนได้ถามเรื่องของท่าน
              อีกคนอยากรู้เรื่องของปู่ย่าตายายแต่ไม่เคยมีเวลานั่งฟังจริงจัง
            </p>
            <p className="mt-4 text-lg leading-relaxed text-earth-700">
              เราทำสิ่งนี้เพราะอยากให้มีคนอื่นไม่ต้องเสียใจแบบเดียวกัน
            </p>
            <p className="mt-6 text-earth-500">
              ทีม STAR PLATINUM · มาจาก 3 โรงเรียน 3 จังหวัด
              จึงเข้าใจว่าแต่ละบ้านพูดกันคนละสำเนียง
            </p>
          </div>
        </Reveal>
      </section>

      {/* ══════════════ Roadmap ══════════════ */}
      <section className="border-t border-paper-300 bg-paper-200/60">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-6">
          <Reveal>
            <h2 className="font-serif text-4xl text-earth-900">แล้วจากนี้ไปไหนต่อ</h2>
          </Reveal>

          <ol className="mt-12 space-y-0">
            {[
              {
                when: "ตอนนี้",
                t: "ใช้ได้จริงแล้ว",
                d: "สัมภาษณ์ ถอดเสียง ตรวจสอบ และสร้างหนังสือพร้อม QR ได้ครบเส้นทาง",
                done: true,
              },
              {
                when: "เดือนถัดไป",
                t: "ทดสอบกับ 10–20 ครอบครัวจริง",
                d: "วัดสัดส่วนประโยคที่ต้องแก้ และความเต็มใจจ่ายของครอบครัว",
                done: false,
              },
              {
                when: "ไตรมาสถัดไป",
                t: "ภาษาถิ่นแม่นขึ้นจากข้อมูลผู้ใช้",
                d: "ทุกคำที่ครอบครัวแก้กลายเป็นชุดข้อมูลภาษาถิ่นที่คู่แข่งไม่มี",
                done: false,
              },
              {
                when: "ปีถัดไป",
                t: "Pilot กับพาร์ทเนอร์",
                d: "ธุรกิจงานศพ ศูนย์ดูแลผู้สูงอายุ และองค์กรปกครองส่วนท้องถิ่น",
                done: false,
              },
            ].map((s, i, arr) => (
              <Reveal key={s.t} delay={i * 0.1}>
                <li className="relative flex gap-6 pb-10">
                  {i < arr.length - 1 && (
                    <span className="absolute top-10 left-[1.1rem] h-full w-px bg-paper-400" />
                  )}
                  <span
                    className={
                      s.done
                        ? "z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-verified-600 text-paper-50"
                        : "z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-paper-400 bg-paper-50 text-earth-500"
                    }
                  >
                    {s.done ? <Check size={17} /> : i + 1}
                  </span>
                  <div className="pt-1">
                    <p className="text-sm tracking-wide text-earth-500 uppercase">{s.when}</p>
                    <h3 className="mt-1 font-serif text-2xl text-earth-900">{s.t}</h3>
                    <p className="mt-2 leading-relaxed text-earth-700">{s.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ══════════════ FAQ ══════════════ */}
      <section id="faq" className="border-t border-paper-300 bg-paper-200/60">
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
