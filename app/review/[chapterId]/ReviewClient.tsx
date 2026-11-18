"use client";

/**
 * หน้าตรวจ — มนุษย์เป็นคนตัดสินใจ AI ไม่มีสิทธิ์พิมพ์อะไรเอง
 *
 * 4 อย่างที่หน้านี้ทำ และทั้ง 4 คือคำตอบของสิ่งที่ mentor ถาม:
 *
 * 1. ไฮไลต์เหลือง — ประโยคที่ระบบจับได้ว่า AI เขียนเกินจากเสียงต้นฉบับ
 * 2. คลิกย่อหน้า → เสียงจริงเล่นที่วินาทีนั้น (หลักฐานว่าไม่ได้แต่ง)
 * 3. แก้คำที่ถอดผิด → เข้า dataset ภาษาถิ่น (mentor แนะเรื่องนี้ตรง ๆ)
 * 4. ปุ่มลืม → ลบคลิป claim ย่อหน้า และ correction พร้อมกัน
 */

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  Loader2,
  Pencil,
  ShieldCheck,
  Volume2,
  X,
} from "lucide-react";
import AudioPlayer, { type AudioPlayerHandle } from "@/components/AudioPlayer";
import Highlight from "@/components/Highlight";
import StatPill from "@/components/StatPill";
import { Button, Card, Notice, inputClass } from "@/components/ui";
import { indexClaims, paragraphAudioAnchor } from "@/lib/verify";
import type { Chapter, Clip, Paragraph, Region } from "@/lib/types";

/** ดึงข้อความในเครื่องหมายคำพูดออกจาก flag เพื่อเอาไปไฮไลต์ในย่อหน้า */
function flaggedFragments(flags: string[]): string[] {
  return flags
    .map((f) => f.match(/["“”'](.+?)["“”']/)?.[1]?.trim())
    .filter((s): s is string => Boolean(s && s.length > 3));
}

/** ตัดข้อความออกเป็นชิ้น แล้วบอกว่าชิ้นไหนต้องไฮไลต์ */
function splitByFragments(text: string, frags: string[]) {
  let parts: { text: string; warn: boolean }[] = [{ text, warn: false }];
  for (const frag of frags) {
    parts = parts.flatMap((p) => {
      if (p.warn) return [p];
      const i = p.text.indexOf(frag);
      if (i < 0) return [p];
      return [
        { text: p.text.slice(0, i), warn: false },
        { text: frag, warn: true },
        { text: p.text.slice(i + frag.length), warn: false },
      ].filter((x) => x.text.length > 0);
    });
  }
  return parts;
}

export default function ReviewClient({
  chapter: initialChapter,
  clips: initialClips,
  elderName,
  region,
  initialPairs,
  siteUrl,
}: {
  chapter: Chapter;
  clips: Clip[];
  elderName: string;
  region?: Region;
  initialPairs: number;
  siteUrl: string;
}) {
  const [chapter, setChapter] = useState(initialChapter);
  const [clips, setClips] = useState(initialClips);
  const [pairs, setPairs] = useState(initialPairs);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [approved, setApproved] = useState(initialChapter.approved);

  const players = useRef<Record<string, AudioPlayerHandle | null>>({});

  const allClaims = useMemo(() => clips.flatMap((c) => c.claims), [clips]);
  const byId = useMemo(() => indexClaims(allClaims), [allClaims]);
  /** claimId → clip ที่เป็นเจ้าของ เพื่อรู้ว่าต้องสั่งเครื่องเล่นตัวไหน */
  const clipOfClaim = useMemo(() => {
    const m: Record<string, Clip> = {};
    for (const c of clips) for (const cl of c.claims) m[cl.id] = c;
    return m;
  }, [clips]);

  const flaggedCount = chapter.paragraphs.filter((p) => p.flags.length > 0).length;

  /** คลิกย่อหน้า → เล่นเสียงต้นฉบับที่วินาทีที่ประโยคนั้นมา */
  function playParagraph(p: Paragraph) {
    const anchor = paragraphAudioAnchor(p, byId);
    if (!anchor) return;
    const clip = clipOfClaim[anchor.id];
    if (!clip) return;
    players.current[clip.id]?.seek(anchor.startMs);
    setNote(`กำลังเล่นเสียงต้นฉบับของย่อหน้านี้ — "${clip.question}"`);
  }

  async function saveParagraph(id: string) {
    setBusy(true);
    setErr(null);
    try {
      const next = chapter.paragraphs.map((p) =>
        p.id === id ? { ...p, text: draft.trim(), flags: [] } : p
      );
      const res = await fetch("/api/chapter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: chapter.id, paragraphs: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "บันทึกไม่สำเร็จ");
      setChapter(json.chapter);
      setEditing(null);
      setNote("บันทึกการแก้แล้ว — ไฮไลต์ของย่อหน้านี้ถูกปลดเพราะคนตรวจแล้ว");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function approve() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/chapter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: chapter.id, approved: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "ยืนยันไม่สำเร็จ");
      setChapter(json.chapter);
      setApproved(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "ยืนยันไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function forget(clip: Clip) {
    if (
      !confirm(
        `ลบคำตอบของคำถาม "${clip.question}" ออกทั้งหมดถาวร?\n\nจะลบไฟล์เสียง ข้อมูลที่ดึงไว้ ย่อหน้าในหนังสือที่อ้างคลิปนี้ และข้อมูลการแก้คำที่ผูกกับคลิปนี้ — กู้คืนไม่ได้`
      )
    )
      return;

    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/forget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clipId: clip.id,
          sessionId: chapter.sessionId,
          chapterId: chapter.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "ลบไม่สำเร็จ");
      setClips((cs) => cs.filter((c) => c.id !== clip.id));
      if (json.chapter) setChapter(json.chapter);
      setPairs((n) => Math.max(0, n - (json.removedCorrections ?? 0)));
      setNote(
        `ลบแล้ว — ย่อหน้าในหนังสือหายไป ${json.removedParagraphs} ย่อหน้า และข้อมูลการแก้คำ ${json.removedCorrections ?? 0} รายการ`
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "ลบไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-sm text-earth-500">ครอบครัวตรวจก่อนพิมพ์</p>
        <h1 className="font-serif text-3xl text-earth-900">{chapter.title}</h1>
        <p className="mt-1 text-earth-700">เรื่องของ{elderName}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatPill
            label="ย่อหน้าที่มีหลักฐาน"
            value={`${chapter.paragraphs.length}/${chapter.paragraphs.length}`}
            tone="good"
          />
          {flaggedCount > 0 && (
            <StatPill label="ต้องตรวจ" value={flaggedCount} tone="warn" />
          )}
          <StatPill label="คู่คำภาษาถิ่นที่เก็บได้" value={pairs} />
        </div>
      </header>

      {flaggedCount > 0 && (
        <div className="mb-5">
          <Notice tone="warn">
            <strong className="text-warn-200">
              มี {flaggedCount} ย่อหน้าที่ระบบจับได้ว่า AI เขียนเกินจากเสียงต้นฉบับ
            </strong>{" "}
            — ส่วนที่ขีดเส้นหยักคือคำที่ไม่มีอยู่ในเสียงจริง กดฟังเทียบแล้วแก้หรือลบได้
          </Notice>
        </div>
      )}

      {note && (
        <div className="mb-5">
          <Notice>{note}</Notice>
        </div>
      )}
      {err && (
        <div className="mb-5">
          <Notice tone="error">{err}</Notice>
        </div>
      )}

      {/* ── บทหนังสือ ── */}
      <Card>
        <div className="space-y-5">
          {chapter.paragraphs.map((p) => {
            const frags = flaggedFragments(p.flags);
            const anchor = paragraphAudioAnchor(p, byId);
            const isEditing = editing === p.id;

            return (
              <div
                key={p.id}
                className={`rounded-xl border p-4 transition ${
                  p.flags.length > 0
                    ? "border-warn-500/40 bg-warn-900/10"
                    : "border-paper-300 hover:border-paper-300"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      className={`${inputClass} min-h-28 font-serif text-lg leading-relaxed`}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveParagraph(p.id)} disabled={busy}>
                        <Check size={14} /> บันทึก
                      </Button>
                      <Button size="sm" variant="quiet" onClick={() => setEditing(null)}>
                        <X size={14} /> ยกเลิก
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-serif text-lg leading-relaxed text-earth-900">
                      {splitByFragments(p.text, frags).map((part, i) =>
                        part.warn ? (
                          <Highlight key={i} level="warn" reason={p.flags[0]}>
                            {part.text}
                          </Highlight>
                        ) : (
                          <span key={i}>{part.text}</span>
                        )
                      )}
                    </p>

                    {p.flags.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {p.flags.map((f, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-warn-200"
                          >
                            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {anchor && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => playParagraph(p)}
                          title={`เล่นที่ ${(anchor.startMs / 1000).toFixed(1)} วินาที`}
                        >
                          <Volume2 size={14} /> ฟังเสียงต้นฉบับของย่อหน้านี้
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="quiet"
                        onClick={() => {
                          setEditing(p.id);
                          setDraft(p.text);
                        }}
                      >
                        <Pencil size={14} /> แก้ข้อความ
                      </Button>
                      <span className="text-xs text-earth-500">
                        อ้างอิง {p.claimIds.length} ข้อจากเสียงจริง
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── เสียงต้นฉบับ + แก้คำที่ถอดผิด ── */}
      <h2 className="mt-9 mb-3 font-serif text-xl text-earth-900">เสียงต้นฉบับทั้งหมด</h2>
      <div className="space-y-4">
        {clips.map((clip) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            region={region}
            registerPlayer={(h) => (players.current[clip.id] = h)}
            onForget={() => forget(clip)}
            onCorrection={() => setPairs((n) => n + 1)}
            busy={busy}
          />
        ))}
      </div>

      {/* ── ยืนยัน ── */}
      <Card className="mt-9">
        <h2 className="flex items-center gap-2 font-serif text-xl text-earth-900">
          <ShieldCheck size={20} className="text-verified-400" /> ยืนยันก่อนทำหนังสือ
        </h2>
        <p className="mt-2 text-earth-700">
          AI ไม่มีสิทธิ์พิมพ์อะไรเองทั้งสิ้น หนังสือจะสร้างได้เมื่อคนในครอบครัวกดยืนยันเท่านั้น
        </p>

        {approved ? (
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <a
              href={`/book/${chapter.shareToken}`}
              className="inline-flex items-center gap-2 rounded-xl bg-earth-900 px-6 py-3.5 text-lg font-medium text-paper-50 hover:bg-gold-300"
            >
              <BookOpen size={18} /> เปิดหนังสือ
            </a>
            <span className="break-all text-sm text-earth-500">
              {siteUrl}/book/{chapter.shareToken}
            </span>
          </div>
        ) : (
          <div className="mt-5">
            <Button size="lg" onClick={approve} disabled={busy}>
              {busy ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> กำลังยืนยัน…
                </>
              ) : (
                <>
                  <Check size={18} /> ตรวจแล้ว ยืนยันเนื้อหานี้
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </main>
  );
}

/* ───────────────── การ์ดเสียง 1 คลิป + ฟอร์มแก้คำที่ถอดผิด ───────────────── */

function ClipCard({
  clip,
  region,
  registerPlayer,
  onForget,
  onCorrection,
  busy,
}: {
  clip: Clip;
  region?: Region;
  registerPlayer: (h: AudioPlayerHandle | null) => void;
  onForget: () => void;
  onCorrection: () => void;
  busy: boolean;
}) {
  const [wrong, setWrong] = useState("");
  const [right, setRight] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit() {
    setSending(true);
    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asrText: wrong,
          humanText: right,
          region,
          clipId: clip.id,
          optIn,
        }),
      });
      const json = await res.json();
      if (json.saved) {
        setSaved(`เก็บไว้แล้ว — "${wrong}" → "${right}"`);
        setWrong("");
        setRight("");
        onCorrection();
      } else {
        setSaved(json.reason ?? json.error ?? "ยังไม่ได้เก็บ");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <p className="mb-3 text-earth-700">{clip.question}</p>
      <AudioPlayer
        ref={registerPlayer}
        src={clip.audioUrl}
        clipId={clip.id}
        label={clip.question}
      />
      <p className="mt-3 text-sm leading-relaxed text-earth-700">{clip.transcript}</p>

      <details className="group mt-4">
        <summary className="cursor-pointer text-sm text-gold-300 hover:text-gold-400">
          AI ถอดคำไหนผิด? ช่วยแก้ให้เราหน่อย
        </summary>
        <div className="mt-3 space-y-3 rounded-xl border border-paper-300 bg-paper-200 p-4">
          <p className="text-xs text-earth-500">
            ทุกคำที่คุณแก้ทำให้เราถอดเสียงภาษาถิ่นได้แม่นขึ้นสำหรับครอบครัวอื่น
            — เราเก็บเฉพาะคู่ข้อความ ไม่เก็บเสียงและไม่เก็บชื่อ
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-earth-500">AI ถอดว่า</span>
              <input
                className={inputClass}
                value={wrong}
                onChange={(e) => setWrong(e.target.value)}
                placeholder="ซาวด์บาท"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-earth-500">ที่จริงท่านพูดว่า</span>
              <input
                className={inputClass}
                value={right}
                onChange={(e) => setRight(e.target.value)}
                placeholder="ซาวบาท"
              />
            </label>
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-xs text-earth-700">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              ยินยอมให้เก็บช่วงเสียงของคำนี้ไว้พัฒนาการถอดเสียงภาษาถิ่นด้วย
              (ไม่ติ๊กก็ช่วยเราได้ เพราะเราเก็บคู่ข้อความอยู่แล้ว)
            </span>
          </label>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={submit}
              disabled={busy || sending || !wrong.trim() || !right.trim()}
            >
              {sending ? "กำลังเก็บ…" : "ส่งคำที่แก้"}
            </Button>
            {saved && <span className="text-xs text-verified-400">{saved}</span>}
          </div>
        </div>
      </details>

      <div className="mt-4 border-t border-paper-300 pt-3">
        <Button size="sm" variant="danger" onClick={onForget} disabled={busy}>
          ลืมเรื่องนี้ทั้งหมด
        </Button>
        <p className="mt-2 text-xs text-earth-500">
          ถ้าท่านเผลอเล่าเรื่องที่ไม่อยากให้บันทึก กดนี่แล้วหายทั้งเสียง ข้อความ และย่อหน้าในหนังสือ
        </p>
      </div>
    </Card>
  );
}
