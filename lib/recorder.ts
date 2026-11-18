"use client";

/**
 * อัดเสียงในเบราว์เซอร์ + คิวอัปโหลดใน IndexedDB
 *
 * ออกแบบมาเพื่อตอบคำถามที่ mentor ถามแล้วทีมตอบไม่ได้:
 * "เปิดแอปทิ้งเป็นชั่วโมงเพื่ออัด มันกินแบตกับเน็ตไหม"
 *
 * คำตอบในตัวสถาปัตยกรรม:
 *   1. ไม่มีการเปิดไมค์ทิ้งไว้เป็นชั่วโมง — อัดทีละคำถาม 1-3 นาทีแล้วหยุด
 *   2. opus 32 kbps → 3 นาที ≈ 0.7 MB (โชว์ตัวเลขสดบนจอให้ผู้ใช้เห็นเอง)
 *   3. ไม่สตรีมขึ้นเน็ตตอนอัด — อัดเก็บในเครื่องก่อน แล้วค่อยอัปโหลด
 *   4. อัปโหลดไม่สำเร็จ → เข้าคิวใน IndexedDB ไม่เสียเรื่องที่ท่านเล่า
 *      (บ้านที่มีผู้สูงอายุมักเน็ตไม่ดี ข้อนี้คือความเป็นไปได้จริง ไม่ใช่ลูกเล่น)
 */

import { useCallback, useEffect, useRef, useState } from "react";

/** 32 kbps พอสำหรับเสียงพูด และทำให้ไฟล์เล็กพอสำหรับเน็ตบ้านนอก */
export const AUDIO_BITRATE = 32_000;

/** จำกัดความยาวต่อคลิป ตรงกับที่ /api/analyze ปฏิเสธคลิปเกิน 5 นาที */
export const MAX_CLIP_MS = 3 * 60_000;

export function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";
  for (const t of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

export const fmtDuration = (ms: number) =>
  `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

export const fmtBytes = (b: number) =>
  b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

/** ประมาณขนาดไฟล์จาก bitrate — ใช้โชว์สดระหว่างอัด ก่อนที่ Blob จะปิด */
export const estimateBytes = (ms: number) => Math.round((ms / 1000) * (AUDIO_BITRATE / 8));

/* ──────────────────────────── React hook ──────────────────────────── */

export type RecorderState = "idle" | "recording" | "done" | "error";

export function useRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [ms, setMs] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** ระดับเสียงสด 0-1 สำหรับวาด waveform */
  const [level, setLevel] = useState(0);

  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const raf = useRef<number | null>(null);
  const t0 = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (raf.current) cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop()); // ปล่อยไมค์ ไฟแสดงสถานะดับ = ไม่กินแบตต่อ
    void audioCtx.current?.close();
    timer.current = null;
    raf.current = null;
    stream.current = null;
    audioCtx.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async () => {
    setError(null);
    setBlob(null);
    setMs(0);
    chunks.current = [];

    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          // ผู้สูงอายุพูดเบา ต้องให้เบราว์เซอร์ช่วยดันระดับเสียงขึ้น
          autoGainControl: true,
        },
      });
      stream.current = s;

      const mimeType = pickMimeType();
      const r = new MediaRecorder(s, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: AUDIO_BITRATE,
      });
      rec.current = r;

      r.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      r.onstop = () => {
        setBlob(new Blob(chunks.current, { type: mimeType || "audio/webm" }));
        setState("done");
        cleanup();
      };

      // วัดระดับเสียงสดไว้วาด waveform ให้เห็นว่าไมค์ได้ยินจริง
      const ctx = new AudioContext();
      audioCtx.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(s).connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let peak = 0;
        for (const v of buf) peak = Math.max(peak, Math.abs(v - 128) / 128);
        setLevel(peak);
        raf.current = requestAnimationFrame(tick);
      };
      tick();

      r.start(1000);
      t0.current = Date.now();
      setState("recording");

      timer.current = setInterval(() => {
        const d = Date.now() - t0.current;
        setMs(d);
        if (d >= MAX_CLIP_MS) r.stop(); // หยุดเองกันลืม
      }, 200);
    } catch (e) {
      setState("error");
      setError(
        e instanceof Error && e.name === "NotAllowedError"
          ? "เบราว์เซอร์ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน — กดอนุญาตที่แถบที่อยู่ หรือใช้ปุ่มอัปโหลดไฟล์แทน"
          : "เปิดไมโครโฟนไม่ได้ ใช้ปุ่มอัปโหลดไฟล์แทนได้เลย"
      );
    }
  }, [cleanup]);

  const stop = useCallback(() => {
    if (rec.current?.state === "recording") rec.current.stop();
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setMs(0);
    setBlob(null);
    setError(null);
    setLevel(0);
  }, []);

  /** ใช้ไฟล์ที่ผู้ใช้เลือกเองแทนการอัดสด — ทางหนีตายตอน demo */
  const useFile = useCallback((f: File) => {
    setBlob(f);
    setMs(0);
    setState("done");
    setError(null);
  }, []);

  return { state, ms, blob, error, level, start, stop, reset, useFile };
}

/* ─────────────────── คิวอัปโหลดใน IndexedDB ───────────────────
 * เน็ตหลุดตอนกดส่ง → เรื่องที่ท่านเล่าต้องไม่หาย
 */

const DB = "laowai";
const STORE = "pending";

export type PendingClip = {
  id: string;
  sessionId: string;
  question: string;
  durationMs: number;
  blob: Blob;
  createdAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** IndexedDB ใช้ไม่ได้ในบางโหมด (private window) → ต้องไม่ทำให้แอปพัง */
async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T | null> {
  try {
    const db = await openDb();
    return await new Promise<T | null>((resolve) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export const queueAdd = (c: PendingClip) => tx<IDBValidKey>("readwrite", (s) => s.put(c));
export const queueAll = () => tx<PendingClip[]>("readonly", (s) => s.getAll());
export const queueRemove = (id: string) => tx<undefined>("readwrite", (s) => s.delete(id));
