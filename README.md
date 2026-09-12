# 재능잇다 (itda)

소상공인의 막연한 요청을 AI가 수행 가능한 프로젝트로 구조화하고, 역량이 맞는 대학생과 연결하는 웹 플랫폼입니다.

> 본 프로젝트는 24시간 해커톤 데모용 MVP입니다. 인증/결제/파일업로드/실시간알림/이메일은 구현하지 않았습니다.

## 기술 스택

- **프레임워크**: Next.js 15 (App Router) + TypeScript
- **스타일**: Tailwind CSS v4, shadcn/ui
- **애니메이션**: Framer Motion
- **아이콘**: lucide-react
- **DB**: Supabase (Postgres)
- **AI**: Google Gemini API (`gemini-3.6-flash`) — `gemini-2.5-flash`는 신규 API 키에 더 이상 제공되지 않아(404) Google이 공식 후속 모델로 안내하는 `gemini-3.6-flash`로 대체

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 값을 채웁니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
GEMINI_API_KEY=AIza...
```

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 프로젝트 설정 → API 에서 확인
- `SUPABASE_SERVICE_ROLE_KEY`: 시드 스크립트 전용 (절대 클라이언트에 노출하지 않음)
- `GEMINI_API_KEY`: [Google AI Studio](https://aistudio.google.com/apikey)에서 발급

`.env.local`은 `.gitignore`에 포함되어 있으며 커밋되지 않습니다.

### 3. DB 시드 데이터 생성

```bash
npm run seed
```

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속

## 화면 구성

| 경로 | 역할 | 내용 |
|---|---|---|
| `/` | 공통 | 히어로, 서비스 흐름, 통계, CTA |
| `/request/new` | 소상공인 | 요청 등록 → AI 구조화 |
| `/request/[id]/review` | 소상공인 | AI 결과 확인 → 승인/재작성 |
| `/projects` | 학생 | 프로젝트 목록 + 매칭 점수 |
| `/projects/[id]` | 학생 | 상세 + 매칭 점수 분해 + 지원 |
| `/profile` | 학생 | 스킬/가용시간/진행 현황 |
| `/admin` | 관리자 | 예외 이슈 대시보드 |

인증은 구현하지 않으며, 상단 헤더의 역할 전환 토글로 소상공인/학생/관리자 관점을 전환합니다.

## 배포

- 배포 URL: https://itda-ki3343yen-giwonkims-projects.vercel.app

> ⚠️ 현재 URL은 Vercel의 **Deployment Protection**이 켜져 있어 Vercel 로그인 없이는
> 접근할 수 없습니다. 심사/발표 등 외부 공개가 필요하면 Vercel 프로젝트 설정
> (Settings → Deployment Protection)에서 해제한 뒤 공개 URL로 안내해주세요.
