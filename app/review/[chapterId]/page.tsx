import Link from "next/link";
import { countCorrections, getChapter, getSession, listClips } from "@/lib/store";
import { SITE_URL } from "@/lib/env";
import ReviewClient from "./ReviewClient";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapter = await getChapter(chapterId);

  if (!chapter) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl text-cream-50">ไม่พบบทนี้</h1>
        <p className="mt-3 text-cream-300">
          อาจเป็นเพราะเซิร์ฟเวอร์รีสตาร์ท (โหมดเก็บข้อมูลในหน่วยความจำ) หรือลิงก์ไม่ถูกต้อง
        </p>
        <Link
          href="/interview/new"
          className="mt-6 inline-block rounded-xl bg-ember-400 px-5 py-2.5 font-medium text-ink-950"
        >
          เริ่มใหม่
        </Link>
      </main>
    );
  }

  const [clips, session, pairs] = await Promise.all([
    listClips(chapter.sessionId),
    getSession(chapter.sessionId),
    countCorrections(),
  ]);

  return (
    <ReviewClient
      chapter={chapter}
      clips={clips}
      elderName={session?.elderName ?? "ท่าน"}
      region={session?.region}
      initialPairs={pairs}
      siteUrl={SITE_URL}
    />
  );
}
