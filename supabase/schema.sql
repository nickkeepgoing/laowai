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
  created_at        timestamptz not null default now(),
  -- ข้อมูล persona: mentor บอกว่า "พอเรามีหน้าลูกค้าชัด เลยรู้ว่าลูกค้าต้องการอะไร"
  -- เก็บจากผู้ใช้จริงตั้งแต่วันแรก ดีกว่าเดาใส่สไลด์
  region            text,   -- central | north | northeast | south
  visit_frequency   text    -- together | weekly | monthly | fewTimesAYear
);

-- เผื่อใครรัน schema เวอร์ชันก่อนหน้าไปแล้ว
alter table sessions add column if not exists region          text;
alter table sessions add column if not exists visit_frequency text;

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

-- ─────────────────────────────────────────────────────────────
-- corrections — Dialect Correction Flywheel
--
-- mentor แนะ 2 เรื่องที่จริง ๆ เป็นเรื่องเดียวกัน:
--   "เก็บตัวอย่างคลื่นเสียงต่อคำถิ่น"  +  "มนุษย์ต้องเป็นคนแก้"
-- ทุกครั้งที่ครอบครัวแก้คำที่ AI ถอดผิด เราได้ข้อมูล 1 คู่ฟรี
-- ยิ่งมีครอบครัวใช้มาก dataset ภาษาถิ่นยิ่งโต → คู่แข่งที่มาทีหลังไล่ไม่ทัน
-- นี่คือคำตอบของ "ผู้ชนะของตลาดคือคนที่อยู่ได้นานที่สุด"
--
-- ⚠️ ความเป็นส่วนตัวต้องมาพร้อมกัน ไม่ใช่ตามหลัง
-- proposal เราประกาศว่า "ไม่นำเสียงไปฝึกโมเดลโดยไม่มีความยินยอมแยกต่างหาก"
-- ฉะนั้นค่าตั้งต้นเก็บเฉพาะ asr_text → human_text + region
-- clip_id กับ span_start_ms เป็น null เว้นแต่ครอบครัวติ๊กยินยอมแยกที่หน้าตรวจ
-- ─────────────────────────────────────────────────────────────
create table if not exists corrections (
  id            uuid primary key default gen_random_uuid(),
  asr_text      text not null,            -- AI ถอดว่าอะไร
  human_text    text not null,            -- ครอบครัวแก้เป็นอะไร
  region        text,                     -- ภาคของผู้เล่า
  -- ผูกกลับไปที่เสียงได้เฉพาะเมื่อ opt-in (ปุ่มลืมจะลบตามด้วย on delete cascade)
  clip_id       uuid references clips(id) on delete cascade,
  span_start_ms integer,
  created_at    timestamptz not null default now()
);

create index if not exists corrections_region_idx on corrections(region);
create index if not exists corrections_clip_idx   on corrections(clip_id);

create index if not exists clips_session_idx    on clips(session_id);
create index if not exists chapters_session_idx on chapters(session_id);
create index if not exists chapters_token_idx   on chapters(share_token);

-- ─────────────────────────────────────────────────────────────
-- RLS
-- hackathon prototype: เปิดกว้างไว้ก่อนเพื่อความเร็วในการ build
-- ⚠️ ห้ามใส่ข้อมูลจริงของครอบครัวอื่นลงฐานนี้
-- ก่อนใช้จริงต้องเปลี่ยนเป็น policy ที่ผูกกับ family membership
-- ─────────────────────────────────────────────────────────────
alter table sessions    enable row level security;
alter table clips       enable row level security;
alter table chapters    enable row level security;
alter table corrections enable row level security;

drop policy if exists dev_all on sessions;
drop policy if exists dev_all on clips;
drop policy if exists dev_all on chapters;
drop policy if exists dev_all on corrections;

create policy dev_all on sessions    for all using (true) with check (true);
create policy dev_all on clips       for all using (true) with check (true);
create policy dev_all on chapters    for all using (true) with check (true);
create policy dev_all on corrections for all using (true) with check (true);

-- ⚠️ RLS policy อย่างเดียวไม่พอ ต้อง GRANT สิทธิ์ระดับตารางให้ role anon ด้วย
-- ไม่มีบรรทัดนี้จะได้ 401 permission denied for table sessions (เจอจริงตอนเทสต์)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on sessions    to anon, authenticated;
grant select, insert, update, delete on clips       to anon, authenticated;
grant select, insert, update, delete on chapters    to anon, authenticated;
grant select, insert, update, delete on corrections to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Storage bucket สำหรับไฟล์เสียง — สร้างจาก SQL ไปเลย ไม่ต้องกดใน Dashboard
--
-- bucket แบบ public ให้สิทธิ์ "อ่าน" สาธารณะเท่านั้น
-- การอัปโหลดยังต้องมี policy บน storage.objects ไม่งั้นจะอัปไม่ขึ้น
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('clips', 'clips', true)
on conflict (id) do update set public = true;

drop policy if exists clips_public_read on storage.objects;
drop policy if exists clips_anon_upload on storage.objects;

create policy clips_public_read on storage.objects
  for select using (bucket_id = 'clips');

create policy clips_anon_upload on storage.objects
  for insert with check (bucket_id = 'clips');

-- ปุ่มลืม: ลบคลิป แล้วย่อหน้าที่อ้าง claim ของคลิปนั้นต้องหายตามไปด้วย
-- (ทำใน /api/forget ฝั่ง app ไม่ใช่ใน SQL เพราะต้องแก้ jsonb ของ paragraphs)
