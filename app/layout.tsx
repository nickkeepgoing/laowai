import type { Metadata } from "next";
import { Noto_Serif_Thai, Sarabun } from "next/font/google";
import "./globals.css";

/**
 * next/font/google ดาวน์โหลดฟอนต์มา self-host ตอน build
 * ไม่ได้ยิง CDN ตอนผู้ใช้เปิดเว็บ → ตอนกด Ctrl+P พิมพ์หนังสือ ฟอนต์ไทยไม่หาย
 * (ถ้าใช้ <link> ไป Google Fonts จะมีโอกาสฟอนต์ไม่มาทันตอน print)
 */
const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
});

const notoSerifThai = Noto_Serif_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "600"],
  variable: "--font-noto-serif-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "เล่าไว้ — เก็บเรื่องชีวิตของท่านด้วยเสียงของท่านเอง",
  description:
    "AI ผู้ช่วยสัมภาษณ์ที่ช่วยให้หลานฟังเรื่องชีวิตของปู่ย่าตายาย แล้วเรียบเรียงเป็นหนังสือชีวิตที่ทุกย่อหน้ากดฟังเสียงจริงของท่านได้",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} ${notoSerifThai.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
