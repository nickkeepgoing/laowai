-- เล่าไว้ (LaoWai) — Supabase schema
-- รันไฟล์นี้ใน Supabase Dashboard → SQL Editor → New query → Run
-- เจ้าของไฟล์: นิค (สาย Engine)

create extension if not exists "pgcrypto";

-- ผู้สูงอายุ 1 ท่าน = 1 session
create table if not exists sessions (
  id                uuid primary key default gen_random_uuid(),
  elder_name        text not null,
  relation          text not null default '',
  topic             text not null default '',
  -- เสียงที่ท่านพูดคำว่ายินยอมด้วยตัวเอง — null = ยังไม่ได้ขอ = ห้ามอัดต่อ
  consent_audio_url text,
  created_at        timestamptz not null default now()
);

-- 1 คำถาม 1 คำตอบ = 1 clip
create table if not exists clips (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references sessions(id) on delete cascade,
  question       text not null,
  audio_url      text not null,
  duration_ms    integer not null default 0,
  transcript     text not null default '',
  -- Claim[] — quote ต้องเป็นถ้อยคำต้นฉบับคำต่อคำ ตรวจด้วย verifyClaim() ก่อนบันทึก
  claims         jsonb not null default '[]'::jsonb,
  next_questions jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now()
);

-- 1 หัวข้อชีวิต = 1 บทในหนังสือ
create table if not exists chapters (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references sessions(id) on delete cascade,
  title        text not null,
  -- Paragraph[] — ทุกย่อหน้าต้องมี claimIds อย่างน้อย 1
  paragraphs   jsonb not null default '[]'::jsonb,
  approved     boolean not null default false,
  -- token สุ่มสำหรับ /book/[token] และ QR — เพิกถอนได้ด้วยการ update ค่าใหม่
  share_token  text not null unique default encode(gen_random_bytes(12), 'hex'),
  created_at   timestamptz not null default now()
);

create index if not exists clips_session_idx    on clips(session_id);
create index if not exists chapters_session_idx on chapters(session_id);
create index if not exists chapters_token_idx   on chapters(share_token);

-- ─────────────────────────────────────────────────────────────
-- RLS
-- hackathon prototype: เปิดกว้างไว้ก่อนเพื่อความเร็วในการ build
-- ⚠️ ห้ามใส่ข้อมูลจริงของครอบครัวอื่นลงฐานนี้
-- ก่อนใช้จริงต้องเปลี่ยนเป็น policy ที่ผูกกับ family membership
-- ─────────────────────────────────────────────────────────────
alter table sessions enable row level security;
alter table clips    enable row level security;
alter table chapters enable row level security;

drop policy if exists dev_all on sessions;
drop policy if exists dev_all on clips;
drop policy if exists dev_all on chapters;

create policy dev_all on sessions for all using (true) with check (true);
create policy dev_all on clips    for all using (true) with check (true);
create policy dev_all on chapters for all using (true) with check (true);

-- ─────────────────────────────────────────────────────────────
-- Storage bucket สำหรับไฟล์เสียง
-- ทำผ่าน Dashboard → Storage → New bucket
--   ชื่อ: clips
--   Public: ✅ (prototype เท่านั้น — ของจริงต้องใช้ signed URL)
-- ─────────────────────────────────────────────────────────────

-- ปุ่มลืม: ลบคลิป แล้วย่อหน้าที่อ้าง claim ของคลิปนั้นต้องหายตามไปด้วย
-- (ทำใน /api/forget ฝั่ง app ไม่ใช่ใน SQL เพราะต้องแก้ jsonb ของ paragraphs)
