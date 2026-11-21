"use client";

/**
 * ข้อความแจ้งผลแบบชั่วคราว + live region แรกของแอปนี้
 *
 * ปัญหาที่มาแก้:
 * ของเดิม ReviewClient เก็บข้อความผลลัพธ์ไว้ใน state ชื่อ note แล้วไม่เคยล้าง
 * ข้อความ "บันทึกแล้ว" จึงค้างอยู่จนกว่าจะเปลี่ยนหน้า และพอทำหลายอย่างติดกัน
 * ก็กองทับกันไปเรื่อย ๆ ทั้งที่เป็นเรื่องที่จบไปแล้ว
 *
 * ⚠️ กฎที่ต้องถือ ไม่งั้นบั๊กเดิมจะกลับมา
 *   ผลของการกระทำที่จบแล้ว  → toast
 *   สภาพของหน้าที่ยังเป็นอยู่ → <Notice> ในเนื้อหน้า
 *   ห้ามเก็บ "ข้อความผลลัพธ์" ไว้ใน state ของ component เด็ดขาด
 *
 * ⚠️ กล่องนี้ต้องเป็น <div> ห้ามเป็น <header>
 * เพราะ book.css มีกฎ `body:has(.book-reader) header { display: none }`
 * ถ้าใช้ <header> toast จะหายทั้งระบบเมื่ออยู่หน้าหนังสือ โดยไม่มี error ให้เห็น
 *
 * นี่เป็น aria-live region แรกของแอป ก่อนหน้านี้ข้อความสถานะทั้งหมด
 * ("AI กำลังฟัง…", "บันทึกแล้ว") เป็นภาพล้วน screen reader ไม่รับรู้เลย
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import clsx from "clsx";

type Tone = "info" | "success" | "error";
type Item = { id: number; tone: Tone; text: string };

type Api = {
  toast: (text: string) => void;
  success: (text: string) => void;
  error: (text: string) => void;
  /** บอก screen reader อย่างเดียว ไม่กินพื้นที่บนจอ — ใช้กับสถานะที่เห็นอยู่แล้ว */
  announce: (text: string) => void;
};

const Ctx = createContext<Api | null>(null);

export function useToast(): Api {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast ต้องอยู่ภายใต้ <ToastProvider>");
  return ctx;
}

const LIFETIME = 5000;
const MAX = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [live, setLive] = useState("");
  const [mounted, setMounted] = useState(false);
  const seq = useRef(0);

  useEffect(() => setMounted(true), []);

  const push = useCallback((tone: Tone, text: string) => {
    const id = ++seq.current;
    setItems((xs) => [...xs, { id, tone, text }].slice(-MAX));
    // error ไม่หายเอง เพราะผู้ใช้ต้องอ่านและตัดสินใจทำอะไรต่อ
    if (tone !== "error") {
      window.setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), LIFETIME);
    }
  }, []);

  const api = useMemo<Api>(
    () => ({
      toast: (t) => push("info", t),
      success: (t) => push("success", t),
      error: (t) => push("error", t),
      announce: (t) => setLive(t),
    }),
    [push]
  );

  const close = (id: number) => setItems((xs) => xs.filter((x) => x.id !== id));

  return (
    <Ctx.Provider value={api}>
      {children}

      {mounted &&
        createPortal(
          <>
            {/* อ่านให้ screen reader ฟังอย่างเดียว ไม่มีภาพ */}
            <div className="sr-only" role="status" aria-live="polite">
              {live}
            </div>

            <div
              className={clsx(
                "no-print pointer-events-none fixed z-[60] flex flex-col gap-2",
                // มือถือ: ลอยเหนือแถบแท็บ · เดสก์ท็อป: มุมขวาล่าง
                "inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))]",
                "lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-96"
              )}
            >
              {items.map((it) => (
                <ToastCard key={it.id} item={it} onClose={() => close(it.id)} />
              ))}
            </div>
          </>,
          document.body
        )}
    </Ctx.Provider>
  );
}

function ToastCard({ item, onClose }: { item: Item; onClose: () => void }) {
  const Icon = item.tone === "success" ? CheckCircle2 : item.tone === "error" ? AlertTriangle : Info;

  return (
    <div
      // error ต้องขัดจังหวะ เพราะมีอะไรให้ทำต่อ ส่วนที่เหลือรอจังหวะว่างได้
      role={item.tone === "error" ? "alert" : "status"}
      aria-live={item.tone === "error" ? "assertive" : "polite"}
      className={clsx(
        "card-soft elev-4 pointer-events-auto flex items-start gap-3 rounded-3xl py-4 pr-3 pl-5",
        item.tone === "success" && "border-verified-600/35",
        item.tone === "error" && "border-red-300"
      )}
    >
      <Icon
        size={20}
        className={clsx(
          "mt-0.5 shrink-0",
          item.tone === "success" && "text-verified-600",
          item.tone === "error" && "text-red-600",
          item.tone === "info" && "text-earth-500"
        )}
      />
      {/* ไม่ย่อเป็น text-sm เพราะผู้ใช้กลุ่มนี้อ่านตัวเล็กไม่ไหว */}
      <p className="flex-1 leading-relaxed text-earth-800">{item.text}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="ปิดข้อความ"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-earth-500 transition hover:bg-paper-200 hover:text-earth-900"
      >
        <X size={17} />
      </button>
    </div>
  );
}
