"use client";

/**
 * หน้าเริ่มเก็บเรื่อง — ขั้นแรกของเส้นทาง demo
 *
 * สองอย่างที่หน้านี้ทำพร้อมกัน:
 *
 * 1. ความยินยอมด้วยเสียงของท่านเอง (ไม่ใช่หลานติ๊กแทน)
 *    /api/session ปฏิเสธถ้าไม่มีไฟล์เสียงยินยอม → ข้ามไม่ได้แม้แต่ตอน demo
 *    นี่คือจุดที่ทำให้เราต่างจาก deadbot อย่างเป็นรูปธรรม ไม่ใช่แค่พูดบนสไลด์
 *
 * 2. เก็บข้อมูล persona 2 ข้อ (ภาค + ความถี่ที่ได้กลับไปเจอท่าน)
 *    mentor บอกว่า "พอเรามีหน้าลูกค้าชัด เลยทำให้เรารู้ว่าลูกค้าต้องการอะไร"
 *    → ให้ตัวสินค้าเก็บข้อมูลนั้นเองตั้งแต่ผู้ใช้คนแรก ดีกว่าเดาใส่สไลด์
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, Square, Trash2 } from "lucide-react";
import { Button, Card, Label, Notice, inputClass, LiveWaveform } from "@/components/ui";
import AudioPlayer from "@/components/AudioPlayer";
import { fmtBytes, fmtDuration, useRecorder } from "@/lib/recorder";
import { topics } from "@/lib/demo";
import { Page } from "@/components/layout";
import type { Region, VisitFrequency } from "@/lib/types";
import { postJson } from "@/lib/api";

const REGIONS: { id: Region; label: string }[] = [
  { id: "central", label: "ภาคกลาง" },
  { id: "north", label: "ภาคเหนือ" },
  { id: "northeast", label: "ภาคอีสาน" },
  { id: "south", label: "ภาคใต้" },
];

const FREQ: { id: VisitFrequency; label: string }[] = [
  { id: "together", label: "อยู่บ้านเดียวกัน" },
  { id: "weekly", label: "ทุกสัปดาห์" },
  { id: "monthly", label: "เดือนละครั้ง" },
  { id: "fewTimesAYear", label: "ปีละไม่กี่ครั้ง" },
];

const CONSENT_SCRIPT = [
  "เดี๋ยวหนูจะอัดเสียงที่ยายเล่าเก็บไว้นะคะ",
  "เสียงจะถูกส่งให้ AI ช่วยถอดเป็นข้อความ แล้วเรียบเรียงเป็นหนังสือของยาย",
  "ยายดูได้ แก้ได้ และบอกให้ลบทิ้งได้ทุกเมื่อ",
  "ยายยินยอมให้หนูอัดไหมคะ",
];

export default function NewInterviewPage() {
  const router = useRouter();
  const rec = useRecorder();

  const [elderName, setElderName] = useState("");
  const [relation, setRelation] = useState("");
  const [region, setRegion] = useState<Region>("central");
  const [visitFrequency, setVisitFrequency] = useState<VisitFrequency>("fewTimesAYear");
  const [topic, setTopic] = useState(topics[0]?.id ?? "childhood");

  /*
   * รับหัวข้อที่เลือกมาจากหน้าหลัก (?topic=...) แล้วเลือกให้เลย
   * ชิปหัวข้อบนหน้าหลักจะได้เป็นทางลัดจริง ไม่ใช่ปุ่มประดับ
   * อ่านจาก window แทน useSearchParams เพราะตัวหลังบังคับให้ห่อ Suspense ทั้งหน้า
   */
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("topic");
    if (want && topics.some((t) => t.id === want)) setTopic(want);
  }, []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const consentUrl = rec.blob ? URL.createObjectURL(rec.blob) : null;
  const ready = elderName.trim().length > 0 && rec.blob !== null;

  async function submit() {
    if (!rec.blob) return;
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.set("elderName", elderName.trim());
      fd.set("relation", relation.trim());
      fd.set("topic", topic);
      fd.set("region", region);
      fd.set("visitFrequency", visitFrequency);
      fd.set("consentAudio", rec.blob, "consent.webm");

      const json = await postJson<{ session: { id: string } }>("/api/session", {
        method: "POST",
        body: fd,
      });
      router.push(`/interview/${json.session.id}?topic=${topic}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
      setBusy(false);
    }
  }

  return (
    <Page width="form">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-earth-700 hover:text-earth-900"
      >
        <ArrowLeft size={15} /> กลับหน้าแรก
      </Link>

      <h1 className="font-serif text-3xl text-earth-900">เริ่มเก็บเรื่องของท่าน</h1>
      <p className="mt-2 text-earth-700">
        นั่งข้างท่าน เปิดหน้านี้ แล้วทำตามทีละขั้น ใช้เวลาประมาณ 2 นาที
      </p>

      {/* ── ขั้น 1 ── */}
      <Card className="mt-8">
        <h2 className="mb-5 flex items-center gap-2 text-lg text-earth-900">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-gold-400 text-sm font-bold text-paper-50">
            1
          </span>
          ท่านคือใคร
        </h2>

        <div className="space-y-4">
          <div>
            <Label>เรียกท่านว่าอะไร</Label>
            <input
              className={inputClass}
              value={elderName}
              onChange={(e) => setElderName(e.target.value)}
              placeholder="ยายสมจิต"
            />
          </div>
          <div>
            <Label>ท่านเป็นอะไรกับคุณ</Label>
            <input
              className={inputClass}
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="ยายของนิค"
            />
          </div>

          <div>
            <Label>ท่านพูดสำเนียงภาคไหน</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRegion(r.id)}
                  className={`inline-flex min-h-12 items-center rounded-xl border px-4 transition ${
                    region === r.id
                      ? "border-gold-400 bg-gold-400/15 text-earth-900"
                      : "border-paper-300 text-earth-700 hover:border-paper-300"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-earth-500">
              ช่วยให้เราถอดเสียงได้แม่นขึ้น และรู้ว่าต้องเก็บข้อมูลภาษาถิ่นภาคไหนเพิ่ม
            </p>
          </div>

          <div>
            <Label>ปกติได้กลับไปเจอท่านบ่อยแค่ไหน</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FREQ.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setVisitFrequency(f.id)}
                  className={`inline-flex min-h-12 items-center rounded-xl border px-4 transition ${
                    visitFrequency === f.id
                      ? "border-gold-400 bg-gold-400/15 text-earth-900"
                      : "border-paper-300 text-earth-700 hover:border-paper-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>อยากเริ่มจากหัวข้อไหน</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {topics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopic(t.id)}
                  className={`inline-flex min-h-12 items-center rounded-xl border px-4 transition ${
                    topic === t.id
                      ? "border-gold-400 bg-gold-400/15 text-earth-900"
                      : "border-paper-300 text-earth-700 hover:border-paper-300"
                  }`}
                >
                  {t.icon} {t.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── ขั้น 2 ── */}
      <Card className="mt-5">
        <h2 className="mb-2 flex items-center gap-2 text-lg text-earth-900">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-gold-400 text-sm font-bold text-paper-50">
            2
          </span>
          ขอความยินยอมจากท่านเอง
        </h2>
        <p className="mb-5 text-sm text-earth-700">
          อ่าน 4 ประโยคนี้ให้ท่านฟัง แล้วกดอัดคำตอบของท่าน —{" "}
          <strong className="text-earth-900">ข้ามขั้นนี้ไม่ได้</strong>{" "}
          เพราะเรื่องของท่านต้องเริ่มจากปากของท่านเอง
        </p>

        <ol className="mb-6 space-y-2 rounded-xl border border-paper-300 bg-paper-200 p-4">
          {CONSENT_SCRIPT.map((line, i) => (
            <li key={i} className="flex gap-3 text-earth-800">
              <span className="shrink-0 tabular-nums text-earth-500">{i + 1}.</span>
              <span className={i === 3 ? "font-medium text-gold-300" : ""}>{line}</span>
            </li>
          ))}
        </ol>

        {rec.state === "recording" && <LiveWaveform level={rec.level} active />}

        {rec.state !== "done" ? (
          <div className="flex flex-wrap items-center gap-3">
            {rec.state === "recording" ? (
              <Button variant="danger" onClick={rec.stop}>
                <Square size={16} /> หยุดอัด
              </Button>
            ) : (
              <Button onClick={rec.start}>
                <Mic size={16} /> อัดคำตอบของท่าน
              </Button>
            )}

            {rec.state === "recording" && (
              <span className="tabular-nums text-earth-700">{fmtDuration(rec.ms)}</span>
            )}

            <label className="cursor-pointer text-sm text-earth-700 underline decoration-paper-400 hover:text-earth-900">
              หรืออัปโหลดไฟล์เสียงที่อัดไว้
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && rec.useFile(e.target.files[0])}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            {consentUrl && (
              <AudioPlayer src={consentUrl} clipId="consent" label="คำยินยอมของท่าน" />
            )}
            <div className="flex items-center gap-3 text-sm text-earth-700">
              <span>{rec.blob ? fmtBytes(rec.blob.size) : ""}</span>
              <Button variant="quiet" size="sm" onClick={rec.reset}>
                <Trash2 size={14} /> อัดใหม่
              </Button>
            </div>
          </div>
        )}

        {rec.error && (
          <div className="mt-4">
            <Notice tone="warn">{rec.error}</Notice>
          </div>
        )}
      </Card>

      {err && (
        <div className="mt-5">
          <Notice tone="error">{err}</Notice>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <Button size="lg" disabled={!ready || busy} onClick={submit}>
          {busy ? "กำลังเริ่ม…" : "เริ่มสัมภาษณ์"}
        </Button>
        {!ready && (
          <span className="text-sm text-earth-500">
            ต้องใส่ชื่อท่านและอัดคำยินยอมก่อน
          </span>
        )}
      </div>
    </Page>
  );
}
