import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative grid min-h-[70vh] place-items-center px-5 text-center">
      <div className="aurora opacity-50" aria-hidden />
      <div className="relative">
        <p className="font-serif text-6xl text-gold-300">404</p>
        <h1 className="mt-5 font-serif text-2xl text-earth-900">ไม่พบหน้านี้</h1>
        <p className="mt-3 max-w-sm leading-relaxed text-earth-700">
          ลิงก์อาจถูกเพิกถอนแล้ว ซึ่งเป็นสิทธิ์ที่ครอบครัวใช้ได้ทุกเมื่อ
        </p>
        <Link
          href="/"
          className="mt-7 inline-block rounded-xl bg-ink-800 px-5 py-3 font-medium text-paper-50 transition hover:bg-ink-700"
        >
          กลับหน้าแรก
        </Link>
      </div>
    </main>
  );
}
