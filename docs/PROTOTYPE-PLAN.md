# เล่าไว้ — แผน Prototype (เฉพาะการ build)
2 สายขนาน · **นิค = Engine** · **ศิลป = Face** · ไอช์/ปุ๊กลุก = สนับสนุน

> เอกสารนี้พูดเรื่อง build อย่างเดียว เรื่อง pitch / business / ethics อยู่ใน `PLAN.md`
> ไฟล์บรีฟที่ศิลปก๊อปไปวางใน Claude Code ของตัวเอง → `docs/BRIEF-SILP.md`

---

## 0. ⚠️ ยกเลิกแล้ว — ตารางเจ้าของไฟล์ไม่ใช้อีกต่อไป

> **อัปเดต Day 1 ช่วงบ่าย:** ทีมตัดสินใจให้นิค + Claude ทำทุกไฟล์รวมหน้าของศิลป
> ตารางเจ้าของไฟล์ด้านล่างเก็บไว้เป็นบันทึกว่าเคยวางไว้แบบไหน **ไม่ต้องทำตามแล้ว**
> ส่วนที่ยังใช้อยู่: ลำดับงาน (ข้อ 4), Definition of Done (ข้อ 6), Fallback (ข้อ 7)

## 0. (เดิม) หลักการเดียวที่ทำให้ 2 สายขนานไม่ชนกัน

> **เจ้าของไฟล์ชัด + สัญญา type ตายตัว + mock data ตั้งแต่นาทีแรก**

ถ้าทำ 3 อย่างนี้ ทั้งสองคนเขียนพร้อมกันได้ 9 ชั่วโมงโดยไม่ต้องรอกัน และไม่มี merge conflict เลย

### ตารางเจ้าของไฟล์ (ห้ามข้ามเส้น)

| Path | เจ้าของ | อีกฝ่ายทำอะไรได้ |
|---|---|---|
| `lib/types.ts` | 🔒 **สัญญากลาง** | อ่านอย่างเดียว ห้ามแก้ (แก้ได้เฉพาะตกลงกันแล้ว) |
| `data/demo/**`, `public/demo/**` | 🔒 **mock กลาง** | อ่านอย่างเดียว |
| `lib/verify.ts` `lib/gemini.ts` `lib/db.ts` `lib/supabase.ts` | นิค | อ่าน |
| `app/api/**` | นิค | เรียกผ่าน fetch |
| `app/interview/**` | นิค | — |
| `app/review/**` | นิค | — |
| `supabase/**` `.env.local` `package.json` | นิค | ขอให้นิคทำให้ |
| `app/page.tsx` (Landing) | **ศิลป** | — |
| `app/book/**` | **ศิลป** | — |
| `app/clip/**` | **ศิลป** | — |
| `components/**` | **ศิลป** | นิค import ได้ แต่ห้ามแก้ไส้ใน |
| `app/globals.css` `tailwind.config.ts` `public/fonts/**` | **ศิลป** | — |

**กฎ package.json:** ลง dependency ทั้งหมดให้ครบใน H+0 แล้วห้ามแตะอีก ถ้าศิลปอยากได้ lib เพิ่ม → ทักนิคในไลน์ นิคลงให้แล้ว push

**กฎ git:** ทั้งคู่ push `main` ตรงๆ `git pull --rebase` ก่อน push ทุกครั้ง เพราะไม่มีไฟล์ทับกัน rebase จะไม่เคย conflict

---

## 1. H+0 — นิคทำคนเดียว 40 นาที (ศิลปรอ setup เครื่อง)

สิ่งที่ต้องออกมาจากชั่วโมงนี้คือ **"สัญญา"** ที่ทำให้ศิลปเริ่มได้ทันทีโดยไม่ต้องรอ API

### 1.1 Scaffold + ลง dep ทั้งหมดทีเดียว
```
next@15 typescript tailwindcss framer-motion
@supabase/supabase-js @google/genai
wavesurfer.js qrcode.react
lucide-react clsx
```

### 1.2 `lib/types.ts` — 🔒 สัญญากลาง (freeze)
```ts
export type Claim = {
  id: string;            // "c1"
  quote: string;         // ถ้อยคำต้นฉบับเป๊ะ ต้องมีจริงใน transcript
  summary: string;       // ย่อความ
  startMs: number;       // ตำแหน่งในไฟล์เสียง (ไว้ให้ seek)
  endMs: number;
  verified: boolean;     // ผลจาก verifyClaim() — false = ทิ้ง ไม่เอาไปเรียบเรียง
};

export type Clip = {
  id: string;
  sessionId: string;
  question: string;
  audioUrl: string;
  durationMs: number;
  transcript: string;
  claims: Claim[];
  nextQuestions: string[];
};

export type Paragraph = {
  id: string;
  text: string;
  claimIds: string[];    // ต้องมีอย่างน้อย 1
  flags: string[];       // ประโยคที่ระบบจับได้ว่าเกินต้นฉบับ → ไฮไลต์เหลือง
};

export type Chapter = {
  id: string;
  sessionId: string;
  title: string;         // "วัยเด็ก"
  paragraphs: Paragraph[];
  approved: boolean;
  shareToken: string;    // ใช้ใน URL ของ /book และ QR
};

export type Session = {
  id: string;
  elderName: string;     // "ยายสมจิต"
  relation: string;      // "ยายของนิค"
  topic: string;
  consentAudioUrl: string | null;
  createdAt: string;
};
```

### 1.3 `data/demo/` — mock ที่มีรูปร่างเหมือนของจริง 100%
- `session.json` · `clips.json` (3 คลิป claim รวม ~12 อัน มี verified:false ปนมา 2 อัน) · `chapter.json` (8 ย่อหน้า มี flags 1 อัน)
- `public/demo/clip-1.webm` ← **เสียงจริง** ถ้ายังไม่มี ใส่ placeholder ไว้ก่อนแล้วแทนทีหลัง (ชื่อไฟล์ห้ามเปลี่ยน)

ศิลปจะ build ทุกหน้าจาก mock นี้ → หน้าเสร็จสวยตั้งแต่ชั่วโมงที่ 3 โดยที่ API ยังไม่เสร็จเลยก็ได้

### 1.4 Component stub 4 ตัว (นิคเขียนโครง 10 บรรทัด ศิลปมาแทนไส้ใน)
props ห้ามเปลี่ยน เพราะหน้าของนิค import ไปใช้
```tsx
<AudioPlayer src clipId startMs? endMs? compact? />   // ref.seek(ms)
<QRBox value size? />
<Highlight level="warn"|"ok">{children}</Highlight>
<StatPill label value />
```

### 1.5 Supabase + Vercel
3 ตาราง + bucket `clips` (public read) + deploy หน้าเปล่าขึ้น Vercel **ให้ URL จริงมีตั้งแต่ชั่วโมงแรก** (QR ต้องยิงไป public URL)

### ✅ จบ H+0 ต้องได้
repo บน GitHub · URL Vercel จริง · `lib/types.ts` freeze · `data/demo` ครบ · ศิลป clone แล้ว `npm run dev` ขึ้น

---

## 2. สาย N — นิค (Engine)

| ช่วง | งาน | เสร็จแล้วต้องทำอะไรได้ |
|---|---|---|
| **H+1→2** | `lib/verify.ts` + unit test เล็กๆ · `lib/gemini.ts` (audio → JSON) · `lib/db.ts` | ยิงไฟล์เสียงเข้า Gemini แล้วได้ JSON claim กลับมาใน terminal |
| **H+2→4** | `POST /api/analyze` · หน้า `/interview/[id]`: เลือกหัวข้อ → อัด (MediaRecorder) → อัปโหลด Supabase → แสดง transcript + การ์ด claim + คำถามต่อ 3 ข้อ | **อัดเสียงจริงแล้วเห็น claim ขึ้นจอ** ← checkpoint สำคัญสุด |
| **H+4→6** | `POST /api/compose` (claims → ย่อหน้า + flags) · หน้า `/review/[id]`: ย่อหน้า + ไฮไลต์เหลือง + คลิกย่อหน้า→seek เสียง + แก้ inline + ยืนยัน | ได้บทที่ตรวจแล้ว 100% มีหลักฐาน |
| **H+6→7** | `POST /api/forget` (ปุ่มลืม) · `POST /api/approve` → สร้าง shareToken | ลบคลิปแล้วย่อหน้าที่อ้างคลิปนั้นหายตาม |
| **H+7→8** | **Demo mode** `?demo=1` อ่านจาก `data/demo` ทั้งหมด ไม่แตะ API เลย | ถอดสายเน็ตแล้ว demo ยังวิ่งครบเส้น |
| **H+8→9** | Streaming transcript (ไหลสดตอนถอดเสียง) · ขัดรายละเอียด | — |

### รายละเอียดที่ห้ามพลาด
**`lib/verify.ts` คือหัวใจทั้งโปรเจกต์**
```ts
const norm = (s: string) =>
  s.replace(/[\s​]/g, '').replace(/[.,!?"'()ฯๆๆ]/g, '');

export const verifyClaim = (transcript: string, quote: string) =>
  norm(transcript).includes(norm(quote));

export const verifyChapter = (ps: Paragraph[], byId: Record<string, Claim>) =>
  ps.every(p => p.claimIds.length > 0 && p.claimIds.every(id => byId[id]?.verified));
```
- Claim ที่ `verified:false` → **ทิ้ง** ไม่ส่งเข้า compose และต้อง**นับให้ผู้ใช้เห็น** ("ทิ้งไป 2 เพราะตรวจไม่ผ่าน") นี่คือจุดขายตอน demo
- Gemini ต้องถูกสั่งให้คืน `quote` แบบ **คัดลอกคำต่อคำ ห้ามเกลา** ไม่งั้น verify ตกหมด → ใส่ใน prompt ย้ำ 2 ครั้ง + ใช้ `responseMimeType: "application/json"` + response schema

**เรียก Gemini 2 แบบเท่านั้น** (1 บทที่มี N คลิป = N+1 ครั้ง)
1. `audio → { transcript, claims[], nextQuestions[] }` (ไม่แยก STT ออกมา)
2. `claims[] → { paragraphs[] }` พร้อมให้มันเช็กเองว่าประโยคไหนเกิน → ใส่ `flags`

---

## 3. สาย S — ศิลป (Face)

| ช่วง | งาน | เสร็จแล้วต้องเห็นอะไร |
|---|---|---|
| **H+1→2** | setup เครื่อง · design token ใน `globals.css` (สี/ฟอนต์ Sarabun+Noto Serif Thai/spacing) · component 4 ตัวแทน stub | หน้า `/demo-components` โชว์ component ทุกตัว |
| **H+2→4** | **`/clip/[token]`** (หน้ามือถือหลังสแกน QR) → แล้วทำ **`/book/[token]`** A5 print: ปก · สารบัญ · บท · QR ท้ายบท | กด Ctrl+P ได้ PDF ไทยสวย ไม่มีสระลอย |
| **H+4→7** | **`/` Landing page** · hero + waveform เสียงจริงกดเล่นได้ · scroll story · ตัวเลขนับขึ้น · section "เราไม่ทำ deadbot" · ตัวอย่างหน้าหนังสือ + QR สแกนได้จริง · CTA | หน้าแรกที่กรรมการเห็นแล้วจำ |
| **H+7→8** | ขัด `/interview` + `/review` ของนิค (เฉพาะ className ห้ามแตะ logic) | ทั้งเว็บดูเป็นชุดเดียวกัน |
| **H+8→9** | responsive มือถือ · dark background consistency · loading state | เปิดบนมือถือกรรมการแล้วไม่พัง |

### ทำไมให้ศิลปทำ `/clip` ก่อน Landing
`/clip` คือหน้าที่กรรมการจะเห็นหลังสแกน QR ด้วยมือถือตัวเอง = **หน้าที่สำคัญที่สุดต่อ 1 ตารางนิ้ว** และเล็กที่สุด ทำเสร็จเร็ว ได้ความมั่นใจก่อนไปลุย Landing

### ข้อบังคับ PDF ไทย (เขียนไว้ใน BRIEF ด้วย)
- ใช้ `@media print` + `@page { size: A5; margin: 18mm }` **ห้ามใช้ react-pdf** (สระ/วรรณยุกต์ไทยจะซ้อนผิดตำแหน่ง)
- ฟอนต์ self-host ใน `public/fonts` ไม่ใช่ Google Fonts CDN (ตอน print ออฟไลน์จะหาย)
- `font-size` เนื้อหา ≥ 15pt — คนอ่านคือผู้สูงอายุ

---

## 4. จุดนัดรวม (Integration Checkpoint) — ห้ามข้าม

| เวลา | ทำอะไร | ใครสั่ง |
|---|---|---|
| **H+2** | pull + run ทั้งคู่ · เช็กว่า component ของศิลปใช้ได้ในหน้าของนิค | นิค |
| **H+4** | 🚩 **Checkpoint ใหญ่** — ต้องได้: อัดเสียงจริง→เห็น claim / หน้า book print ได้ / Vercel เปิดจากมือถือได้<br>**ถ้าไม่ครบ → ศิลปหยุด Landing มาช่วยนิคทันที** | ทั้งคู่ |
| **H+6** | 🔒 **FREEZE logic** — นิคหยุดแตะ pipeline เหลือแต่ bug fix | นิค |
| **H+8** | รันเต็มเส้นพร้อมกัน: Landing → interview → review → book → สแกน QR ด้วยมือถือจริงบน **4G** | ทั้งคู่ |
| **ค่ำ** | ซ้อม demo 1 รอบเต็มทีม + เก็บ demo data ชุดสุดท้าย | ทั้งทีม |

**กฎข้อเดียวของ Day 2:** ห้ามเพิ่ม feature ใหม่หลัง **12:00** เด็ดขาด หลังจากนั้นมีแค่ bug fix กับซ้อม

---

## 5. งานสนับสนุน (ไอช์ / ปุ๊กลุก) — ออกมาเป็นไฟล์ ไม่ใช่คำพูด

| คน | ไฟล์ที่ต้องส่ง | deadline |
|---|---|---|
| **ปุ๊กลุก** | `data/questions.json` — 5 หัวข้อ × 8 คำถาม (วัยเด็ก · การทำงาน · ความรัก · สูตรอาหาร · คำสอน) ปิดทุกหัวข้อด้วย "อยากฝากอะไรถึงหลานไหมคะ" | **H+2** |
| **ปุ๊กลุก** | 🎙️ **อัดเสียงจริง 3–5 คลิป คลิปละ 2–3 นาที** + consent ด้วยเสียงต้นคลิป → ส่งนิควางใน `public/demo/` | **H+1 ด่วนสุด** |
| **ปุ๊กลุก** | QA — รันเสียงจริงเข้าระบบทุกชั่วโมง จดว่าอะไรเพี้ยน ส่งเป็น list ไม่ใช่เล่าปากเปล่า | ต่อเนื่อง |
| **ไอช์** | ref ดีไซน์ + palette ให้ศิลปใน H+1 · ช่วยขัดหน้า book · สไลด์ | H+1 แล้วต่อเนื่อง |

⚠️ **เสียงจริงคือ blocker อันดับ 1 ของทั้งโปรเจกต์** ไม่มีเสียง = verify ทดสอบไม่ได้ = demo ไม่มี = จบ ถ้าปู่ย่าตายายไม่อยู่ตรงนั้น → โทรเปิดลำโพงแล้วอัด

---

## 6. Definition of Done ของ Prototype

```
[ ] เปิด landing page บนมือถือแล้วกดฟังเสียงจริงได้
[ ] เลือกหัวข้อ → อัดเสียง 1–3 นาที → อัปโหลดสำเร็จ
[ ] ภายใน 30 วินาที เห็น transcript + claim ที่ verified + คำถามต่อ 3 ข้อ
[ ] กดเรียบเรียง → ได้บท 6–10 ย่อหน้า ทุกย่อหน้ามี claimIds ≥ 1
[ ] มีอย่างน้อย 1 ย่อหน้าที่ขึ้นไฮไลต์เหลือง (ระบบจับ AI ตัวเองได้)
[ ] คลิกย่อหน้า → เสียงต้นฉบับเล่นที่วินาทีนั้น
[ ] กดปุ่มลืม → คลิป + claim + ย่อหน้าที่อ้างคลิปนั้นหายหมด
[ ] กดยืนยัน → ได้หน้าหนังสือ A5 พร้อม QR
[ ] Ctrl+P → PDF ภาษาไทยไม่มีสระลอย ไม่ตัดกลางคำ
[ ] สแกน QR ด้วยมือถือ 3 เครื่องบน 4G → ได้ยินเสียงจริง
[ ] ?demo=1 → เส้นทางทั้งหมดวิ่งได้โดยไม่ต้องมีเน็ต
```

ติ๊กครบ 11 ข้อ = prototype เสร็จ ที่เหลือคือ polish

---

## 7. Fallback (ลำดับตัดเมื่อไฟไหม้)
1. ตัด streaming transcript → ขึ้นทีเดียวตอนเสร็จ
2. ตัดการเรียบเรียงย่อหน้า → โชว์ **รายการ Claim + ปุ่มฟัง** (ยังพิสูจน์แนวคิดหลักครบ 100%)
3. ตัดอัดสด → ปุ่มอัปโหลดไฟล์ (ต้องมีคู่กันอยู่แล้วทุกหน้า)
4. เน็ต/API ล่ม → `?demo=1` **แล้วบอกกรรมการตรงๆ**
