import { Type, type Schema } from "@google/genai";

export const CATEGORIES = [
  "design",
  "content",
  "video",
  "translation",
  "marketing",
  "other",
] as const;

export const SYSTEM_PROMPT = `당신은 "재능잇다" 플랫폼에서 소상공인의 막연한 의뢰 원문을 대학생이 수행 가능한 프로젝트로 구조화하는 어시스턴트입니다.

반드시 아래 스키마를 따르는 JSON 객체 하나만 반환하세요. 설명, 마크다운 코드블록(\`\`\`), 그 외 어떤 텍스트도 포함하지 마세요.

[필드 설명]
- title: 프로젝트 제목, 20자 이내
- goal: 프로젝트 목표를 한 문장으로
- category: "design" | "content" | "video" | "translation" | "marketing" | "other" 중 하나
- deliverables: 구체적인 산출물 목록 (예: "카드뉴스 3장 (1080x1350)")
- requiredSkills: 필요한 스킬 태그, 소문자 영문 (예: photoshop, illustrator, video, premiere, ppt, blog, copywriting, translation, marketing, instagram, figma, canva)
- difficulty: "mini" | "standard"
- estimatedHours: 예상 소요 시간(정수)
- durationDays: 수행 기간(일, 정수)
- revisionCount: 항상 1
- isOutOfScope: 아래 [범위 초과 판정 기준]에 하나라도 해당하면 true, 아니면 false
- outOfScopeReason: 범위 초과 사유를 한 문장으로. 범위 초과가 아니면 null
- suggestedSplit: 범위 초과인 경우에만 수행 가능한 단위로 쪼갠 프로젝트 제안 2~4개. 범위 초과가 아니면 빈 배열

[범위 초과 판정 기준] (하나라도 해당하면 isOutOfScope: true)
1. 특정 성과 보장 요구 — 예: "팔로워 1만 명", "매출 20% 상승", "조회수 10만 회 이상"
2. 지속 운영 요구 — 예: "6개월간 SNS 계정 관리", "매주 촬영 방문"
3. 대형 개발 — 예: "홈페이지 전체 구축", "쇼핑몰 시스템 개발"

범위 초과인 경우 suggestedSplit에는 원래 요청 중 실제로 수행 가능한 부분만 골라 2~4개의 독립적인 단위 프로젝트로 쪼갠 제안을 담으세요.
예) "인스타 팔로워 1만 명 만들어주세요" →
["콘텐츠 기획 및 카드뉴스 8종 제작", "1개월 인스타그램 피드 콘텐츠 4건 제작", "해시태그·캡션 가이드 문서 작성"]`;

export function buildUserPrompt(rawRequest: string) {
  return `다음은 소상공인이 남긴 의뢰 원문입니다. 위 규칙에 따라 JSON으로 구조화하세요.

"""
${rawRequest}
"""`;
}

export const STRUCTURE_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "프로젝트 제목 (20자 이내)" },
    goal: { type: Type.STRING, description: "프로젝트 목표 한 문장" },
    category: {
      type: Type.STRING,
      format: "enum",
      enum: [...CATEGORIES],
    },
    deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
    requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    difficulty: {
      type: Type.STRING,
      format: "enum",
      enum: ["mini", "standard"],
    },
    estimatedHours: { type: Type.INTEGER },
    durationDays: { type: Type.INTEGER },
    revisionCount: { type: Type.INTEGER },
    isOutOfScope: { type: Type.BOOLEAN },
    outOfScopeReason: { type: Type.STRING, nullable: true },
    suggestedSplit: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "title",
    "goal",
    "category",
    "deliverables",
    "requiredSkills",
    "difficulty",
    "estimatedHours",
    "durationDays",
    "revisionCount",
    "isOutOfScope",
    "suggestedSplit",
  ],
};
