/**
 * 🔒 สัญญากลาง (FROZEN CONTRACT) — เล่าไว้
 *
 * ไฟล์นี้คือข้อตกลงระหว่างสาย Engine (นิค) กับสาย Face (ศิลป)
 * ห้ามแก้โดยไม่ตกลงกันทั้งสองฝ่าย เพราะทั้งสองสายเขียนโค้ดพร้อมกันอยู่
 *
 * ถ้าจำเป็นต้องเพิ่ม field ให้ "เพิ่มแบบ optional" เท่านั้น
 * ห้ามเปลี่ยนชื่อ field เดิม ห้ามลบ ห้ามเปลี่ยน type เดิม
 */

/**
 * Claim = หน่วยความจริง 1 ชิ้นที่ดึงมาจากสิ่งที่ผู้สูงอายุเล่า
 *
 * หัวใจของทั้งโปรเจกต์อยู่ที่ `quote`:
 * มันต้องเป็น "ถ้อยคำต้นฉบับคำต่อคำ" ที่มีอยู่จริงใน transcript
 * เราตรวจด้วยโค้ด (verifyClaim) ไม่ใช่ให้ AI ตรวจ AI
 */
export type Claim = {
  /** "c1", "c2", ... ไม่ซ้ำกันภายใน session เดียว */
  id: string;
  /** ถ้อยคำต้นฉบับคำต่อคำ ห้ามเกลา ห้ามย่อ — ใช้ตรวจสอบว่ามีอยู่จริงใน transcript */
  quote: string;
  /** ย่อความสั้น ๆ ไว้ให้มนุษย์อ่านบนการ์ด */
  summary: string;
  /** ตำแหน่งในไฟล์เสียง (ms) — ใช้ให้ <AudioPlayer> seek ไปที่ช่วงนี้ */
  startMs: number;
  endMs: number;
  /** ผลลัพธ์จาก verifyClaim() — false = AI แต่งเกินต้นฉบับ → ทิ้ง ไม่เอาไปเรียบเรียง */
  verified: boolean;
};

/** Clip = การอัดเสียง 1 ครั้ง = 1 คำถาม 1 คำตอบ */
export type Clip = {
  id: string;
  sessionId: string;
  /** คำถามที่หลานถามก่อนกดอัด */
  question: string;
  /** URL ไฟล์เสียง (Supabase Storage หรือ /demo/*.wav ตอน dev) */
  audioUrl: string;
  durationMs: number;
  /** ข้อความถอดเสียงเต็ม — เป็น "แหล่งความจริง" ที่ทุก claim ต้องอ้างอิงได้ */
  transcript: string;
  claims: Claim[];
  /** คำถามต่อ 3 ข้อที่ AI เสนอให้หลานถาม */
  nextQuestions: string[];
  createdAt: string;
};

/** Paragraph = 1 ย่อหน้าในหนังสือ ต้องอ้าง claim อย่างน้อย 1 อันเสมอ */
export type Paragraph = {
  id: string;
  text: string;
  /** ต้องมีอย่างน้อย 1 เสมอ ถ้าว่าง = ย่อหน้านี้ไม่มีหลักฐาน = ห้ามพิมพ์ */
  claimIds: string[];
  /**
   * ประโยคที่ระบบจับได้ว่า "เขียนเกินจากต้นฉบับ"
   * UI ต้องแสดงเป็นไฮไลต์สีเหลืองให้ครอบครัวตรวจ
   * ว่างเปล่า = ผ่าน
   */
  flags: string[];
};

/** Chapter = 1 บทในหนังสือ = 1 หัวข้อชีวิต */
export type Chapter = {
  id: string;
  sessionId: string;
  /** "วัยเด็ก" | "การทำงาน" | "ความรัก" | "สูตรอาหาร" | "คำสอน" */
  title: string;
  paragraphs: Paragraph[];
  /** ครอบครัวกดยืนยันแล้วหรือยัง — ถ้ายัง ห้ามสร้างหนังสือ */
  approved: boolean;
  /** token สุ่มสำหรับ /book/[token] และ QR — เพิกถอนได้ */
  shareToken: string;
};

/** ภาคของผู้เล่า — ใช้ติดป้ายให้ dataset ภาษาถิ่น (ดู Correction) */
export type Region = "central" | "north" | "northeast" | "south";

/**
 * ความถี่ที่ลูกหลานได้กลับไปเจอท่าน
 *
 * ถามตอนเริ่ม session เพราะ mentor บอกว่า "พอเรามีหน้าลูกค้าชัด
 * เลยทำให้เรารู้ว่าลูกค้าต้องการอะไร" → เก็บจากผู้ใช้จริงตั้งแต่วันแรก
 * ดีกว่าเดา persona เอาเองในสไลด์
 */
export type VisitFrequency = "together" | "weekly" | "monthly" | "fewTimesAYear";

/** Session = การเก็บเรื่องของผู้สูงอายุ 1 ท่าน */
export type Session = {
  id: string;
  /** "ยายสมจิต" */
  elderName: string;
  /** "ยายของนิค" — ใช้แสดงบนหน้าหนังสือและหน้า /clip */
  relation: string;
  topic: string;
  /** เสียงที่ผู้สูงอายุพูดคำว่ายินยอมด้วยตัวเอง — null = ยังไม่ได้ขอ = ห้ามอัดต่อ */
  consentAudioUrl: string | null;
  createdAt: string;
  /** ข้อมูล persona (optional — session เก่าไม่มี) */
  region?: Region;
  visitFrequency?: VisitFrequency;
};

/**
 * Correction = คู่ข้อความ "AI ถอดผิด → คนแก้ถูก" 1 คู่
 *
 * mentor แนะว่าต้องเก็บตัวอย่างคำถิ่น และบอกว่ามนุษย์ต้องเป็นคนแก้
 * สองอย่างนั้นคืออันเดียวกัน: ทุกครั้งที่ครอบครัวแก้คำ เราได้ข้อมูล 1 คู่
 * ยิ่งมีครอบครัวใช้มาก dataset ภาษาถิ่นยิ่งโต → เป็น moat ที่คู่แข่งไล่ไม่ทัน
 *
 * ⚠️ ความเป็นส่วนตัว: ค่าตั้งต้นเก็บ "เฉพาะคู่ข้อความ + ภาค" เท่านั้น
 * ไม่เก็บเสียง ไม่เก็บชื่อ ไม่ผูกกลับไปที่คลิป
 * จะผูก clipId/spanStartMs ได้ต่อเมื่อครอบครัวติ๊กยินยอมแยกต่างหาก
 * (proposal เราประกาศไว้ว่าไม่เอาเสียงไปฝึกโมเดลโดยไม่มีความยินยอมแยก)
 */
export type Correction = {
  id: string;
  /** AI ถอดว่าอะไร */
  asrText: string;
  /** ครอบครัวแก้เป็นอะไร */
  humanText: string;
  region?: Region;
  /** มีค่าเฉพาะเมื่อ optIn = true */
  clipId?: string | null;
  spanStartMs?: number | null;
  createdAt: string;
};

/** ---- รูปแบบ response ของ API (สาย Face เรียกผ่าน fetch) ---- */

/** POST /api/analyze — ส่งไฟล์เสียงขึ้นไป ได้ clip ที่ผ่านการ verify แล้วกลับมา */
export type AnalyzeResponse = {
  clip: Clip;
  /** จำนวน claim ที่ AI สร้างมาแต่ตรวจไม่ผ่านแล้วถูกทิ้ง — เอาไปโชว์บน UI ได้เลย */
  droppedClaims: number;
};

/** POST /api/compose — ส่ง claim ทั้งหัวข้อ ได้บทที่เรียบเรียงแล้ว */
export type ComposeResponse = {
  chapter: Chapter;
  /** ย่อหน้าที่มีหลักฐานครบ / ย่อหน้าทั้งหมด — ควรเป็น x/x เสมอ */
  verifiedParagraphs: number;
  totalParagraphs: number;
};

/** หัวข้อชีวิต 1 หัวข้อ พร้อมชุดคำถาม (มาจาก data/questions.json) */
export type Topic = {
  id: string;
  title: string;
  /** emoji หรือชื่อ icon จาก lucide */
  icon: string;
  description: string;
  questions: {
    text: string;
    /** true = หัวข้อที่อาจกระทบใจ ต้องให้หลานเลือกเองว่าจะถามไหม */
    sensitive?: boolean;
  }[];
};
