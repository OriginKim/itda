export type ProjectCategory =
  | "design"
  | "content"
  | "video"
  | "translation"
  | "marketing"
  | "other";

export type ProjectDifficulty = "mini" | "standard";

export type StructuredProject = {
  title: string; // 프로젝트 제목 (20자 이내)
  goal: string; // 목표 한 문장
  category: ProjectCategory;
  deliverables: string[]; // 산출물 목록 (예: ["카드뉴스 3장 (1080x1350)"])
  requiredSkills: string[]; // 필요 스킬 태그 (소문자 영문)
  difficulty: ProjectDifficulty;
  estimatedHours: number; // 예상 소요 시간
  durationDays: number; // 수행 기간(일)
  revisionCount: 1; // 항상 1
  isOutOfScope: boolean; // 범위 초과 여부
  outOfScopeReason: string | null;
  suggestedSplit: string[]; // 범위 초과 시 쪼갠 프로젝트 제안
};

// ============================================================
// Supabase 테이블 로우 타입 (supabase/schema.sql과 대응)
// ============================================================
export type DbStudent = {
  id: string;
  name: string;
  major: string;
  skills: string[];
  interests: string[];
  weekly_hours: number;
  completed_count: number;
  completion_rate: number;
  ontime_rate: number;
  created_at: string;
};

export type DbMerchant = {
  id: string;
  name: string;
  category: string;
  district: string;
  created_at: string;
};

export type DbProject = {
  id: string;
  merchant_id: string;
  student_id: string | null;
  raw_request: string;
  title: string | null;
  goal: string | null;
  category: string | null;
  deliverables: string[] | null;
  required_skills: string[] | null;
  difficulty: string | null;
  estimated_hours: number | null;
  duration_days: number | null;
  revision_count: number;
  is_out_of_scope: boolean;
  out_of_scope_reason: string | null;
  suggested_split: string[] | null;
  status: string;
  created_at: string;
};

export type DbApplication = {
  id: string;
  project_id: string;
  student_id: string;
  match_score: number;
  score_breakdown: {
    skill: number;
    availability: number;
    experience: number;
    interest: number;
    trust: number;
  };
  status: string;
  created_at: string;
};

export type DbIssue = {
  id: string;
  project_id: string;
  type: string;
  description: string | null;
  status: string;
  created_at: string;
};
