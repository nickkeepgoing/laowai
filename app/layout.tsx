import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Trirong } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

/**
 * คู่ฟอนต์
 *
 * เนื้อหา: IBM Plex Sans Thai
 *   IBM จ้างโรงหล่อออกแบบให้เป็นฟอนต์ประจำองค์กร โครงสร้างตัวอักษรแน่น
 *   มีบุคลิกเป็นงานออกแบบจริง ต่างจาก Sarabun ที่เป็นฟอนต์ราชการซึ่งเห็นทุกที่จนจำไม่ได้
 *   และอ่านบนจอง่ายกว่า จึงไม่ต้องแลกความชัดเจนสำหรับผู้สูงอายุเลย
 *
 * หัวเรื่อง: Trirong
 *   Thai serif ที่มีหัวและเชิงชัด ให้ความรู้สึกเป็นหนังสือและเป็นของที่เก็บไว้
 *   ซึ่งตรงกับสิ่งที่ผลิตภัณฑ์นี้ทำ
 *
 * next/font/google ดาวน์โหลดมา self-host ตอน build ไม่ได้ยิง CDN ตอนผู้ใช้เปิดเว็บ
 * ทำให้ตอนกด Ctrl+P พิมพ์หนังสือ ฟอนต์ไทยไม่หาย
 */
const plex = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-thai",
  display: "swap",
});

const trirong = Trirong({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-trirong",
  display: "swap",
});

export const metadata: Metadata = {
  title: "เล่าไว้ — เก็บเรื่องชีวิตของท่านด้วยเสียงของท่านเอง",
  description:
    "AI ผู้ช่วยสัมภาษณ์ที่ช่วยให้หลานฟังเรื่องชีวิตของปู่ย่าตายาย แล้วเรียบเรียงเป็นหนังสือชีวิตที่ทุกย่อหน้ากดฟังเสียงจริงของท่านได้",
};

/**
 * ⚠️ ตัวแปรฟอนต์ต้องอยู่บน <html> ไม่ใช่ <body>
 *
 * Tailwind v4 ประกาศ --font-sans ไว้ที่ :root โดยอ้าง var(--font-plex-thai)
 * ถ้าตัวแปรนั้นอยู่บน body ตอน :root จะหาไม่เจอ ค่าเลยกลายเป็น invalid
 * แล้วทั้งเว็บตกไปใช้ฟอนต์ default ของเบราว์เซอร์ โดยไม่มี error ใด ๆ ให้เห็น
 * บั๊กนี้ทำให้ฟอนต์ที่ตั้งไว้ไม่เคยถูกใช้เลยตั้งแต่ต้น
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${plex.variable} ${trirong.variable}`}>
      <body className="antialiased">
        {/* หน้าหนังสือซ่อน header เองด้วยคลาส no-print ตอนพิมพ์ */}
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
