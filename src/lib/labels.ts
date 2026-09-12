export const CATEGORY_LABELS: Record<string, string> = {
  design: "디자인",
  content: "콘텐츠",
  video: "영상",
  translation: "번역",
  marketing: "마케팅",
  other: "기타",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  mini: "미니",
  standard: "스탠다드",
};

export const ISSUE_TYPE_LABELS: Record<string, string> = {
  match_failed: "매칭 실패",
  no_response: "무응답",
  dropout: "중도 포기",
  scope_dispute: "범위 이견",
  approval_dispute: "승인 이견",
};

export const ISSUE_TYPES = Object.keys(ISSUE_TYPE_LABELS);
