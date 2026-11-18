import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Languages,
  Mic,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { Card, Progress } from "@/components/ui";
import { currentUser } from "@/lib/supabase/server";
import {
  countCorrections,
  listChaptersOfUser,
  listClips,
  listSessionsOfUser,
} from "@/lib/store";
import { topics } from "@/lib/demo";

export const metadata = { title: "หน้าหลัก — เล่าไว้" };

/**
 * หน้าหลักหลังเข้าสู่ระบบ
 *
 * ปัญหาที่หน้านี้แก้: เดิมล็อกอินเข้ามาแล้วเจอหน้าว่าง ไม่รู้ว่าต้องทำอะไรต่อ
 * และไม่เห็นว่าระบบเก็บอะไรไว้ให้บ้าง ซึ่งทำให้ดูเหมือน "แค่ปุ่มอัดเสียง"
 *
 * หลักที่ใช้ออกแบบ:
 *   1. บอกเสมอว่า "ก้าวต่อไปคืออะไร" — ผู้ใช้ไม่ต้องคิดเอง
 *   2. แสดงความคืบหน้าเป็นรูปธรรม (บทไหนเสร็จ หัวข้อไหนยังว่าง)
 *   3. ตัวเลขที่เห็นต้องมีความหมายกับครอบครัว ไม่ใช่ metric ของนักพัฒนา
 */
export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/library");

  const [sessions, chapters, pairs] = await Promise.all([
    listSessionsOfUser(user.id),
    listChaptersOfUser(user.id),
    countCorrections(),
  ]);

  // ดึงคลิปของทุก session เพื่อคำนวณ "นาทีเสียงที่เก็บไว้" ซึ่งเป็นตัวเลขที่ครอบครัวรู้สึกได้
  const clipsBySession = await Promise.all(
    sessions.map(async (s) => ({ sessionId: s.id, clips: await listClips(s.id) }))
  );
  const allClips = clipsBySession.flatMap((x) => x.clips);
  const totalMinutes = Math.round(
    allClips.reduce((sum, c) => sum + (c.durationMs ?? 0), 0) / 60000
  );
  const verifiedClaims = allClips.flatMap((c) => c.claims).length;

  const firstName =
    ((user.user_metadata?.full_name as string | undefined) ?? user.email ?? "คุณ")
      .split(" ")[0]
      .split("@")[0];

  const hour = new Date().getHours();
  const greet = hour < 12 ? "สวัสดีตอนเช้า" : hour < 18 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนค่ำ";

  /* ───────── ยังไม่มีข้อมูล: สอนให้เริ่ม ไม่ใช่โชว์หน้าว่าง ───────── */
  if (sessions.length === 0) {
    return (
      <main className="relative mx-auto max-w-4xl px-5 py-12 sm:px-6">
        <div className="hero-field opacity-70" aria-hidden />

        <div className="relative">
          <p className="text-earth-500">
            {greet} คุณ{firstName}
          </p>
          <h1 className="mt-2 font-serif text-4xl leading-tight text-earth-900">
            มาเก็บเรื่องแรกของท่านกัน
          </h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-earth-700">
            ไม่ต้องเตรียมอะไรเลย แค่นั่งข้างท่าน เปิดหน้านี้ แล้วอ่านคำถามให้ท่านฟัง
            ที่เหลือเราจัดการให้
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              {
                n: 1,
                icon: Users,
                t: "บอกเราว่าท่านคือใคร",
                d: "ชื่อที่ใช้เรียก ภาค และความถี่ที่คุณได้กลับไปเจอท่าน ใช้เวลาไม่ถึงนาที",
              },
              {
                n: 2,
                icon: Mic,
                t: "ขอความยินยอมแล้วกดอัด",
                d: "อ่าน 4 ประโยคให้ท่านฟัง แล้วอัดคำตอบของท่าน จากนั้นถามทีละคำถาม",
              },
              {
                n: 3,
                icon: BookOpen,
                t: "ตรวจแล้วได้หนังสือ",
                d: "AI เรียบเรียงให้ คุณตรวจและยืนยัน แล้วได้หนังสือพร้อม QR ฟังเสียงจริง",
              },
            ].map((s) => (
              <Card key={s.n} className="relative">
                <span className="absolute -top-3 left-6 grid h-8 w-8 place-items-center rounded-full bg-earth-900 text-sm font-bold text-paper-50">
                  {s.n}
                </span>
                <s.icon size={26} className="mt-2 text-gold-500" />
                <h2 className="mt-4 text-lg font-medium text-earth-900">{s.t}</h2>
                <p className="mt-2 leading-relaxed text-earth-700">{s.d}</p>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/interview/new"
              className="inline-flex min-h-14 items-center gap-2 rounded-2xl bg-earth-900 px-8 text-lg font-medium text-paper-50 shadow-[0_10px_30px_-12px_rgba(33,26,18,0.7)] transition hover:bg-earth-800"
            >
              <Mic size={20} /> เริ่มเรื่องแรก
            </Link>
            <Link
              href="/book/demo-token-7f3a9c2e"
              className="inline-flex min-h-14 items-center gap-2 rounded-2xl border border-paper-400 bg-paper-50 px-7 text-earth-800 transition hover:border-gold-400"
            >
              <BookOpen size={19} /> ดูตัวอย่างหนังสือก่อน
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ───────── มีข้อมูลแล้ว: dashboard เต็ม ───────── */
  return (
    <main className="relative mx-auto max-w-5xl px-5 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-earth-500">
            {greet} คุณ{firstName}
          </p>
          <h1 className="mt-1 font-serif text-3xl text-earth-900 sm:text-4xl">
            คลังความทรงจำของครอบครัว
          </h1>
        </div>
        <Link
          href="/interview/new"
          className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-earth-900 px-6 font-medium text-paper-50 transition hover:bg-earth-800"
        >
          <Plus size={18} /> เล่าเรื่องใหม่
        </Link>
      </header>

      {/* ตัวเลขที่ครอบครัวรู้สึกได้ ไม่ใช่ metric ของนักพัฒนา */}
      <section className="mt-8 grid gap-4 sm:grid-cols-4">
        <Stat icon={Clock} value={totalMinutes} unit="นาที" label="เสียงที่เก็บไว้แล้ว" />
        <Stat icon={BookOpen} value={chapters.length} unit="บท" label="เรียบเรียงแล้ว" />
        <Stat
          icon={CheckCircle2}
          value={verifiedClaims}
          unit="เรื่อง"
          label="ข้อมูลที่ตรวจแล้ว"
        />
        <Stat icon={Languages} value={pairs} unit="คู่" label="คำถิ่นที่คุณช่วยสอน" />
      </section>

      {/* ก้าวต่อไป — ผู้ใช้ไม่ต้องคิดเองว่าต้องทำอะไร */}
      {chapters.some((c) => !c.approved) && (
        <section className="mt-8">
          <Card className="border-gold-400/60 bg-gold-200/25">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Sparkles size={22} className="mt-1 shrink-0 text-gold-500" />
                <div>
                  <h2 className="text-lg font-medium text-earth-900">
                    มี {chapters.filter((c) => !c.approved).length} บทรอให้คุณตรวจ
                  </h2>
                  <p className="mt-1 text-earth-700">
                    ตรวจเสร็จแล้วจะได้หนังสือพร้อม QR ให้ทุกคนในบ้านฟังเสียงท่านได้
                  </p>
                </div>
              </div>
              <Link
                href={`/review/${chapters.find((c) => !c.approved)!.id}`}
                className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-2xl bg-earth-900 px-6 font-medium text-paper-50 transition hover:bg-earth-800"
              >
                ตรวจเลย <ArrowRight size={17} />
              </Link>
            </div>
          </Card>
        </section>
      )}

      {/* ผู้เล่าแต่ละคน + ความคืบหน้าตามหัวข้อชีวิต */}
      <section className="mt-10">
        <h2 className="mb-4 font-serif text-2xl text-earth-900">ผู้เล่าในคลัง</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {sessions.map((s) => {
            const mine = chapters.filter((c) => c.sessionId === s.id);
            const done = new Set(mine.map((c) => c.title));
            const clips = clipsBySession.find((x) => x.sessionId === s.id)?.clips ?? [];
            const mins = Math.round(
              clips.reduce((n, c) => n + (c.durationMs ?? 0), 0) / 60000
            );

            return (
              <Card key={s.id}>
                <div className="flex items-start gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gold-200 font-serif text-2xl text-earth-800">
                    {s.elderName.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-2xl text-earth-900">{s.elderName}</h3>
                    <p className="text-earth-500">
                      {s.relation || "ผู้เล่า"}
                      {mins > 0 && ` · เก็บเสียงแล้ว ${mins} นาที`}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm text-earth-600">
                    <span className="text-earth-700">
                      เล่าแล้ว {done.size} จาก {topics.length} หัวข้อชีวิต
                    </span>
                  </div>
                  <Progress value={done.size} max={topics.length} />

                  <div className="mt-4 flex flex-wrap gap-2">
                    {topics.map((t) => {
                      const ok = done.has(t.title);
                      return (
                        <span
                          key={t.id}
                          className={
                            ok
                              ? "rounded-full border border-verified-400/60 bg-verified-400/15 px-3 py-1 text-sm text-earth-800"
                              : "rounded-full border border-paper-300 px-3 py-1 text-sm text-earth-400"
                          }
                        >
                          {t.icon} {t.title}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {mine.length > 0 && (
                  <ul className="mt-5 space-y-2 border-t border-paper-300 pt-4">
                    {mine.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={c.approved ? `/book/${c.shareToken}` : `/review/${c.id}`}
                          className="flex min-h-11 items-center gap-2.5 rounded-xl px-2 text-earth-800 transition hover:bg-paper-200"
                        >
                          <BookOpen size={17} className="shrink-0 text-gold-500" />
                          <span className="truncate">{c.title}</span>
                          <span
                            className={
                              c.approved
                                ? "ml-auto shrink-0 text-sm text-verified-600"
                                : "ml-auto shrink-0 text-sm text-gold-500"
                            }
                          >
                            {c.approved ? "เปิดหนังสือ" : "รอตรวจ"}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href={`/interview/${s.id}`}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-paper-400 px-4 text-earth-800 transition hover:border-gold-400 hover:bg-paper-100"
                >
                  <Mic size={16} /> เล่าเรื่องต่อ
                </Link>
              </Card>
            );
          })}

          <Link
            href="/interview/new"
            className="grid min-h-48 place-items-center rounded-3xl border-2 border-dashed border-paper-400 text-earth-500 transition hover:border-gold-400 hover:bg-paper-200/60 hover:text-earth-800"
          >
            <span className="flex flex-col items-center gap-2">
              <Plus size={26} />
              เพิ่มผู้เล่าคนใหม่
            </span>
          </Link>
        </div>
      </section>

      <p className="mt-12 text-sm leading-relaxed text-earth-500">
        คุณเห็นเฉพาะเรื่องที่ผูกกับบัญชีนี้ · ลิงก์หนังสือที่แชร์ออกไปใช้รหัสที่เดาไม่ได้
        และเพิกถอนได้ทุกเมื่อ
      </p>
    </main>
  );
}

function Stat({
  icon: Icon,
  value,
  unit,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: number;
  unit: string;
  label: string;
}) {
  return (
    <div className="card-soft rounded-3xl px-5 py-5">
      <Icon size={20} className="text-gold-500" />
      <p className="mt-3 font-serif text-3xl text-earth-900">
        {value.toLocaleString("th-TH")}
        <span className="ml-1 text-base text-earth-500">{unit}</span>
      </p>
      <p className="mt-0.5 text-sm text-earth-500">{label}</p>
    </div>
  );
}
