"use client";

/**
 * 🧩 STUB — เจ้าของไฟล์: ศิลป (สาย Face)
 *
 * ตอนนี้เป็นเวอร์ชันใช้งานได้จริงแต่ยังไม่สวย ศิลปจะมาเขียนไส้ในใหม่ด้วย wavesurfer.js
 *
 * ⚠️ props และ AudioPlayerHandle ห้ามเปลี่ยนเด็ดขาด
 * เพราะหน้า /interview และ /review ของนิค import ไปใช้อยู่แล้ว
 * ถ้าจะเพิ่ม prop ให้เพิ่มแบบ optional เท่านั้น
 */

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export type AudioPlayerHandle = {
  /** เลื่อนไปที่ตำแหน่ง ms แล้วเล่นต่อ — ใช้ตอนคลิกย่อหน้าในหน้า /review */
  seek: (ms: number) => void;
  pause: () => void;
};

export type AudioPlayerProps = {
  src: string;
  clipId: string;
  /** ถ้าระบุ จะเริ่มเล่นที่ตำแหน่งนี้ */
  startMs?: number;
  /** ถ้าระบุ จะหยุดอัตโนมัติเมื่อเล่นถึงตำแหน่งนี้ (ใช้ฟังเฉพาะช่วงของ claim) */
  endMs?: number;
  /** โหมดเล็ก ใช้ฝังในย่อหน้า */
  compact?: boolean;
  ref?: React.Ref<AudioPlayerHandle>;
};

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function AudioPlayer({
  src,
  clipId,
  startMs,
  endMs,
  compact = false,
  ref,
}: AudioPlayerProps) {
  const el = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);

  useImperativeHandle(ref, () => ({
    seek(ms: number) {
      const a = el.current;
      if (!a) return;
      a.currentTime = ms / 1000;
      void a.play();
    },
    pause() {
      el.current?.pause();
    },
  }));

  // หยุดเองเมื่อเล่นเลยช่วงของ claim ที่กำหนด
  useEffect(() => {
    const a = el.current;
    if (!a || endMs == null) return;
    const onTime = () => {
      if (a.currentTime * 1000 >= endMs) a.pause();
    };
    a.addEventListener("timeupdate", onTime);
    return () => a.removeEventListener("timeupdate", onTime);
  }, [endMs]);

  const toggle = () => {
    const a = el.current;
    if (!a) return;
    if (a.paused) {
      if (startMs != null && a.currentTime * 1000 < startMs) a.currentTime = startMs / 1000;
      void a.play();
    } else {
      a.pause();
    }
  };

  return (
    <div
      data-clip-id={clipId}
      className={
        compact
          ? "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
          : "flex items-center gap-3 rounded-xl border p-3"
      }
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "หยุดเสียง" : "ฟังเสียงต้นฉบับ"}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>

      {/* TODO(ศิลป): แทนแถบนี้ด้วย waveform จริงจาก wavesurfer.js */}
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-current transition-[width] duration-100"
          style={{ width: dur ? `${(t / dur) * 100}%` : "0%" }}
        />
      </div>

      {!compact && (
        <span className="shrink-0 tabular-nums text-xs opacity-60">
          {fmt(t)} / {fmt(dur)}
        </span>
      )}

      <audio
        ref={el}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)}
      />
    </div>
  );
}
