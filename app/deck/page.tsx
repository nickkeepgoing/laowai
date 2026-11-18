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
 * Pitch Deck — ออกแบบสำหรับพูด 4 นาที
 *
 * 240 วินาที ÷ 12 สไลด์ = 20 วินาทีต่อใบ
 * กฎที่ใช้คุมทุกสไลด์: ต้องอ่านจบได้ใน 3 วินาที
 * ถ้าสไลด์ไหนต้องใช้เวลาอ่านนานกว่านั้น แปลว่ามันกำลังแย่งเวลาของคนพูด
 *
 * สไลด์ที่ตัดออกจากชุดเดิมไม่ได้ทิ้ง แต่ย้ายไปอยู่ท้ายเล่มเป็นสไลด์สำรอง
 * ไว้เปิดตอนกรรมการถาม ซึ่งเป็นช่วงที่คำตอบละเอียดมีค่าจริง
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
      {/* ═══════════ 01 · ปก ═══════════ */}
      <section className="slide slide--dark slide--center">
        <div className="deck-glow" />
        <div className="relative">
          <div className="flex justify-center">
            <Logo size={104} tone="dark" />
          </div>
          <h1 className="mt-11 font-serif">
            <span className="gold">เล่าไว้</span>
          </h1>
          <p className="lead mt-7 opacity-85">
            หนังสือชีวิตที่ทุกย่อหน้า กดฟังเสียงจริงของท่านได้
          </p>
          <p className="small mt-14">
            STAR PLATINUM · SPIRITUAL HACK! · Thailand AI Extreme Hack 2026
          </p>
        </div>
      </section>

      {/* ═══════════ 02 · Hook ═══════════ */}
      <section className="slide slide--center">
        <Bar tag="Why this matters" />
        <h2 className="max-w-4xl font-serif">
          ในทีม 4 คน มี 2 คน
          <br />
          ที่<span className="gold">ไม่มีโอกาสนั้นแล้ว</span>
        </h2>
        <p className="lead mt-10 max-w-2xl text-earth-700">
          คนหนึ่งเสียคุณยายไปก่อนได้ถามเรื่องของท่าน
          <br />
          อีกคนไม่เคยมีเวลานั่งฟังจริงจัง
        </p>
        {no()}
      </section>

      {/* ═══════════ 03 · ปัญหา + ตัวเลข ═══════════ */}
      <section className="slide">
        <Bar tag="The problem" />
        <h2 className="max-w-3xl font-serif">
          ทุกบ้านเคยอัดคลิปเก็บไว้
          <br />
          แล้วไม่มีใครกลับมาฟัง
        </h2>
        <div className="accent-bar mt-9" />
        <div className="mt-11 grid grid-cols-3 gap-12">
          {[
            ["16.8 ล้าน", "ผู้สูงอายุไทย ปี 2567"],
            ["1.3 ล้าน", "อยู่ลำพัง ปี 2566"],
            ["559,684", "เสียชีวิตในปี 2568"],
          ].map(([a, b]) => (
            <div key={b}>
              <p className="font-serif text-[52px] leading-none text-gold-500">{a}</p>
              <p className="mt-4 text-[21px] text-earth-700">{b}</p>
            </div>
          ))}
        </div>
        <p className="lead mt-12 max-w-3xl">
          และครอบครัวมักรู้ตัวตอนสายแล้ว — ตอนทำหนังสืองานศพ
          ที่<strong>ไม่มีเสียงของท่านอยู่เลย</strong>
        </p>
        {no()}
      </section>

      {/* ═══════════ 04 · Insight ═══════════ */}
      <section className="slide slide--dark slide--center">
        <Bar tag="Human insight" />
        <h2 className="max-w-4xl font-serif">
          ปัญหาไม่ใช่ว่าท่านไม่อยากเล่า
          <br />
          <span className="gold">แต่ไม่มีใครรู้ว่าจะถามอะไร</span>
        </h2>
        <div className="mt-14 grid max-w-4xl grid-cols-2 gap-7 text-left">
          <div className="rounded-2xl border border-white/12 bg-white/5 p-8">
            <p className="text-[27px] leading-relaxed">
              “อยากรู้เรื่องของแม่ แต่ถามว่าสบายดีไหม แล้วก็จบแค่นั้น”
            </p>
            <p className="small mt-4">ลูกหลาน</p>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/5 p-8">
            <p className="text-[27px] leading-relaxed">
              “เล่าได้ทั้งวัน ถ้ามีคนตั้งใจฟัง แต่ให้เขียนเองไม่ไหว”
            </p>
            <p className="small mt-4">ผู้สูงอายุ</p>
          </div>
        </div>
        {no()}
      </section>

      {/* ═══════════ 05 · Innovation ═══════════ */}
      <section className="slide slide--center">
        <Bar tag="Innovation" />
        <div className="flex justify-center">
          <Logo size={62} />
        </div>
        <h2 className="mt-8 max-w-4xl font-serif">
          AI ผู้ช่วยสัมภาษณ์ ที่เปลี่ยนบทสนทนาในบ้าน
          <br />
          ให้เป็น<span className="gold">หนังสือที่ฟังเสียงจริงได้</span>
        </h2>
        <div className="mt-14 flex items-center gap-4 text-[20px] text-earth-700">
          {["หลานกดอัด", "AI ช่วยถามต่อ", "ครอบครัวตรวจ", "หนังสือ + QR"].map((t, i) => (
            <span key={t} className="flex items-center gap-4">
              <span className="rounded-full border border-gold-400 bg-gold-200/35 px-6 py-3">
                {t}
              </span>
              {i < 3 && <span className="text-gold-500">→</span>}
            </span>
          ))}
        </div>
        {no()}
      </section>

      {/* ═══════════ 06 · แก่นนวัตกรรม ═══════════ */}
      <section className="slide slide--ink">
        <Bar tag="The core innovation" />
        <h2 className="max-w-4xl font-serif">
          ทีมอื่นให้ AI ตรวจ AI
          <br />
          <span className="gold">เราตรวจด้วยโค้ด</span>
        </h2>
        <div className="mt-12 grid grid-cols-[1fr_1fr] items-center gap-12">
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
              ตรวจย้อนกลับไปถึง<strong>วินาทีที่ท่านพูด</strong>ได้
            </p>
          </div>
        </div>
        {no()}
      </section>

      {/* ═══════════ 07 · หลักฐาน ═══════════ */}
      <section className="slide slide--dark">
        <Bar tag="Proof" />
        <h2 className="font-serif">
          ทำไมเรา<span className="gold">ไม่เชื่อ</span> AI ของเราเอง
        </h2>
        <p className="lead mt-6 opacity-80">
          คำที่ AI ถอดผิดจาก<strong>บทสนทนาจริงกับ mentor ในงานนี้</strong>
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4">
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
        <p className="mt-10 font-serif text-[32px] leading-snug">
          ถ้าภาษากลางยังผิดขนาดนี้ — เสียงคุณยายพูดภาษาถิ่นจะผิดแค่ไหน
        </p>
        {no()}
      </section>

      {/* ═══════════ 08 · MVP ═══════════ */}
      <section className="slide">
        <Bar tag="MVP · ใช้งานได้จริงแล้ว" />
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

      {/* ═══════════ 09 · Demo ═══════════ */}
      <section className="slide slide--center">
        <Bar tag="Live demo" />
        <h2 className="font-serif">หยิบมือถือขึ้นมาสแกนได้เลยครับ</h2>
        <div className="mt-10">
          <QRBox value={clipUrl} size={248} />
        </div>
        <p className="lead mt-9 max-w-2xl text-earth-700">
          QR แบบเดียวกับที่อยู่ในหนังสือจริง — สแกนแล้วได้ยิน
          <strong>เสียงของท่านที่วินาทีนั้นพอดี</strong>
        </p>
        {no()}
      </section>

      {/* ═══════════ 10 · Business ═══════════ */}
      <section className="slide">
        <Bar tag="Business model" />
        <h2 className="font-serif">ใช้ฟรี จ่ายเมื่ออยากได้เล่ม</h2>
        <div className="mt-11 grid grid-cols-4 gap-5">
          {[
            ["ดิจิทัล", "ฟรี"],
            ["หนังสือเล่มจริง", "ต่อเล่ม"],
            ["สมาชิกรายปี", "ต่อปี"],
            ["ผ่านพาร์ทเนอร์", "ต่อโครงการ"],
          ].map(([t, p], i) => (
            <div
              key={t}
              className={
                i === 1
                  ? "rounded-2xl border-2 border-gold-400 bg-gold-200/30 p-8"
                  : "rounded-2xl border border-paper-400 bg-paper-50 p-8"
              }
            >
              <p className="text-[21px]">{t}</p>
              <p className="mt-4 font-serif text-[34px] text-gold-600">{p}</p>
            </div>
          ))}
        </div>
        <p className="lead mt-12 max-w-4xl">
          ของฟรีทำให้ครอบครัวกล้าเริ่ม — และ<strong>การเริ่มคือสิ่งที่ยากที่สุด</strong>ในปัญหานี้
        </p>
        {no()}
      </section>

      {/* ═══════════ 11 · Impact + Future ═══════════ */}
      <section className="slide slide--ink">
        <Bar tag="Impact & what comes next" />
        <h2 className="max-w-4xl font-serif">
          ยิ่งมีครอบครัวใช้
          <br />
          <span className="gold">ภาษาถิ่นยิ่งแม่นขึ้น</span>
        </h2>
        <div className="mt-11 grid grid-cols-[1.1fr_0.9fr] gap-12">
          <div className="rounded-2xl border border-white/12 bg-white/5 p-8 text-[21px] leading-[2.1]">
            <p>ครอบครัวแก้คำที่ AI ถอดผิด</p>
            <p className="text-gold-300">↓</p>
            <p>ชุดข้อมูลคำไทย-ถิ่นโตขึ้น</p>
            <p className="text-gold-300">↓</p>
            <p className="font-medium">ถอดเสียงแม่นขึ้นสำหรับทุกครอบครัว</p>
          </div>
          <div>
            <p className="text-[23px] leading-relaxed opacity-85">
              คู่แข่งต่างชาติไม่มีทางได้ข้อมูลนี้ เพราะไม่มีผู้ใช้ไทย
            </p>
            <p className="mt-7 text-[23px] leading-relaxed opacity-85">
              และเราทำโดย<strong>ไม่เก็บเสียง ไม่เก็บชื่อ</strong> —
              เก็บแค่คู่ข้อความที่คนแก้
            </p>
          </div>
        </div>
        {no()}
      </section>

      {/* ═══════════ 12 · Closing ═══════════ */}
      <section className="slide slide--dark slide--center">
        <div className="deck-glow" />
        <div className="relative">
          <h1 className="max-w-4xl font-serif text-[64px] leading-[1.24]">
            วันที่อยากฟัง
            <br />
            <span className="gold">อาจไม่ใช่วันที่ยังได้ฟัง</span>
          </h1>
          <div className="mt-12 flex justify-center">
            <Logo size={58} tone="dark" />
          </div>
          <p className="mt-7 text-[22px] opacity-80">laowai-th.vercel.app</p>
        </div>
      </section>

      {/* ═══════════ คั่นสไลด์สำรอง ═══════════ */}
      <section className="slide slide--divider slide--center">
        <h2 className="font-serif">สไลด์สำรอง</h2>
        <p className="lead mt-6">สำหรับตอบคำถามกรรมการ</p>
      </section>

      {/* ═══════════ A1 · Persona ═══════════ */}
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

      {/* ═══════════ A2 · คู่แข่ง ═══════════ */}
      <section className="slide">
        <Bar tag="Appendix · competition" />
        <h2 className="font-serif">มีคนทำเรื่องนี้แล้ว และเขาทำได้ดี</h2>
        <table className="mt-10 w-full border-separate border-spacing-0 text-left text-[20px]">
          <thead>
            <tr>
              {["", "Storyworth", "Remento", "เล่าไว้"].map((h, i) => (
                <th
                  key={h || i}
                  className={
                    i === 3
                      ? "rounded-t-xl bg-gold-400 px-5 py-4 text-earth-900"
                      : "bg-paper-300 px-5 py-4"
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
              ["ใช้แบบดิจิทัลได้ฟรี", "✕", "✕", "✓"],
            ].map((row, ri) => (
              <tr key={row[0]} className={ri % 2 ? "bg-paper-200/50" : ""}>
                {row.map((c, ci) => (
                  <td
                    key={ci}
                    className={
                      ci === 3
                        ? "border-b border-paper-300 bg-gold-200/35 px-5 py-3.5 text-center text-[23px] font-medium text-verified-600"
                        : ci === 0
                          ? "border-b border-paper-300 px-5 py-3.5"
                          : "border-b border-paper-300 px-5 py-3.5 text-center text-[23px] text-earth-400"
                    }
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="small mt-6">
          Remento ขึ้น Shark Tank แล้ว มีกว่า 1 ล้านเรื่อง — เรารู้ และเลือกแข่งในที่ที่เขาไม่ได้อยู่
        </p>
      </section>

      {/* ═══════════ A3 · Execution ═══════════ */}
      <section className="slide slide--ink">
        <Bar tag="Appendix · execution" />
        <h2 className="font-serif">สิ่งที่เกิดขึ้นจริงใน 2 วัน</h2>
        <div className="mt-12 grid grid-cols-4 gap-6">
          {[
            ["16", "ความสามารถที่ทำงานได้จริง"],
            ["6", "API ที่เขียนและทดสอบแล้ว"],
            ["3.4 วิ", "ถอดเสียง 40 วินาที (เดิม 236 วิ)"],
            ["100%", "ย่อหน้าที่ตรวจย้อนกลับได้"],
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

      {/* ═══════════ A4 · Ethics ═══════════ */}
      <section className="slide">
        <Bar tag="Appendix · ethics" />
        <h2 className="max-w-4xl font-serif">เราไม่สร้าง AI ที่เลียนแบบคนที่จากไป</h2>
        <p className="lead mt-8 max-w-4xl text-earth-700">
          มีบริการที่ทำ “deadbot” ให้คุยกับคนที่เสียไปแล้วได้
          นักวิจัยมหาวิทยาลัยเคมบริดจ์ (2024) เตือนว่าอาจทำร้ายจิตใจผู้ใช้
          เราเลือกเก็บ<strong>เสียงจริง</strong> ไม่โคลนเสียง ไม่สร้างบุคลิกปลอม
        </p>
        <div className="mt-10 rounded-2xl border-2 border-warn-500/50 bg-warn-200/35 p-8">
          <p className="text-[21px] font-medium text-warn-900">คำถามที่เรายังไม่มีคำตอบ</p>
          <ul className="mt-5 space-y-3 text-[21px] text-earth-800">
            <li>• ถ้าท่านมีภาวะสมองเสื่อม ใครคือผู้ให้ความยินยอม</li>
            <li>• ถ้าเรื่องที่เล่าทำร้ายคนที่ยังอยู่ ใครมีสิทธิ์ลบ</li>
            <li>• เสียงที่เก็บไว้ ควรอยู่กับครอบครัวไปอีกกี่ชั่วอายุคน</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
