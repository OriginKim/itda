# 재능잇다 (itda) — 프로젝트 지시서

> 이 문서는 Claude Code가 처음부터 끝까지 따라 실행하는 작업 지시서다.
> 위에서 아래로 순서대로 진행한다. 각 STEP은 하나의 이슈 → 브랜치 → PR → 머지 사이클로 처리한다.

---

## 0. 프로젝트 개요

**서비스명**: 재능잇다 (itda)
**한 줄 정의**: 소상공인의 막연한 요청을 AI가 수행 가능한 프로젝트로 구조화하고, 역량이 맞는 대학생과 연결하는 웹 플랫폼
**레포**: https://github.com/OriginKim/itda.git

**중요 전제**: 이것은 **24시간 해커톤 데모용 MVP**다. 실서비스가 아니다.
- 발표 화면에서 "실제로 작동하는 것처럼" 보이는 것이 목표
- 인증/결제/파일업로드/실시간알림/이메일 **구현하지 않는다**
- 완성도 > 기능 개수. 화면 7개가 매끄럽게 도는 것이 목표

---

## 1. 사람이 먼저 해야 하는 사전 준비 (Claude Code가 할 수 없음)

> 아래 3가지는 사용자가 직접 해야 한다. Claude Code는 STEP 0에서 이 값들이 `.env.local`에 있는지 확인하고, 없으면 사용자에게 요청한 뒤 대기한다.

### 1-1. Supabase 프로젝트 생성

1. https://supabase.com 접속 → GitHub 계정으로 로그인
2. `New project` 클릭
   - Name: `itda`
   - Database Password: 임의 생성 후 **어딘가 저장** (나중에 필요)
   - Region: `Northeast Asia (Seoul)` 선택
   - Plan: **Free**
3. 생성까지 약 2분 대기
4. 좌측 메뉴 `Project Settings` → `API` 이동
5. 아래 두 값을 복사
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` 키 → `SUPABASE_SERVICE_ROLE_KEY` (seed 스크립트용, **절대 클라이언트 노출 금지**)

### 1-2. Anthropic API 키 발급

1. https://console.anthropic.com 접속 → 로그인
2. `API Keys` → `Create Key`
3. 발급된 키 복사 → `ANTHROPIC_API_KEY`
4. 크레딧이 없으면 `Billing`에서 최소 금액($5) 충전 (Haiku 기준 1,500건 처리해도 $15 이하)

### 1-3. `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 만들고 아래 형식으로 채운다.

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
ANTHROPIC_API_KEY=sk-ant-...
```

**`.env.local`은 반드시 `.gitignore`에 포함되어야 한다. 절대 커밋하지 않는다.**

### 1-4. (마지막에) Vercel 배포

STEP 9에서 안내한다. 지금은 하지 않아도 된다.

---

## 2. 기술 스택

| 영역 | 기술 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 15 (App Router) | TypeScript |
| 스타일 | Tailwind CSS v4 | |
| UI 컴포넌트 | shadcn/ui | 필요한 것만 선택 설치 |
| 애니메이션 | Framer Motion | 절제해서 사용 |
| 아이콘 | lucide-react | 이모지 금지 |
| DB | Supabase (Postgres) | Free tier |
| AI | Anthropic API, `claude-haiku-4-5-20251001` | API Route에서만 호출 |
| 폰트 | Pretendard (한글), Inter (영문/숫자) | CDN |
| 배포 | Vercel | Hobby(무료) |

**인증은 구현하지 않는다.** 대신 화면 상단에 **역할 전환 토글**(소상공인 / 학생 / 관리자)을 두고, 선택된 역할을 `localStorage` 대신 **React Context + URL query**로 관리한다. 데모에서 3개 관점을 즉시 전환해 보여주기 위함이다.

---

## 3. 디자인 원칙

### 톤
애플·나이키 계열의 **절제된 미니멀**. 여백이 8할이다.

### 색
```
배경      #FFFFFF / #FAFAFA (섹션 구분용)
텍스트    #111111 (제목) / #6B7280 (본문 보조)
보더      #E5E7EB
액센트    #132482 (버튼, 활성 상태, 강조 숫자에만 극소량)
성공/경고 #059669 / #DC2626 (상태 배지에만)
```

### 금지 사항 (AI틱함 방지)
- 그라디언트 배경 (특히 보라-파랑 계열) **금지**
- 이모지 아이콘 **금지** → lucide-react 라인 아이콘만
- 카드마다 다른 색 **금지** → 전부 흰 배경 + 얇은 보더로 통일
- 제목 아래 액센트 밑줄 **금지**
- 사이드 컬러 바, 헤더 컬러 스트라이프 **금지**

### 타이포
- 히어로: 48~64px, `font-semibold`, `tracking-tight`
- 섹션 제목: 28~32px, `font-semibold`
- 카드 제목: 16~18px, `font-medium`
- 본문: 15px, `leading-relaxed`
- 캡션: 13px, `text-gray-500`

### 모션 (Framer Motion)
```
스크롤 진입   opacity 0→1, y 16→0, duration 0.5, ease [0.16, 1, 0.3, 1]
카드 호버     scale 1.01, shadow-sm → shadow-md, duration 0.2
페이지 전환   crossfade 0.3
숫자 카운트업 매칭 점수는 0 → 목표값, duration 0.8
```
전환 이징은 전부 `cubic-bezier(0.16, 1, 0.3, 1)`로 통일한다.

### 레이아웃
- 최대 폭 `max-w-6xl mx-auto`, 좌우 패딩 `px-6`
- 섹션 간 여백 `py-20` 이상
- 카드 라운드 `rounded-xl` (12px) 통일
- 그림자는 `shadow-sm` 기본, 호버 시 `shadow-md`

---

## 4. 데이터 모델 (Supabase 테이블)

```sql
-- 학생
create table students (
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

-- 매장(소상공인)
create table merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,              -- 음식점/카페/공방/소매점/미용실
  district text not null,
  created_at timestamptz default now()
);

-- 프로젝트
create table projects (
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

-- 지원
create table applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  student_id uuid references students(id),
  match_score int not null,
  score_breakdown jsonb not null,       -- {skill:36,availability:20,...}
  status text default 'applied',        -- applied/accepted/rejected
  created_at timestamptz default now()
);

-- 상호 평가
create table reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  direction text not null,              -- merchant_to_student / student_to_merchant
  rating int not null,                  -- 1~5
  comment text,
  created_at timestamptz default now()
);

-- 관리자 이슈 (예외 상황)
create table issues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  type text not null,
  -- match_failed / no_response / dropout / scope_dispute / approval_dispute
  description text,
  status text default 'open',           -- open/resolved
  created_at timestamptz default now()
);
```

RLS는 데모용이므로 **모든 테이블에 대해 anon 읽기/쓰기 허용 정책**을 넣는다. (실서비스 아님을 주석으로 명시)

---

## 5. AI 응답 스키마 (고정)

`/api/structure` POST 엔드포인트에서 Haiku를 호출한다. 프롬프트는 **JSON만 반환하도록** 강제하고, 아래 스키마를 벗어나면 재시도 1회 후 실패 처리한다.

```ts
type StructuredProject = {
  title: string;              // 프로젝트 제목 (20자 이내)
  goal: string;               // 목표 한 문장
  category: 'design' | 'content' | 'video' | 'translation' | 'marketing' | 'other';
  deliverables: string[];     // 산출물 목록 (예: ["카드뉴스 3장 (1080x1350)"])
  requiredSkills: string[];   // 필요 스킬 태그 (소문자 영문)
  difficulty: 'mini' | 'standard';
  estimatedHours: number;     // 예상 소요 시간
  durationDays: number;       // 수행 기간(일)
  revisionCount: 1;           // 항상 1
  isOutOfScope: boolean;      // 범위 초과 여부
  outOfScopeReason: string | null;
  suggestedSplit: string[];   // 범위 초과 시 쪼갠 프로젝트 제안
};
```

### 범위 초과 판정 기준 (프롬프트에 명시)
아래에 해당하면 `isOutOfScope: true`:
- 특정 성과 보장 요구 (팔로워 N명, 매출 N% 상승, 조회수 N회)
- 지속 운영 요구 (N개월 계정 관리, 상시 촬영)
- 대형 개발 (홈페이지 전체 구축, 쇼핑몰 구축)

이 경우 `suggestedSplit`에 수행 가능한 단위로 쪼갠 안을 2~4개 제시한다.

**이 기능이 데모의 킬러 포인트다. 반드시 정확히 동작해야 한다.**

---

## 6. 매칭 점수 계산식

`lib/matching.ts`에 순수 함수로 구현한다 (테스트 가능하게).

```
총점(100) = 스킬(40) + 가용시간(20) + 경험(20) + 관심분야(10) + 신뢰도(10)

스킬     = (보유한 필요스킬 개수 / 필요스킬 총개수) × 40
가용시간 = weekly_hours >= estimated_hours ? 20 : (weekly_hours / estimated_hours) × 20
경험     = min(completed_count, 4) / 4 × 20
관심분야 = interests에 category 포함 ? 10 : 0
신뢰도   = (completion_rate × 0.6 + ontime_rate × 0.4) × 10

모든 항목 소수점 반올림, 총점도 정수
```

화면에는 **총점과 항목별 분해를 함께** 표시한다. "왜 87점인지" 설명 가능해야 한다.

---

## 7. 화면 구성 (7개)

| # | 경로 | 역할 | 내용 |
|---|---|---|---|
| 1 | `/` | 공통 | 히어로, 서비스 흐름 4단계, 통계 섹션, CTA |
| 2 | `/request/new` | 소상공인 | 요청 등록 폼 → AI 구조화 호출 |
| 3 | `/request/[id]/review` | 소상공인 | AI 결과 카드 확인 → 승인/재작성. 범위 초과 시 분할 제안 표시 |
| 4 | `/projects` | 학생 | 프로젝트 목록 그리드, 내 매칭 점수 배지, 난이도·카테고리 필터 |
| 5 | `/projects/[id]` | 학생 | 상세 + 매칭 점수 분해(막대) + 지원하기 |
| 6 | `/profile` | 학생 | 스킬·가용시간·진행중/완료 프로젝트 |
| 7 | `/admin` | 관리자 | 예외 이슈 5종 목록, 상태별 카운트, 해결 처리 |

**상단 공통 헤더**: 로고(itda) + 역할 전환 토글 + 현재 역할 표시

---

## 8. 작업 순서 (STEP 0 ~ 9)

> 각 STEP마다: 이슈 생성 → 브랜치 생성 → 작업 → 커밋 → PR 생성 → 머지 → 브랜치 삭제

### STEP 0. 사전 확인 및 초기 세팅
- `.env.local` 존재 및 4개 키 확인. 없으면 사용자에게 요청 후 **대기**
- 레포 클론 (`https://github.com/OriginKim/itda.git`)
- `.gitignore` 작성 (`.env*.local`, `node_modules`, `.next`, `.vercel`)
- Next.js 15 + TypeScript + Tailwind 초기화
- shadcn/ui 초기화, `framer-motion` `lucide-react` `@supabase/supabase-js` `@anthropic-ai/sdk` 설치
- `README.md` 작성 (프로젝트 소개, 실행 방법, 환경변수 안내)
- 커밋: `chore: 프로젝트 초기 세팅 및 의존성 설치`

### STEP 1. 디자인 시스템 + 공통 레이아웃
- `globals.css`에 폰트(Pretendard/Inter CDN), 컬러 변수, 이징 변수 정의
- 공통 컴포넌트: `Header`(역할 토글 포함), `Container`, `Badge`, `StatusBadge`, `FadeIn`(스크롤 진입 모션 래퍼)
- 역할 Context (`RoleProvider`) 구현
- 커밋: `feat: 디자인 시스템 및 공통 레이아웃 구현`

### STEP 2. Supabase 스키마 + 시드 데이터
- `supabase/schema.sql` 작성 (위 4장 그대로)
- `scripts/seed.ts` 작성 — **실행하면 아래 더미 데이터가 자동 생성되어야 함**
  - 학생 10명: 스킬·가용시간·완료실적·신뢰도를 **의도적으로 다양하게** (매칭 점수가 40~95점 범위로 흩어지도록)
  - 매장 5곳: 음식점/카페/공방/소매점/미용실
  - 프로젝트 8건: `recruiting` 3, `in_progress` 2, `completed` 3
  - 완료 3건에 상호평가 데이터 포함
  - 관리자 이슈 4건 (타입 각각 다르게)
- `npm run seed` 스크립트 등록
- 커밋: `feat: DB 스키마 및 시드 데이터 생성 스크립트 추가`

### STEP 3. AI 구조화 API
- `app/api/structure/route.ts` — Haiku 호출, JSON 스키마 강제, 파싱 실패 시 1회 재시도
- `lib/prompts.ts` — 시스템 프롬프트 (범위 초과 판정 기준 포함)
- 범위 초과 케이스 정상 동작 확인 (테스트 입력: "인스타 팔로워 1만 명 만들어주세요")
- 커밋: `feat: AI 요구사항 구조화 API 구현`

### STEP 4. 매칭 점수 로직
- `lib/matching.ts` — 순수 함수, 총점 + 분해 반환
- 간단한 단위 테스트 (`lib/matching.test.ts`) — 경계값 3케이스
- 커밋: `feat: 매칭 점수 계산 로직 구현`

### STEP 5. 소상공인 플로우 (화면 2, 3)
- 요청 등록 폼 (필수 검증, 제출 중 로딩 상태)
- AI 결과 리뷰 화면 — 프로젝트 카드 표시, 범위 초과 시 분할 제안 UI, 승인 버튼
- 승인 시 status를 `recruiting`으로 변경
- 커밋: `feat: 소상공인 요청 등록 및 AI 결과 승인 화면 구현`

### STEP 6. 학생 플로우 (화면 4, 5, 6)
- 프로젝트 목록 (필터, 매칭 점수 배지, 카드 호버 모션)
- 프로젝트 상세 (점수 분해 막대, 카운트업 애니메이션, 지원하기)
- 내 프로필
- 커밋: `feat: 학생 프로젝트 탐색 및 지원 화면 구현`

### STEP 7. 관리자 대시보드 (화면 7)
- 예외 이슈 5종 목록, 타입별 카운트 카드, 해결 처리 버튼
- 커밋: `feat: 관리자 예외 상황 대시보드 구현`

### STEP 8. 랜딩 페이지 (화면 1)
- 히어로 (큰 타이포 + fade-up)
- 서비스 흐름 4단계 (스크롤 진입 시 순차 등장)
- 통계 섹션 (21.3% 등, 카운트업)
- **가장 마지막에 만든다** — 실제 화면이 다 나온 뒤 톤을 맞추기 위함
- 커밋: `feat: 랜딩 페이지 구현`

### STEP 9. 배포 및 마무리
- 빌드 오류 정리, 콘솔 에러 제거
- Vercel 연결 안내:
  1. https://vercel.com → `Add New Project` → GitHub `itda` 레포 선택
  2. Environment Variables에 `.env.local`의 4개 키 그대로 등록
  3. Deploy
- README에 배포 URL 추가
- 커밋: `docs: 배포 URL 및 실행 방법 문서화`

---

## 9. Git 컨벤션

### 브랜치 전략 (GitHub Flow 단순화)
```
main ← feature/기능명
```
- `develop` 브랜치 없음 (24시간 프로젝트에 불필요)
- 브랜치명: `feature/setup`, `feature/design-system`, `feature/ai-api`, `fix/matching-score`
- 머지 후 브랜치 삭제

### 커밋 메시지 (타입 영문 + 내용 한글)
```
feat: 소상공인 요청 등록 폼 구현
fix: 매칭 점수 계산 오류 수정
style: 프로젝트 카드 여백 조정
refactor: AI 호출 로직 분리
docs: README 실행 방법 추가
chore: 의존성 추가
test: 매칭 점수 단위 테스트 작성
```

- 제목은 50자 이내, 명령형이 아닌 **완료형(~구현, ~수정)**
- 본문이 필요하면 한 줄 띄고 작성

### 이슈 / PR

**이슈 제목**: `[STEP N] 작업 내용`
**이슈 본문 템플릿**:
```markdown
## 작업 내용
- [ ] 항목 1
- [ ] 항목 2

## 완료 조건
- 조건 1
```

**PR 제목**: 커밋 메시지와 동일 형식
**PR 본문 템플릿**:
```markdown
## 변경 사항
-

## 관련 이슈
Closes #N

## 확인 방법
-
```

### 자동화 (GitHub CLI 사용)
Claude Code는 각 STEP마다 아래를 실행한다:
```bash
gh issue create --title "[STEP N] ..." --body "..."
git switch -c feature/...
# 작업
git add . && git commit -m "feat: ..."
git push -u origin feature/...
gh pr create --title "..." --body "Closes #N ..."
gh pr merge --squash --delete-branch
```

**주의**: `gh pr merge`는 빌드가 통과한 것을 확인한 뒤에만 실행한다. 로컬에서 `npm run build`가 성공해야 머지한다.

---

## 10. 반드시 지킬 것

1. **API 키를 코드에 하드코딩하지 않는다.** 전부 `process.env`로 읽는다.
2. **Anthropic API는 서버(API Route)에서만 호출한다.** 클라이언트에서 직접 호출 금지.
3. **`.env.local`을 커밋하지 않는다.** 커밋 전 `git status`로 확인.
4. 각 STEP 완료 후 `npm run build`가 통과해야 다음 STEP으로 넘어간다.
5. 화면을 만들 때마다 실제로 렌더링해서 확인한다. 코드만 쓰고 넘어가지 않는다.
6. 디자인 금지 사항(3장)을 어기지 않는다. 특히 그라디언트·이모지.
7. 더미 데이터 없이 빈 화면이 나오는 상태로 두지 않는다.

---

## 11. 완료 기준

- [ ] 7개 화면이 모두 렌더링되고 서로 이동 가능
- [ ] 요청 등록 → AI 구조화 → 승인 → 목록 노출까지 실제로 이어짐
- [ ] "팔로워 1만 명" 입력 시 범위 초과 판정 + 분할 제안이 정상 표시됨
- [ ] 학생별 매칭 점수가 서로 다르게 계산되어 표시됨
- [ ] 역할 토글로 3개 관점 전환 가능
- [ ] Vercel 배포 URL에서 위 항목이 모두 동작
- [ ] `.env.local`이 커밋되지 않았음을 확인
