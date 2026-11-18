/**
 * โหลด mock data สำหรับ:
 * 1. ให้สาย Face (ศิลป) build หน้าจอได้ทันทีโดยไม่ต้องรอ API
 * 2. Demo mode (?demo=1) ตอน pitch — ถ้าเน็ตหรือ Gemini ล่ม ยัง demo ครบเส้นทางได้
 *
 * ⚠️ ข้อมูลชุดนี้มีรูปร่างเหมือนของจริง 100% แต่เสียงเป็นไฟล์ placeholder
 * พอได้เสียงจริงของปู่ย่าตายายแล้ว นิคจะรัน pipeline จริงแล้ว regenerate ทับ
 */

import type { Chapter, Clip, Session, Topic } from "./types";

import sessionJson from "@/data/demo/session.json";
import clipsJson from "@/data/demo/clips.json";
import chapterJson from "@/data/demo/chapter.json";
import questionsJson from "@/data/questions.json";

export const demoSession = sessionJson as Session;
export const demoClips = clipsJson as Clip[];
export const demoChapter = chapterJson as Chapter;
export const topics = questionsJson as Topic[];

/** claim ทั้งหมดจากทุกคลิปในหัวข้อนี้ รวมทั้งที่ตรวจไม่ผ่าน */
export const demoClaims = demoClips.flatMap((c) => c.claims);

export const getTopic = (id: string) => topics.find((t) => t.id === id) ?? null;

export const getDemoClip = (id: string) => demoClips.find((c) => c.id === id) ?? null;

/** เปิด demo mode ด้วย ?demo=1 บน URL ไหนก็ได้ */
export const isDemoMode = (searchParams: URLSearchParams | { demo?: string }) =>
  searchParams instanceof URLSearchParams
    ? searchParams.get("demo") === "1"
    : searchParams.demo === "1";
