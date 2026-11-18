import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Mic, Plus } from "lucide-react";
import { currentUser } from "@/lib/supabase/server";
import { listChaptersOfUser, listSessionsOfUser } from "@/lib/store";
import { topics } from "@/lib/demo";

export const metadata = { title: "คลังความทรงจำ — เล่าไว้" };

/**
 * คลังความทรงจำของครอบครัว
 *
 * นี่คือเหตุผลที่โปรเจกต์นี้ต้องมีบัญชีผู้ใช้จริง ไม่ใช่ติดมาเพราะเว็บอื่นเขามีกัน:
 * เรื่องที่ท่านเล่าไม่ได้จบในครั้งเดียว ครอบครัวจะกลับมาเพิ่มเรื่อยๆ
 * และต้องมั่นใจว่าคนนอกเปิดดูไม่ได้
 */
export default async function LibraryPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/library");

  const [sessions, chapters] = await Promise.all([
    listSessionsOfUser(user.id),
    listChaptersOfUser(user.id),
  ]);

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "คุณ";

  const totalMinutes = 0; // แสดงเมื่อมีข้อมูลจริงครบแล้ว

  return (
    <main className="relative mx-auto max-w-5xl px-5 py-12 sm:px-6">
      <div className="aurora opacity-40" aria-hidden />

      <header className="relative">
        <p className="text-sm text-mist-500">คลังความทรงจำของ {name}</p>
        <h1 className="mt-1.5 font-serif text-3xl text-mist-50 sm:text-4xl">
          เรื่องที่เก็บไว้แล้ว
        </h1>
      </header>

      {sessions.length === 0 ? (
        <div className="ring-glow relative mt-10 rounded-3xl border border-white/10 bg-night-900/70 p-10 text-center">
          <Mic size={30} className="mx-auto text-gold-400" />
          <h2 className="mt-5 font-serif text-2xl text-mist-50">
            ยังไม่มีเรื่องในคลัง
          </h2>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-mist-300">
            นั่งข้างท่าน เปิดหัวข้อสักหัวข้อ แล้วกดอัด
            ใช้เวลาแค่ 3 นาทีก็ได้เรื่องแรกแล้ว
          </p>
          <Link
            href="/interview/new"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gold-400 px-6 py-3.5 font-medium text-night-950 transition hover:bg-gold-300"
          >
            <Plus size={18} /> เริ่มเรื่องแรก
          </Link>
        </div>
      ) : (
        <>
          <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
            <Stat label="ผู้เล่าในคลัง" value={sessions.length} />
            <Stat label="บทที่เรียบเรียงแล้ว" value={chapters.length} />
            <Stat
              label="บทที่ยืนยันแล้ว"
              value={chapters.filter((c) => c.approved).length}
            />
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-2">
            {sessions.map((s) => {
              const topic = topics.find((t) => t.id === s.topic);
              const mine = chapters.filter((c) => c.sessionId === s.id);
              return (
                <article
                  key={s.id}
                  className="rounded-2xl border border-white/10 bg-night-900/70 p-5 transition hover:border-gold-400/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-xl text-mist-50">{s.elderName}</h3>
                      {s.relation && (
                        <p className="mt-0.5 text-sm text-mist-500">{s.relation}</p>
                      )}
                    </div>
                    {topic && (
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-mist-300">
                        {topic.icon} {topic.title}
                      </span>
                    )}
                  </div>

                  {mine.length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                      {mine.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={c.approved ? `/book/${c.shareToken}` : `/review/${c.id}`}
                            className="flex items-center gap-2 text-sm text-mist-300 transition hover:text-gold-300"
                          >
                            <BookOpen size={14} className="shrink-0" />
                            {c.title}
                            <span className="ml-auto shrink-0 text-xs text-mist-500">
                              {c.approved ? "ยืนยันแล้ว" : "รอตรวจ"}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    href={`/interview/${s.id}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm text-gold-300 hover:text-gold-200"
                  >
                    <Mic size={14} /> เล่าเรื่องต่อ
                  </Link>
                </article>
              );
            })}
          </div>

          <Link
            href="/interview/new"
            className="relative mt-8 inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-mist-100 transition hover:border-gold-400/60 hover:bg-white/5"
          >
            <Plus size={17} /> เพิ่มผู้เล่าคนใหม่
          </Link>
        </>
      )}

      <p className="relative mt-12 text-xs leading-relaxed text-mist-500">
        เห็นเฉพาะเรื่องที่ผูกกับบัญชีนี้เท่านั้น
        ลิงก์หนังสือที่แชร์ออกไปใช้ token ที่เดาไม่ได้ และเพิกถอนได้ทุกเมื่อ
        {totalMinutes > 0 && ` · เก็บเสียงไว้แล้ว ${totalMinutes} นาที`}
      </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-night-900/60 px-5 py-4">
      <p className="font-serif text-3xl text-gold-300">{value}</p>
      <p className="mt-1 text-sm text-mist-500">{label}</p>
    </div>
  );
}
