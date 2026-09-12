"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { Badge } from "@/components/common/badge";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/labels";

type ProjectRow = {
  id: string;
  raw_request: string;
  title: string | null;
  goal: string | null;
  category: string | null;
  deliverables: string[] | null;
  required_skills: string[] | null;
  difficulty: string | null;
  estimated_hours: number | null;
  duration_days: number | null;
  is_out_of_scope: boolean;
  out_of_scope_reason: string | null;
  suggested_split: string[] | null;
  status: string;
};

export default function RequestReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError || !data) {
          setError("프로젝트를 찾을 수 없습니다.");
        } else {
          setProject(data);
          setApproved(data.status !== "draft");
        }
        setLoading(false);
      });
  }, [id]);

  async function handleApprove() {
    if (!project) return;
    setApproving(true);
    const { error: updateError } = await supabase
      .from("projects")
      .update({ status: "recruiting" })
      .eq("id", project.id);
    setApproving(false);
    if (updateError) {
      setError("승인 처리에 실패했습니다.");
      return;
    }
    setApproved(true);
  }

  if (loading) {
    return (
      <Container className="max-w-2xl py-20">
        <p className="text-[15px] text-subtle">불러오는 중...</p>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container className="max-w-2xl py-20">
        <p className="text-[15px] text-danger">
          {error ?? "프로젝트를 찾을 수 없습니다."}
        </p>
        <Link
          href="/request/new"
          className="mt-4 inline-block text-[15px] font-medium text-brand"
        >
          다시 요청하기
        </Link>
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl py-20">
      <FadeIn>
        <p className="text-[13px] font-medium text-subtle">AI 구조화 결과</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          {project.is_out_of_scope
            ? "범위 조정이 필요해요"
            : "이렇게 진행할게요"}
        </h1>
      </FadeIn>

      <FadeIn
        delay={0.1}
        className="mt-8 rounded-xl border border-hairline bg-white p-6 shadow-sm"
      >
        <p className="text-[13px] font-medium text-subtle">원본 요청</p>
        <p className="mt-1 text-[15px] leading-relaxed text-foreground">
          {project.raw_request}
        </p>
      </FadeIn>

      {project.is_out_of_scope ? (
        <FadeIn
          delay={0.15}
          className="mt-6 rounded-xl border border-danger/20 bg-danger/5 p-6"
        >
          <div className="flex items-start gap-3">
            <CircleAlert size={18} className="mt-0.5 shrink-0 text-danger" />
            <div>
              <p className="text-[15px] font-medium text-foreground">
                이 요청은 현재 범위를 벗어나요
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-subtle">
                {project.out_of_scope_reason}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[13px] font-medium text-foreground">
              이렇게 나눠서 진행해보세요
            </p>
            <ul className="mt-3 space-y-2">
              {(project.suggested_split ?? []).map((split, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-hairline bg-white px-4 py-3 text-[14px] leading-relaxed text-foreground"
                >
                  {split}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/request/new"
            className="mt-6 inline-block rounded-full border border-hairline px-5 py-2.5 text-[15px] font-medium text-foreground transition-colors duration-200 hover:bg-surface"
          >
            다시 작성하기
          </Link>
        </FadeIn>
      ) : (
        <>
          <FadeIn
            delay={0.15}
            className="mt-6 rounded-xl border border-hairline bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-medium text-foreground">
              {project.title}
            </h2>
            <p className="mt-1 text-[15px] leading-relaxed text-subtle">
              {project.goal}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-[14px]">
              <div>
                <dt className="text-subtle">카테고리</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {CATEGORY_LABELS[project.category ?? ""] ??
                    project.category}
                </dd>
              </div>
              <div>
                <dt className="text-subtle">난이도</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {DIFFICULTY_LABELS[project.difficulty ?? ""] ??
                    project.difficulty}
                </dd>
              </div>
              <div>
                <dt className="text-subtle">예상 소요 시간</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {project.estimated_hours}시간
                </dd>
              </div>
              <div>
                <dt className="text-subtle">수행 기간</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {project.duration_days}일
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <p className="text-[13px] text-subtle">산출물</p>
              <ul className="mt-2 space-y-1">
                {(project.deliverables ?? []).map((deliverable, index) => (
                  <li key={index} className="text-[14px] text-foreground">
                    · {deliverable}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(project.required_skills ?? []).map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="mt-8 flex items-center gap-3">
            {approved ? (
              <p className="inline-flex items-center gap-2 text-[15px] font-medium text-success">
                <CheckCircle2 size={18} />
                승인 완료 · 모집이 시작됩니다
              </p>
            ) : (
              <>
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="rounded-full bg-brand px-5 py-2.5 text-[15px] font-medium text-white transition-opacity duration-200 disabled:opacity-60"
                >
                  {approving ? "처리 중..." : "승인하고 모집 시작"}
                </button>
                <Link
                  href="/request/new"
                  className="rounded-full border border-hairline px-5 py-2.5 text-[15px] font-medium text-foreground transition-colors duration-200 hover:bg-surface"
                >
                  다시 작성하기
                </Link>
              </>
            )}
          </FadeIn>

          {approved && (
            <FadeIn delay={0.25} className="mt-4">
              <Link
                href="/projects"
                className="text-[14px] font-medium text-brand"
              >
                프로젝트 목록으로 이동 →
              </Link>
            </FadeIn>
          )}
        </>
      )}

      {error && <p className="mt-4 text-[13px] text-danger">{error}</p>}
    </Container>
  );
}
