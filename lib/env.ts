/**
 * รวมการอ่าน env ไว้ที่เดียว เพื่อให้ "แอปรันได้เสมอ" แม้ยังไม่มี key
 *
 * หลักการ: ไม่มี key ก็ไม่พัง แค่ถอยไปใช้ mock + in-memory store
 * ทำแบบนี้เพราะศิลปต้อง build หน้าจอได้โดยไม่ต้องรอ Supabase/Gemini
 * และตอน pitch เราต้องมี demo mode ที่ไม่พึ่งเน็ตอยู่แล้ว
 */

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || "";
export const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

export const SUPABASE_URL =
  (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim() || "";

/**
 * anon key อยู่ฝั่ง server เท่านั้น ไม่ต้องใช้ NEXT_PUBLIC_
 *
 * เราแตะ Supabase จาก app/api/** เท่านั้น ส่วนหน้าเว็บคุยกับ API ผ่าน fetch
 * เพราะฉะนั้นไม่มีเหตุผลให้ key หลุดไปอยู่ใน bundle ของเบราว์เซอร์
 * (ยังรองรับชื่อเดิมที่มี NEXT_PUBLIC_ ไว้ด้วย เผื่อใครยังใช้ .env.local เก่า)
 */
export const SUPABASE_ANON_KEY =
  (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim() || "";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const hasGemini = () => GEMINI_API_KEY.length > 0;
export const hasSupabase = () => SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

/** ชื่อ bucket ใน Supabase Storage */
export const AUDIO_BUCKET = "clips";

/**
 * กันงานค้างจนแพลตฟอร์มตัดเอง
 *
 * ⚠️ ทำไมต้องมี: Vercel มีเพดานเวลาของ serverless function
 * ถ้าเราปล่อยให้ค้างจนครบเพดาน Vercel จะตอบกลับเป็น "หน้า error ของตัวเอง"
 * ซึ่งเป็นข้อความธรรมดา ไม่ใช่ JSON แล้วหน้าเว็บจะพังตอน parse
 * ผู้ใช้เห็นข้อความที่ไม่บอกอะไรเลย และเข้าใจผิดว่าเน็ตตัวเองมีปัญหา
 *
 * เราจึงตัดจบเองก่อนถึงเพดาน เพื่อให้ยังตอบเป็น JSON ที่บอกทางแก้ได้
 */
export async function withTimeout<T>(
  work: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new TimeoutError(`${label}ใช้เวลานานเกิน ${Math.round(ms / 1000)} วินาที`)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

/** สรุปสถานะไว้โชว์ใน response ของ API เพื่อให้ debug บนเวทีได้เร็ว */
export const runtimeMode = () => ({
  gemini: hasGemini() ? "live" : "mock",
  storage: hasSupabase() ? "supabase" : "memory",
});
