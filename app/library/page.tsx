import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Languages,
  Mic,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { Suspense } from "react";
import clsx from "clsx";
import { Progress } from "@/components/ui";
import { Page } from "@/components/layout";
import Logo from "@/components/Logo";
import { HomeBodySkeleton } from "@/components/skeletons";
import { currentUser } from "@/lib/supabase/server";
import {
  countCorrections,
  listChaptersOfUser,
  listClipsOfSessions,
  listSessionsOfUser,
} from "@/lib/store";
import { topics } from "@/lib/demo";
import { DEMO_BOOK } from "@/lib/chrome";
import type { Session } from "@/lib/types";

export const metadata = { title: "หน้าหลัก — เล่าไว้" };

/**
 * หน้าหลักหลังเข้าสู่ระบบ — โครงจากหน้าแอปของ Nixtio
 *
 *   คำทักทายสองโทน → การ์ดงาน 3 ใบ → แถบเริ่มจากหัวข้อ → สถิติ → ผู้เล่า
 *
 * ทำไมใช้โครงนี้:
 * หน้าเดิมเปิดมาด้วยสถิติ 4 ใบ ซึ่งตอบคำถามว่า "เก็บไปแล้วเท่าไร"
 * แต่สิ่งที่คนเปิดแอปอยากรู้คือ "ตอนนี้ต้องทำอะไรต่อ"
 * โครงของ Nixtio วางงานที่ทำได้ไว้บนสุด แล้วค่อยแสดงความคืบหน้าทีหลัง ตรงกับที่ต้องการพอดี
 *
 * แถบเริ่มจากหัวข้อแสดง "ตัวอย่างคำถาม" แทนช่องพิมพ์เปล่า
 * เพราะ insight หลักของผลิตภัณฑ์คือ ลูกหลานไม่รู้ว่าจะถามอะไร
 * ช่องพิมพ์เปล่า ๆ จึงเป็นสิ่งที่ผิดที่สุดที่จะยื่นให้เขา
 */
export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/library");

  /*
   * ⚠️ การตรวจสิทธิ์และ redirect ต้องอยู่ตรงนี้ ห้ามย้ายเข้าไปใน Suspense
   * redirect ที่เกิดใน component ที่ถูก suspend จะทำงานไม่ตรงที่คาด
   *
   * ดึงแค่ sessions ตรงนี้เพื่อตัดสินว่าจะแสดงหน้าว่างหรือหน้าเต็ม
   * ส่วนที่เหลือปล่อยให้ stream คำทักทายจึงขึ้นทันทีโดยไม่ต้องรอฐานข้อมูล
   */
  const sessions = await listSessionsOfUser(user.id);

  const firstName =
    ((user.user_metadata?.full_name as string | undefined) ?? user.email ?? "คุณ")
      .split(" ")[0]
      .split("@")[0];

  const hour = new Date().getHours();
  const greet = hour < 12 ? "สวัสดีตอนเช้า" : hour < 18 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนค่ำ";

  /* ───────── ยังไม่มีข้อมูล: สอนให้เริ่ม ไม่ใช่โชว์หน้าว่าง ───────── */
  if (sessions.length === 0) {
    return (
      <Page width="app">
        <TopBar />
        <Hero
          muted={`${greet} คุณ${firstName}`}
          strong="มาเก็บเรื่องแรกของท่านกัน"
          sub="ไม่ต้องเตรียมอะไรเลย แค่นั่งข้างท่าน แล้วอ่านคำถามให้ท่านฟัง ที่เหลือเราจัดการให้"
          bubble="เริ่มจากเรื่องวัยเด็กก่อนไหมคะ?"
        />

        <CardRow>
          {[
            {
              n: 1,
              icon: Users,
              t: "บอกเราว่าท่านคือใคร",
              d: "ชื่อที่ใช้เรียก ภาค และความถี่ที่คุณได้กลับไปเจอท่าน",
              tag: "ไม่ถึงนาที",
            },
            {
              n: 2,
              icon: Mic,
              t: "ขอความยินยอมแล้วกดอัด",
              d: "อ่าน 4 ประโยคให้ท่านฟัง แล้วถามทีละคำถาม",
              tag: "ท่านเป็นคนตัดสิน",
            },
            {
              n: 3,
              icon: BookOpen,
              t: "ตรวจแล้วได้หนังสือ",
              d: "AI เรียบเรียงให้ คุณตรวจ แล้วได้หนังสือพร้อม QR ฟังเสียงจริง",
              tag: "ทุกย่อหน้ามีหลักฐาน",
            },
          ].map((s, i) => (
            <div key={s.n} className={clsx("app-card relative p-6", i === 1 && "md:mt-6")}>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-800 text-paper-50">
                <s.icon size={20} />
              </span>
              <h2 className="mt-5 text-xl leading-snug font-medium text-earth-900">{s.t}</h2>
              <p className="mt-2 leading-relaxed text-earth-700">{s.d}</p>
              <p className="mt-4 text-sm text-earth-500">
                ขั้นที่ {s.n} · {s.tag}
              </p>
            </div>
          ))}
        </CardRow>

        <TopicComposer />

        <p className="mt-6 text-center">
          <Link
            href={DEMO_BOOK}
            className="inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-earth-700 underline-offset-4 transition hover:text-earth-900 hover:underline"
          >
            <BookOpen size={18} /> ยังไม่แน่ใจ? ดูตัวอย่างหนังสือก่อน
          </Link>
        </p>
      </Page>
    );
  }

  /* ───────── มีข้อมูลแล้ว ───────── */
  return (
    <Page width="app">
      <TopBar />
      <Hero
        muted={`${greet} คุณ${firstName}`}
        strong="วันนี้อยากฟังเรื่องอะไรของท่าน?"
        bubble="ถามต่อจากที่ค้างไว้ก็ได้นะคะ"
      />

      <Suspense fallback={<HomeBodySkeleton />}>
        <LibraryBody userId={user.id} sessions={sessions} />
      </Suspense>
    </Page>
  );
}

/* ═══════════════════════ ชิ้นส่วนของหน้า ═══════════════════════ */

/** แถบบนในแผง — ป้ายบอกตำแหน่งซ้าย ปุ่มหลักขวา (มือถือใช้ปุ่มกลางของแท็บล่างแทน) */
function TopBar() {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="pill-badge">
        <Sparkles size={14} className="text-gold-500" />
        คลังความทรงจำ
      </span>
      <Link
        href="/interview/new"
        className="hidden min-h-11 items-center gap-2 rounded-full bg-ink-800 px-5 font-medium text-paper-50 shadow-[0_10px_24px_-12px_rgba(26,37,57,0.8)] transition hover:bg-ink-700 md:inline-flex"
      >
        <Plus size={18} /> เล่าเรื่องใหม่
      </Link>
    </div>
  );
}

/**
 * คำทักทายสองโทนแบบ Nixtio — ส่วนแรกจาง ส่วนหลังเข้ม
 * ตาจะข้ามคำทักทายไปหยุดที่คำถามเอง ซึ่งเป็นสิ่งที่อยากให้อ่าน
 *
 * ตราของเราพร้อมกรอบคำพูดแทนหุ่นยนต์ของต้นแบบ
 * ไม่ใช้หน้าการ์ตูนเพราะผลิตภัณฑ์นี้แตะเรื่องความทรงจำและการจากลา
 */
function Hero({
  muted,
  strong,
  sub,
  bubble,
}: {
  muted: string;
  strong: string;
  sub?: string;
  bubble: string;
}) {
  return (
    <section className="relative mt-8 sm:mt-12">
      <div className="max-w-2xl md:pr-56">
        <h1 className="font-serif text-[2.15rem] leading-[1.2] sm:text-5xl sm:leading-[1.15]">
          <span className="block text-earth-500">{muted},</span>
          <span className="block text-earth-900">{strong}</span>
        </h1>
        {sub && <p className="mt-4 max-w-xl text-lg leading-relaxed text-earth-700">{sub}</p>}
      </div>

      <div className="pointer-events-none absolute top-0 right-0 hidden items-start gap-3 md:flex" aria-hidden>
        <span className="mt-2 rounded-2xl rounded-tr-md border border-paper-300 bg-paper-50 px-4 py-2.5 text-[0.95rem] leading-snug text-earth-800 shadow-[0_12px_28px_-18px_rgba(60,45,28,0.45)]">
          {bubble}
        </span>
        <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full border border-paper-300 bg-paper-50 shadow-[0_18px_40px_-22px_rgba(201,149,58,0.7)]">
          <Logo size={62} />
        </span>
      </div>
    </section>
  );
}

/**
 * แถวการ์ด — มือถือเลื่อนแนวนอนแบบแถบเรื่องราวของ IG (เห็นใบถัดไปโผล่ขอบ
 * บอกโดยไม่ต้องเขียนว่า "เลื่อนได้") · จอกว้างเรียง 3 คอลัมน์
 */
function CardRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="snap-row -mx-5 mt-8 flex gap-4 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:items-start md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&>*]:w-[78%] [&>*]:shrink-0 md:[&>*]:w-auto">
      {children}
    </div>
  );
}

/**
 * แถบเริ่มจากหัวข้อ — ตำแหน่งเดียวกับช่องพิมพ์ของ Nixtio
 * แต่แสดงตัวอย่างคำถามแทนช่องว่าง (เหตุผลอยู่ที่หัวไฟล์)
 * ชิปทุกอันพาไปเริ่มสัมภาษณ์โดยเลือกหัวข้อให้แล้ว
 */
function TopicComposer() {
  return (
    <section className="app-card mt-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-earth-700">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Sparkles size={15} className="text-gold-500" /> เริ่มจากหัวข้อชีวิต
        </span>
        <span className="text-earth-500">ไม่ต้องเตรียมคำถามเอง เรามีให้ครบ</span>
      </div>

      <Link
        href="/interview/new"
        className="mt-4 flex min-h-16 items-center gap-4 rounded-2xl border border-paper-300 bg-paper-100 py-3 pr-3 pl-5 transition hover:border-gold-400"
      >
        <span className="flex-1 leading-relaxed text-earth-700">
          เช่น “ตอนเด็ก ๆ ตื่นมาทำอะไรเป็นอย่างแรกคะ”
        </span>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink-800 text-paper-50">
          <Mic size={20} />
        </span>
      </Link>

      <div className="snap-row -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 sm:-mx-6 sm:px-6 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {topics.map((t) => (
          <Link
            key={t.id}
            href={`/interview/new?topic=${t.id}`}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-ink-800 px-4 text-paper-50 transition hover:bg-ink-700"
          >
            <span aria-hidden>{t.icon}</span> {t.title}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════ ส่วนที่ต้องรอฐานข้อมูล ═══════════════════════ */

/**
 * แยกออกมาเพื่อให้ Suspense สตรีมได้
 * ดึงคลิปของทุก session ด้วยคำสั่งเดียว ไม่ใช่ยิงทีละ session แบบ N+1
 */
async function LibraryBody({ userId, sessions }: { userId: string; sessions: Session[] }) {
  const [chapters, pairs, allClips] = await Promise.all([
    listChaptersOfUser(userId),
    countCorrections(),
    listClipsOfSessions(sessions.map((s) => s.id)),
  ]);

  const totalMinutes = Math.round(
    allClips.reduce((sum, c) => sum + (c.durationMs ?? 0), 0) / 60000
  );
  const verifiedClaims = allClips.flatMap((c) => c.claims).length;
  const pending = chapters.filter((c) => !c.approved);
  const books = chapters.filter((c) => c.approved);

  return (
    <>
      {/* ── การ์ดงาน 3 ใบ: ก้าวต่อไปอยู่บนสุดเสมอ ── */}
      <CardRow>
        <ActionCard
          href="/interview/new"
          icon={<Mic size={20} />}
          iconClass="bg-ink-800 text-paper-50"
          title="เล่าเรื่องใหม่"
          body="เลือกผู้เล่า ขอความยินยอม แล้วถามทีละคำถาม"
          meta="เริ่มต้น · ราว 2 นาที"
        />
        <ActionCard
          href={pending[0] ? `/review/${pending[0].id}` : "#elders"}
          icon={<ClipboardCheck size={20} />}
          iconClass={pending.length ? "bg-gold-400 text-earth-900" : "bg-paper-200 text-earth-700"}
          title={pending.length ? `มี ${pending.length} บทรอให้คุณตรวจ` : "ยังไม่มีบทรอตรวจ"}
          body="ตรวจและยืนยันแล้วจะได้หนังสือพร้อม QR ให้ทุกคนในบ้าน"
          meta={pending.length ? "ต้องทำ" : "เรียบร้อยทุกบท"}
          offset
          highlight={pending.length > 0}
        />
        <ActionCard
          href={books[0] ? `/book/${books[0].shareToken}` : DEMO_BOOK}
          icon={<BookOpen size={20} />}
          iconClass="bg-verified-600 text-paper-50"
          title={books.length ? `เปิดหนังสือ ${books.length} เล่ม` : "ดูตัวอย่างหนังสือ"}
          body="ทุกย่อหน้ากดฟังเสียงจริงของท่านได้"
          meta="หนังสือ"
        />
      </CardRow>

      <TopicComposer />

      {/* ── สถิติแบบ bento: ตัวเลขใหญ่ อ่านได้จากระยะแขน ── */}
      <section className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat icon={Clock} value={totalMinutes} unit="นาที" label="เสียงที่เก็บไว้แล้ว" glow />
        <Stat icon={BookOpen} value={chapters.length} unit="บท" label="เรียบเรียงแล้ว" />
        <Stat icon={CheckCircle2} value={verifiedClaims} unit="เรื่อง" label="ข้อมูลที่ตรวจแล้ว" />
        <Stat icon={Languages} value={pairs} unit="คู่" label="คำถิ่นที่คุณช่วยสอน" />
      </section>

      {/* ── ผู้เล่าแต่ละคน + ความคืบหน้าตามหัวข้อชีวิต ── */}
      <section id="elders" className="mt-12 scroll-mt-24">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl text-earth-900 sm:text-3xl">ผู้เล่าในคลัง</h2>
          <span className="pill-badge">{sessions.length} ท่าน</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((s) => {
            const mine = chapters.filter((c) => c.sessionId === s.id);
            const done = new Set(mine.map((c) => c.title));
            const mins = Math.round(
              allClips
                .filter((c) => c.sessionId === s.id)
                .reduce((n, c) => n + (c.durationMs ?? 0), 0) / 60000
            );

            return (
              <article key={s.id} className="app-card flex flex-col p-6">
                <div className="flex items-start gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-200 to-gold-400 font-serif text-2xl text-earth-900 shadow-[0_10px_24px_-14px_rgba(201,149,58,0.9)]">
                    {s.elderName.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-serif text-2xl text-earth-900">{s.elderName}</h3>
                    <p className="text-earth-700">
                      {s.relation || "ผู้เล่า"}
                      {mins > 0 && ` · ${mins} นาที`}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-sm text-earth-700">
                    เล่าแล้ว {done.size} จาก {topics.length} หัวข้อชีวิต
                  </p>
                  <Progress value={done.size} max={topics.length} />

                  <div className="mt-4 flex flex-wrap gap-2">
                    {topics.map((t) => {
                      const ok = done.has(t.title);
                      return (
                        <span
                          key={t.id}
                          // ของเดิมหัวข้อที่ยังไม่เล่าใช้ text-earth-400 ซึ่งเป็นสีสำหรับ placeholder
                          // คอนทราสต์ต่ำเกินกว่าผู้สูงอายุจะอ่านได้ ใช้เส้นประแยกสถานะแทนการทำให้จาง
                          className={clsx(
                            "rounded-full border px-3 py-1 text-sm",
                            ok
                              ? "border-verified-600/40 bg-verified-400/20 text-earth-900"
                              : "border-dashed border-paper-400 text-earth-700"
                          )}
                        >
                          {ok && <span className="sr-only">เล่าแล้ว: </span>}
                          {t.icon} {t.title}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {mine.length > 0 && (
                  <ul className="mt-5 space-y-1 border-t border-paper-300 pt-4">
                    {mine.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={c.approved ? `/book/${c.shareToken}` : `/review/${c.id}`}
                          className="flex min-h-12 items-center gap-2.5 rounded-xl px-2 text-earth-800 transition hover:bg-paper-200"
                        >
                          <BookOpen size={17} className="shrink-0 text-gold-500" />
                          <span className="truncate">{c.title}</span>
                          {/* ของเดิม "รอตรวจ" เป็นตัวสีทองบนพื้นขาว คอนทราสต์ราว 2.6:1 อ่านแทบไม่ออก */}
                          <span
                            className={clsx(
                              "ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-sm",
                              c.approved
                                ? "bg-verified-400/20 text-verified-600"
                                : "bg-gold-200 text-earth-900"
                            )}
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
                  className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full border border-paper-400 px-5 text-earth-800 transition hover:border-gold-400 hover:bg-paper-100"
                  style={{ marginTop: "1.25rem" }}
                >
                  <Mic size={16} /> เล่าเรื่องต่อ
                </Link>
              </article>
            );
          })}

          <Link
            href="/interview/new"
            className="grid min-h-52 place-items-center rounded-[1.75rem] border-2 border-dashed border-paper-400 text-earth-700 transition hover:border-gold-400 hover:bg-paper-50/70 hover:text-earth-900"
          >
            <span className="flex flex-col items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-ink-800 text-paper-50">
                <Plus size={22} />
              </span>
              เพิ่มผู้เล่าคนใหม่
            </span>
          </Link>
        </div>
      </section>

      <p className="mt-12 text-sm leading-relaxed text-earth-500">
        คุณเห็นเฉพาะเรื่องที่ผูกกับบัญชีนี้ · ลิงก์หนังสือที่แชร์ออกไปใช้รหัสที่เดาไม่ได้
        และเพิกถอนได้ทุกเมื่อ
      </p>
    </>
  );
}

function ActionCard({
  href,
  icon,
  iconClass,
  title,
  body,
  meta,
  offset,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  body: string;
  meta: string;
  /** ใบกลางลดระดับลงนิดแบบต้นแบบ ให้แถวดูมีจังหวะ ไม่ใช่ตารางแข็ง */
  offset?: boolean;
  /** มีงานค้าง — ขอบทองให้ตาหยุดที่ใบนี้ก่อน */
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "app-card group flex flex-col p-6",
        offset && "md:mt-6",
        highlight && "border-gold-400/70 ring-4 ring-gold-200/60"
      )}
    >
      <span className={clsx("grid h-11 w-11 place-items-center rounded-2xl", iconClass)}>{icon}</span>
      <h2 className="mt-5 text-xl leading-snug font-medium text-earth-900">{title}</h2>
      <p className="mt-2 leading-relaxed text-earth-700">{body}</p>
      <p className="mt-4 flex items-center justify-between text-sm text-earth-500">
        {meta}
        <ArrowRight
          size={17}
          className="text-earth-700 transition group-hover:translate-x-1 group-hover:text-earth-900"
        />
      </p>
    </Link>
  );
}

function Stat({
  icon: Icon,
  value,
  unit,
  label,
  glow,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: number;
  unit: string;
  label: string;
  /** ใบแรกมีแสงทองนุ่ม ๆ เพราะ "นาทีเสียงที่เก็บไว้" คือตัวเลขที่ครอบครัวรู้สึกได้มากที่สุด */
  glow?: boolean;
}) {
  return (
    <div className={clsx("app-card relative overflow-hidden px-5 py-5", glow && "border-gold-400/50")}>
      {glow && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold-300/40 blur-2xl"
        />
      )}
      <Icon size={20} className="relative text-gold-500" />
      <p className="relative mt-3 font-serif text-4xl leading-none text-earth-900">
        {value.toLocaleString("th-TH")}
        <span className="ml-1.5 text-base text-earth-700">{unit}</span>
      </p>
      <p className="relative mt-2 text-sm text-earth-700">{label}</p>
    </div>
  );
}
