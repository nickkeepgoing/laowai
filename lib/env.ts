/**
 * รวมการอ่าน env ไว้ที่เดียว เพื่อให้ "แอปรันได้เสมอ" แม้ยังไม่มี key
 *
 * หลักการ: ไม่มี key ก็ไม่พัง แค่ถอยไปใช้ mock + in-memory store
 * ทำแบบนี้เพราะศิลปต้อง build หน้าจอได้โดยไม่ต้องรอ Supabase/Gemini
 * และตอน pitch เราต้องมี demo mode ที่ไม่พึ่งเน็ตอยู่แล้ว
 */

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || "";
export const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const hasGemini = () => GEMINI_API_KEY.length > 0;
export const hasSupabase = () => SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

/** ชื่อ bucket ใน Supabase Storage */
export const AUDIO_BUCKET = "clips";

/** สรุปสถานะไว้โชว์ใน response ของ API เพื่อให้ debug บนเวทีได้เร็ว */
export const runtimeMode = () => ({
  gemini: hasGemini() ? "live" : "mock",
  storage: hasSupabase() ? "supabase" : "memory",
});
