"use client";

/**
 * Bottom sheet / dialog — สร้างบน <dialog> ของเบราว์เซอร์
 *
 * ทำไมใช้ native <dialog> แทนการเขียน portal เอง:
 * `showModal()` ให้ของสำคัญมาครบโดยไม่ต้องเขียนเอง และไม่ต้องเพิ่ม dependency
 *   - focus trap (โฟกัสวิ่งวนอยู่แค่ใน dialog)
 *   - ปิดด้วย Escape
 *   - ::backdrop ที่กดแล้วปิดได้
 *   - ทำให้พื้นหลังเป็น inert ทั้งหมด (screen reader ไม่อ่านทะลุ)
 *
 * ของเดิมในแอปนี้ใช้ window.confirm() กับการลบที่กู้คืนไม่ได้
 * ซึ่งแสดงได้แค่ข้อความเปล่า ๆ ทั้งที่การลบนั้นลบพร้อมกัน 4 ชั้น
 * ครอบครัวควรเห็นให้ชัดว่ากำลังจะเสียอะไรไปบ้าง
 *
 * มือถือ: เลื่อนขึ้นจากด้านล่าง เพราะนิ้วโป้งอยู่แถวนั้น
 * เดสก์ท็อป: กลางจอตามปกติ
 */

import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** คำอธิบายใต้หัวเรื่อง — ใช้บอกผลที่จะเกิดขึ้นก่อนผู้ใช้ตัดสินใจ */
  description?: string;
  children?: React.ReactNode;
  /** แถวปุ่มด้านล่าง */
  footer?: React.ReactNode;
};

export default function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // เปิด/ปิดผ่าน API ของ dialog เพื่อให้ได้ focus trap และ inert ของจริง
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // Escape ของ <dialog> จะยิง cancel/close เอง ต้องบอก parent ให้รู้ด้วย
  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [handleClose]);

  /**
   * กดพื้นหลังแล้วปิด
   * ::backdrop ไม่ใช่ element จึงรับ event เองไม่ได้
   * ต้องเช็กว่าจุดที่คลิกอยู่นอกกรอบเนื้อหาหรือไม่
   */
  const onBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target !== ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const inside =
      e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) onClose();
  };

  return (
    <dialog
      ref={ref}
      onClick={onBackdropClick}
      aria-label={title}
      className={clsx(
        "no-print w-full max-w-lg bg-transparent p-0 backdrop:bg-earth-900/45 backdrop:backdrop-blur-[2px]",
        // มือถือ: ชิดล่างเต็มความกว้าง · เดสก์ท็อป: กลางจอ
        "m-0 mt-auto sm:m-auto"
      )}
    >
      <div
        className={clsx(
          "relative bg-paper-50 p-6 pb-8 text-earth-800 shadow-[0_-12px_48px_-16px_rgba(33,26,18,0.4)]",
          "rounded-t-3xl sm:rounded-3xl"
        )}
      >
        {/* แถบจับ — บอกใบ้ว่าแผ่นนี้ปัดลงได้ และเป็นภาษาที่คนคุ้นจากแอปมือถือ */}
        <div className="mx-auto mb-5 h-1.5 w-11 rounded-full bg-paper-400 sm:hidden" aria-hidden />

        <button
          type="button"
          onClick={onClose}
          aria-label="ปิด"
          className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full text-earth-500 transition hover:bg-paper-200 hover:text-earth-900"
        >
          <X size={20} />
        </button>

        <h2 className="pr-12 font-serif text-2xl text-earth-900">{title}</h2>
        {description && (
          <p className="mt-2 pr-4 leading-relaxed text-earth-700">{description}</p>
        )}

        {children && <div className="mt-6">{children}</div>}
        {footer && <div className="mt-7 flex flex-wrap gap-3">{footer}</div>}
      </div>
    </dialog>
  );
}
