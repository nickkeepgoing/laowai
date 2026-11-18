"use client";

/**
 * Landing page — หน้าแรกที่กรรมการเห็นตอน demo
 *
 * ลำดับการเล่าเรื่องตั้งใจให้เหมือน pitch:
 *   เสียง → ปัญหา → ทางที่คนใช้อยู่ → เราไม่ทำ deadbot
 *   → หลักฐานว่า AI ของเราเองก็ผิด → ทุกย่อหน้าพิสูจน์ได้ → หนังสือ + QR
 *
 * ⚠️ ไฟล์เสียงใน hero ตอนนี้ยังเป็น placeholder สังเคราะห์
 * พอได้เสียงจริงที่ได้รับความยินยอมแล้ว ให้ทับ public/demo/clip-1.wav
 * แล้วเปลี่ยน PLACEHOLDER_AUDIO เป็น false — ห้ามปล่อยให้คนเข้าใจผิดว่าเป็นเสียงจริง
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, BookOpen, Check, ShieldOff, Volume2, X } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import Highlight from "@/components/Highlight";
import QRBox from "@/components/QRBox";
import { Button, Card } from "@/components/ui";
import { demoChapter, demoClips } from "@/lib/demo";

const PLACEHOLDER_AUDIO = true;

/** ตัวเลขนับขึ้นเมื่อ scroll มาถึง — ทำให้ตัวเลขรู้สึกเป็นคนจริง ไม่ใช่สถิติลอย */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!seen) return;
    const t0 = performance.now();
    const dur = 1100;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString("th-TH")}
      {suffix}
    </span>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** ของที่ AI ถอดผิดจริง ๆ จาก transcript บทสนทนากับ mentor ในงานนี้ */
const ASR_ERRORS = [
  { wrong: "ภาษาอังกฤษ…แปลว่าเหนือกลางใต้", right: "ภาษาถิ่น" },
  { wrong: "สมาชิกคลังเรือนจำรายปี", right: "คลังความทรงจำรายปี" },
  { wrong: "หนังสืออนุสรณ์ผ่านธุรกิจงานสุข", right: "ธุรกิจงานศพ" },
  { wrong: "มีถังเพิ่มไหม", right: "มีคำถามเพิ่มไหม" },
];

export default function Home() {
  const hero = demoClips[0];
  const flagged = demoChapter.paragraphs.find((p) => p.flags.length > 0);
  const [siteUrl, setSiteUrl] = useState("");

  useEffect(() => setSiteUrl(window.location.origin), []);

  return (
    <main className="overflow-x-hidden">
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative mx-auto max-w-3xl px-5 pt-20 pb-24 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-ember-500/15 blur-[100px]"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-xs tracking-[0.3em] text-cream-500 uppercase"
        >
          เล่าไว้
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 font-serif text-4xl leading-[1.25] text-cream-50 sm:text-5xl sm:leading-[1.2]"
        >
          ปู่ย่าตายายของคุณ
          <br />
          มีเรื่องเล่าอีกกี่เรื่อง
          <br />
          <span className="text-ember-300">ที่คุณยังไม่เคยฟัง</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-10"
        >
          <p className="mb-3 flex items-center gap-2 text-sm text-cream-300">
            <Volume2 size={15} className="text-ember-400" />
            กดฟัง — นี่คือสิ่งที่เรากำลังเก็บรักษา
          </p>
          <AudioPlayer src={hero.audioUrl} clipId="hero" label="ตัวอย่างเสียงผู้เล่า" />
          {PLACEHOLDER_AUDIO && (
            <p className="mt-2 text-xs text-cream-500">
              ไฟล์ตัวอย่างชั่วคราวสำหรับทดสอบระบบ — จะแทนด้วยเสียงจริงที่ได้รับความยินยอมแล้ว
            </p>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-cream-300"
        >
          AI ช่วยตั้งคำถามให้หลานถาม ถอดเสียงที่ท่านเล่า แล้วเรียบเรียงเป็นหนังสือชีวิต
          ที่ทุกย่อหน้ากดฟังเสียงจริงของท่านได้
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <Link href="/interview/new">
            <Button size="lg">
              เริ่มเก็บเรื่องของท่าน <ArrowRight size={18} />
            </Button>
          </Link>
          <span className="text-sm text-cream-500">ใช้เวลาเริ่มต้น 2 นาที</span>
        </motion.div>
      </section>

      {/* ───────────────────────── ตัวเลข ───────────────────────── */}
      <section className="border-y border-cream-500/10 bg-ink-900/50">
        <div className="mx-auto grid max-w-4xl gap-8 px-5 py-16 sm:grid-cols-3 sm:px-6">
          {[
            { n: 16_800_000, label: "ผู้สูงอายุไทย ปี 2567", sub: "เดลินิวส์ อ้างรายงานที่ วช. สนับสนุน" },
            { n: 1_348_397, label: "ผู้สูงอายุที่อยู่ลำพัง ปี 2566", sub: "Thai PBS Policy Watch" },
            { n: 559_684, label: "ผู้เสียชีวิตในปี 2568", sub: "สถาบันวิจัยประชากรและสังคม ม.มหิดล" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.12}>
              <p className="font-serif text-3xl text-ember-300 sm:text-4xl">
                <CountUp to={s.n} />
              </p>
              <p className="mt-2 text-cream-100">{s.label}</p>
              <p className="mt-1 text-xs text-cream-500">{s.sub}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────────────── เทียบกับทางที่คนใช้อยู่ ───────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-6">
        <Reveal>
          <h2 className="font-serif text-3xl text-cream-50">
            ทุกบ้านเคยลองอัดคลิปเก็บไว้
          </h2>
          <p className="mt-3 max-w-2xl text-cream-300">
            แล้วไม่มีใครกลับมาฟัง เพราะหาไม่เจอ ฟังยาว และไม่รู้ว่าอยู่คลิปไหน
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Reveal>
            <Card className="h-full border-cream-500/10">
              <p className="mb-4 text-sm tracking-wide text-cream-500 uppercase">
                อัดคลิปเก็บไว้ในมือถือ
              </p>
              <ul className="space-y-3">
                {[
                  "คลิปยาวเป็นชั่วโมง ไม่มีใครกลับมาฟัง",
                  "หาเรื่องที่ต้องการไม่เจอ",
                  "ไม่รู้จะเริ่มถามอะไร เลยได้แต่เรื่องเดิม",
                  "มือถือหาย = หายไปทั้งหมด",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5 text-cream-300">
                    <X size={17} className="mt-0.5 shrink-0 text-red-400/70" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>

          <Reveal delay={0.12}>
            <Card className="h-full border-ember-400/30 bg-ember-500/5">
              <p className="mb-4 text-sm tracking-wide text-ember-300 uppercase">เล่าไว้</p>
              <ul className="space-y-3">
                {[
                  "อัดทีละคำถาม 1–3 นาที ไม่ต้องเปิดแอปทิ้งไว้",
                  "จัดเป็นบทตามช่วงชีวิต ค้นและอ่านได้",
                  "AI เสนอคำถามต่อจากสิ่งที่ท่านเพิ่งเล่า",
                  "ได้หนังสือจริงที่ทุกย่อหน้ากดฟังเสียงได้",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5 text-cream-100">
                    <Check size={17} className="mt-0.5 shrink-0 text-verified-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <p className="mt-6 text-sm text-cream-500">
            เสียง 3 นาทีใช้เน็ตประมาณ 0.7 MB และอัปโหลดหลังกดหยุดเท่านั้น —
            เน็ตหลุดก็เก็บไว้ในเครื่องก่อน ไม่เสียเรื่องที่ท่านเล่า
          </p>
        </Reveal>
      </section>

      {/* ───────────────────────── ไม่ทำ deadbot ───────────────────────── */}
      <section className="border-y border-cream-500/10 bg-ink-900/50">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6">
          <Reveal>
            <ShieldOff size={28} className="text-ember-400" />
            <h2 className="mt-5 font-serif text-3xl text-cream-50">
              เราไม่สร้าง AI ที่เลียนแบบคนที่จากไป
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-cream-300">
              มีบริการที่ทำ “deadbot” ให้คุยกับคนที่เสียไปแล้วได้
              นักวิจัยมหาวิทยาลัยเคมบริดจ์ (2024) เตือนว่าอาจทำร้ายจิตใจผู้ใช้
            </p>
            <p className="mt-4 text-lg leading-relaxed text-cream-100">
              เราเลือกทางตรงข้าม — เก็บ<strong className="text-ember-300">เสียงจริง</strong>
              ของท่านไว้ ไม่โคลนเสียง ไม่สร้างบุคลิกปลอม
              และใช้ AI เป็นผู้ช่วยฟังที่พาคนในครอบครัวกลับมาคุยกัน
              <strong className="text-ember-300">ขณะที่ยังมีโอกาส</strong>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───────────── ทำไมเราไม่เชื่อ AI ของเราเอง ───────────── */}
      <section className="mx-auto max-w-3xl px-5 py-20 sm:px-6">
        <Reveal>
          <h2 className="font-serif text-3xl text-cream-50">
            ทำไมเราไม่เชื่อ AI ของเราเอง
          </h2>
          <p className="mt-3 text-cream-300">
            นี่คือคำที่ AI ถอดผิดจาก<strong className="text-cream-100">บทสนทนาจริงในงานนี้</strong> —
            เสียงคนหนุ่มพูดภาษากลางชัด ๆ ในห้องเงียบ
          </p>
        </Reveal>

        <div className="mt-8 space-y-3">
          {ASR_ERRORS.map((e, i) => (
            <Reveal key={e.right} delay={i * 0.08}>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-cream-500/15 bg-ink-900/60 px-4 py-3">
                <span className="text-cream-500 line-through decoration-red-400/60">
                  {e.wrong}
                </span>
                <ArrowRight size={14} className="text-cream-500" />
                <span className="font-medium text-verified-400">{e.right}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="mt-7 text-lg leading-relaxed text-cream-100">
            ถ้าภาษากลางยังผิดขนาดนี้ เสียงคุณยายอายุ 80 พูดภาษาถิ่นจะผิดแค่ไหน
          </p>
          <p className="mt-3 text-cream-300">
            เพราะฉะนั้นเราไม่ออกแบบระบบที่สมมติว่า AI ถูก
            เราออกแบบระบบที่สมมติว่า<strong className="text-cream-100">AI ผิดได้ทุกเมื่อ</strong>
            แล้วทำให้ครอบครัวจับผิดมันได้ง่ายที่สุด
          </p>
        </Reveal>
      </section>

      {/* ───────────────────────── ทุกย่อหน้าพิสูจน์ได้ ───────────────────────── */}
      <section className="border-y border-cream-500/10 bg-ink-900/50">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6">
          <Reveal>
            <h2 className="font-serif text-3xl text-cream-50">ทุกย่อหน้าพิสูจน์ได้</h2>
            <p className="mt-3 text-cream-300">
              ทุกย่อหน้าต้องอ้างถ้อยคำที่มีอยู่จริงในเสียง และเรา
              <strong className="text-cream-100">ตรวจด้วยโค้ด ไม่ใช่ให้ AI ตรวจ AI</strong>
            </p>
          </Reveal>

          {flagged && (
            <Reveal delay={0.15}>
              <Card className="mt-8 border-warn-500/40 bg-warn-900/10">
                <p className="mb-3 text-xs tracking-wide text-warn-200 uppercase">
                  ตัวอย่างจริงจากหน้าตรวจ
                </p>
                <p className="font-serif text-lg leading-relaxed text-cream-50">
                  ยายตื่นตีห้าทุกวันไปช่วยแม่หาบขนมไปขาย เป็นหน้าที่ประจำตั้งแต่ยังเล็ก และ
                  <Highlight level="warn" reason={flagged.flags[0]}>
                    เป็นช่วงเวลาที่ยายได้อยู่กับแม่มากที่สุดในหนึ่งวัน
                  </Highlight>
                </p>
                <p className="mt-4 text-sm text-warn-200">
                  ระบบจับได้เองว่าประโยคหลังไม่มีถ้อยคำนี้ในเสียงต้นฉบับ
                  ครอบครัวจะเห็นไฮไลต์นี้และต้องตัดสินใจก่อนพิมพ์
                </p>
              </Card>
            </Reveal>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                t: "อ้างถ้อยคำต้นฉบับ",
                d: "ทุกย่อหน้าผูกกับประโยคที่ท่านพูดจริง ถ้าหาไม่เจอในเสียง ระบบทิ้งทันที",
              },
              {
                t: "กดฟังเทียบได้",
                d: "คลิกย่อหน้าแล้วเสียงจริงเล่นที่วินาทีนั้นพอดี",
              },
              {
                t: "คนยืนยันก่อนพิมพ์",
                d: "AI ไม่มีสิทธิ์พิมพ์อะไรเอง ครอบครัวต้องกดยืนยันทุกบท",
              },
            ].map((c, i) => (
              <Reveal key={c.t} delay={0.1 + i * 0.1}>
                <Card className="h-full">
                  <h3 className="text-cream-50">{c.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream-300">{c.d}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── หนังสือ + QR ───────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-6">
        <div className="grid items-center gap-10 sm:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <h2 className="font-serif text-3xl text-cream-50">
              จบลงที่หนังสือที่ถือได้จริง
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-cream-300">
              หนังสือชีวิตขนาด A5 พิมพ์ได้จริง ทุกย่อหน้ามี QR ให้สแกนฟังเสียงของท่าน
              ตรงประโยคนั้น และต่อยอดเป็นหนังสืออนุสรณ์ที่ทำไว้ล่วงหน้า
              <strong className="text-cream-100">ขณะที่ท่านยังเล่าได้</strong>
              ไม่ใช่รวบรวมอย่างเร่งรีบหลังการจากไป
            </p>
            <Link href="/interview/new" className="mt-7 inline-block">
              <Button size="lg">
                <BookOpen size={18} /> ลองทำหนังสือของท่าน
              </Button>
            </Link>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="paper rounded-2xl p-7 text-center shadow-2xl">
              <p className="text-[10px] tracking-[0.3em] text-[#8a7a63] uppercase">เล่าไว้</p>
              <h3 className="mt-5 font-serif text-2xl text-[#231c14]">ยายสมจิต</h3>
              <div className="mx-auto my-4 h-px w-10 bg-[#c9b89c]" />
              <p className="font-serif text-[#3d3124]">วัยเด็กริมคลองบางปะกง</p>
              <div className="mt-6 flex justify-center">
                <QRBox
                  value={siteUrl ? `${siteUrl}/clip/${demoChapter.shareToken}` : "https://laowai-th.vercel.app"}
                  size={104}
                  caption="สแกนเพื่อฟังเสียงจริง"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── ปิด ───────────────────────── */}
      <footer className="border-t border-cream-500/10 px-5 py-14 text-center sm:px-6">
        <p className="font-serif text-2xl text-cream-50">
          วันที่อยากฟัง อาจไม่ใช่วันที่ยังได้ฟัง
        </p>
        <Link href="/interview/new" className="mt-7 inline-block">
          <Button size="lg">
            เริ่มวันนี้ <ArrowRight size={18} />
          </Button>
        </Link>
        <p className="mt-10 text-xs text-cream-500">
          เล่าไว้ · ทีม STAR PLATINUM · Thailand AI Extreme Hack 2026
        </p>
      </footer>
    </main>
  );
}
