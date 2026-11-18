<div align="center">

<img src="https://raw.githubusercontent.com/nickkeepgoing/laowai/main/public/logo.svg" width="88" alt="เล่าไว้" />

# เล่าไว้ · LaoWai

### หนังสือชีวิตที่ทุกย่อหน้ากดฟังเสียงจริงของท่านได้

**AI ช่วยสัมภาษณ์ปู่ย่าตายาย ถอดเสียง และเรียบเรียงเป็นหนังสือ
โดยทุกประโยคต้องพิสูจน์ได้ว่ามาจากถ้อยคำที่ท่านพูดจริง**

<br />

[![Live Demo](https://img.shields.io/badge/Live_Demo-laowai--th.vercel.app-E3B254?style=for-the-badge&logo=vercel&logoColor=white)](https://laowai-th.vercel.app)
[![Sample Book](https://img.shields.io/badge/ตัวอย่างหนังสือ-เปิดดู-211A12?style=for-the-badge&logo=bookstack&logoColor=white)](https://laowai-th.vercel.app/book/demo-token-7f3a9c2e)

<br />

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![three.js](https://img.shields.io/badge/three.js-r187-000000?logo=threedotjs&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?logo=googlegemini&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth_·_DB_·_Storage-3FCF8E?logo=supabase&logoColor=white)
![Status](https://img.shields.io/badge/status-working_prototype-success)

<br />

**Thailand AI Extreme Hack 2026 · Business Engineering Edition**
Track **SPIRITUAL HACK!** · ทีม **STAR PLATINUM** · UTCC Academic Week 2026

</div>

---

## 📑 สารบัญ

| | |
|---|---|
| [1 · ภาพรวม](#1--ภาพรวม) | [7 · ข้อจำกัดปัจจุบัน](#7--ข้อจำกัดปัจจุบัน) |
| [2 · ปัญหาและทางแก้](#2--ปัญหาและทางแก้) | [8 · การตัดสินใจทางเทคนิค](#8--การตัดสินใจทางเทคนิค) |
| [3 · MVP ที่ทำงานได้จริง](#3--mvp-ที่ทำงานได้จริง) | [9 · โครงสร้างโปรเจกต์](#9--โครงสร้างโปรเจกต์) |
| [4 · Tech Stack](#4--tech-stack) | [10 · เอกสารประกอบ](#10--เอกสารประกอบ) |
| [5 · สถาปัตยกรรม](#5--สถาปัตยกรรม) | [11 · ทีม](#11--ทีม) |
| [6 · ติดตั้งและรัน](#6--ติดตั้งและรัน) | |

---

## 1 · ภาพรวม

เรื่องเล่า ความรู้ และคำสอนของผู้สูงอายุหายไปพร้อมกับท่าน
เพราะลูกหลานไม่มีเวลานั่งฟัง ไม่รู้จะเริ่มถามอะไร และไม่มีเครื่องมือเก็บรักษา

**เล่าไว้** ยกภาระทั้งหมดมาไว้ที่ลูกหลาน แล้วปล่อยให้ผู้สูงอายุทำสิ่งที่ท่านเก่งที่สุด — เล่า

```
หลานเปิดคำถาม  →  กดอัด 1–3 นาที  →  AI ถอดเสียง + เสนอคำถามต่อ
      ↓
AI เรียบเรียงเป็นบท  →  ครอบครัวตรวจและยืนยัน  →  หนังสือ A5 + QR ฟังเสียงจริง
```

> ### 🔑 สิ่งที่ทำให้โปรเจกต์นี้ไม่ใช่ ChatGPT wrapper
>
> **ทุกย่อหน้าในหนังสือต้องอ้าง Claim ที่มีถ้อยคำต้นฉบับอยู่จริงในข้อความถอดเสียง
> และเราตรวจด้วยโค้ด ไม่ใช่ให้ AI ตรวจ AI**
>
> หาถ้อยคำนั้นไม่เจอในเสียงจริง → **ทิ้งทันที ไม่ให้เข้าหนังสือ**
> ประโยคที่ AI เขียนเกิน → **ไฮไลต์ให้ครอบครัวตัดสินใจก่อนพิมพ์**
>
> พิสูจน์ได้ด้วย `npm run check` · โค้ดอยู่ใน [`lib/verify.ts`](lib/verify.ts)

### ⚡ ตรวจสอบด้วยตัวเองใน 60 วินาที

1. เปิด **[ตัวอย่างหนังสือ](https://laowai-th.vercel.app/book/demo-token-7f3a9c2e)**
2. **สแกน QR ท้ายบทด้วยมือถือ** → ได้ยินเสียงเล่นตรงประโยคนั้น
3. กด <kbd>Ctrl</kbd>+<kbd>P</kbd> → ได้ PDF ภาษาไทยที่สระและวรรณยุกต์ถูกต้อง

---

## 2 · ปัญหาและทางแก้

### บริบทสังคม

| ตัวเลข | ที่มา |
|---:|---|
| **16,800,000** คน | ผู้สูงอายุไทย ปี 2567 — เดลินิวส์ อ้างรายงานที่ วช. สนับสนุน |
| **1,348,397** คน | ผู้สูงอายุที่อยู่ลำพัง ปี 2566 — Thai PBS Policy Watch |
| **559,684** คน | ผู้เสียชีวิตในปี 2568 — สถาบันวิจัยประชากรและสังคม ม.มหิดล |

ครอบครัวมักรู้ตัวตอนสายไปแล้ว คือตอนทำหนังสืองานศพ
ที่ต้องรวบรวมเรื่องอย่างเร่งรีบ และไม่มีเสียงของท่านอยู่เลย

### ทำไมวิธีที่มีอยู่ไม่ได้ผล

| วิธีที่คนใช้อยู่ | ช่องว่างที่ยังไม่มีใครแก้ |
|---|---|
| อัดคลิปเก็บในมือถือ | คลิปยาว ไม่มีใครกลับมาฟัง ค้นหาไม่เจอ |
| Storyworth | ให้ผู้สูงอายุพิมพ์ตอบเอง เป็นภาษาอังกฤษ ไม่มีเสียง |
| Remento | ใกล้เราที่สุด มี QR ทุกหน้า แต่ไม่รองรับไทย/ภาษาถิ่น และตรวจย้อนกลับไม่ได้ |
| ChatGPT + อัดเอง | ไม่มีชุดคำถาม AI แต่งเติมได้โดยไม่มีใครรู้ ตรวจที่มาไม่ได้ |
| บริการ deadbot | จำลองผู้เสียชีวิต — งานวิจัย Cambridge (2024) เตือนเรื่องผลต่อสุขภาวะทางใจ |
| หนังสืองานศพแบบเดิม | ทำหลังท่านจากไป ญาติต้องเดาเรื่องเอง ไม่มีเสียงท่าน |

### จุดยืนของเรา

> **เราไม่สร้าง AI ที่เลียนแบบคนที่จากไป**
> ไม่โคลนเสียง ไม่สร้างบุคลิกจำลอง
> เราเก็บเสียงจริงไว้ และใช้ AI พาครอบครัวกลับมาคุยกันขณะที่ยังมีโอกาส

---

## 3 · MVP ที่ทำงานได้จริง

ทุกข้อด้านล่าง **ทดสอบแล้วว่าใช้งานได้จริง** ไม่ใช่แผนที่จะทำ

<details open>
<summary><b>🎙️ การเก็บเสียง</b></summary>

| | ความสามารถ |
|---|---|
| ✅ | ขอความยินยอมด้วยเสียงของผู้เล่าเอง — **ข้ามไม่ได้ บังคับที่ระดับ API** |
| ✅ | อัดเสียงในเบราว์เซอร์ พร้อม waveform สดและขนาดไฟล์แบบเรียลไทม์ |
| ✅ | อัปโหลดไฟล์เสียงแทนการอัดสด (ทางหนีตายตอน demo) |
| ✅ | คิวอัปโหลดใน IndexedDB — เน็ตหลุดแล้วเรื่องไม่หาย |
| ✅ | หยุดอัดเองที่ 3 นาที และปล่อยไมค์ทันทีเพื่อไม่ให้กินแบตต่อ |

</details>

<details open>
<summary><b>🤖 AI Pipeline</b></summary>

| | ความสามารถ |
|---|---|
| ✅ | ถอดเสียงไทย + ดึง Claim + เสนอคำถามต่อ ด้วย Gemini **เรียกครั้งเดียว** |
| ✅ | **ตรวจ Claim ด้วยโค้ด** — ไม่ผ่านคือทิ้ง พร้อมนับจำนวนที่ทิ้งให้ผู้ใช้เห็น |
| ✅ | เรียบเรียงเป็นบทหนังสือ + ติด flag ประโยคที่เขียนเกินต้นฉบับ |
| ✅ | ย่อหน้าที่ไม่มีหลักฐานถูกตัดทิ้งก่อนบันทึกลงฐานข้อมูล |

</details>

<details open>
<summary><b>👨‍👩‍👧 การควบคุมโดยมนุษย์</b></summary>

| | ความสามารถ |
|---|---|
| ✅ | ไฮไลต์ประโยคที่ระบบจับได้ว่า AI เขียนเกิน |
| ✅ | คลิกย่อหน้า → เสียงต้นฉบับเล่นที่วินาทีนั้นพอดี |
| ✅ | แก้ข้อความ inline ได้ทุกบรรทัด |
| ✅ | **ปุ่มลืม** — ลบคลิป Claim ย่อหน้า และข้อมูลการแก้คำพร้อมกัน |
| ✅ | ยืนยันโดยมนุษย์เป็นขั้นบังคับก่อนสร้างหนังสือ |

</details>

<details open>
<summary><b>📖 ผลลัพธ์และบัญชีผู้ใช้</b></summary>

| | ความสามารถ |
|---|---|
| ✅ | หนังสือ A5 พร้อมพิมพ์ + QR ท้ายบทและข้างทุกย่อหน้า |
| ✅ | หน้าเล่นเสียงบนมือถือ รองรับ `?c=clipId&t=ms` เพื่อเล่นตรงวินาที |
| ✅ | เข้าสู่ระบบด้วย Google หรือลิงก์ทางอีเมล (magic link) |
| ✅ | คลังความทรงจำส่วนตัว เห็นเฉพาะเรื่องของบัญชีตัวเอง |
| ✅ | **Dialect Correction Flywheel** — ทุกคำที่ครอบครัวแก้เข้า dataset ภาษาถิ่น |
| ✅ | Demo mode — เส้นทางทั้งหมดทำงานได้โดยไม่ต้องมีฐานข้อมูล |

</details>

---

## 4 · Tech Stack

| ชั้น | เทคโนโลยี | เหตุผลที่เลือก |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) · React 19 · TypeScript | Server Component อ่านสถานะล็อกอินได้ตั้งแต่ render แรก ไม่มีจังหวะกระพริบตอน demo |
| **Styling** | Tailwind CSS v4 · IBM Plex Sans Thai · Trirong | ฟอนต์ self-host ตอน build → ตอนพิมพ์หนังสือ ฟอนต์ไทยไม่หาย |
| **3D** | three.js · @react-three/fiber | 5 ฉาก โหลดแบบ dynamic + fallback CSS ถ้าเครื่องเปิด WebGL ไม่ได้ |
| **Animation** | framer-motion | มี mounted guard กันหน้าว่างถ้า hydration พัง |
| **AI** | Google Gemini 2.5 Flash (`@google/genai`) | รับไฟล์เสียงตรง ไม่ต้องแยก STT · JSON mode ผ่าน `responseSchema` |
| **Auth** | Supabase Auth ผ่าน `@supabase/ssr` (cookie) | ทำฝั่ง server ทั้งหมด โทเคนไม่ผ่าน JavaScript ในเบราว์เซอร์ |
| **Database** | Supabase Postgres · 4 ตาราง · RLS | |
| **Storage** | Supabase Storage (bucket `clips`) | |
| **Audio** | MediaRecorder (opus 32 kbps) · Web Audio API · IndexedDB | 3 นาที ≈ 0.7 MB · อัดก่อนอัปโหลดทีหลัง |
| **PDF** | HTML + `@media print` | ดูเหตุผลใน [ข้อ 8](#8--การตัดสินใจทางเทคนิค) |
| **Deploy** | Vercel (auto-deploy จาก `main`) | |

---

## 5 · สถาปัตยกรรม

```
┌───────────────┐   เสียง 1–3 นาที    ┌──────────────────┐
│  เบราว์เซอร์   │ ──────────────────► │  POST /api/analyze│
│ MediaRecorder │  opus 32 kbps       │                  │
│  + IndexedDB  │ ◄────────────────── │                  │
└───────────────┘  Clip + Claims      └────────┬─────────┘
                                               │ ① Gemini: audio → {transcript, claims[], nextQuestions[]}
                                               │ ② verifyClaim() ตรวจด้วยโค้ด ◄── 🔑 หัวใจ
                                               │ ③ claim ที่ไม่ผ่าน → ทิ้ง
                                               ▼
                                      ┌──────────────────┐
                                      │     Supabase     │
                                      │  clips · claims  │
                                      └────────┬─────────┘
                                               ▼
                                      ┌──────────────────┐
                                      │ POST /api/compose│
                                      │ claims → บทหนังสือ │
                                      │ + flag ประโยคเกิน  │
                                      └────────┬─────────┘
                                               │ ย่อหน้าที่ไม่มีหลักฐาน → ตัดทิ้ง
                                               ▼
                                ┌────────────────────────────┐
                                │   /review  มนุษย์ตรวจ        │
                                │ ไฮไลต์ · ฟังเทียบ · แก้คำ     │
                                │ /api/correct → dataset ถิ่น  │
                                │ /api/forget  → ลบ 4 ชั้น     │
                                └─────────────┬──────────────┘
                                              │ ✋ ต้องกดยืนยัน (บังคับ)
                                              ▼
                                ┌────────────────────────────┐
                                │  /book/[token]   A5 + QR   │
                                └─────────────┬──────────────┘
                                              │ สแกน QR
                                              ▼
                                ┌────────────────────────────┐
                                │ /clip/[token]?c=&t=        │
                                │ เล่นเสียงจริงตรงวินาที       │
                                └────────────────────────────┘
```

### หัวใจของระบบ

```ts
// lib/verify.ts
export function normalizeThai(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[\s ​‌‍]/g, "")  // ช่องว่างทุกชนิด
    .replace(/[.,!?;:"'`""''()\[\]{}…ฯ]/g, "")     // เครื่องหมายวรรคตอน
    .replace(/ๆ/g, "");                        // ๆ — Gemini ใส่/ตัดไม่ตรงกัน
}

export function verifyClaim(transcript: string, quote: string): boolean {
  const q = normalizeThai(quote);
  if (q.length < 8) return false;   // กัน AI คืน quote สั้นจู๋อย่าง "ยาย"
  return normalizeThai(transcript).includes(q);
}
```

เรา normalize **เฉพาะช่องว่างกับเครื่องหมายวรรคตอน** ไม่แตะสระหรือวรรณยุกต์
เพราะถ้าแตะ AI จะแต่งคำใหม่แล้วยังผ่านการตรวจได้

### ฐานข้อมูล

| ตาราง | เก็บอะไร | ความเป็นส่วนตัว |
|---|---|---|
| `sessions` | ผู้เล่า 1 ท่าน · เสียงยินยอม · ภาค · ความถี่ที่ลูกหลานได้กลับไปเจอ | ผูกกับ `user_id` |
| `clips` | 1 คำถาม 1 คำตอบ · transcript · `claims` (jsonb) | ลบได้ด้วยปุ่มลืม |
| `chapters` | 1 บท · `paragraphs` (jsonb) · `approved` · `share_token` | token เพิกถอนได้ |
| `corrections` | คู่ข้อความ "AI ถอดผิด → คนแก้ถูก" + ภาค | **ไม่เก็บเสียง ไม่เก็บชื่อ** |

---

## 6 · ติดตั้งและรัน

```bash
git clone https://github.com/nickkeepgoing/laowai.git
cd laowai
npm install
cp .env.example .env.local      # เติมค่าของคุณเอง
npm run dev                     # http://localhost:3000
```

> **ยังไม่มี API key ก็รันได้**
> ระบบตรวจเองว่ามี Gemini/Supabase หรือไม่ ถ้าไม่มีจะถอยไปใช้ mock
> และ in-memory store อัตโนมัติ โดย flow ทั้งหมดยังเดินครบ

### ตั้งค่าให้ใช้งานจริง

<details>
<summary><b>ขั้นตอนทั้งหมด</b></summary>

1. **Supabase** → สร้าง project → SQL Editor → รัน [`supabase/schema.sql`](supabase/schema.sql) ทั้งไฟล์
   ไฟล์เดียวจบ: สร้างตาราง · `GRANT` สิทธิ์ · สร้าง storage bucket · ตั้ง RLS — **รันซ้ำได้ปลอดภัย**
2. **Gemini API key** → [Google AI Studio](https://aistudio.google.com/apikey)
3. **Google OAuth** (ถ้าต้องการปุ่ม Google) → Supabase → Authentication → Providers → Google
   redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`

ตัวแปรที่ต้องตั้งดูได้จาก [`.env.example`](.env.example)
ไฟล์ `.env.local` ถูก gitignore ไว้แล้ว **ห้าม commit ค่าจริงลง repo**

</details>

### คำสั่งที่มี

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รัน development server |
| `npm run build` | build production |
| `npm run check` | **ตรวจว่า Claim ทุกอันในข้อมูลตัวอย่างพิสูจน์ได้จริง** |
| `npm run test:gemini <audio> [question]` | วัดว่า Gemini คืน quote ตรงต้นฉบับกี่เปอร์เซ็นต์ |
| `npm run gen:audio` | สร้างไฟล์เสียง placeholder |

```console
$ npm run check

🔍 ตรวจ claim ทุกอันเทียบกับ transcript จริง
  claim ที่ผ่าน 14 อัน · ที่ถูกทิ้ง 2 อัน
🔍 ตรวจทุกย่อหน้าในบทว่ามีหลักฐานครบ
  ย่อหน้าที่มีหลักฐาน 10/10
🔍 ย่อหน้าที่ติดไฮไลต์เหลือง 1 อัน
✅ สัญญากลางถูกต้องครบทุกข้อ
```

---

## 7 · ข้อจำกัดปัจจุบัน

> เราเขียนส่วนนี้ตรงไปตรงมา เพราะโปรเจกต์นี้ทั้งโปรเจกต์ตั้งอยู่บนหลักว่า
> **อย่าอ้างสิ่งที่พิสูจน์ไม่ได้** ถ้า README เคลมเกินจริง ก็ขัดกับตัวผลิตภัณฑ์เอง

| ระดับ | เรื่อง | สถานะจริง |
|:---:|---|---|
| 🔴 | **ไฟล์เสียงตัวอย่าง** | `public/demo/*.wav` เป็น**เสียงสังเคราะห์ ไม่ใช่เสียงคน** สร้างด้วย `scripts/gen-placeholder-audio.mjs` เพื่อให้พัฒนา UI ได้ ยังไม่ได้แทนด้วยเสียงจริงของปู่ย่าตายาย |
| 🔴 | **ความแม่นภาษาถิ่น** | **ยังไม่ได้วัดกับเสียงผู้สูงอายุจริง** ภาษาอีสานมีงานวิจัยอ้างอิง (Typhoon ASR, CER 8.85%) แต่ภาคเหนือและใต้ยังไม่มีผลทดสอบ **เราจึงไม่เคลมว่ารองรับทุกภาษาถิ่น** |
| 🟠 | **RLS** | `INSERT/UPDATE/DELETE` จำกัดเฉพาะเจ้าของแล้ว แต่ `SELECT` ยังเปิด เพราะ QR ในหนังสือต้องให้คนนอกสแกนฟังได้ ความปลอดภัยมาจาก `share_token` ที่เดาไม่ได้และเพิกถอนได้ **ยังไม่เหมาะกับข้อมูลครอบครัวจริงของคนนอกทีม** |
| 🟠 | **Dialect Flywheel** | กลไกทำงานแล้วและเก็บข้อมูลจริง แต่**ยังไม่ได้นำ dataset ไป fine-tune โมเดล** — เป็น roadmap ไม่ใช่ของที่เสร็จแล้ว |
| 🟠 | **ภาพบนหน้าเว็บ** | ภาพถ่ายจาก Unsplash เป็น**ภาพประกอบ ไม่ใช่ผู้ใช้จริงของเรา** ([CREDITS](public/img/CREDITS.md)) |
| 🟡 | **ราคา** | ยังไม่มีตัวเลข เพราะยังไม่ได้ต้นทุนพิมพ์จริงและยังไม่ได้ทดสอบความเต็มใจจ่าย |
| 🟡 | **ระบบชำระเงิน** | ยังไม่มี |
| 🟡 | **การทดสอบ** | มี `npm run check` ตรวจความถูกต้องของสัญญาข้อมูล แต่**ยังไม่มี unit test suite เต็มรูปแบบ** |
| 🟡 | **ภาวะสมองเสื่อม** | ออกแบบแนวทางไว้แล้ว (ผู้ดูแลยินยอมร่วม · ปิดการเผยแพร่) แต่**ยังไม่ได้ลงมือทำในโค้ด** |
| 🟡 | **Latency** | 3.4 วินาทีกับเสียง 40 วินาที ยังไม่ได้วัดกับเสียง 3 นาทีเต็ม |

---

## 8 · การตัดสินใจทางเทคนิค

<details>
<summary><b>ทำไมไม่ใช้ react-pdf ทำหนังสือ</b></summary>

<br />

react-pdf ไม่รองรับ complex text shaping ของภาษาไทย
สระบน-ล่างและวรรณยุกต์จะซ้อนผิดตำแหน่ง (เช่น "สื่อ" "ปู่" "ก๊อง") และตัดบรรทัดกลางคำ

เราใช้ HTML + `@media print` + `@page { size: A5 }` แทน
ซึ่งใช้ text shaping engine ของเบราว์เซอร์ที่ทำภาษาไทยถูกต้อง 100%
กด <kbd>Ctrl</kbd>+<kbd>P</kbd> → Save as PDF ได้เล่มที่สวยกว่าและเร็วกว่า

</details>

<details>
<summary><b>ทำไมปิด thinking ของ Gemini — วัดได้ 236 วินาที → 3.4 วินาที</b></summary>

<br />

`gemini-2.5-flash` เผา thinking token หนักมากตอนเจอเสียงที่ฟังไม่ชัด
ซึ่งเสียงผู้สูงอายุพูดเบามีเสียงรบกวนจะเข้าเคสนี้เต็ม ๆ

งานถอดเสียงไม่ต้องใช้การให้เหตุผล จึงตั้ง `thinkingConfig: { thinkingBudget: 0 }`
**ผลคือเร็วขึ้น 70 เท่า**

และต้องบังคับ `httpOptions.apiVersion = "v1beta"`
ไม่งั้น `responseSchema` ตอบ `400 INVALID_ARGUMENT` กลับมา

</details>

<details>
<summary><b>บั๊กที่เจอจากการทดสอบจริง: claim id ชนกันข้ามคลิป</b></summary>

<br />

Gemini คืน id เป็น `c1, c2, c3` ทุกคลิป
แต่ `/api/compose` รวม claim จากทุกคลิปในหัวข้อเดียวกัน → id ชนกัน

**ผลคือกดปุ่มลืมคลิปที่ 2 แล้วย่อหน้าของคลิปที่ 1 หายไป 5 ย่อหน้า**
แก้ด้วยการเติม nonce prefix ตอนรับผลจาก Gemini
ทดสอบซ้ำแล้ว: 2 คลิป 10 ย่อหน้า ลบคลิปหลัง เหลือ 5 ย่อหน้าถูกต้อง

</details>

<details>
<summary><b>ทำไมเก็บ correction เฉพาะคู่ข้อความ</b></summary>

<br />

เราประกาศไว้ว่า *"ไม่นำเสียงไปฝึกโมเดลโดยไม่มีความยินยอมแยกต่างหาก"*
ถ้าเก็บเสียงเข้า dataset แบบเงียบ ๆ เราก็ขัดคำพูดตัวเอง

ค่าตั้งต้นจึงเก็บเฉพาะ `asr_text → human_text` + ภาค
**ไม่เก็บเสียง ไม่เก็บชื่อ ไม่ผูกกลับไปที่คลิป**
จะผูก `clip_id` ได้ต่อเมื่อครอบครัวติ๊กยินยอมแยกที่หน้าตรวจ
และ `/api/forget` ลบ correction ของคลิปนั้นด้วย

</details>

<details>
<summary><b>บั๊กที่เงียบที่สุด: ฟอนต์ไม่เคยถูกใช้เลย</b></summary>

<br />

`next/font` ใส่ตัวแปรฟอนต์ไว้ที่ className ที่เราวาง
แต่ Tailwind v4 ประกาศ `--font-sans` ไว้ที่ `:root` โดยอ้าง `var(--font-...)`

ถ้าตัวแปรอยู่บน `<body>` ตอน `:root` resolve จะหาไม่เจอ ค่ากลายเป็น invalid
แล้ว**ทั้งเว็บตกไปใช้ฟอนต์ default ของเบราว์เซอร์ โดยไม่มี error ใด ๆ ให้เห็น**
ทั้ง build และ console ผ่านหมด แก้โดยย้ายไปไว้ที่ `<html>`

</details>

---

## 9 · โครงสร้างโปรเจกต์

```
app/
├── api/              analyze · compose · correct · forget · chapter · session
├── auth/             signin · callback · signout
├── interview/        new · [sessionId]        โหมดสัมภาษณ์ครอบครัว
├── review/           [chapterId]              หน้าตรวจ + ไฮไลต์ + ปุ่มลืม
├── book/             [token]                  หนังสือ A5 พร้อมพิมพ์
├── clip/             [token]                  ปลายทางของ QR
└── library/                                   คลังความทรงจำ (ต้องล็อกอิน)

lib/
├── types.ts          🔒 สัญญากลาง
├── verify.ts         ❤️ หัวใจ — ตรวจว่า AI ไม่ได้แต่งเกินต้นฉบับ
├── gemini.ts         เรียก Gemini 2 แบบ (วิเคราะห์/เรียบเรียง) — 1 บท N คลิป = N+1 ครั้ง
├── prompts.ts        prompt + response schema (แยกเพื่อทดสอบได้โดยไม่ผ่าน API)
├── recorder.ts       MediaRecorder + คิว IndexedDB
└── store.ts          Supabase หรือ memory สลับเองตาม env

components/           AudioPlayer · explainers · AppMockups · 3D 5 ฉาก
supabase/             schema.sql (รันไฟล์เดียวจบ)
scripts/              check-demo · test-gemini · gen-placeholder-audio
docs/                 แผนงาน · เอกสารธุรกิจ · บันทึกการคุย mentor
```

---

## 10 · เอกสารประกอบ

| เอกสาร | เนื้อหา |
|---|---|
| [`docs/BUSINESS.md`](docs/BUSINESS.md) | Persona · ตารางคู่แข่ง · GTM · รายได้ 4 ทาง |
| [`docs/mentor-round1-transcript.md`](docs/mentor-round1-transcript.md) | บันทึกการคุย mentor + คำที่ AI ถอดผิดจากบทสนทนาจริง |
| [`docs/PROTOTYPE-PLAN.md`](docs/PROTOTYPE-PLAN.md) | แผนพัฒนา 2 วัน + Definition of Done |
| [`public/img/CREDITS.md`](public/img/CREDITS.md) | เครดิตและไลเซนส์ภาพทุกไฟล์ |

---

## 11 · ทีม

<div align="center">

**STAR PLATINUM**

| | บทบาท |
|---|---|
| **นิค** — กฤษนล มาตย์งามเมือง | Lead · สถาปัตยกรรมระบบ · Backend · AI Pipeline |
| **ไอช์** — ศิปปกร บุญกาญจน์ | Design · Research |
| **ศิลป** — นัทธเดช ธรรมมิกะ | Business · Pitch |
| **ปุ๊กลุก** — พิชชามน สันติพงษ์ไพบูลย์ | Research · Ethics · User Testing |

ทีมมาจาก 3 โรงเรียน 3 จังหวัด — ชลบุรี · นครศรีธรรมราช · นครราชสีมา
จึงเข้าใจว่าแต่ละบ้านพูดกันคนละสำเนียง

</div>

> ในทีม 4 คน มี 2 คนที่เจอปัญหานี้กับตัวเอง —
> คนหนึ่งเสียคุณยายไปก่อนได้ถามเรื่องของท่าน
> อีกคนอยากรู้เรื่องของปู่ย่าตายายแต่ไม่เคยมีเวลานั่งฟังจริงจัง

---

<div align="center">

### วันที่อยากฟัง อาจไม่ใช่วันที่ยังได้ฟัง

<br />

`#UTCCAcademicWeek2026` · `#UTCC` · `#CreativeLabTH` · `#CIACreativeLab`

</div>
