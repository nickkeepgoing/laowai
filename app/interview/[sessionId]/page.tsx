import Link from "next/link";
import { getSession } from "@/lib/store";
import { topics } from "@/lib/demo";
import { runtimeMode } from "@/lib/env";
import InterviewClient from "./InterviewClient";

/**
 * หน้าสัมภาษณ์ — ดึง session ฝั่ง server แล้วส่งให้ client component ทำงานต่อ
 * แยกแบบนี้เพราะการอัดเสียงต้องอยู่ฝั่ง browser แต่การอ่านฐานข้อมูลควรอยู่ฝั่ง server
 */
export default async function InterviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ topic?: string }>;
}) {
  const { sessionId } = await params;
  const { topic } = await searchParams;

  const session = await getSession(sessionId);

  if (!session) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl text-cream-50">ไม่พบการสัมภาษณ์นี้</h1>
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

  const chosen = topics.find((t) => t.id === (topic ?? session.topic)) ?? topics[0];

  return <InterviewClient session={session} topic={chosen} mode={runtimeMode()} />;
}
