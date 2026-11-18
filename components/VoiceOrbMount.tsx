"use client";

/**
 * ตัวครอบ VoiceOrb — โหลด three.js แบบ dynamic เฉพาะฝั่ง browser
 *
 * สำคัญกับวัน pitch: ถ้าคอมกลางในห้องเปิด WebGL ไม่ได้ หรือเน็ตช้าจน chunk ยังไม่มา
 * ผู้ชมจะเห็นวงแสงทองแบบ CSS แทน ไม่ใช่กล่องว่าง ๆ
 */

import dynamic from "next/dynamic";

const Orb = dynamic(() => import("./VoiceOrb"), {
  ssr: false,
  loading: () => <OrbFallback />,
});

function OrbFallback() {
  return (
    <div className="grid h-full w-full place-items-center" aria-hidden>
      <div className="relative h-56 w-56">
        <div className="absolute inset-0 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(227,178,84,0.45)_0%,transparent_70%)]" />
        <div className="absolute inset-8 rounded-full border border-gold-400/40" />
        <div className="absolute inset-16 rounded-full border border-gold-400/25" />
      </div>
    </div>
  );
}

export default function VoiceOrbMount({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* วงแสงนิ่งอยู่ด้านหลังเสมอ เป็นตาข่ายนิรภัยถ้า WebGL ใช้ไม่ได้ */}
      <div className="absolute inset-0">
        <OrbFallback />
      </div>
      {/* ต้องส่ง h-full ลงไปด้วย ไม่งั้น div ครอบไม่มีความสูง แล้ว canvas ยุบเหลือ 150px */}
      <div className="absolute inset-0">
        <Orb className="h-full w-full" />
      </div>
    </div>
  );
}
