"use client";

/**
 * โหมดสัมภาษณ์ครอบครัว — หัวใจของ demo
 *
 * เส้นทาง: เลือกคำถาม → อัด (1-3 นาที) → AI ถอดเสียง + ดึง claim + เสนอคำถามต่อ
 *
 * สามอย่างที่หน้านี้ต้องสื่อให้กรรมการเห็นภายใน 60 วินาที:
 *   1. ขนาดไฟล์สดบนจอ → ตอบคำถาม mentor ว่า "กินแบตกับเน็ตไหม"
 *   2. การ์ด claim ที่ติดป้าย "ตรวจแล้ว" → เราไม่ได้เชื่อ AI ลอย ๆ
 *   3. ตัวเลข "ทิ้งไป N เพราะตรวจไม่ผ่าน" → ระบบจับ AI ตัวเองได้
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  CloudUpload,
  Loader2,
  Mic,
  Square,
  Trash2,
} from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import StatPill from "@/components/StatPill";
import { Button, Card, LiveWaveform, Notice } from "@/components/ui";
import {
  estimateBytes,
  fmtBytes,
  fmtDuration,
  MAX_CLIP_MS,
  queueAdd,
  queueAll,
  queueRemove,
  useRecorder,
} from "@/lib/recorder";
import type { Clip, Session, Topic } from "@/lib/types";

type Mode = { gemini: string; storage: string };

export default function InterviewClient({
  session,
  topic,
  mode,
}: {
  session: Session;
  topic: Topic;
  mode: Mode;
}) {
  const router = useRouter();
  const rec = useRecorder();

  const [qIndex, setQIndex] = useState(0);
  const [customQ, setCustomQ] = useState<string | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [dropped, setDropped] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [composing, setComposing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [queued, setQueued] = useState(0);

  const question = customQ ?? topic.questions[qIndex]?.text ?? "เล่าเรื่องนี้ให้ฟังหน่อยได้ไหมคะ";
  const lastClip = clips.at(-1) ?? null;
  const blobUrl = useRef<string | null>(null);

  // ขนาดไฟล์ระหว่างอัดต้องประมาณจาก bitrate เพราะ Blob ยังไม่ปิด
  const liveBytes = estimateBytes(rec.ms);

  const refreshQueue = useCallback(async () => {
    setQueued((await queueAll())?.length ?? 0);
  }, []);
  useEffect(() => {
    void refreshQueue();
  }, [refreshQueue]);

  /** ส่งคลิปขึ้นวิเคราะห์ — ล้มเหลวแล้วไม่ทิ้ง ต้องเข้าคิวไว้ */
  const send = useCallback(
    async (blob: Blob, durationMs: number, q: string) => {
      setAnalyzing(true);
      setErr(null);
      try {
        const fd = new FormData();
        fd.set("audio", blob, "clip.webm");
        fd.set("question", q);
        fd.set("sessionId", session.id);
        fd.set("durationMs", String(durationMs));

        const res = await fetch("/api/analyze", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "วิเคราะห์เสียงไม่สำเร็จ");

        setClips((c) => [...c, json.clip as Clip]);
        setDropped((d) => d + (json.droppedClaims ?? 0));
        rec.reset();
        // เลื่อนไปคำถามถัดไปให้เอง เพื่อให้หลานไม่ต้องคิดว่าจะกดอะไรต่อ
        setCustomQ(null);
        setQIndex((i) => Math.min(i + 1, topic.questions.length - 1));
        return true;
      } catch (e) {
        // เน็ตหลุดกลางบ้านต่างจังหวัด — เรื่องที่ท่านเล่าต้องไม่หาย
        await queueAdd({
          id: crypto.randomUUID(),
          sessionId: session.id,
          question: q,
          durationMs,
          blob,
          createdAt: Date.now(),
        });
        await refreshQueue();
        setErr(
          (e instanceof Error ? e.message : "ส่งไม่สำเร็จ") +
            " — เก็บคลิปไว้ในเครื่องแล้ว กดส่งคิวอีกครั้งได้เมื่อเน็ตกลับมา"
        );
        return false;
      } finally {
        setAnalyzing(false);
      }
    },
    [session.id, topic.questions.length, rec, refreshQueue]
  );

  async function flushQueue() {
    const items = (await queueAll()) ?? [];
    for (const it of items) {
      const ok = await send(it.blob, it.durationMs, it.question);
      if (ok) await queueRemove(it.id);
      else break; // ยังส่งไม่ได้ หยุดก่อน ไม่ต้องรัวให้เสียเวลา
    }
    await refreshQueue();
  }

  async function compose() {
    setComposing(true);
    setErr(null);
    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          title: topic.title,
          elderName: session.elderName,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "เรียบเรียงไม่สำเร็จ");
      router.push(`/review/${json.chapter.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "เรียบเรียงไม่สำเร็จ");
      setComposing(false);
    }
  }

  if (rec.blob && !blobUrl.current) blobUrl.current = URL.createObjectURL(rec.blob);
  if (!rec.blob) blobUrl.current = null;

  const verifiedCount = clips.flatMap((c) => c.claims).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-earth-500">
            {topic.icon} {topic.title}
          </p>
          <h1 className="font-serif text-2xl text-earth-900">
            กำลังฟัง{session.elderName}เล่า
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatPill label="เรื่องที่เก็บแล้ว" value={clips.length} />
          <StatPill label="ข้อมูลที่ตรวจแล้ว" value={verifiedCount} tone="good" />
          {dropped > 0 && (
            <StatPill label="AI แต่งเกิน ถูกทิ้ง" value={dropped} tone="warn" />
          )}
        </div>
      </header>

      {mode.gemini === "mock" && (
        <div className="mb-5">
          <Notice tone="warn">
            โหมดสาธิต — ยังไม่ได้ต่อ Gemini จริง ผลที่เห็นเป็นข้อมูลตัวอย่าง
          </Notice>
        </div>
      )}

      {/* ── คำถาม ── */}
      <Card>
        <p className="mb-1.5 text-sm text-earth-500">
          คำถามที่ {qIndex + 1} จาก {topic.questions.length} — อ่านให้ท่านฟังแล้วกดอัด
        </p>
        <p className="font-serif text-2xl leading-relaxed text-earth-900">{question}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {topic.questions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQIndex(i);
                setCustomQ(null);
              }}
              title={q.text}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === qIndex && !customQ ? "bg-gold-400" : "bg-paper-300 hover:bg-paper-300"
              }`}
              aria-label={`ไปคำถามที่ ${i + 1}`}
            />
          ))}
        </div>
      </Card>

      {/* ── อัด ── */}
      <Card className="mt-5">
        {rec.state === "recording" && (
          <>
            <LiveWaveform level={rec.level} active />
            <div className="mb-4 flex items-center justify-center gap-4 text-sm">
              <span className="tabular-nums text-earth-900">{fmtDuration(rec.ms)}</span>
              <span className="text-earth-500">·</span>
              {/* ตัวเลขนี้คือคำตอบของคำถาม mentor เรื่องเน็ตกับแบต */}
              <span className="tabular-nums text-earth-700">ประมาณ {fmtBytes(liveBytes)}</span>
              <span className="text-earth-500">·</span>
              <span className="text-earth-500">
                หยุดเองที่ {fmtDuration(MAX_CLIP_MS)}
              </span>
            </div>
          </>
        )}

        {rec.state !== "done" ? (
          <div className="flex flex-col items-center gap-4">
            {rec.state === "recording" ? (
              <Button variant="danger" size="lg" onClick={rec.stop}>
                <Square size={18} /> หยุดอัด
              </Button>
            ) : (
              <Button size="lg" onClick={rec.start} disabled={analyzing}>
                <Mic size={18} /> กดอัดคำตอบ
              </Button>
            )}
            <label className="cursor-pointer text-sm text-earth-700 underline decoration-paper-400 hover:text-earth-900">
              หรืออัปโหลดไฟล์เสียง
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && rec.useFile(e.target.files[0])}
              />
            </label>
            <p className="max-w-md text-center text-xs text-earth-500">
              อัดทีละคำถาม ไม่ต้องเปิดแอปทิ้งไว้ — เสียง 3 นาทีใช้เน็ตประมาณ 0.7 MB
              และจะอัปโหลดหลังกดหยุดเท่านั้น
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blobUrl.current && (
              <AudioPlayer src={blobUrl.current} clipId="draft" label="คำตอบที่เพิ่งอัด" />
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                disabled={analyzing}
                onClick={() => rec.blob && send(rec.blob, rec.ms, question)}
              >
                {analyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> AI กำลังฟัง…
                  </>
                ) : (
                  <>
                    <CloudUpload size={16} /> ส่งให้ AI ถอดเสียง
                  </>
                )}
              </Button>
              <span className="text-sm text-earth-700">
                {rec.blob ? fmtBytes(rec.blob.size) : ""}
              </span>
              <Button variant="quiet" size="sm" onClick={rec.reset} disabled={analyzing}>
                <Trash2 size={14} /> อัดใหม่
              </Button>
            </div>
          </div>
        )}

        {err && (
          <div className="mt-4">
            <Notice tone="error">{err}</Notice>
          </div>
        )}

        {queued > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Notice tone="warn">
              มีคลิปรออัปโหลด {queued} คลิป เก็บไว้ในเครื่องแล้ว เรื่องของท่านไม่หาย
            </Notice>
            <Button variant="ghost" size="sm" onClick={flushQueue} disabled={analyzing}>
              ส่งคิวอีกครั้ง
            </Button>
          </div>
        )}
      </Card>

      {/* ── ผลจาก AI ── */}
      {lastClip && (
        <Card className="mt-5">
          <h2 className="mb-3 text-sm text-earth-500">
            สิ่งที่ AI ได้ยินจากคำตอบล่าสุด
          </h2>
          <p className="mb-5 rounded-xl border border-paper-300 bg-paper-200 p-4 leading-relaxed text-earth-800">
            {lastClip.transcript}
          </p>

          <h3 className="mb-2 text-sm text-earth-500">
            ข้อมูลที่ดึงได้ — ทุกข้อตรวจแล้วว่ามีถ้อยคำนี้ในเสียงจริง
          </h3>
          <ul className="space-y-2">
            {lastClip.claims.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-verified-400/25 bg-verified-600/10 p-3"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="mt-1 shrink-0 text-verified-400"
                    aria-label="ตรวจแล้ว"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-earth-900">{c.summary}</p>
                    <p className="mt-1 text-sm text-earth-700">“{c.quote}”</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {dropped > 0 && (
            <p className="mt-4 flex items-start gap-2 text-sm text-warn-200">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              ทิ้งไป {dropped} ข้อ เพราะ AI เขียนถ้อยคำที่ไม่มีอยู่ในเสียงจริง
              ระบบตรวจด้วยโค้ดแล้วคัดออกเอง
            </p>
          )}

          {lastClip.nextQuestions.length > 0 && (
            <>
              <h3 className="mt-6 mb-2 text-sm text-earth-500">
                AI เสนอคำถามต่อ — กดเลือกข้อที่อยากถาม
              </h3>
              <div className="flex flex-col gap-2">
                {lastClip.nextQuestions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCustomQ(q)}
                    className="rounded-xl border border-paper-300 bg-paper-200 px-4 py-3 text-left text-earth-800 transition hover:border-gold-400/60 hover:bg-paper-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {/* ── เรียบเรียง ── */}
      {clips.length > 0 && (
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Button size="lg" onClick={compose} disabled={composing}>
            {composing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> กำลังเรียบเรียง…
              </>
            ) : (
              <>
                <BookOpen size={18} /> เรียบเรียงเป็นบทหนังสือ
              </>
            )}
          </Button>
          <span className="text-sm text-earth-500">
            จากเรื่องที่เก็บไว้ {clips.length} เรื่อง · ครอบครัวจะได้ตรวจก่อนพิมพ์
          </span>
        </div>
      )}
    </main>
  );
}
