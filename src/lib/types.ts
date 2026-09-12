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
