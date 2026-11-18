import type { Metadata } from "next";
import Logo from "@/components/Logo";
import {
  BookMockup,
  BrowserFrame,
  InterviewMockup,
  ReviewMockup,
} from "@/components/AppMockups";
import QRBox from "@/components/QRBox";
import { SITE_URL } from "@/lib/env";
import { demoChapter } from "@/lib/demo";
import "./deck.css";

export const metadata: Metadata = {
  title: "เล่าไว้ — Pitch Deck | Thailand AI Extreme Hack 2026",
  description: "STAR PLATINUM · SPIRITUAL HACK!",
};

/**
 * Pitch Deck — 12 สไลด์หลัก สำหรับพูด 4 นาที
 *
 * โครงเรื่องใช้ลำดับมาตรฐานของ pitch deck นักลงทุน
 * (Company Brief → Problem → Solution → Product → Market →
 *  Business Model → Competition → Advantage → Team)
 * แต่ปรับให้เข้ากับเกณฑ์ของงานนี้ ซึ่งให้ Social Impact 14 คะแนนจาก 50
 * โครงนักลงทุนล้วนไม่มีหัวข้อนั้น ถ้าใช้ตรง ๆ จะทิ้งคะแนนไปเปล่า ๆ
 *
 * 240 วินาที ÷ 12 สไลด์ = 20 วินาทีต่อใบ
 * กฎ: ทุกสไลด์ต้องอ่านจบใน 3 วินาที ที่เหลือเป็นเวลาของคนพูด
 */

function Bar({ tag }: { tag: string }) {
  return (
    <>
      <div className="slide__bar">
        <span>{tag}</span>
      </div>
      <div className="slide__rule" />
    </>
  );
}

export default function DeckPage() {
  const clipUrl = `${SITE_URL}/clip/${demoChapter.shareToken}`;
  let n = 0;
  const no = () => <span className="slide__no">{String(++n).padStart(2, "0")}</span>;

  return (
    <div className="deck">
      {/* ═══ 01 · Company Brief ═══ */}
      <section className="slide slide--dark slide--center">
        <div className="deck-glow" />
        <div className="relative">
          <div className="flex justify-center">
            <Logo size={100} tone="dark" />
          </div>
          <h1 className="mt-10 font-serif">
            <span className="gold">เล่าไว้</span>
          </h1>
          <p className="lead mt-7 max-w-3xl opacity-85">
            เราเปลี่ยนบทสนทนาในบ้าน ให้เป็นหนังสือชีวิต
            <br />
            ที่ทุกย่อหน้า<strong>กดฟังเสียงจริงของท่านได้</strong>
          </p>
          <p className="small mt-12">
            STAR PLATINUM · SPIRITUAL HACK! · Thailand AI Extreme Hack 2026
          </p>
        </div>
      </section>

      {/* ═══ 02 · Problem ═══ */}
      <section className="slide">
        <Bar tag="Problem" />
        <h2 className="max-w-3xl font-serif">
          ในทีม 4 คน มี 2 คน
          <br />
          ที่<span className="gold">ไม่มีโอกาสนั้นแล้ว</span>
        </h2>
        <p className="lead mt-8 max-w-3xl text-earth-700">
          คนหนึ่งเสียคุณยายไปก่อนได้ถามเรื่องของท่าน
          อีกคนไม่เคยมีเวลานั่งฟังจริงจัง
        </p>
        <div className="accent-bar mt-10" />
        <div className="mt-10 grid grid-cols-3 gap-12">
          {[
            ["16.8 ล้าน", "ผู้สูงอายุไทย ปี 2567"],
            ["1.3 ล้าน", "อยู่ลำพัง ปี 2566"],
            ["559,684", "เสียชีวิตในปี 2568"],
          ].map(([a, b]) => (
            <div key={b}>
              <p className="font-serif text-[50px] leading-none text-gold-500">{a}</p>
              <p className="mt-3 text-[20px] text-earth-700">{b}</p>
            </div>
          ))}
        </div>
        {no()}
      </section>

      {/* ═══ 03 · Solution ═══ */}
      <section className="slide slide--dark slide--center">
        <Bar tag="Solution" />
        <h2 className="max-w-4xl font-serif">
          ปัญหาไม่ใช่ว่าท่านไม่อยากเล่า
          <br />
          <span className="gold">แต่ไม่มีใครรู้ว่าจะถามอะไร</span>
        </h2>
        <p className="lead mt-9 max-w-3xl opacity-85">
          เราจึงยกภาระทั้งหมดมาไว้ที่ลูกหลาน
          แล้วปล่อยให้ท่านทำสิ่งที่ท่านเก่งที่สุด — เล่า
        </p>
        <div className="mt-12 flex items-center gap-4 text-[20px]">
          {["หลานกดอัด", "AI ช่วยถามต่อ", "ครอบครัวตรวจ", "หนังสือ + QR"].map((t, i) => (
            <span key={t} className="flex items-center gap-4">
              <span className="rounded-full border border-gold-400/60 bg-white/5 px-6 py-3">
                {t}
              </span>
              {i < 3 && <span className="text-gold-300">→</span>}
            </span>
          ))}
        </div>
        {no()}
      </section>

      {/* ═══ 04 · Product ═══ */}
      <section className="slide">
        <Bar tag="Product · ใช้งานได้จริงแล้ว" />
        <h2 className="font-serif">ไม่ใช่ภาพในสไลด์ — นี่คือหน้าจอจริง</h2>
        <div className="mt-6 grid origin-top scale-[0.87] grid-cols-3 items-start gap-6">
          <div>
            <BrowserFrame url="laowai-th.vercel.app/interview">
              <InterviewMockup />
            </BrowserFrame>
            <p className="mt-4 text-[20px] font-medium">หน้าสัมภาษณ์</p>
          </div>
          <div>
            <BrowserFrame url="laowai-th.vercel.app/review">
              <ReviewMockup />
            </BrowserFrame>
            <p className="mt-4 text-[20px] font-medium">หน้าตรวจ · จับ AI เขียนเกิน</p>
          </div>
          <div>
            <BrowserFrame url="laowai-th.vercel.app/book">
              <BookMockup />
            </BrowserFrame>
            <p className="mt-4 text-[20px] font-medium">หนังสือ A5 + QR</p>
          </div>
        </div>
        {no()}
      </section>

      {/* ═══ 05 · แก่นนวัตกรรม ═══ */}
      <section className="slide slide--ink">
        <Bar tag="How it works · the core" />
        <h2 className="max-w-4xl font-serif">
          ทีมอื่นให้ AI ตรวจ AI
          <br />
          <span className="gold">เราตรวจด้วยโค้ด</span>
        </h2>
        <div className="mt-12 grid grid-cols-2 items-center gap-12">
          <div className="rounded-2xl bg-black/30 p-9 font-mono text-[19px] leading-[2]">
            <p className="opacity-50">{"// ทุกย่อหน้าต้องอ้างถ้อยคำที่มีจริงในเสียง"}</p>
            <p className="mt-5">
              <span className="text-gold-300">verifyClaim</span>(เสียง, ถ้อยคำ)
            </p>
            <p className="mt-4 pl-5 text-verified-400">✓ เจอ → เก็บไว้</p>
            <p className="mt-2 pl-5 text-red-300">✕ ไม่เจอ → ทิ้งทันที</p>
          </div>
          <div>
            <p className="huge font-serif text-gold-300">100%</p>
            <p className="lead mt-5">
              ของย่อหน้าในหนังสือ
              <br />
              <strong>อ้างถ้อยคำที่มีอยู่จริงในเสียง</strong>
              <br />
              และกดกลับไปฟังได้
            </p>
          </div>
        </div>
        {no()}
      </section>

      {/* ═══ 06 · หลักฐาน ═══ */}
      <section className="slide slide--dark">
        <Bar tag="Why it matters" />
        <h2 className="font-serif">
          ทำไมเรา<span className="gold">ไม่เชื่อ</span> AI ของเราเอง
        </h2>
        <p className="lead mt-6 opacity-80">
          คำที่ AI ถอดผิดจาก<strong>บทสนทนาจริงกับ mentor ในงานนี้</strong>
        </p>
        <div className="mt-9 grid grid-cols-2 gap-4">
          {[
            ["ภาษาอังกฤษ", "ภาษาถิ่น"],
            ["คลังเรือนจำ", "คลังความทรงจำ"],
            ["ธุรกิจงานสุข", "ธุรกิจงานศพ"],
            ["ซาวด์บาท", "ซาวบาท"],
          ].map(([w, r]) => (
            <div
              key={r}
              className="flex items-center gap-5 rounded-2xl border border-white/12 bg-white/5 px-7 py-5 text-[23px]"
            >
              <span className="line-through opacity-45">{w}</span>
              <span className="opacity-35">→</span>
              <span className="font-medium text-gold-300">{r}</span>
            </div>
          ))}
        </div>
        <p className="mt-9 font-serif text-[31px] leading-snug">
          ถ้าภาษากลางยังผิดขนาดนี้ — เสียงคุณยายพูดภาษาถิ่นจะผิดแค่ไหน
        </p>
        {no()}
      </section>

      {/* ═══ 07 · Market ═══ */}
      <section className="slide">
        <Bar tag="Market size & validation" />
        <h2 className="max-w-4xl font-serif">
          เราไม่ต้องสร้างพฤติกรรมใหม่
          <br />
          <span className="gold">เงินก้อนนี้ถูกจ่ายอยู่แล้วทุกปี</span>
        </h2>
        <div className="mt-10 grid grid-cols-[1fr_1fr] gap-10">
          <div className="rounded-3xl border-2 border-gold-400 bg-gold-200/25 p-8">
            <p className="font-serif text-[46px] leading-none text-gold-600">
              120,000–400,000฿
            </p>
            <p className="mt-4 text-[21px] text-earth-800">
              ค่าจัดงานศพต่อหนึ่งงานในไทย
            </p>
            <p className="small mt-3">กรมส่งเสริมอุตสาหกรรม · บริการครบวงจร</p>
            <div className="mt-6 border-t border-gold-400/40 pt-5">
              <p className="text-[22px] text-earth-800">
                หนังสืออนุสรณ์ของเรา = <strong>ไม่ถึง 2%</strong> ของงบที่เขาจ่ายอยู่แล้ว
              </p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl border border-paper-400 bg-paper-50 p-6">
              <p className="text-[20px] text-earth-700">ผู้เสียชีวิตต่อปี</p>
              <p className="mt-1 font-serif text-[34px]">559,684 ราย</p>
            </div>
            <div className="rounded-2xl border border-paper-400 bg-paper-50 p-6">
              <p className="text-[20px] text-earth-700">ตลาดพิสูจน์แล้วในต่างประเทศ</p>
              <p className="mt-1 text-[21px]">
                Storyworth พิมพ์ไปแล้วกว่า 1 ล้านเล่ม
                <br />
                Remento เก็บเรื่องแล้วกว่า 1 ล้านเรื่อง
              </p>
            </div>
          </div>
        </div>
        <p className="small mt-6">
          ⚠️ สิ่งที่เรายังไม่มี: การทดสอบความเต็มใจจ่ายกับครอบครัวไทยจริง — เป็นงานลำดับแรกหลังจบงานนี้
        </p>
        {no()}
      </section>

      {/* ═══ 08 · Business model ═══ */}
      <section className="slide">
        <Bar tag="Business model" />
        <h2 className="font-serif">ใช้ฟรี จ่ายเมื่ออยากได้เล่ม</h2>
        <div className="mt-10 grid grid-cols-4 gap-5">
          {[
            ["ดิจิทัล", "ฟรี", "ทำให้กล้าเริ่ม"],
            ["หนังสือเล่มจริง", "ต่อเล่ม", "ของขวัญวันแม่ วันพ่อ"],
            ["สมาชิกรายปี", "ต่อปี", "คลังของทั้งครอบครัว"],
            ["ผ่านพาร์ทเนอร์", "ต่อโครงการ", "ธุรกิจงานศพ · ประกัน"],
          ].map(([t, p, d], i) => (
            <div
              key={t}
              className={
                i === 3
                  ? "rounded-2xl border-2 border-gold-400 bg-gold-200/30 p-7"
                  : "rounded-2xl border border-paper-400 bg-paper-50 p-7"
              }
            >
              <p className="text-[20px]">{t}</p>
              <p className="mt-3 font-serif text-[31px] text-gold-600">{p}</p>
              <p className="small mt-3">{d}</p>
            </div>
          ))}
        </div>
        <p className="lead mt-10 max-w-4xl">
          ช่องทางที่สี่คือตัวหลัก — เพราะธุรกิจงานศพ
          <strong>มีลูกค้าที่กำลังคิดเรื่องนี้อยู่พอดี</strong> และได้ของขายเพิ่มโดยไม่ต้องลงทุน
        </p>
        {no()}
      </section>

      {/* ═══ 09 · Competition ═══ */}
      <section className="slide">
        <Bar tag="Competition & advantage" />
        <h2 className="font-serif">มีคนทำแล้ว และเขาทำได้ดี</h2>
        <table className="mt-8 w-full border-separate border-spacing-0 text-left text-[20px]">
          <thead>
            <tr>
              {["", "Storyworth", "Remento", "เล่าไว้"].map((h, i) => (
                <th
                  key={h || i}
                  className={
                    i === 3
                      ? "rounded-t-xl bg-gold-400 px-5 py-3.5 text-earth-900"
                      : "bg-paper-300 px-5 py-3.5"
                  }
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["ภาษาไทยและภาษาถิ่น", "✕", "✕", "✓"],
              ["เก็บเสียงจริง ไม่ต้องเขียนเอง", "✕", "✓", "✓"],
              ["ตรวจย้อนกลับได้ถึงวินาที", "✕", "✕", "✓"],
              ["หนังสืออนุสรณ์ตามธรรมเนียมไทย", "✕", "✕", "✓"],
            ].map((row, ri) => (
              <tr key={row[0]} className={ri % 2 ? "bg-paper-200/50" : ""}>
                {row.map((c, ci) => (
                  <td
                    key={ci}
                    className={
                      ci === 3
                        ? "border-b border-paper-300 bg-gold-200/35 px-5 py-3 text-center text-[23px] font-medium text-verified-600"
                        : ci === 0
                          ? "border-b border-paper-300 px-5 py-3"
                          : "border-b border-paper-300 px-5 py-3 text-center text-[23px] text-earth-400"
                    }
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="lead mt-7 max-w-4xl">
          สิ่งที่ทำให้เรา<strong>อยู่ได้นาน</strong>ไม่ใช่เทคโนโลยี
          แต่คือช่องทางผ่านธุรกิจงานศพ และคลังความทรงจำที่ครอบครัวย้ายไปที่อื่นไม่ได้
        </p>
        {no()}
      </section>

      {/* ═══ 10 · Social impact ═══ */}
      <section className="slide slide--ink">
        <Bar tag="Social impact · now & next" />
        <h2 className="max-w-4xl font-serif">
          เปลี่ยนหนังสืองานศพ จากของที่ทำ<span className="gold">หลังจากไป</span>
          <br />
          เป็นของที่ทำ<span className="gold">ตอนยังอยู่</span>
        </h2>
        <div className="mt-11 grid grid-cols-[1fr_1fr] gap-12">
          <div className="rounded-2xl border border-white/12 bg-white/5 p-8 text-[21px] leading-[2]">
            <p>ครอบครัวแก้คำที่ AI ถอดผิด</p>
            <p className="text-gold-300">↓</p>
            <p>ชุดข้อมูลคำไทย-ถิ่นโตขึ้น</p>
            <p className="text-gold-300">↓</p>
            <p className="font-medium">ถอดเสียงแม่นขึ้นสำหรับทุกครอบครัว</p>
          </div>
          <div>
            <p className="text-[22px] leading-relaxed opacity-85">
              เราทำโดย<strong>ไม่เก็บเสียง ไม่เก็บชื่อ</strong> —
              เก็บแค่คู่ข้อความที่คนแก้
            </p>
            <div className="mt-6 rounded-2xl border border-gold-400/40 bg-gold-400/10 p-6">
              <p className="text-[19px] leading-relaxed">
                <strong className="text-gold-300">คำถามที่เรายังไม่มีคำตอบ:</strong>
                <br />
                ถ้าท่านมีภาวะสมองเสื่อม ใครคือผู้ให้ความยินยอม
                และเสียงที่เก็บไว้ควรอยู่กับครอบครัวไปอีกกี่ชั่วอายุคน
              </p>
            </div>
          </div>
        </div>
        {no()}
      </section>

      {/* ═══ 11 · Team ═══ */}
      <section className="slide">
        <Bar tag="Team" />
        <h2 className="font-serif">ทีมที่เจอปัญหานี้มาเอง</h2>
        <div className="mt-11 grid grid-cols-4 gap-6">
          {[
            ["นิค", "Lead · ระบบและ AI", "สถาปัตยกรรม · Backend · AI Pipeline"],
            ["ไอช์", "Design · Research", "ออกแบบหน้าจอและแม่แบบหนังสือ"],
            ["ศิลป", "Business · Pitch", "โมเดลธุรกิจ · ต้นทุน · พาร์ทเนอร์"],
            ["ปุ๊กลุก", "Research · Ethics", "ชุดคำถาม · ความยินยอม · ทดสอบผู้ใช้"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-2xl border border-paper-400 bg-paper-50 p-7">
              <p className="font-serif text-[30px]">{a}</p>
              <p className="mt-2 text-[18px] text-gold-600">{b}</p>
              <p className="small mt-3">{c}</p>
            </div>
          ))}
        </div>
        <p className="lead mt-10 max-w-4xl">
          มาจาก 3 โรงเรียน 3 จังหวัด — ชลบุรี นครศรีธรรมราช นครราชสีมา
          จึงเข้าใจว่า<strong>แต่ละบ้านพูดกันคนละสำเนียง</strong>
        </p>
        {no()}
      </section>

      {/* ═══ 12 · Closing + Demo ═══ */}
      <section className="slide slide--dark slide--center">
        <div className="deck-glow" />
        <div className="relative">
          <h2 className="max-w-4xl font-serif">
            วันที่อยากฟัง
            <br />
            <span className="gold">อาจไม่ใช่วันที่ยังได้ฟัง</span>
          </h2>
          <div className="mt-10 flex items-center justify-center gap-12">
            <QRBox value={clipUrl} size={168} />
            <div className="text-left">
              <p className="text-[25px]">สแกนเพื่อฟังเสียงจริง</p>
              <p className="mt-2 text-[19px] opacity-70">
                QR แบบเดียวกับที่อยู่ในหนังสือ
              </p>
              <p className="mt-7 text-[21px] text-gold-300">laowai-th.vercel.app</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ คั่นสไลด์สำรอง ═══ */}
      <section className="slide slide--divider slide--center">
        <h2 className="font-serif">สไลด์สำรอง</h2>
        <p className="lead mt-6">สำหรับตอบคำถามกรรมการ</p>
      </section>

      {/* ═══ A1 · Market adoption ═══ */}
      <section className="slide">
        <Bar tag="Appendix · market adoption" />
        <h2 className="font-serif">เราจะเข้าถึงลูกค้ายังไง</h2>
        <div className="mt-10 space-y-4">
          {[
            ["1", "คอนเทนต์เสียงจริง", "คลิปสั้นเสียงคุณยายเล่าเรื่อง — ตัวสินค้าคือคอนเทนต์ในตัวเอง ต้นทุนเท่ากับเวลาตัดต่อ", "ทันที"],
            ["2", "ฤดูกาลของขวัญ", "วันแม่ วันพ่อ สงกรานต์ ปีใหม่ — จังหวะที่ความรู้สึกผิดสูงที่สุด", "ทันที"],
            ["3", "ธุรกิจจัดงานศพ", "เสนอเป็นบริการเสริม เขามีลูกค้าที่กำลังคิดเรื่องนี้อยู่พอดี", "หลัง pilot"],
            ["4", "ศูนย์ผู้สูงอายุ / อบต.", "มีผู้สูงอายุรวมกันอยู่แล้ว และได้ทดสอบภาษาถิ่นหลายภาคพร้อมกัน", "หลัง pilot"],
          ].map(([i, t, d, w]) => (
            <div
              key={t}
              className="flex items-center gap-6 rounded-2xl border border-paper-400 bg-paper-50 px-7 py-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-400 font-serif text-[22px] text-earth-900">
                {i}
              </span>
              <div className="flex-1">
                <p className="text-[22px] font-medium">{t}</p>
                <p className="small mt-1">{d}</p>
              </div>
              <span className="shrink-0 rounded-full border border-paper-400 px-4 py-1.5 text-[16px] text-earth-600">
                {w}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ A2 · Persona ═══ */}
      <section className="slide">
        <Bar tag="Appendix · target user" />
        <h2 className="font-serif">คนจ่ายกับคนเล่า เป็นคนละคน</h2>
        <div className="mt-11 grid grid-cols-2 gap-8">
          <div className="rounded-3xl border border-paper-400 bg-paper-50 p-9">
            <p className="font-serif text-[31px]">ลูกสาววัย 34 · คนจ่าย</p>
            <ul className="mt-6 space-y-3 text-[21px] text-earth-700">
              <li>ทำงานกรุงเทพ พ่อแม่อยู่ต่างจังหวัด</li>
              <li>กลับบ้านปีละ 3 ครั้ง</li>
              <li>รู้สึกผิดที่ไม่มีเวลา และกลัวไม่ทัน</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-paper-400 bg-paper-50 p-9">
            <p className="font-serif text-[31px]">คุณยายวัย 78 · คนเล่า</p>
            <ul className="mt-6 space-y-3 text-[21px] text-earth-700">
              <li>ใช้ LINE ได้ พิมพ์ไม่ถนัด</li>
              <li>จำเรื่องเก่าได้ดีกว่าเรื่องเมื่อวาน</li>
              <li>อยากรู้สึกว่าเรื่องของตัวเองมีค่า</li>
            </ul>
          </div>
        </div>
        <p className="lead mt-9">
          ยายไม่ได้จ่าย — <strong>แต่ยายคือคนตัดสินว่าจะเล่าต่อไหม</strong>
        </p>
      </section>

      {/* ═══ A3 · Execution ═══ */}
      <section className="slide slide--ink">
        <Bar tag="Appendix · execution" />
        <h2 className="font-serif">สิ่งที่เกิดขึ้นจริงใน 2 วัน</h2>
        <div className="mt-12 grid grid-cols-4 gap-6">
          {[
            ["16", "ความสามารถที่ทำงานได้จริง"],
            ["6", "API ที่เขียนและทดสอบแล้ว"],
            ["3.4 วิ", "ถอดเสียง 40 วินาที (เดิม 236 วิ)"],
            ["100%", "ย่อหน้าที่อ้างถ้อยคำต้นฉบับ"],
          ].map(([a, b]) => (
            <div key={b} className="rounded-2xl border border-white/12 bg-white/5 p-7">
              <p className="font-serif text-[46px] leading-none text-gold-300">{a}</p>
              <p className="mt-4 text-[19px] opacity-80">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-gold-400/40 bg-gold-400/10 p-7">
          <p className="text-[21px] leading-relaxed">
            <strong className="text-gold-300">บั๊กที่เจอจากการทดสอบจริง:</strong>{" "}
            Gemini คืน claim id ซ้ำกันทุกคลิป ทำให้กดปุ่มลืมคลิปหนึ่ง
            แล้วย่อหน้าของอีกคลิปหายไปด้วย — แก้แล้วและทดสอบซ้ำจนผ่าน
          </p>
        </div>
      </section>

      {/* ═══ A4 · ความเสี่ยง ═══ */}
      <section className="slide">
        <Bar tag="Appendix · risks" />
        <h2 className="font-serif">ความเสี่ยงที่เรารู้ตัว</h2>
        <div className="mt-10 space-y-5">
          {[
            [
              "ถ้า Google ทำ ASR ภาษาถิ่นไทยได้ดีเอง",
              "ความได้เปรียบด้านข้อมูลของเราจะหายไป — เราจึงไม่ฝากอนาคตไว้กับเรื่องนี้ทางเดียว แต่สร้างช่องทางผ่านธุรกิจงานศพและคลังความทรงจำที่ย้ายไม่ได้ควบคู่กัน",
            ],
            [
              "เป็นการซื้อครั้งเดียว ไม่ใช่รายได้ต่อเนื่อง",
              "ครอบครัวหนึ่งอาจทำเล่มเดียวจบ — จึงต้องพึ่งปริมาณผ่านพาร์ทเนอร์ที่มีลูกค้าใหม่ทุกวัน มากกว่าหวังให้คนเดิมจ่ายซ้ำ",
            ],
            [
              "ยังไม่ได้ทดสอบความเต็มใจจ่ายกับครอบครัวไทย",
              "เรารู้ว่าตลาดนี้มีคนจ่ายจริงในต่างประเทศ แต่ยังไม่ได้พิสูจน์ในไทย — เป็นงานลำดับแรกหลังจบงานนี้",
            ],
          ].map(([t, d]) => (
            <div
              key={t}
              className="rounded-2xl border-l-4 border-warn-500 bg-warn-200/30 px-8 py-6"
            >
              <p className="text-[23px] font-medium text-warn-900">{t}</p>
              <p className="mt-2 text-[20px] leading-relaxed text-earth-800">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
