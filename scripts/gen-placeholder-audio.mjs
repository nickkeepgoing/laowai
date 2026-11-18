/**
 * สร้างไฟล์เสียง placeholder สำหรับ /public/demo
 *
 * ทำไมต้องมี: ศิลปต้อง build <AudioPlayer> + waveform + หน้า /clip ได้ทันที
 * โดยไม่ต้องรอเสียงจริงของปู่ย่าตายาย
 *
 * 🔴 ไฟล์พวกนี้เป็นเสียงสังเคราะห์ ไม่ใช่เสียงคน
 *    พอได้เสียงจริงแล้ว ให้ทับไฟล์ชื่อเดิมได้เลย (clip-1.wav, clip-2.wav, ...)
 *    แล้วแก้ durationMs ใน data/demo/clips.json ให้ตรง
 *
 * รัน: node scripts/gen-placeholder-audio.mjs
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RATE = 8000; // 8 kHz พอสำหรับ placeholder และทำให้ไฟล์เล็ก
const OUT = join(process.cwd(), "public", "demo");

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const head = Buffer.alloc(44);
  head.write("RIFF", 0);
  head.writeUInt32LE(36 + data.length, 4);
  head.write("WAVE", 8);
  head.write("fmt ", 12);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20); // PCM
  head.writeUInt16LE(1, 22); // mono
  head.writeUInt32LE(RATE, 24);
  head.writeUInt32LE(RATE * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write("data", 36);
  head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
}

/** สร้างเสียงที่มีจังหวะคล้ายคนพูด เพื่อให้ waveform ดูมีชีวิตตอนทดสอบ UI */
function speechLike(seconds, seed) {
  const n = Math.floor(seconds * RATE);
  const out = new Float32Array(n);
  let rnd = seed;
  const rand = () => ((rnd = (rnd * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

  // สร้างช่วง "คำพูด" สลับกับ "ช่วงเงียบ"
  const bursts = [];
  let t = 0.3;
  while (t < seconds - 0.3) {
    const len = 0.25 + rand() * 0.75;
    bursts.push([t, Math.min(t + len, seconds - 0.2)]);
    t += len + 0.08 + rand() * 0.45;
  }

  const f0 = 120 + seed * 11;
  for (const [a, b] of bursts) {
    const i0 = Math.floor(a * RATE);
    const i1 = Math.floor(b * RATE);
    const pitch = f0 * (0.85 + rand() * 0.4);
    for (let i = i0; i < i1; i++) {
      const p = (i - i0) / (i1 - i0);
      const env = Math.sin(Math.PI * p) ** 0.7; // ค่อย ๆ ดังแล้วค่อย ๆ เบา
      const x = i / RATE;
      out[i] +=
        env *
        0.33 *
        (Math.sin(2 * Math.PI * pitch * x) +
          0.5 * Math.sin(4 * Math.PI * pitch * x) +
          0.25 * Math.sin(6 * Math.PI * pitch * x) +
          0.12 * (rand() * 2 - 1));
    }
  }
  return out;
}

mkdirSync(OUT, { recursive: true });

const files = [
  ["clip-1.wav", 40, 3],
  ["clip-2.wav", 40, 7],
  ["clip-3.wav", 40, 11],
  ["consent.wav", 6, 5],
];

for (const [name, secs, seed] of files) {
  const buf = wav(speechLike(secs, seed));
  writeFileSync(join(OUT, name), buf);
  console.log(`✓ ${name}  ${secs}s  ${(buf.length / 1024).toFixed(0)} KB`);
}

console.log("\n🔴 นี่คือเสียงสังเคราะห์ ไม่ใช่เสียงคน");
console.log("   พอได้เสียงจริงแล้วให้ทับไฟล์ชื่อเดิมได้เลย");
