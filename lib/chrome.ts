/**
 * กติกากลางว่าหน้าไหนใช้แถบนำทางแบบไหน
 *
 * ทำไมต้องรวมไว้ที่เดียว:
 * ตอนนี้มีแถบนำทาง 3 แบบ (แถบบนลอย · แถบแท็บล่างบนมือถือ · แถบไอคอนซ้ายบนเดสก์ท็อป)
 * ถ้าแต่ละตัวตัดสินเองว่าจะโผล่หน้าไหน จะเกิดหน้าที่มีแถบซ้อนกันสองอัน
 * หรือหน้าที่ไม่มีแถบเลย ซึ่งเคยเกิดมาแล้วตอนแก้แถบบนแยกจากแถบล่าง
 *
 * | หน้า                       | มือถือ              | เดสก์ท็อป (lg+)  |
 * |---------------------------|--------------------|-----------------|
 * | /library /review /interview/new | แถบบน(โลโก้) + แท็บล่าง | แถบไอคอนซ้าย |
 * | /interview/[id] (กำลังอัด)  | แถบบน(โลโก้) เท่านั้น  | แถบไอคอนซ้าย |
 * | / (landing)                | แถบบน + แท็บล่าง     | แถบบนลอย       |
 * | /book /deck                | ไม่มี (ซ่อนด้วย CSS)  | ไม่มี            |
 * | /clip                     | แถบบน               | แถบบน           |
 */

/** หน้าที่เป็นตัวแอปจริง — ใช้แถบไอคอนซ้ายบนเดสก์ท็อปแทนแถบบน */
export function isAppRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/library") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/interview")
  );
}

/**
 * หน้าที่ต้องไม่มีแถบแท็บล่างบนมือถือ
 *   /book   เครื่องอ่านล็อกความสูงจอและไม่เลื่อน แถบจะไปกินพื้นที่หน้ากระดาษ
 *   /deck   สไลด์ขนาดตายตัว
 *   /clip   คนที่สแกน QR เข้ามาไม่ใช่เจ้าของบัญชี
 *   /interview/[id]  ถ้าเผลอแตะแท็บกลางคันจะเสียคลิปที่กำลังอัด
 */
export function hidesBottomTabs(pathname: string): boolean {
  if (pathname.startsWith("/book") || pathname.startsWith("/deck")) return true;
  if (pathname.startsWith("/clip")) return true;
  if (pathname.startsWith("/interview/") && pathname !== "/interview/new") return true;
  return false;
}

/** ลิงก์ตัวอย่างหนังสือ ใช้ร่วมกันหลายที่ */
export const DEMO_BOOK = "/book/demo-token-7f3a9c2e";
