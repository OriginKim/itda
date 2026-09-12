-- 재능잇다 (itda) — 데이터베이스 스키마
-- 24시간 해커톤 데모용 MVP. 인증을 구현하지 않으므로 RLS는 anon 역할에
-- 읽기/쓰기를 전면 허용한다. 실서비스에는 절대 이 정책을 사용하지 않는다.

create extension if not exists "pgcrypto";

-- ============================================================
-- 학생
-- ============================================================
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  major text not null,
  skills text[] not null,              -- ['photoshop','illustrator','video']
  interests text[] not null,           -- ['design','content']
  weekly_hours int not null,           -- 주간 가용 시간
  completed_count int default 0,
  completion_rate numeric default 1.0, -- 0.0 ~ 1.0
  ontime_rate numeric default 1.0,     -- 0.0 ~ 1.0
  created_at timestamptz default now()
);

-- ============================================================
-- 매장 (소상공인)
-- ============================================================
create table if not exists merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,              -- 음식점/카페/공방/소매점/미용실
  district text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- 프로젝트
-- ============================================================
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id),
  student_id uuid references students(id),          -- 매칭 전 null
  raw_request text not null,                        -- 소상공인 원문
  title text,
  goal text,
  category text,                                    -- design/content/video/translation/marketing/other
  deliverables text[],
  required_skills text[],
  difficulty text,                                  -- mini/standard
  estimated_hours int,
  duration_days int,
  revision_count int default 1,
  is_out_of_scope boolean default false,
  out_of_scope_reason text,
  suggested_split text[],
  status text default 'draft',
  -- draft → pending_approval → recruiting → in_progress → reviewing → completed
  created_at timestamptz default now()
);

-- ============================================================
-- 지원
-- ============================================================
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  student_id uuid references students(id),
  match_score int not null,
  score_breakdown jsonb not null,       -- {skill:36,availability:20,...}
  status text default 'applied',        -- applied/accepted/rejected
  created_at timestamptz default now()
);

-- ============================================================
-- 상호 평가
-- ============================================================
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  direction text not null,              -- merchant_to_student / student_to_merchant
  rating int not null,                  -- 1~5
  comment text,
  created_at timestamptz default now()
);

-- ============================================================
-- 관리자 이슈 (예외 상황)
-- ============================================================
create table if not exists issues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  type text not null,
  -- match_failed / no_response / dropout / scope_dispute / approval_dispute
  description text,
  status text default 'open',           -- open/resolved
  created_at timestamptz default now()
);

-- ============================================================
-- RLS: 데모용 anon 전면 허용 정책
-- 실서비스가 아니므로 인증 없이 anon 키로 모든 CRUD를 허용한다.
-- ============================================================
alter table students enable row level security;
alter table merchants enable row level security;
alter table projects enable row level security;
alter table applications enable row level security;
alter table reviews enable row level security;
alter table issues enable row level security;

drop policy if exists "demo_anon_all" on students;
create policy "demo_anon_all" on students for all using (true) with check (true);

drop policy if exists "demo_anon_all" on merchants;
create policy "demo_anon_all" on merchants for all using (true) with check (true);

drop policy if exists "demo_anon_all" on projects;
create policy "demo_anon_all" on projects for all using (true) with check (true);

drop policy if exists "demo_anon_all" on applications;
create policy "demo_anon_all" on applications for all using (true) with check (true);

drop policy if exists "demo_anon_all" on reviews;
create policy "demo_anon_all" on reviews for all using (true) with check (true);

drop policy if exists "demo_anon_all" on issues;
create policy "demo_anon_all" on issues for all using (true) with check (true);
