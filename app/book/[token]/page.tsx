import Link from "next/link";
import QRBox from "@/components/QRBox";
import { SITE_URL } from "@/lib/env";
import { getChapterByToken, getSession, listClips } from "@/lib/store";
import { demoChapter, demoClips, demoSession } from "@/lib/demo";
import { indexClaims, paragraphAudioAnchor } from "@/lib/verify";
import PrintButton from "./PrintButton";

/**
 * หนังสือชีวิต A5 พร้อมพิมพ์
 *
 * ทำด้วย HTML + @media print ไม่ใช่ react-pdf โดยเจตนา
 * react-pdf ไม่รองรับ complex text shaping ของไทย — สระกับวรรณยุกต์จะซ้อนผิดตำแหน่ง
 * (สื่อ ปู่ ก๊อง) และตัดบรรทัดกลางคำ ส่วนเบราว์เซอร์ทำถูก 100%
 * กด Ctrl+P → Save as PDF ได้เล่มที่สวยกว่าและเร็วกว่า
 *
 * QR ท้ายบท = นาทีทองตอน demo กรรมการสแกนด้วยมือถือตัวเองแล้วได้ยินเสียงจริง
 */
export default async function BookPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // ทางเดินข้อมูลตัวอย่าง = demo mode (ดูเหตุผลใน app/clip/[token]/page.tsx)
  const isDemo = token === demoChapter.shareToken;
  const chapter = isDemo ? { ...demoChapter, approved: true } : await getChapterByToken(token);

  if (!chapter) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl text-cream-50">ไม่พบหนังสือเล่มนี้</h1>
        <p className="mt-3 text-cream-300">ลิงก์อาจถูกเพิกถอนแล้ว</p>
      </main>
    );
  }

  if (!chapter.approved) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl text-cream-50">บทนี้ยังไม่ได้รับการยืนยัน</h1>
        <p className="mt-3 text-cream-300">
          ครอบครัวต้องตรวจและยืนยันเนื้อหาก่อน ระบบจึงจะสร้างหนังสือได้ —
          นี่เป็นขั้นบังคับ ไม่ใช่ตัวเลือก
        </p>
        <Link
          href={`/review/${chapter.id}`}
          className="mt-6 inline-block rounded-xl bg-ember-400 px-5 py-2.5 font-medium text-ink-950"
        >
          ไปหน้าตรวจ
        </Link>
      </main>
    );
  }

  const [clips, session] = isDemo
    ? [demoClips, demoSession]
    : await Promise.all([listClips(chapter.sessionId), getSession(chapter.sessionId)]);

  const elderName = session?.elderName ?? "ท่าน";
  const relation = session?.relation ?? "";
  const byId = indexClaims(clips.flatMap((c) => c.claims));
  const clipOfClaim: Record<string, string> = {};
  for (const c of clips) for (const cl of c.claims) clipOfClaim[cl.id] = c.id;

  const chapterUrl = `${SITE_URL}/clip/${token}`;

  return (
    <div className="paper min-h-screen">
      <PrintButton />

      <article className="mx-auto max-w-[148mm] px-8 py-14 print:px-0 print:py-0">
        {/* ── ปก ── */}
        <header className="page-break mb-16 text-center">
          <p className="text-sm tracking-[0.3em] text-[#8a7a63] uppercase">เล่าไว้</p>
          <h1 className="mt-10 font-serif text-4xl leading-tight text-[#231c14]">
            {elderName}
          </h1>
          {relation && <p className="mt-3 text-[#6b5c48]">{relation}</p>}
          <div className="mx-auto my-10 h-px w-16 bg-[#c9b89c]" />
          <h2 className="font-serif text-2xl text-[#3d3124]">{chapter.title}</h2>
          <p className="mt-10 text-sm text-[#8a7a63]">
            เรื่องเล่าด้วยเสียงของท่านเอง · {chapter.paragraphs.length} ย่อหน้า
            <br />
            ทุกย่อหน้าในเล่มนี้มาจากถ้อยคำที่ท่านพูดจริง
          </p>
        </header>

        {/* ── เนื้อบท ── */}
        <section className="book-body">
          <h2 className="mb-8 font-serif text-2xl text-[#231c14]">{chapter.title}</h2>

          {chapter.paragraphs.map((p) => {
            const anchor = paragraphAudioAnchor(p, byId);
            const clipId = anchor ? clipOfClaim[anchor.id] : null;
            return (
              <div key={p.id} className="mb-6 flex items-start gap-4">
                <p className="flex-1 font-serif text-[15pt] leading-[1.9] text-[#231c14]">
                  {p.text}
                </p>
                {clipId && anchor && (
                  <div className="mt-1 shrink-0 print:block">
                    <QRBox
                      value={`${chapterUrl}?c=${clipId}&t=${anchor.startMs}`}
                      size={54}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* ── ท้ายบท: QR ใหญ่ ── */}
        <footer className="mt-20 border-t border-[#d9cdb9] pt-10 text-center">
          <h3 className="font-serif text-xl text-[#231c14]">ฟังเสียงของ{elderName}</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#6b5c48]">
            สแกนเพื่อฟังเสียงจริงที่ท่านเล่าเรื่องในบทนี้
            <br />
            เสียงนี้ไม่ได้สังเคราะห์ขึ้น เป็นเสียงของท่านเอง
          </p>
          <div className="mt-6 flex justify-center">
            <QRBox value={chapterUrl} size={132} caption={chapterUrl} />
          </div>
          <p className="mt-10 text-xs text-[#8a7a63]">
            จัดทำด้วย เล่าไว้ · ครอบครัวตรวจและยืนยันเนื้อหาแล้ว
          </p>
        </footer>
      </article>
    </div>
  );
}
