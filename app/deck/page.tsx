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
 * Pitch Deck สำหรับ PITCH DAY
 *
 * หลักที่ใช้เขียนทุกสไลด์:
 *   - หนึ่งสไลด์ หนึ่งความคิด
 *   - ตัวหนังสือน้อยที่สุดเท่าที่เล่าเรื่องได้ ที่เหลือให้ภาพทำงาน
 *   - ทุกตัวเลขต้องมีที่มา และทุกคำเคลมต้องพิสูจน์ได้ในเดโม
 *
 * โจทย์เขียนไว้ว่า "อย่าเปลี่ยน Research Document ให้เป็นตัวหนังสือบนสไลด์"
 * สไลด์ชุดนี้จึงเล่าเรื่องอย่างเดียว ส่วนรายละเอียดทั้งหมดอยู่ในเอกสารแยก
 */
export default function DeckPage() {
  const clipUrl = `${SITE_URL}/clip/${demoChapter.shareToken}`;
  let n = 0;
  const no = () => String(++n).padStart(2, "0");

  return (
    <div className="deck">
      {/* ─────────────── 01 ปก ─────────────── */}
      <section className="slide slide--dark slide--center">
        <div className="deck-glow" />
        <div className="relative">
          <div className="flex justify-center">
            <Logo size={96} tone="dark" />
          </div>
          <h1 className="mt-10 font-serif">
            <span className="gold">เล่าไว้</span>
          </h1>
          <p className="lead mt-6 opacity-85">
            หนังสือชีวิตที่ทุกย่อหน้า กดฟังเสียงจริงของท่านได้
          </p>
          <div className="mx-auto mt-10 h-px w-24 bg-gold-400/50" />
          <p className="small mt-8">
            ทีม STAR PLATINUM · SPIRITUAL HACK!
            <br />
            Thailand AI Extreme Hack 2026 · UTCC Academic Week
          </p>
        </div>
      </section>

      {/* ─────────────── 02 Hook ─────────────── */}
      <section className="slide slide--center">
        <span className="slide__tag">Why this matters</span>
        <h2 className="max-w-4xl font-serif">
          ในทีม 4 คน มี 2 คน
          <br />
          ที่ไม่มีโอกาสนั้นแล้ว
        </h2>
        <p className="lead mt-9 max-w-2xl text-earth-700">
          คนหนึ่งเสียคุณยายไปก่อนได้ถามเรื่องของท่าน
          <br />
          อีกคนอยากรู้เรื่องของปู่ย่าตายาย แต่ไม่เคยมีเวลานั่งฟังจริงจัง
        </p>
        <p className="mt-12 font-serif text-[34px] text-gold-500">
          เราทำสิ่งนี้เพื่อให้คนอื่นไม่ต้องเสียใจแบบเดียวกัน
        </p>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 03 ตัวเลข ─────────────── */}
      <section className="slide">
        <span className="slide__tag">Current social challenge</span>
        <h2 className="font-serif">ประเทศไทยกำลังลืมเร็วกว่าที่คิด</h2>
        <div className="mt-14 grid grid-cols-3 gap-10">
          {[
            { n: "16.8 ล้าน", l: "ผู้สูงอายุไทย ปี 2567", s: "เดลินิวส์ อ้างรายงานที่ วช. สนับสนุน" },
            { n: "1,348,397", l: "ผู้สูงอายุที่อยู่ลำพัง ปี 2566", s: "Thai PBS Policy Watch" },
            { n: "559,684", l: "ผู้เสียชีวิตในปี 2568", s: "สถาบันวิจัยประชากรและสังคม ม.มหิดล" },
          ].map((x) => (
            <div key={x.l}>
              <p className="font-serif text-[56px] leading-none text-gold-500">{x.n}</p>
              <p className="mt-5 text-[22px] text-earth-800">{x.l}</p>
              <p className="small mt-2">{x.s}</p>
            </div>
          ))}
        </div>
        <p className="lead mt-16 max-w-3xl">
          และครอบครัวมักรู้ตัวตอนสายไปแล้ว — ตอนต้องทำหนังสืองานศพ
          ที่รวบรวมเรื่องอย่างเร่งรีบ และ<strong>ไม่มีเสียงของท่านอยู่เลย</strong>
        </p>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 04 Problem ─────────────── */}
      <section className="slide">
        <span className="slide__tag">Problem</span>
        <h2 className="max-w-3xl font-serif">
          ทุกบ้านเคยลองอัดคลิปเก็บไว้
          <br />
          แล้วไม่มีใครกลับมาฟัง
        </h2>
        <div className="mt-14 grid grid-cols-2 gap-8">
          <div className="rounded-3xl border border-paper-400 bg-paper-200/60 p-9">
            <p className="small tracking-[0.2em] uppercase">วิธีที่คนใช้อยู่</p>
            <ul className="mt-6 space-y-4 text-[21px] text-earth-700">
              <li>✕ คลิปยาวเป็นชั่วโมง ไม่มีใครเปิดซ้ำ</li>
              <li>✕ หาเรื่องที่ต้องการไม่เจอ</li>
              <li>✕ ไม่รู้จะเริ่มถามอะไร เลยได้แต่เรื่องเดิม</li>
              <li>✕ มือถือหาย = หายทั้งหมด</li>
            </ul>
          </div>
          <div className="rounded-3xl border-2 border-gold-400 bg-gold-200/25 p-9">
            <p className="small tracking-[0.2em] text-gold-600 uppercase">สิ่งที่หายไปจริง ๆ</p>
            <p className="mt-6 text-[23px] leading-relaxed text-earth-800">
              ไม่ใช่แค่ไฟล์เสียง แต่คือ<strong>สำเนียง จังหวะ เสียงหัวเราะ</strong>
              และคำสอนที่ไม่มีใครจดไว้
            </p>
            <p className="mt-5 text-[23px] leading-relaxed text-earth-800">
              สิ่งเหล่านี้สร้างขึ้นใหม่ไม่ได้ แม้จะมี AI ที่เก่งแค่ไหนก็ตาม
            </p>
          </div>
        </div>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 05 Insight ─────────────── */}
      <section className="slide slide--dark slide--center">
        <span className="slide__tag">Human insight</span>
        <h2 className="max-w-4xl font-serif">
          ปัญหาไม่ใช่ว่าท่านไม่อยากเล่า
          <br />
          <span className="gold">แต่คือไม่มีใครรู้ว่าจะถามอะไร</span>
        </h2>
        <div className="mt-14 grid max-w-4xl grid-cols-2 gap-8 text-left">
          <div className="rounded-2xl border border-white/12 bg-white/5 p-8">
            <p className="text-[21px] opacity-70">ลูกหลาน</p>
            <p className="mt-3 text-[25px] leading-relaxed">
              “อยากรู้เรื่องของแม่ แต่ถามว่าสบายดีไหม แล้วก็จบแค่นั้นทุกครั้ง”
            </p>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/5 p-8">
            <p className="text-[21px] opacity-70">ผู้สูงอายุ</p>
            <p className="mt-3 text-[25px] leading-relaxed">
              “เล่าได้ทั้งวัน ถ้ามีคนตั้งใจฟัง — แต่ให้เขียนเองไม่ไหว”
            </p>
          </div>
        </div>
        <p className="lead mt-12 max-w-3xl opacity-85">
          เราจึงยกภาระทั้งหมดมาไว้ที่ลูกหลาน
          แล้วปล่อยให้ท่านทำสิ่งที่ท่านเก่งที่สุด — เล่า
        </p>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 06 Target user ─────────────── */}
      <section className="slide">
        <span className="slide__tag">Target user</span>
        <h2 className="font-serif">คนจ่ายกับคนเล่า เป็นคนละคน</h2>
        <div className="mt-12 grid grid-cols-2 gap-9">
          <div className="rounded-3xl border border-paper-400 bg-paper-50 p-9">
            <p className="font-serif text-[30px]">ลูกสาววัย 34</p>
            <p className="small mt-1">คนจ่าย</p>
            <ul className="mt-6 space-y-3 text-[20px] text-earth-700">
              <li>ทำงานกรุงเทพ พ่อแม่อยู่ต่างจังหวัด</li>
              <li>กลับบ้านปีละ 3 ครั้ง</li>
              <li>รู้สึกผิดที่ไม่มีเวลา และกลัวไม่ทัน</li>
              <li>เคยอัดคลิปไว้ แต่ไม่เคยกลับมาเปิด</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-paper-400 bg-paper-50 p-9">
            <p className="font-serif text-[30px]">คุณยายวัย 78</p>
            <p className="small mt-1">คนเล่า</p>
            <ul className="mt-6 space-y-3 text-[20px] text-earth-700">
              <li>ใช้ LINE ได้ พิมพ์ไม่ถนัด</li>
              <li>จำเรื่องเก่าได้ดีกว่าเรื่องเมื่อวาน</li>
              <li>กลัวเป็นภาระ กลัวถูกมองว่าพูดมาก</li>
              <li>อยากรู้สึกว่าเรื่องของตัวเองมีค่า</li>
            </ul>
          </div>
        </div>
        <p className="lead mt-10">
          ยายไม่ได้จ่าย — <strong>แต่ยายคือคนตัดสินว่าจะเล่าต่อไหม</strong>
          ประสบการณ์ของยายจึงสำคัญกว่าหน้าจอของหลาน
        </p>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 07 Innovation ─────────────── */}
      <section className="slide slide--center">
        <span className="slide__tag">Innovation</span>
        <div className="flex justify-center">
          <Logo size={64} />
        </div>
        <h2 className="mt-9 max-w-4xl font-serif">
          AI ผู้ช่วยสัมภาษณ์ ที่เปลี่ยนบทสนทนาในบ้าน
          <br />
          ให้กลายเป็น<span className="gold">หนังสือที่ฟังเสียงจริงได้</span>
        </h2>
        <div className="mt-14 flex items-center gap-5 text-[21px] text-earth-700">
          {["ชุดคำถามตามช่วงชีวิต", "AI ช่วยถามต่อ", "ตรวจสอบย้อนกลับได้", "หนังสือ + QR"].map(
            (t, i) => (
              <span key={t} className="flex items-center gap-5">
                <span className="rounded-full border border-gold-400 bg-gold-200/40 px-5 py-2.5">
                  {t}
                </span>
                {i < 3 && <span className="text-gold-500">→</span>}
              </span>
            )
          )}
        </div>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 08 How it works ─────────────── */}
      <section className="slide">
        <span className="slide__tag">How it works</span>
        <h2 className="font-serif">เสียงของท่านเดินทางยังไง</h2>
        <div className="mt-14 grid grid-cols-5 gap-4">
          {[
            { t: "เสียงของท่าน", d: "อัด 1–3 นาที ต่อหนึ่งคำถาม" },
            { t: "ข้อความถอดเสียง", d: "AI ถอดคำต่อคำ" },
            { t: "ข้อมูลที่ตรวจแล้ว", d: "โค้ดเช็กว่ามีจริงในเสียง" },
            { t: "ย่อหน้าในหนังสือ", d: "คนยืนยันก่อนพิมพ์" },
            { t: "QR ฟังเสียงเดิม", d: "กลับไปที่วินาทีนั้น" },
          ].map((s, i) => (
            <div
              key={s.t}
              className={
                i === 2
                  ? "rounded-2xl border-2 border-gold-400 bg-gold-200/30 p-6"
                  : "rounded-2xl border border-paper-400 bg-paper-50 p-6"
              }
            >
              <p className="font-serif text-[22px] text-gold-500">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-3 text-[20px] font-medium">{s.t}</p>
              <p className="small mt-2">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="lead mt-14 max-w-4xl">
          จุดสำคัญอยู่ที่ขั้นที่ 3 — ถ้าถ้อยคำนั้นหาไม่เจอในเสียงจริง
          <strong> ระบบทิ้งทันที ไม่ให้เข้าหนังสือ</strong>
        </p>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 09 Core innovation ─────────────── */}
      <section className="slide slide--ink">
        <span className="slide__tag">The core innovation</span>
        <h2 className="max-w-4xl font-serif">
          ทีมอื่นให้ AI ตรวจ AI
          <br />
          <span className="gold">เราตรวจด้วยโค้ด</span>
        </h2>
        <div className="mt-12 grid grid-cols-[1.15fr_0.85fr] items-center gap-10">
          <div className="rounded-2xl bg-black/25 p-8 font-mono text-[18px] leading-[1.9] text-paper-100">
            <p className="opacity-55">{"// ทุกย่อหน้าต้องอ้างถ้อยคำที่มีอยู่จริงในเสียง"}</p>
            <p className="mt-4">
              <span className="text-gold-300">verifyClaim</span>(transcript, quote)
            </p>
            <p className="mt-3 pl-6">
              → <span className="text-verified-400">true</span> = เก็บไว้
            </p>
            <p className="mt-1 pl-6">
              → <span className="text-red-300">false</span> = ทิ้งทันที
            </p>
            <p className="mt-6 text-[16px] opacity-55">
              {"// ภาษาไทยไม่มีช่องว่างระหว่างคำ"}
              <br />
              {"// จึงเทียบ substring ได้ตรงและเร็ว"}
            </p>
          </div>
          <div className="space-y-6">
            {[
              ["ไม่เชื่อ AI", "AI ไม่ได้ตัดสินว่าตัวเองถูก โค้ดเป็นคนตัดสิน"],
              ["ตรวจย้อนกลับได้", "คลิกย่อหน้า แล้วเสียงเล่นที่วินาทีนั้นพอดี"],
              ["คนยืนยันเสมอ", "AI ไม่มีสิทธิ์พิมพ์อะไรเองทั้งสิ้น"],
            ].map(([t, d]) => (
              <div key={t} className="border-l-2 border-gold-400 pl-6">
                <p className="text-[24px] font-medium">{t}</p>
                <p className="mt-1.5 text-[19px] opacity-75">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 10 Proof ─────────────── */}
      <section className="slide slide--dark">
        <span className="slide__tag">Proof</span>
        <h2 className="font-serif">
          ทำไมเราถึง<span className="gold">ไม่เชื่อ</span> AI ของเราเอง
        </h2>
        <p className="lead mt-5 opacity-80">
          นี่คือคำที่ AI ถอดผิดจาก<strong>บทสนทนาจริงกับ mentor ในงานนี้</strong> —
          เสียงคนหนุ่มพูดภาษากลางชัด ในห้องเงียบ
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4">
          {[
            ["ภาษาอังกฤษ", "ภาษาถิ่น"],
            ["คลังเรือนจำรายปี", "คลังความทรงจำรายปี"],
            ["ธุรกิจงานสุข", "ธุรกิจงานศพ"],
            ["ซาวด์บาท", "ซาวบาท"],
          ].map(([w, r]) => (
            <div
              key={r}
              className="flex items-center gap-4 rounded-2xl border border-white/12 bg-white/5 px-6 py-4 text-[21px]"
            >
              <span className="line-through opacity-50">{w}</span>
              <span className="opacity-40">→</span>
              <span className="font-medium text-gold-300">{r}</span>
            </div>
          ))}
        </div>
        <p className="mt-10 font-serif text-[31px] leading-snug">
          ถ้าภาษากลางยังผิดขนาดนี้
          <br />
          เสียงคุณยายอายุ 80 พูดภาษาถิ่นจะผิดแค่ไหน
        </p>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 11 MVP ─────────────── */}
      <section className="slide">
        <span className="slide__tag">MVP · ใช้งานได้จริงแล้ว</span>
        <h2 className="font-serif">ไม่ใช่ภาพในสไลด์ — นี่คือหน้าจอจริง</h2>
        <div className="mt-7 grid origin-top scale-[0.93] grid-cols-3 items-start gap-6">
          <div>
            <BrowserFrame url="laowai-th.vercel.app/interview">
              <InterviewMockup />
            </BrowserFrame>
            <p className="mt-4 text-[19px] font-medium">หน้าสัมภาษณ์</p>
            <p className="small">อัดทีละคำถาม เห็นขนาดไฟล์สด</p>
          </div>
          <div>
            <BrowserFrame url="laowai-th.vercel.app/review">
              <ReviewMockup />
            </BrowserFrame>
            <p className="mt-4 text-[19px] font-medium">หน้าตรวจ</p>
            <p className="small">ระบบจับได้เองว่า AI เขียนเกิน</p>
          </div>
          <div>
            <BrowserFrame url="laowai-th.vercel.app/book">
              <BookMockup />
            </BrowserFrame>
            <p className="mt-4 text-[19px] font-medium">หน้าหนังสือ</p>
            <p className="small">A5 พร้อมพิมพ์ ทุกย่อหน้ามี QR</p>
          </div>
        </div>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 12 Execution ─────────────── */}
      <section className="slide slide--ink">
        <span className="slide__tag">Execution</span>
        <h2 className="font-serif">สิ่งที่เกิดขึ้นจริงใน 2 วัน</h2>
        <div className="mt-12 grid grid-cols-4 gap-6">
          {[
            ["16", "ความสามารถที่ทำงานได้จริง", "ไม่ใช่แผนที่จะทำ"],
            ["6", "API ที่เขียนและทดสอบแล้ว", "analyze · compose · verify · forget"],
            ["3.4 วิ", "เวลาถอดเสียง 40 วินาที", "เดิม 236 วิ เร็วขึ้น 70 เท่า"],
            ["100%", "ย่อหน้าที่ตรวจย้อนกลับได้", "พิสูจน์ด้วย npm run check"],
          ].map(([n2, t, d]) => (
            <div key={t} className="rounded-2xl border border-white/12 bg-white/5 p-7">
              <p className="font-serif text-[44px] leading-none text-gold-300">{n2}</p>
              <p className="mt-4 text-[19px]">{t}</p>
              <p className="mt-1.5 text-[15px] opacity-60">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-11 rounded-2xl border border-gold-400/40 bg-gold-400/10 p-7">
          <p className="text-[21px] leading-relaxed">
            <strong className="text-gold-300">บั๊กที่เจอจากการทดสอบจริง:</strong>{" "}
            Gemini คืน claim id ซ้ำกันทุกคลิป ทำให้กด “ปุ่มลืม” คลิปหนึ่ง
            แล้วย่อหน้าของอีกคลิปหายไปด้วย — แก้แล้วและทดสอบซ้ำจนผ่าน
          </p>
        </div>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 13 Demo ─────────────── */}
      <section className="slide slide--center">
        <span className="slide__tag">Live demo</span>
        <h2 className="max-w-3xl font-serif">
          หยิบมือถือขึ้นมาสแกนได้เลยครับ
        </h2>
        <p className="lead mt-6 text-earth-700">
          นี่คือ QR แบบเดียวกับที่อยู่ในหนังสือจริง
        </p>
        <div className="mt-10">
          <QRBox value={clipUrl} size={230} />
        </div>
        <p className="mt-8 text-[21px] text-earth-700">
          สแกนแล้วจะได้ยิน<strong>เสียงจริงของผู้เล่า</strong>
          ที่วินาทีของประโยคนั้นพอดี
        </p>
        <p className="small mt-3">{clipUrl}</p>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 14 Business model ─────────────── */}
      <section className="slide">
        <span className="slide__tag">Business model</span>
        <h2 className="font-serif">ใช้ฟรี จ่ายเมื่ออยากได้เล่ม</h2>
        <div className="mt-12 grid grid-cols-4 gap-5">
          {[
            ["ดิจิทัล", "ฟรี", "สัมภาษณ์ไม่จำกัด อ่านและฟังบนเว็บ"],
            ["หนังสือเล่มจริง", "ต่อเล่ม", "A5 พิมพ์จริง QR ทุกย่อหน้า"],
            ["สมาชิกรายปี", "ต่อปี", "คลังความทรงจำของทั้งครอบครัว"],
            ["ผ่านพาร์ทเนอร์", "ต่อโครงการ", "ธุรกิจงานศพ · ศูนย์ผู้สูงอายุ · อบต."],
          ].map(([t, p, d], i) => (
            <div
              key={t}
              className={
                i === 1
                  ? "rounded-2xl border-2 border-gold-400 bg-gold-200/30 p-7"
                  : "rounded-2xl border border-paper-400 bg-paper-50 p-7"
              }
            >
              <p className="text-[21px] font-medium">{t}</p>
              <p className="mt-3 font-serif text-[32px] text-gold-600">{p}</p>
              <p className="small mt-3">{d}</p>
            </div>
          ))}
        </div>
        <p className="lead mt-11 max-w-4xl">
          ของฟรีทำให้ครอบครัวกล้าเริ่ม — และ<strong>การเริ่มคือสิ่งที่ยากที่สุด</strong>ในปัญหานี้
        </p>
        <p className="small mt-4">
          ราคาจะกำหนดหลังได้ต้นทุนพิมพ์จริงและทดสอบความเต็มใจจ่าย — เราไม่ตั้งตัวเลขที่ยังพิสูจน์ไม่ได้
        </p>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 15 Competition ─────────────── */}
      <section className="slide">
        <span className="slide__tag">Competitive advantage</span>
        <h2 className="font-serif">มีคนทำเรื่องนี้แล้ว และเขาทำได้ดี</h2>
        <table className="mt-11 w-full border-separate border-spacing-0 text-left text-[19px]">
          <thead>
            <tr>
              {["", "Storyworth", "Remento", "เล่าไว้"].map((h, i) => (
                <th
                  key={h || i}
                  className={
                    i === 3
                      ? "rounded-t-xl bg-gold-400 px-5 py-3.5 text-earth-900"
                      : "bg-paper-300 px-5 py-3.5 text-earth-800"
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
              ["QR ฟังเสียงในหนังสือ", "✕", "✓", "✓"],
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
                        ? "border-b border-paper-300 bg-gold-200/35 px-5 py-3 text-center text-[22px] font-medium text-verified-600"
                        : ci === 0
                          ? "border-b border-paper-300 px-5 py-3"
                          : "border-b border-paper-300 px-5 py-3 text-center text-[22px] text-earth-400"
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
          Remento ขึ้น Shark Tank แล้ว มีกว่า 1 ล้านเรื่อง — เรารู้ และเราเลือกแข่งในที่ที่เขาไม่ได้อยู่
        </p>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 16 Current impact ─────────────── */}
      <section className="slide slide--dark">
        <span className="slide__tag">Current social impact</span>
        <h2 className="max-w-4xl font-serif">
          เปลี่ยนหนังสืองานศพ
          <br />
          จากของที่ทำ<span className="gold">หลังจากไป</span>
          เป็นของที่ทำ<span className="gold">ตอนยังอยู่</span>
        </h2>
        <div className="mt-14 grid grid-cols-3 gap-8 text-[21px]">
          {[
            ["ต่อครอบครัว", "มีเหตุผลและเครื่องมือให้คนต่างวัยได้นั่งคุยกันจริง"],
            ["ต่อผู้สูงอายุ", "ได้รู้สึกว่าเรื่องของตัวเองมีคนฟังและมีค่า"],
            ["ต่อวัฒนธรรม", "ภูมิปัญญา สูตรอาหาร คำสอน ถูกเก็บด้วยเสียงจริง"],
          ].map(([t, d]) => (
            <div key={t} className="border-t-2 border-gold-400 pt-6">
              <p className="font-medium">{t}</p>
              <p className="mt-3 opacity-75">{d}</p>
            </div>
          ))}
        </div>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 17 Future impact ─────────────── */}
      <section className="slide">
        <span className="slide__tag">Future impact & challenge</span>
        <h2 className="font-serif">ยิ่งมีคนใช้ ภาษาถิ่นยิ่งแม่น</h2>
        <div className="mt-11 grid grid-cols-[1fr_0.9fr] gap-10">
          <div>
            <div className="rounded-3xl border border-paper-400 bg-paper-200/50 p-8 text-[20px] leading-[2]">
              <p>ครอบครัวใช้งาน</p>
              <p className="text-gold-600">↓</p>
              <p>AI ถอดคำถิ่นผิด</p>
              <p className="text-gold-600">↓</p>
              <p>ครอบครัวแก้ให้ (เขาอยากได้หนังสือที่ถูกอยู่แล้ว)</p>
              <p className="text-gold-600">↓</p>
              <p className="font-medium">dataset คำไทย-ถิ่นโตขึ้น → ถอดเสียงแม่นขึ้น</p>
            </div>
            <p className="small mt-5">
              เก็บเฉพาะคู่ข้อความ ไม่เก็บเสียง ไม่เก็บชื่อ —
              จะผูกกลับไปที่เสียงได้ต่อเมื่อครอบครัวยินยอมแยกต่างหาก
            </p>
          </div>
          <div className="space-y-5">
            <p className="text-[23px] leading-relaxed">
              คู่แข่งต่างชาติไม่มีทางได้ข้อมูลนี้ เพราะไม่มีผู้ใช้ไทย
              และคู่แข่งไทยที่เข้ามาทีหลังต้องเริ่มจากศูนย์
            </p>
            <div className="rounded-2xl border-2 border-warn-500/50 bg-warn-200/35 p-7">
              <p className="text-[20px] font-medium text-warn-900">คำถามที่เรายังไม่มีคำตอบ</p>
              <ul className="mt-4 space-y-2.5 text-[19px] text-earth-800">
                <li>• ถ้าท่านมีภาวะสมองเสื่อม ใครคือผู้ให้ความยินยอม</li>
                <li>• ถ้าเรื่องที่เล่าทำร้ายคนที่ยังอยู่ ใครมีสิทธิ์ลบ</li>
                <li>• เสียงที่เก็บไว้ ควรอยู่กับครอบครัวไปอีกกี่ชั่วอายุคน</li>
              </ul>
            </div>
          </div>
        </div>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 18 Ethics ─────────────── */}
      <section className="slide slide--ink slide--center">
        <span className="slide__tag">Ethics</span>
        <h2 className="max-w-4xl font-serif">
          เราไม่สร้าง AI
          <br />
          ที่เลียนแบบคนที่จากไป
        </h2>
        <p className="lead mt-10 max-w-3xl opacity-80">
          มีบริการที่ทำ “deadbot” ให้คุยกับคนที่เสียไปแล้วได้
          นักวิจัยมหาวิทยาลัยเคมบริดจ์ (2024) เตือนว่าอาจทำร้ายจิตใจผู้ใช้
        </p>
        <p className="mt-9 max-w-3xl text-[27px] leading-relaxed">
          เราเลือกทางตรงข้าม — เก็บ<span className="gold">เสียงจริง</span>ของท่านไว้
          ไม่โคลนเสียง ไม่สร้างบุคลิกปลอม
          และใช้ AI พาครอบครัวกลับมาคุยกัน<strong>ขณะที่ยังมีโอกาส</strong>
        </p>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 19 Roadmap ─────────────── */}
      <section className="slide">
        <span className="slide__tag">Roadmap</span>
        <h2 className="font-serif">แล้วจากนี้ไปไหนต่อ</h2>
        <div className="mt-14 grid grid-cols-4 gap-6">
          {[
            ["ตอนนี้", "ใช้ได้จริงแล้ว", "สัมภาษณ์ ตรวจสอบ และสร้างหนังสือพร้อม QR ครบเส้นทาง", true],
            ["เดือนถัดไป", "ทดสอบ 10–20 ครอบครัว", "วัดสัดส่วนประโยคที่ต้องแก้ และความเต็มใจจ่าย", false],
            ["ไตรมาสถัดไป", "ภาษาถิ่นแม่นขึ้น", "นำ dataset จากผู้ใช้จริงไปพัฒนาการถอดเสียง", false],
            ["ปีถัดไป", "Pilot กับพาร์ทเนอร์", "ธุรกิจงานศพ ศูนย์ดูแลผู้สูงอายุ และ อบต.", false],
          ].map(([w, t, d, done]) => (
            <div key={t as string}>
              <div
                className={
                  done
                    ? "h-1.5 rounded-full bg-verified-600"
                    : "h-1.5 rounded-full bg-paper-400"
                }
              />
              <p className="small mt-5 tracking-[0.15em] uppercase">{w as string}</p>
              <p className="mt-2 font-serif text-[25px]">{t as string}</p>
              <p className="mt-3 text-[18px] leading-relaxed text-earth-700">{d as string}</p>
            </div>
          ))}
        </div>
        <span className="slide__no">{no()}</span>
      </section>

      {/* ─────────────── 20 Closing ─────────────── */}
      <section className="slide slide--dark slide--center">
        <div className="deck-glow" />
        <div className="relative">
          <h1 className="max-w-4xl font-serif text-[62px] leading-[1.25]">
            วันที่อยากฟัง
            <br />
            <span className="gold">อาจไม่ใช่วันที่ยังได้ฟัง</span>
          </h1>
          <div className="mx-auto mt-12 h-px w-24 bg-gold-400/50" />
          <div className="mt-10 flex justify-center">
            <Logo size={56} tone="dark" />
          </div>
          <p className="mt-7 text-[21px] opacity-80">laowai-th.vercel.app</p>
          <p className="small mt-6">
            ทีม STAR PLATINUM · นิค · ไอช์ · ศิลป · ปุ๊กลุก
            <br />
            #UTCCAcademicWeek2026 #CreativeLabTH #CIACreativeLab
          </p>
        </div>
      </section>
    </div>
  );
}
