# แผนส่งงาน Final — เหลือถึง 19 พ.ย. 09:00

## เกณฑ์คะแนนบอกเราว่าต้องทุ่มตรงไหน (ต่อกรรมการ 1 ท่าน เต็ม 50)

| คะแนน | หัวข้อ | เราได้จากอะไร |
|---|---|---|
| **12** | Execution | เว็บที่ใช้งานได้จริง + login + deploy + GitHub public |
| **10** | MVP & Prototype | เส้นทาง อัด→ตรวจ→หนังสือ→QR ที่ demo สดได้ |
| **8** | Creativity | Claim-grounded + ไฮไลต์เหลือง + Flywheel + QR ในหนังสือ |
| **7** | Current Impact | สังคมสูงวัย + หนังสืองานศพ + ตัวเลขจริง |
| **7** | Future Impact | dataset ภาษาถิ่น + คำถามจริยธรรมเรื่อง AI กับความตาย |
| **6** | Presentation | Pitch Deck + demo สด |

**Execution + MVP = 22 คะแนน (44%)** → ของที่ต้องเห็นว่าใช้ได้จริงสำคัญที่สุด
เอกสารกับสไลด์เป็นของบังคับส่ง ขาดไม่ได้ แต่ไม่ควรกินเวลาจนโค้ดไม่เสร็จ

---

## Phase 1 — Brand & Design Upgrade ⬅ ทำก่อน
เพราะทุก screenshot ที่จะไปอยู่ในเอกสารและสไลด์ ต้องมาจากดีไซน์ชุดใหม่
ถ้าทำดีไซน์ทีหลัง ต้องถ่ายรูปใหม่หมดทุกใบ

- โลโก้ + สีประจำแบรนด์ (navy ลึก + ทอง) + header/footer ทั้งเว็บ
- Hero แบบ aurora gradient ให้เทียบชั้น reference
- ปรับทุกหน้าให้เป็นชุดเดียวกัน

**ทำไมไม่ใช้น้ำเงิน AI ล้วนตาม reference:** ทีมอื่นในงานจะใช้โทนนั้นกันเกือบหมด
เราใช้ความเนี๊ยบระดับเดียวกันแต่เก็บ **ทอง** ไว้เป็นสีประจำตัว
กรรมการเห็นสไลด์ใบไหนก็รู้ว่าเป็นของเรา — ตรงกับที่ mentor บอกว่าต้องทำให้จำได้

## Phase 2 — Login / User Account
- Google Sign-in + Magic Link (อีเมล) **สองทาง** เพื่อไม่ให้ติดถ้า Google ยังตั้งค่าไม่ทัน
- หน้า `/library` คลังความทรงจำของครอบครัว — เก็บทุกบทที่เคยทำ
- ผูก `user_id` เข้ากับ session/chapter + RLS จริง

> ข้อนี้ได้ 2 เด้ง: เป็น Execution ที่จับต้องได้ **และ** ทำให้คำตอบเรื่อง PDPA แข็งขึ้นมาก
> จากเดิม "ใครมี key ก็อ่านได้ทุกแถว" เป็น "เห็นเฉพาะของครอบครัวตัวเอง"

## Phase 3 — GitHub Public Documentation
README ที่กรรมการเปิดแล้วเข้าใจทั้งโปรเจกต์: Overview · Problem/Solution · Features ที่ทำงานจริง ·
Tech Stack · Architecture · Setup · Screenshots · Demo link · **Current Limitations** (ส่วนที่ยัง mock)

## Phase 4 — Research Document (.DOCX)
17 หัวข้อตามที่งานกำหนด + Business Model 9 ข้อ + References

## Phase 5 — Pitch Deck
15 สไลด์ เน้นภาพ ไม่ใช่ตัวหนังสือ ใช้ screenshot จริงจาก Phase 1

---

## ของที่ยังค้างฝั่งนิค (บล็อกอยู่)
1. **รัน `supabase/schema.sql` ใหม่** — ตอนนี้ 401 permission denied
2. **เปิด Google provider ใน Supabase** (ถ้าอยากได้ปุ่ม Google จริง)
3. **เสียงจริง** — อัดเองก็ได้ เพื่อเทสต์ `npm run test:gemini`
