# เล่าไว้ (LaoWai)

> AI ผู้ช่วยสัมภาษณ์ที่ช่วยให้หลานฟังเรื่องชีวิตของปู่ย่าตายาย
> แล้วเรียบเรียงเป็นหนังสือชีวิตที่ทุกย่อหน้ากดฟังเสียงจริงของท่านได้

ทีม **STAR PLATINUM** · Thailand AI Extreme Hack 2026 · Track **SPIRITUAL HACK!**

---

## สิ่งที่ทำให้โปรเจกต์นี้ไม่ใช่ ChatGPT wrapper

ทุกย่อหน้าในหนังสือต้องอ้าง **Claim** ที่มีถ้อยคำต้นฉบับอยู่จริงใน transcript
และเรา **ตรวจด้วยโค้ด ไม่ใช่ให้ AI ตรวจ AI** → [`lib/verify.ts`](lib/verify.ts)

Claim ที่ตรวจไม่ผ่าน = AI แต่งเกิน → **ทิ้ง** ไม่เอาไปเรียบเรียง
ประโยคที่น่าสงสัย → ขึ้น **ไฮไลต์เหลือง** ให้ครอบครัวตรวจก่อนพิมพ์

```bash
npm run check    # พิสูจน์ว่าทุก claim ในข้อมูลตัวอย่างตรวจสอบได้จริง
```

---

## เริ่มต้น

```bash
npm install
cp .env.example .env.local      # แล้วเติมค่า (ขอจากนิค)
npm run dev                     # http://localhost:3000
```

ยังไม่มี `.env.local` ก็ build หน้าจอได้ เพราะมี mock data ครบใน `data/demo/`

---

## แบ่งงาน

**อัปเดต (Day 1 ช่วงบ่าย): ยกเลิกกฎแบ่งไฟล์แล้ว**
เดิมแบ่งเป็นสาย Engine (นิค) กับสาย Face (ศิลป) เพื่อให้เขียนขนานกันได้
ตอนนี้ทีมตัดสินใจรวมเป็นสายเดียว นิค + Claude ทำทั้งหมดรวมหน้าของศิลปด้วย

⚠️ ถ้าใครเคย clone ไปเขียนค้างไว้ ให้  ก่อนแตะไฟล์ใด ๆ

📄 แผนเต็ม → [`docs/PROTOTYPE-PLAN.md`](docs/PROTOTYPE-PLAN.md)
📄 บรีฟของศิลป (ก๊อปไปวางใน Claude Code) → [`docs/BRIEF-SILP.md`](docs/BRIEF-SILP.md)
📄 แผนรวม pitch / business / ethics → [`docs/PLAN.md`](docs/PLAN.md)

---

## โครงสร้าง

```
lib/types.ts       🔒 สัญญากลาง — Claim, Paragraph, Chapter, Clip, Session
lib/verify.ts      ❤️ หัวใจ — ตรวจว่า AI ไม่ได้แต่งเกินต้นฉบับ
lib/demo.ts        โหลด mock data + demo mode
data/demo/         ข้อมูลตัวอย่างรูปร่างเหมือนจริง 100%
data/questions.json ชุดคำถามตามช่วงชีวิต 5 หัวข้อ
components/        AudioPlayer · QRBox · Highlight · StatPill (ศิลปเขียนไส้ใน)
supabase/schema.sql 3 ตาราง — รันใน SQL Editor
scripts/           เครื่องมือ: check-demo, gen-placeholder-audio
public/demo/       🔴 เสียงสังเคราะห์ชั่วคราว — ทับด้วยเสียงจริงชื่อเดิมได้เลย
```

---

## ⚠️ เรื่องเสียง

`public/demo/*.wav` ตอนนี้เป็น**เสียงสังเคราะห์** ไม่ใช่เสียงคน มีไว้ให้ build UI ได้เท่านั้น

พอได้เสียงจริงของปู่ย่าตายาย (ขอความยินยอมด้วยเสียงไว้ต้นคลิปแล้ว):
1. ทับไฟล์ `clip-1.wav` `clip-2.wav` `clip-3.wav` ด้วยชื่อเดิม
2. แก้ `durationMs` ใน `data/demo/clips.json` ให้ตรง
3. รัน pipeline จริงเพื่อ regenerate transcript กับ claims
4. `npm run check` ต้องผ่าน

## Definition of Done
ดู [`docs/PROTOTYPE-PLAN.md` ข้อ 6](docs/PROTOTYPE-PLAN.md) — 11 ข้อ ติ๊กครบคือ prototype เสร็จ
