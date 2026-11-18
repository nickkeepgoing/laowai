import { getChapterByToken, getSession, listClips } from "@/lib/store";
import { demoChapter, demoClips, demoSession } from "@/lib/demo";
import ClipPlayer from "./ClipPlayer";

/**
 * ปลายทางของ QR ในหนังสือ — หน้าที่กรรมการจะเห็นบนมือถือตัวเอง
 *
 * ออกแบบให้เล็ก เรียบ ไม่มีอะไรให้กดผิด เพราะคนที่เปิดหน้านี้
 * ถือหนังสืออยู่ในมืออีกข้าง และต้องการแค่ "ได้ยินเสียงท่าน"
 *
 * ?c=<clipId>  ฟังเฉพาะคลิปนั้น (QR ข้างย่อหน้า)
 * ?t=<ms>      เริ่มเล่นที่วินาทีของย่อหน้านั้นพอดี
 */
export default async function ClipPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ c?: string; t?: string }>;
}) {
  const { token } = await params;
  const { c, t } = await searchParams;

  /**
   * ทางเดินสำหรับข้อมูลตัวอย่าง = demo mode
   * ทำให้ QR บนหน้า landing และในหนังสือตัวอย่างสแกนได้จริงโดยไม่ต้องมีฐานข้อมูล
   * และถ้าวัน pitch เน็ตหรือ Supabase ล่ม ยังมีเส้นทางให้กรรมการสแกนได้
   */
  if (token === demoChapter.shareToken) {
    const picked = c ? demoClips.filter((x) => x.id === c) : demoClips;
    return (
      <ClipPlayer
        clips={picked.length > 0 ? picked : demoClips}
        elderName={demoSession.elderName}
        relation={demoSession.relation}
        chapterTitle={demoChapter.title}
        startMs={t ? Number(t) : undefined}
      />
    );
  }

  const chapter = await getChapterByToken(token);
  if (!chapter || !chapter.approved) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <h1 className="font-serif text-2xl text-mist-50">ลิงก์นี้ใช้ไม่ได้แล้ว</h1>
          <p className="mt-3 text-mist-300">
            ครอบครัวสามารถเพิกถอนลิงก์ได้ทุกเมื่อ เพื่อให้เสียงของท่านอยู่ในมือครอบครัวเสมอ
          </p>
        </div>
      </main>
    );
  }

  const [clips, session] = await Promise.all([
    listClips(chapter.sessionId),
    getSession(chapter.sessionId),
  ]);

  const chosen = c ? clips.filter((x) => x.id === c) : clips;

  return (
    <ClipPlayer
      clips={chosen.length > 0 ? chosen : clips}
      elderName={session?.elderName ?? "ท่าน"}
      relation={session?.relation ?? ""}
      chapterTitle={chapter.title}
      startMs={t ? Number(t) : undefined}
    />
  );
}
