"use client";

/**
 * เรียก API ของเราเองให้ทนทานต่อ "คำตอบที่ไม่ใช่ JSON"
 *
 * ⚠️ ทำไมต้องมีไฟล์นี้
 * ของเดิมทุกที่เขียนว่า `const json = await res.json()` แล้วค่อยเช็ก res.ok
 * ซึ่งพังเมื่อเซิร์ฟเวอร์ตอบกลับมาเป็นข้อความธรรมดา เช่น
 *   - หน้า error ของ Vercel ตอน function ทำงานนานเกินกำหนดหรือพัง
 *     (ขึ้นต้นว่า "An error occurred...")
 *   - หน้า error HTML ของ Next ตอน dev server สะดุด
 * ผลคือผู้ใช้เห็นข้อความว่า `Unexpected token 'A', "An error o"... is not valid JSON`
 * ซึ่งไม่ได้บอกอะไรเลย และโค้ดเดิมยังไปสรุปต่อว่าเป็นปัญหา "เน็ตหลุด"
 * ทั้งที่จริง ๆ เซิร์ฟเวอร์ตอบกลับมาแล้ว แค่ตอบว่าพัง
 *
 * ไฟล์นี้แยก 2 กรณีออกจากกันให้ชัด เพราะวิธีแก้ของผู้ใช้ต่างกันคนละเรื่อง:
 *   - ติดต่อเซิร์ฟเวอร์ไม่ได้เลย  → รอเน็ตแล้วส่งคิวใหม่
 *   - เซิร์ฟเวอร์ตอบว่าพัง        → ลองใหม่ได้เลย หรืออัดคลิปให้สั้นลง
 */

export class ApiError extends Error {
  /** HTTP status ที่ได้กลับมา — 0 แปลว่าไม่ได้คำตอบเลย (เน็ตมีปัญหาจริง) */
  readonly status: number;
  /** true = เซิร์ฟเวอร์ตอบกลับมาแล้ว ปัญหาไม่ได้อยู่ที่เน็ตของผู้ใช้ */
  readonly reachedServer: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.reachedServer = status > 0;
  }
}

/** แปลง status เป็นภาษาที่ลูกหลานหน้างานอ่านแล้วรู้ว่าต้องทำอะไรต่อ */
function explain(status: number, body: string): string {
  if (status === 504 || status === 408) {
    return "ระบบใช้เวลาประมวลผลนานเกินกำหนด — ลองอัดคลิปให้สั้นลง (ไม่เกิน 2 นาที) แล้วส่งใหม่";
  }
  if (status === 413) {
    return "ไฟล์เสียงใหญ่เกินไป — ลองอัดคลิปให้สั้นลงแล้วส่งใหม่";
  }
  if (status === 401 || status === 403) {
    return "ไม่มีสิทธิ์เข้าถึง — ลองออกจากระบบแล้วเข้าใหม่";
  }
  // ตัดเนื้อความมาเล็กน้อยเพื่อให้ทีมดูออกหน้างานว่าพังที่ชั้นไหน
  const hint = body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 90);
  return `ระบบประมวลผลไม่สำเร็จ (รหัส ${status})${hint ? " — " + hint : ""}`;
}

/**
 * ยิง POST แล้วคืน JSON ที่ parse แล้ว
 * ถ้าไม่สำเร็จจะโยน ApiError เสมอ ซึ่งบอกได้ว่าถึงเซิร์ฟเวอร์หรือไม่
 */
export async function postJson<T>(url: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    // ยิงไม่ออกเลย = เน็ตมีปัญหาจริง
    throw new ApiError("ติดต่อเซิร์ฟเวอร์ไม่ได้", 0);
  }

  const raw = await res.text();

  let json: unknown = null;
  try {
    json = JSON.parse(raw);
  } catch {
    // ตอบกลับมาแต่ไม่ใช่ JSON — เกือบทั้งหมดคือหน้า error ของแพลตฟอร์ม
    throw new ApiError(explain(res.status, raw), res.status || 500);
  }

  if (!res.ok) {
    const msg = (json as { error?: string })?.error;
    throw new ApiError(msg || explain(res.status, raw), res.status);
  }
  return json as T;
}
