import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  SYSTEM_PROMPT,
  STRUCTURE_RESPONSE_SCHEMA,
  buildUserPrompt,
} from "@/lib/prompts";
import type { StructuredProject } from "@/lib/types";

// gemini-2.5-flash는 신규 API 키에 더 이상 제공되지 않아
// 최신 flash 계열을 가리키는 별칭 모델로 대체했다.
const MODEL = "gemini-flash-latest";
const RETRY_INSTRUCTION =
  "이전 응답이 지정된 JSON 스키마를 따르지 않았습니다. 설명 없이, 스키마에 맞는 JSON 객체 하나만 다시 반환하세요.";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 설정되어 있지 않습니다.");
  }
  return new GoogleGenAI({ apiKey });
}

function isValidStructuredProject(
  value: unknown,
): value is Omit<StructuredProject, "revisionCount"> {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === "string" &&
    typeof v.goal === "string" &&
    typeof v.category === "string" &&
    Array.isArray(v.deliverables) &&
    Array.isArray(v.requiredSkills) &&
    (v.difficulty === "mini" || v.difficulty === "standard") &&
    typeof v.estimatedHours === "number" &&
    typeof v.durationDays === "number" &&
    typeof v.isOutOfScope === "boolean" &&
    (v.outOfScopeReason === null ||
      v.outOfScopeReason === undefined ||
      typeof v.outOfScopeReason === "string") &&
    Array.isArray(v.suggestedSplit)
  );
}

async function callGemini(
  client: GoogleGenAI,
  rawRequest: string,
  extraInstruction?: string,
): Promise<unknown> {
  const prompt = extraInstruction
    ? `${buildUserPrompt(rawRequest)}\n\n${extraInstruction}`
    : buildUserPrompt(rawRequest);

  const response = await client.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: STRUCTURE_RESPONSE_SCHEMA,
      temperature: 0.3,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("AI로부터 빈 응답을 받았습니다.");
  }

  return JSON.parse(text);
}

export async function POST(request: Request) {
  let body: { rawRequest?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청 형식입니다." },
      { status: 400 },
    );
  }

  const rawRequest = body.rawRequest?.trim();
  if (!rawRequest) {
    return NextResponse.json(
      { error: "rawRequest 값이 필요합니다." },
      { status: 400 },
    );
  }

  let client: GoogleGenAI;
  try {
    client = getClient();
  } catch (error) {
    console.error("[structure] AI 클라이언트 초기화 실패", error);
    return NextResponse.json(
      { error: "AI 서비스 설정 오류입니다." },
      { status: 500 },
    );
  }

  const maxAttempts = 2;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const parsed = await callGemini(
        client,
        rawRequest,
        attempt > 0 ? RETRY_INSTRUCTION : undefined,
      );

      if (isValidStructuredProject(parsed)) {
        const isOutOfScope = parsed.isOutOfScope;
        const result: StructuredProject = {
          title: parsed.title,
          goal: parsed.goal,
          category: parsed.category,
          deliverables: parsed.deliverables,
          requiredSkills: parsed.requiredSkills,
          difficulty: parsed.difficulty,
          estimatedHours: parsed.estimatedHours,
          durationDays: parsed.durationDays,
          revisionCount: 1,
          isOutOfScope,
          outOfScopeReason: isOutOfScope
            ? (parsed.outOfScopeReason ?? null)
            : null,
          suggestedSplit: isOutOfScope ? parsed.suggestedSplit : [],
        };
        return NextResponse.json(result);
      }

      console.warn(
        `[structure] 스키마 검증 실패 (시도 ${attempt + 1}/${maxAttempts})`,
        parsed,
      );
    } catch (error) {
      console.error(
        `[structure] AI 호출 실패 (시도 ${attempt + 1}/${maxAttempts})`,
        error,
      );
    }
  }

  return NextResponse.json(
    { error: "AI 구조화에 실패했습니다. 잠시 후 다시 시도해주세요." },
    { status: 502 },
  );
}
