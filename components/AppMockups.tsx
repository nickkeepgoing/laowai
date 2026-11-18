"use client";

/**
 * ภาพโปรดักต์จริงในกรอบเบราว์เซอร์
 *
 * ทำไมไม่ใช้ screenshot:
 *   - screenshot เบลอทันทีบนจอ retina และต้องถ่ายใหม่ทุกครั้งที่แก้ UI
 *   - mockup ที่เป็น HTML จริงคมทุกความละเอียด ย่อขยายได้ และแก้ตามโปรดักต์ได้ทันที
 *   - ใช้ซ้ำในสไลด์ pitch ได้โดยไม่ต้องถ่ายใหม่
 *
 * เนื้อหาในกรอบลอกมาจากหน้าจริงของเรา ไม่ได้แต่งให้ดูดีเกินจริง
 */

import { BookOpen, Check, Mic, Volume2 } from "lucide-react";

/** กรอบเบราว์เซอร์แบบ macOS */
export function BrowserFrame({
  url,
  children,
  className = "",
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-paper-400 bg-paper-50 ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-paper-300 bg-paper-200 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="flex-1 truncate rounded-md bg-paper-50 px-3 py-1 text-center text-[11px] text-earth-500">
          {url}
        </span>
      </div>
      <div className="bg-paper-100">{children}</div>
    </div>
  );
}

/** หน้าสัมภาษณ์ — ตอน AI เพิ่งถอดเสียงเสร็จ */
export function InterviewMockup() {
  return (
    <div className="p-4 text-[11px] leading-relaxed">
      <div className="flex items-center justify-between">
        <span className="text-earth-500">🏡 วัยเด็ก</span>
        <span className="flex gap-1.5">
          <span className="rounded-full border border-paper-300 px-2 py-0.5 text-earth-600">
            เก็บแล้ว 3
          </span>
          <span className="rounded-full border border-verified-400/60 bg-verified-400/15 px-2 py-0.5 text-earth-700">
            ตรวจแล้ว 14
          </span>
          <span className="rounded-full border border-warn-500/50 bg-warn-200/50 px-2 py-0.5 text-warn-900">
            ทิ้ง 2
          </span>
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-paper-300 bg-paper-50 p-3">
        <p className="text-earth-500">คำถามที่ 3 จาก 8</p>
        <p className="mt-1 font-serif text-[15px] text-earth-900">
          ตอนเด็ก ๆ ตื่นมาทำอะไรเป็นอย่างแรกคะ
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-paper-300 bg-paper-50 p-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-earth-900 text-paper-50">
          <Mic size={13} />
        </span>
        <span className="flex flex-1 items-end gap-[2px]" aria-hidden>
          {[8, 16, 24, 12, 28, 18, 10, 22, 14, 26, 9, 20, 15, 23, 11, 25, 13, 19].map(
            (h, i) => (
              <span key={i} className="w-1 rounded-full bg-gold-500" style={{ height: h }} />
            )
          )}
        </span>
        <span className="shrink-0 text-earth-500">0:48 · 0.2 MB</span>
      </div>

      <div className="mt-3 space-y-1.5">
        {[
          "ยายตื่นตีห้าทุกวันไปช่วยแม่หาบขนมไปขาย",
          "ขนมที่แม่ทำอร่อยที่สุดคือขนมกล้วย",
        ].map((t) => (
          <div
            key={t}
            className="flex items-start gap-2 rounded-lg border border-verified-400/40 bg-verified-400/10 px-2.5 py-2"
          >
            <Check size={12} className="mt-0.5 shrink-0 text-verified-600" />
            <span className="text-earth-800">“{t}”</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-earth-500">AI เสนอคำถามต่อ</p>
      <div className="mt-1.5 rounded-lg border border-gold-400/50 bg-gold-200/30 px-2.5 py-2 text-earth-800">
        ขนมกล้วยของแม่ยายทำยังไงคะ อยากรู้สูตร
      </div>
    </div>
  );
}

/** หน้าตรวจ — ของเด็ดคือไฮไลต์เหลืองที่ระบบจับ AI ตัวเองได้ */
export function ReviewMockup() {
  return (
    <div className="p-4 text-[11px] leading-relaxed">
      <p className="font-serif text-[15px] text-earth-900">วัยเด็กริมคลองบางปะกง</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-verified-400/60 bg-verified-400/15 px-2 py-0.5 text-earth-700">
          ย่อหน้าที่มีหลักฐาน 10/10
        </span>
        <span className="rounded-full border border-warn-500/50 bg-warn-200/50 px-2 py-0.5 text-warn-900">
          ต้องตรวจ 1
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-paper-300 bg-paper-50 px-3 py-2.5">
        <p className="text-earth-800">
          บ้านหลังแรกในความทรงจำของยายสมจิตอยู่ริมคลองแถวบางปะกง
        </p>
        <p className="mt-1.5 flex items-center gap-1 text-earth-500">
          <Volume2 size={11} /> ฟังเสียงต้นฉบับ · อ้างอิง 1 ข้อ
        </p>
      </div>

      <div className="mt-2 rounded-xl border-2 border-warn-500/50 bg-warn-200/25 px-3 py-2.5">
        <p className="text-earth-800">
          ยายตื่นตีห้าทุกวันไปช่วยแม่หาบขนมไปขาย และ
          <mark className="rounded bg-warn-200 px-1 font-medium text-warn-900 underline decoration-warn-500 decoration-wavy">
            เป็นช่วงเวลาที่ยายได้อยู่กับแม่มากที่สุด
          </mark>
        </p>
        <p className="mt-1.5 text-warn-900">
          ⚠ ไม่มีถ้อยคำนี้ในเสียงต้นฉบับ — แก้หรือลบก่อนพิมพ์
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <span className="rounded-lg bg-earth-900 px-3 py-1.5 text-paper-50">
          ตรวจแล้ว ยืนยัน
        </span>
        <span className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-red-700">
          ลืมเรื่องนี้
        </span>
      </div>
    </div>
  );
}

/** หน้าหนังสือ A5 พร้อม QR */
export function BookMockup() {
  return (
    <div className="paper p-5 text-[11px] leading-[1.9]">
      <p className="text-center text-[8px] tracking-[0.3em] text-[#8a7a63] uppercase">
        เล่าไว้
      </p>
      <p className="mt-3 text-center font-serif text-[17px] text-[#231c14]">ยายสมจิต</p>
      <div className="mx-auto my-2 h-px w-8 bg-[#c9b89c]" />
      <p className="text-center font-serif text-[#3d3124]">วัยเด็กริมคลองบางปะกง</p>

      <div className="mt-4 flex gap-3">
        <p className="flex-1 font-serif text-[#231c14]">
          บ้านหลังแรกในความทรงจำของยายสมจิตอยู่ริมคลองแถวบางปะกง จังหวัดฉะเชิงเทรา
          เป็นเรือนไม้ใต้ถุนสูงแบบที่คนริมน้ำสมัยนั้นปลูกกัน
        </p>
        <span className="grid h-10 w-10 shrink-0 grid-cols-4 gap-px rounded bg-white p-1" aria-hidden>
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className={i % 3 === 0 ? "bg-[#231c14]" : "bg-transparent"} />
          ))}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 border-t border-[#d9c7ab] pt-3 text-[#6b5c48]">
        <BookOpen size={11} /> สแกนเพื่อฟังเสียงจริงของท่าน
      </div>
    </div>
  );
}
