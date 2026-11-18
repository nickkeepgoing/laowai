"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import AudioPlayer, { type AudioPlayerHandle } from "@/components/AudioPlayer";
import type { Clip } from "@/lib/types";

export default function ClipPlayer({
  clips,
  elderName,
  relation,
  chapterTitle,
  startMs,
}: {
  clips: Clip[];
  elderName: string;
  relation: string;
  chapterTitle: string;
  startMs?: number;
}) {
  const first = useRef<AudioPlayerHandle | null>(null);
  const [open, setOpen] = useState<string | null>(clips[0]?.id ?? null);

  // มาจาก QR ข้างย่อหน้า → เลื่อนไปวินาทีนั้นให้เลย ไม่ต้องให้ผู้ใช้หา
  useEffect(() => {
    if (startMs != null && Number.isFinite(startMs)) {
      const id = setTimeout(() => first.current?.seek(startMs), 400);
      return () => clearTimeout(id);
    }
  }, [startMs]);

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <header className="text-center">
        <p className="text-xs tracking-[0.25em] text-cream-500 uppercase">เล่าไว้</p>
        <h1 className="mt-4 font-serif text-3xl text-cream-50">{elderName}</h1>
        {relation && <p className="mt-1 text-cream-300">{relation}</p>}
        <div className="mx-auto my-6 h-px w-12 bg-cream-500/30" />
        <h2 className="font-serif text-lg text-cream-100">{chapterTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-cream-500">
          นี่คือเสียงจริงของท่าน ไม่ได้สังเคราะห์ขึ้น
        </p>
      </header>

      <div className="mt-9 space-y-3">
        {clips.map((clip, i) => (
          <section
            key={clip.id}
            className="rounded-2xl border border-cream-500/15 bg-ink-900/70 p-4"
          >
            <p className="mb-3 text-cream-100">{clip.question}</p>

            <AudioPlayer
              ref={i === 0 ? first : undefined}
              src={clip.audioUrl}
              clipId={clip.id}
              label={clip.question}
              startMs={i === 0 ? startMs : undefined}
            />

            <button
              type="button"
              onClick={() => setOpen(open === clip.id ? null : clip.id)}
              className="mt-3 inline-flex items-center gap-1 text-sm text-cream-500 hover:text-cream-300"
            >
              <ChevronDown
                size={14}
                className={`transition ${open === clip.id ? "rotate-180" : ""}`}
              />
              {open === clip.id ? "ซ่อนข้อความ" : "อ่านตามไปด้วย"}
            </button>

            {open === clip.id && (
              <p className="mt-3 text-sm leading-[1.9] text-cream-300">{clip.transcript}</p>
            )}
          </section>
        ))}
      </div>

      <p className="mt-10 text-center text-xs leading-relaxed text-cream-500">
        ครอบครัวเป็นเจ้าของเสียงนี้ และเพิกถอนลิงก์นี้ได้ทุกเมื่อ
      </p>
    </main>
  );
}
