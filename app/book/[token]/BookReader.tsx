"use client";

/**
 * เครื่องอ่านหนังสือชีวิต — เปิดทีละหน้าเหมือนหนังสือจริง
 *
 * ทำไมไม่ปล่อยให้เลื่อนยาวแบบเดิม:
 * สิ่งที่ครอบครัวจ่ายเงินซื้อคือ "ของที่ระลึก" ไม่ใช่ไฟล์เอกสาร
 * ความรู้สึกตอนเปิดหน้าแรกจึงเป็นส่วนหนึ่งของสินค้า ไม่ใช่ของตกแต่ง
 *
 * วิธีทำให้พลิกได้จริง (sheet model):
 *   กระดาษ 1 แผ่นมีสองหน้า — หน้าขวาของคู่ที่ n และหน้าซ้ายของคู่ที่ n+1
 *   พลิกแผ่น = หมุน rotateY(-180deg) รอบสัน แล้วหน้าหลังจะไปอยู่ทางซ้าย
 *   เรียงลำดับทับกันด้วย z-index: แผ่นที่ยังไม่พลิกเรียงจากบนลงล่างทางขวา
 *   แผ่นที่พลิกแล้วเรียงสะสมทางซ้าย
 *
 * บนมือถือใช้ 1 หน้าต่อแผ่น (หลังเป็นกระดาษเปล่า) เพราะสองหน้าคู่จะเล็กจนอ่านไม่ออก
 *
 * ⚠️ QR แสดงเฉพาะตอนพิมพ์ บนจอใช้ปุ่มฟังเสียงแทน
 *    เพราะไม่มีใครสแกน QR บนจอตัวเองได้ และการกดฟังได้ทันทีคือจุดขายของเรา
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Pause, Play, Printer, Volume2 } from "lucide-react";
import QRBox from "@/components/QRBox";
import "../book.css";

export type ReaderParagraph = {
  id: string;
  text: string;
  /** ไฟล์เสียงต้นฉบับของย่อหน้านี้ — ไม่มีได้ถ้าคลิปถูกลบไปแล้ว */
  audioUrl?: string | null;
  startMs?: number;
};

export type BookReaderProps = {
  elderName: string;
  relation: string;
  chapterTitle: string;
  paragraphs: ReaderParagraph[];
  /** ลิงก์ฟังเสียงทั้งบท ใช้ทำ QR หน้าสุดท้าย */
  chapterUrl: string;
};

/** ชนิดของหน้าในเล่ม */
type Page =
  | { kind: "cover" }
  | { kind: "dedication" }
  | { kind: "chapter" }
  | { kind: "text"; items: ReaderParagraph[]; first: boolean }
  | { kind: "end" }
  | { kind: "blank" };

export default function BookReader({
  elderName,
  relation,
  chapterTitle,
  paragraphs,
  chapterUrl,
}: BookReaderProps) {
  const [twoUp, setTwoUp] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pageSize, setPageSize] = useState({ w: 420, h: 594 });
  const [textPages, setTextPages] = useState<ReaderParagraph[][] | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  /* ─────────── ขนาดหน้า: อิงสัดส่วน A5 (1 : 1.414) ─────────── */
  useLayoutEffect(() => {
    setMounted(true);
    const fit = () => {
      const el = stageRef.current;
      if (!el) return;
      const availW = el.clientWidth;
      // เผื่อที่ให้แถบเครื่องมือบนและปุ่มล่าง
      const availH = Math.max(380, window.innerHeight - 196);
      const spread = window.innerWidth >= 900;
      setTwoUp(spread);

      // ความกว้างที่หน้าหนึ่งหน้าใช้ได้ (ถ้าเปิดคู่ต้องหารสอง)
      const maxW = spread ? availW / 2 : availW;
      let h = availH;
      let w = h / 1.414;
      if (w > maxW) {
        w = maxW;
        h = w * 1.414;
      }
      setPageSize({ w: Math.floor(w), h: Math.floor(h) });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  /* ─────────── สัดส่วนตัวอักษรและขอบกระดาษ ───────────
   *
   * ⚠️ ค่าทุกตัวในนี้ต้องถูกใช้ "ทั้งตอนวัดและตอนแสดงผล"
   *
   * บั๊กที่เคยเกิด: ตอนแสดงผลใช้ clamp() ที่อิง vw แต่ตอนวัดคำนวณจากความกว้างหน้า
   * สองค่านี้ไม่เท่ากัน ข้อความจริงจึงสูงกว่าที่วัดไว้ แล้วล้นทะลุขอบล่างไปทับเลขหน้า
   * ทางแก้คือคำนวณเป็นตัวเลขที่เดียว แล้วส่งเข้าทั้งสองที่ด้วย inline style
   *
   * สัดส่วนขอบใช้แบบหนังสือจริง: ล่างมากกว่าบน เพื่อให้มีที่หายใจและวางเลขหน้า
   */
  const type = useMemo(() => {
    const { w, h } = pageSize;
    // ขั้นต่ำ 15px ไม่ใช่ 13 — หนังสือเล่มนี้มีผู้สูงอายุเป็นคนอ่านด้วย
    // ยอมให้พลิกหน้าบ่อยขึ้น ดีกว่าให้ท่านต้องเพ่ง
    const fs = Math.round(Math.min(17, Math.max(15, w * 0.034)) * 10) / 10;
    const padX = Math.round(Math.min(58, Math.max(24, w * 0.112)));
    const padTop = Math.round(padX * 1.12);
    const padBottom = Math.round(padX * 1.55); // เผื่อที่ให้เลขหน้า
    return {
      fs,
      lh: 1.95,
      /** ระยะห่างระหว่างย่อหน้า — น้อยกว่าของเดิม เพราะมีการย่อหน้าช่วยแบ่งแล้ว */
      gap: Math.round(fs * 0.62),
      /** ย่อหน้าแบบหนังสือ: ร่นบรรทัดแรกเข้ามา */
      indent: Math.round(fs * 1.7),
      padX,
      padTop,
      padBottom,
      colW: w - padX * 2,
      /* เผื่อที่ไว้ประมาณหนึ่งบรรทัดครึ่ง ไม่อัดย่อหน้าจนเต็มขอบพอดีเป๊ะ
       * เพราะการวัดกับการ render คลาดกันได้ระดับเศษพิกเซล
       * ถ้าเต็มพอดีแล้วคลาดนิดเดียว บรรทัดสุดท้ายจะทะลุลงไปทับเลขหน้า
       * และหน้าที่แน่นจนชิดขอบล่างก็อ่านแล้วอึดอัดอยู่แล้ว */
      usableH: h - padTop - padBottom - Math.round(fs * 1.95 * 1.5),
      /** ความสูงของหัวบทบนหน้าแรกของเนื้อเรื่อง */
      headH: Math.round(fs * 1.4 + fs * 1.6),
    };
  }, [pageSize]);

  /* ─────────── แบ่งหน้าโดย "วัดความสูงจริง" ───────────
   * ไม่ใช้การเดาจากจำนวนตัวอักษร เพราะภาษาไทยตัดบรรทัดไม่เท่ากัน
   * ย่อหน้าหนึ่งห้ามถูกผ่าครึ่ง เพราะปุ่มฟังเสียงผูกกับย่อหน้า
   */
  useLayoutEffect(() => {
    const box = measureRef.current;
    if (!box) return;
    const kids = Array.from(box.children) as HTMLElement[];
    if (kids.length !== paragraphs.length) return;

    const out: ReaderParagraph[][] = [];
    let cur: ReaderParagraph[] = [];
    let used = type.headH; // หน้าแรกของเนื้อเรื่องมีหัวบทกินที่อยู่

    kids.forEach((el, i) => {
      const hgt = el.getBoundingClientRect().height + type.gap;
      if (cur.length > 0 && used + hgt > type.usableH) {
        out.push(cur);
        cur = [];
        used = 0;
      }
      cur.push(paragraphs[i]);
      used += hgt;
    });
    if (cur.length) out.push(cur);
    setTextPages(out.length ? out : [[]]);
  }, [paragraphs, type]);

  /* ─────────── ประกอบหน้าทั้งเล่ม ─────────── */
  const pages = useMemo<Page[]>(() => {
    const body: Page[] =
      textPages?.map((items, i) => ({ kind: "text" as const, items, first: i === 0 })) ?? [];
    const list: Page[] = [
      { kind: "cover" },
      { kind: "dedication" },
      { kind: "chapter" },
      ...body,
      { kind: "end" },
    ];
    // เปิดคู่ต้องมีจำนวนหน้าเป็นเลขคู่ ไม่งั้นแผ่นสุดท้ายจะมีหลังว่างโหว่
    if (twoUp && list.length % 2 !== 0) list.push({ kind: "blank" });
    return list;
  }, [textPages, twoUp]);

  const perSheet = twoUp ? 2 : 1;
  const sheetTotal = Math.ceil(pages.length / perSheet);
  // ที่คู่มีตำแหน่งพลิกเกินจำนวนแผ่น 1 ตำแหน่ง (หนังสือที่อ่านจบแล้ว)
  // ที่หน้าเดียวตำแหน่งสุดท้ายคือแผ่นสุดท้าย
  const maxSheet = twoUp ? sheetTotal : sheetTotal - 1;

  const [sheet, setSheet] = useState(0);
  const [turning, setTurning] = useState<number | null>(null);

  useEffect(() => {
    setSheet((s) => Math.min(s, Math.max(0, maxSheet)));
  }, [maxSheet]);

  const go = useCallback(
    (dir: 1 | -1) => {
      setSheet((s) => {
        const next = s + dir;
        if (next < 0 || next > maxSheet) return s;
        setTurning(dir === 1 ? s : next);
        window.setTimeout(() => setTurning(null), 920);
        return next;
      });
    },
    [maxSheet]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // ปัดนิ้วบนมือถือ
  const touch = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => (touch.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touch.current === null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
    touch.current = null;
  };

  /* ─────────── เสียง ─────────── */
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const play = (p: ReaderParagraph) => {
    const el = audioRef.current;
    if (!el || !p.audioUrl) return;
    if (playing === p.id) {
      el.pause();
      setPlaying(null);
      return;
    }
    if (el.src !== p.audioUrl) el.src = p.audioUrl;
    el.currentTime = (p.startMs ?? 0) / 1000;
    void el.play();
    setPlaying(p.id);
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const stop = () => setPlaying(null);
    el.addEventListener("ended", stop);
    el.addEventListener("pause", stop);
    return () => {
      el.removeEventListener("ended", stop);
      el.removeEventListener("pause", stop);
    };
  }, []);

  // เปลี่ยนหน้าแล้วให้เสียงหยุด ไม่งั้นเสียงจากหน้าก่อนจะค้างเล่นต่อ
  useEffect(() => {
    audioRef.current?.pause();
  }, [sheet]);

  /* ขอบกระดาษ — ต้องมาจาก type ชุดเดียวกับที่ใช้ตอนวัดความสูง */
  const pageStyle: React.CSSProperties = {
    paddingLeft: type.padX,
    paddingRight: type.padX,
    paddingTop: type.padTop,
    paddingBottom: type.padBottom,
  };

  /* ─────────── ส่วนแสดงผลของหน้าแต่ละชนิด ─────────── */
  const renderPage = (page: Page, index: number) => {
    const no = index + 1;
    if (page.kind === "cover") {
      return (
        <div className="page cover items-center justify-center text-center" style={pageStyle}>
          <p className="text-[11px] tracking-[0.42em] text-gold-300/70 uppercase">เล่าไว้</p>
          <div className="cover__rule mt-7 w-full" />
          <h1 className="cover__title mt-9 font-serif text-[clamp(28px,6.4vw,44px)] leading-tight">
            {elderName}
          </h1>
          {relation && <p className="mt-3 text-sm text-[#c9b48c]">{relation}</p>}
          <p className="mt-10 font-serif text-[clamp(15px,3vw,20px)] text-[#e8d9ba]">
            {chapterTitle}
          </p>
          <div className="cover__rule mt-9 w-full" />
          <p className="mt-7 text-[11px] leading-relaxed text-[#b3a083]">
            เรื่องเล่าด้วยเสียงของท่านเอง
          </p>
        </div>
      );
    }

    if (page.kind === "dedication") {
      return (
        <div className="page items-center justify-center text-center" style={pageStyle}>
          <p className="font-serif text-[clamp(16px,3.4vw,22px)] leading-[2] text-[#4a3c2a]">
            วันที่อยากฟัง
            <br />
            อาจไม่ใช่วันที่ยังได้ฟัง
          </p>
          <div className="mx-auto my-9 h-px w-12 bg-[#cbb79a]" />
          <p className="max-w-[80%] text-[13px] leading-[1.95] text-[#6b5c48]">
            หนังสือเล่มนี้เกิดจากการที่มีคนในครอบครัวนั่งลงฟัง{elderName}เล่า
            แล้วเก็บทุกถ้อยคำไว้ตามที่ท่านพูดจริง
          </p>
          <p className="mt-8 text-[11px] text-[#9a8a72]">กดที่ย่อหน้าใดก็ได้ เพื่อฟังเสียงของท่าน</p>
          <span className="page__no">{no}</span>
        </div>
      );
    }

    if (page.kind === "chapter") {
      return (
        <div className="page items-center justify-center text-center" style={pageStyle}>
          <p className="text-[11px] tracking-[0.34em] text-[#a1917a] uppercase">บทที่หนึ่ง</p>
          <h2 className="mt-7 font-serif text-[clamp(22px,4.6vw,32px)] leading-snug text-[#241d14]">
            {chapterTitle}
          </h2>
          <div className="mt-8 h-[2px] w-14 rounded-full bg-gradient-to-r from-[#f0cd7c] to-[#b0822f]" />
          <p className="mt-8 text-[12px] text-[#8a7a63]">{paragraphs.length} ย่อหน้า</p>
          <span className="page__no">{no}</span>
        </div>
      );
    }

    if (page.kind === "text") {
      return (
        <div className="page" style={pageStyle}>
          {page.first && (
            <h3
              className="shrink-0 font-serif text-[#4a3c2a]"
              style={{
                fontSize: type.fs * 1.16,
                lineHeight: 1.4,
                marginBottom: type.fs * 1.6,
              }}
            >
              {chapterTitle}
            </h3>
          )}
          <div className="min-h-0 flex-1">
            {page.items.map((p, i) => {
              const can = Boolean(p.audioUrl);
              const on = playing === p.id;
              // ย่อหน้าแรกของบทไม่ร่น เพราะมีอักษรตัวโตนำอยู่แล้ว ตามธรรมเนียมหนังสือ
              const lead = page.first && i === 0;
              return (
                <div key={p.id} className="group relative" style={{ marginBottom: type.gap }}>
                  <p
                    onClick={() => can && play(p)}
                    className={clsx(
                      "font-serif text-[#241d14] transition-colors",
                      lead && "dropcap",
                      can && "cursor-pointer hover:text-[#5b4420]",
                      on && "text-[#5b4420]"
                    )}
                    style={{
                      fontSize: type.fs,
                      lineHeight: type.lh,
                      textIndent: lead ? 0 : type.indent,
                      textAlignLast: "left",
                    }}
                  >
                    {p.text}
                  </p>
                  {/* ปุ่มฟังเสียงวางไว้ใน "ขอบกระดาษ" ไม่ใช่ในคอลัมน์ข้อความ
                      เหตุผลสองข้อ: ไม่บังตัวหนังสือ และไม่กินความสูง
                      ถ้ามันกินความสูง การคำนวณแบ่งหน้าจะคลาดทันที แล้วข้อความจะล้นหน้า */}
                  {can && (
                    <button
                      type="button"
                      onClick={() => play(p)}
                      aria-label={on ? "หยุดเสียง" : "ฟังเสียงของท่านในย่อหน้านี้"}
                      className={clsx(
                        "absolute grid place-items-center rounded-full transition",
                        on
                          ? "bg-[#e3b254] text-[#2c2110] opacity-100"
                          : "bg-[#eadcc0] text-[#7d6c53] opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                      )}
                      style={{
                        left: -Math.round(type.padX * 0.62),
                        top: Math.round(type.fs * 0.5),
                        width: Math.round(type.fs * 1.25),
                        height: Math.round(type.fs * 1.25),
                      }}
                    >
                      {on ? <Pause size={9} /> : <Play size={9} />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <span className="page__no">{no}</span>
        </div>
      );
    }

    if (page.kind === "end") {
      return (
        <div className="page items-center justify-center text-center" style={pageStyle}>
          <h3 className="font-serif text-[clamp(16px,3.2vw,21px)] text-[#241d14]">
            ฟังเสียงของ{elderName}
          </h3>
          <p className="mt-2.5 max-w-[78%] text-[12px] leading-[1.9] text-[#6b5c48]">
            สแกนเพื่อฟังเสียงจริงที่ท่านเล่าเรื่องในบทนี้
            <br />
            เสียงนี้ไม่ได้สังเคราะห์ขึ้น เป็นเสียงของท่านเอง
          </p>
          <div className="mt-6">
            <QRBox value={chapterUrl} size={Math.min(124, Math.floor(pageSize.w * 0.34))} />
          </div>
          <p className="mt-8 text-[10.5px] leading-relaxed text-[#9a8a72]">
            จัดทำด้วย เล่าไว้
            <br />
            ครอบครัวตรวจและยืนยันเนื้อหาทุกย่อหน้าแล้ว
          </p>
          <span className="page__no">{no}</span>
        </div>
      );
    }

    return <div className="page" style={pageStyle} />;
  };

  /* ─────────── ประกอบแผ่นกระดาษ ─────────── */
  const sheets = useMemo(() => {
    const out: { front: Page; back: Page | null }[] = [];
    for (let i = 0; i < pages.length; i += perSheet) {
      out.push({ front: pages[i], back: perSheet === 2 ? (pages[i + 1] ?? null) : null });
    }
    return out;
  }, [pages, perSheet]);

  const bookW = twoUp ? pageSize.w * 2 : pageSize.w;
  const atStart = sheet === 0;
  const atEnd = sheet >= maxSheet;
  // เลขหน้าที่กำลังเห็นจริง ๆ (ที่คู่เห็นสองหน้า)
  const leftNo = twoUp && sheet > 0 ? 2 * sheet : null;
  const rightNo = twoUp ? (2 * sheet + 1 <= pages.length ? 2 * sheet + 1 : null) : sheet + 1;
  const shownLabel = [leftNo, rightNo].filter(Boolean).join("–") || String(pages.length);

  return (
    <div className="book-reader bookshelf flex min-h-screen flex-col">
      <audio ref={audioRef} preload="none" className="hidden" />

      {/* กล่องวัดความสูง — ต้องเหมือนหน้าจริงทุกค่า ไม่งั้นแบ่งหน้าผิดแล้วข้อความล้น */}
      <div
        ref={measureRef}
        className="measure font-serif"
        style={{
          width: type.colW,
          fontSize: type.fs,
          lineHeight: type.lh,
        }}
        aria-hidden
      >
        {paragraphs.map((p, i) => (
          <p key={p.id} style={{ textIndent: i === 0 ? 0 : type.indent }}>
            {p.text}
          </p>
        ))}
      </div>

      {/* ── แถบบน ── */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-7">
        <div className="min-w-0">
          <p className="truncate font-serif text-[15px] text-[#f0e4cc]">{elderName}</p>
          <p className="truncate text-[11px] text-[#9d8a6d]">{chapterTitle}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#53432e] px-3.5 py-1.5 text-[12px] text-[#e2d3b4] transition hover:bg-[#2e241a]"
        >
          <Printer size={13} />
          สั่งพิมพ์เล่มจริง
        </button>
      </div>

      {/* ── เวที ── */}
      <div
        ref={stageRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="flex flex-1 items-center justify-center px-3 py-6 sm:px-7"
      >
        {mounted && textPages ? (
          <div
            className={clsx("book", !twoUp && "book--single", twoUp && sheet === 0 && "book--closed",
              twoUp && sheet === maxSheet && "book--finished")}
            style={{ width: bookW, height: pageSize.h }}
          >
            <div className="book__spine" />

            {sheets.map((s, i) => {
              const flipped = i < sheet;
              // แผ่นที่กำลังพลิกต้องอยู่บนสุดเสมอ ไม่งั้นจะมุดใต้กองกระดาษ
              const z = turning === i ? 400 : flipped ? i + 1 : sheets.length - i;
              return (
                <div
                  key={i}
                  className={clsx("sheet", flipped && "sheet--flipped")}
                  style={{
                    zIndex: z,
                    width: pageSize.w,
                    left: twoUp ? pageSize.w : 0,
                  }}
                >
                  <div className="sheet__face sheet__face--front">{renderPage(s.front, i * perSheet)}</div>
                  <div className="sheet__face sheet__face--back">
                    {s.back ? renderPage(s.back, i * perSheet + 1) : <div className="page" style={pageStyle} />}
                  </div>
                </div>
              );
            })}

            {/* โซนกดพลิก วางทับหน้ากระดาษแต่ไม่บังปุ่มฟังเสียง */}
            {!atStart && (
              <button
                type="button"
                aria-label="หน้าก่อนหน้า"
                onClick={() => go(-1)}
                className="turn-zone turn-zone--prev"
              />
            )}
            {!atEnd && (
              <button
                type="button"
                aria-label="หน้าถัดไป"
                onClick={() => go(1)}
                className="turn-zone turn-zone--next"
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-[#8a7862]">กำลังจัดหน้าหนังสือ…</p>
        )}
      </div>

      {/* ── แถบล่าง ── */}
      <div className="flex items-center justify-center gap-5 pb-7">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={atStart}
          aria-label="หน้าก่อนหน้า"
          className="grid h-11 w-11 place-items-center rounded-full border border-[#53432e] text-[#e2d3b4] transition enabled:hover:bg-[#2e241a] disabled:opacity-25"
        >
          <ChevronLeft size={19} />
        </button>

        <div className="text-center">
          <p className="font-serif text-[13px] text-[#e2d3b4]">
            {shownLabel} / {pages.length}
          </p>
          <p className="mt-0.5 flex items-center justify-center gap-1 text-[10.5px] text-[#8e7c62]">
            <Volume2 size={10} />
            กดย่อหน้าเพื่อฟังเสียง
          </p>
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          disabled={atEnd}
          aria-label="หน้าถัดไป"
          className="grid h-11 w-11 place-items-center rounded-full border border-[#53432e] text-[#e2d3b4] transition enabled:hover:bg-[#2e241a] disabled:opacity-25"
        >
          <ChevronRight size={19} />
        </button>
      </div>
    </div>
  );
}
