"use client";

/**
 * เครื่องเล่นเสียงต้นฉบับ + waveform
 *
 * นี่คือ component ที่สำคัญที่สุดของโปรเจกต์ เพราะ "กดฟังเสียงจริงได้"
 * คือสิ่งที่ทำให้หนังสือของเราไม่ใช่แค่ข้อความที่ AI เขียน
 *
 * ⚠️ props และ AudioPlayerHandle ห้ามเปลี่ยน — หน้า /interview /review /clip /book ใช้อยู่
 * seek(ms) คือ API ที่หน้า /review ใช้ตอนคลิกย่อหน้าแล้วให้เสียงเล่นที่วินาทีนั้น
 */

import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import clsx from "clsx";

export type AudioPlayerHandle = {
  /** เลื่อนไปที่ตำแหน่ง ms แล้วเล่นต่อ */
  seek: (ms: number) => void;
  pause: () => void;
};

export type AudioPlayerProps = {
  src: string;
  clipId: string;
  /** เริ่มเล่นที่ตำแหน่งนี้ */
  startMs?: number;
  /** หยุดเองเมื่อถึงตำแหน่งนี้ — ใช้ฟังเฉพาะช่วงของ claim */
  endMs?: number;
  compact?: boolean;
  /** ป้ายกำกับให้ screen reader และผู้ใช้เข้าใจว่ากำลังฟังเสียงอะไร */
  label?: string;
  ref?: React.Ref<AudioPlayerHandle>;
};

const BARS = 56;

const fmt = (s: number) =>
  Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00";

export default function AudioPlayer({
  src,
  clipId,
  startMs,
  endMs,
  compact = false,
  label,
  ref,
}: AudioPlayerProps) {
  const el = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [peaks, setPeaks] = useState<number[] | null>(null);

  /**
   * ถอดคลื่นเสียงออกมาเป็นแท่งครั้งเดียวตอนโหลด
   * ใช้ AudioContext ของเบราว์เซอร์เอง ไม่ต้องพึ่ง lib ภายนอก
   * ถ้าถอดไม่ได้ (บาง codec / ไฟล์ใหญ่) ก็แสดงแท่งสม่ำเสมอแทน ไม่พัง
   */
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const buf = await (await fetch(src)).arrayBuffer();
        const ctx = new AudioContext();
        const audio = await ctx.decodeAudioData(buf);
        void ctx.close();
        const data = audio.getChannelData(0);
        const per = Math.floor(data.length / BARS) || 1;
        const out: number[] = [];
        for (let i = 0; i < BARS; i++) {
          let peak = 0;
          for (let j = 0; j < per; j += 16) peak = Math.max(peak, Math.abs(data[i * per + j] || 0));
          out.push(peak);
        }
        const max = Math.max(...out, 0.01);
        if (!dead) setPeaks(out.map((v) => Math.max(0.08, v / max)));
      } catch {
        if (!dead) setPeaks(Array.from({ length: BARS }, () => 0.35));
      }
    })();
    return () => {
      dead = true;
    };
  }, [src]);

  /**
   * อ่านความยาวจากตัว element โดยตรง ไม่พึ่ง onLoadedMetadata อย่างเดียว
   *
   * ถ้าไฟล์เสียงมาจาก cache เบราว์เซอร์จะยิง loadedmetadata ตั้งแต่ก่อน React hydrate
   * ทำให้ handler ไม่ทัน แล้วเวลาจะค้างที่ 0:00 ส่วนแถบ progress ก็ไม่วิ่ง (เจอจริงตอนเทสต์)
   */
  useEffect(() => {
    const a = el.current;
    if (!a) return;
    const sync = () => {
      if (Number.isFinite(a.duration) && a.duration > 0) setDur(a.duration);
      setPlaying(!a.paused);
    };
    sync();
    a.addEventListener("durationchange", sync);
    a.addEventListener("canplay", sync);
    return () => {
      a.removeEventListener("durationchange", sync);
      a.removeEventListener("canplay", sync);
    };
  }, [src]);

  useImperativeHandle(ref, () => ({
    seek(ms) {
      const a = el.current;
      if (!a) return;
      a.currentTime = ms / 1000;
      void a.play();
    },
    pause: () => el.current?.pause(),
  }));

  // หยุดเองเมื่อเล่นเลยช่วงของ claim
  useEffect(() => {
    const a = el.current;
    if (!a || endMs == null) return;
    const onTime = () => {
      if (a.currentTime * 1000 >= endMs) a.pause();
    };
    a.addEventListener("timeupdate", onTime);
    return () => a.removeEventListener("timeupdate", onTime);
  }, [endMs]);

  const toggle = useCallback(() => {
    const a = el.current;
    if (!a) return;
    if (a.paused) {
      if (startMs != null && a.currentTime * 1000 < startMs) a.currentTime = startMs / 1000;
      void a.play();
    } else a.pause();
  }, [startMs]);

  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = el.current;
    if (!a || !dur) return;
    const r = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - r.left) / r.width) * dur;
  };

  const progress = dur ? t / dur : 0;

  return (
    <div
      data-clip-id={clipId}
      className={clsx(
        "flex items-center gap-3 rounded-2xl border border-paper-300 bg-paper-50",
        compact ? "px-2.5 py-1.5" : "p-3"
      )}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "หยุด" : label ? `ฟังเสียงต้นฉบับ: ${label}` : "ฟังเสียงต้นฉบับ"}
        className={clsx(
          "grid shrink-0 place-items-center rounded-full bg-earth-900 text-paper-50 transition hover:bg-earth-800",
          compact ? "h-7 w-7" : "h-10 w-10"
        )}
      >
        {playing ? <Pause size={compact ? 13 : 17} /> : <Play size={compact ? 13 : 17} />}
      </button>

      <div
        onClick={scrub}
        role="slider"
        aria-label="ตำแหน่งการเล่น"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        className={clsx(
          "flex flex-1 cursor-pointer items-center gap-[2px]",
          compact ? "h-6" : "h-10"
        )}
      >
        {(peaks ?? Array.from({ length: BARS }, () => 0.3)).map((p, i) => (
          <span
            key={i}
            className={clsx(
              "flex-1 rounded-full transition-colors",
              i / BARS <= progress ? "bg-gold-500" : "bg-paper-300"
            )}
            style={{ height: `${Math.round(p * 100)}%`, minHeight: 2 }}
          />
        ))}
      </div>

      <span
        className={clsx(
          "shrink-0 tabular-nums text-earth-500",
          compact ? "text-[11px]" : "text-xs"
        )}
      >
        {fmt(t)} / {fmt(dur)}
      </span>

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
