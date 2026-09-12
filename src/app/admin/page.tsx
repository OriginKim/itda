"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { StatusBadge } from "@/components/common/status-badge";
import { supabase } from "@/lib/supabase";
import { ISSUE_TYPE_LABELS, ISSUE_TYPES } from "@/lib/labels";
import type { DbIssue, DbMerchant, DbProject } from "@/lib/types";

type IssueWithProject = DbIssue & {
  projects:
    | (Pick<DbProject, "title"> & {
        merchants: Pick<DbMerchant, "name"> | null;
      })
    | null;
};

export default function AdminPage() {
  const [issues, setIssues] = useState<IssueWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("issues")
      .select("*, projects(title, merchants(name))")
      .order("created_at", { ascending: false });
    setIssues((data as IssueWithProject[] | null) ?? []);
    setLoading(false);
  }

  async function handleResolve(id: string) {
    setResolvingId(id);
    const { error } = await supabase
      .from("issues")
      .update({ status: "resolved" })
      .eq("id", id);
    setResolvingId(null);
    if (!error) {
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id ? { ...issue, status: "resolved" } : issue,
        ),
      );
    }
  }

  if (loading) {
    return (
      <Container className="py-20">
        <p className="text-[15px] text-subtle">불러오는 중...</p>
      </Container>
    );
  }

  const openCount = issues.filter((issue) => issue.status === "open").length;
  const resolvedCount = issues.filter(
    (issue) => issue.status === "resolved",
  ).length;

  return (
    <Container className="py-20">
      <FadeIn>
        <p className="text-[13px] font-medium text-subtle">관리자</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          예외 상황 대시보드
        </h1>
      </FadeIn>

      <FadeIn
        delay={0.05}
        className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3"
      >
        <div className="rounded-xl border border-hairline bg-white p-5 shadow-sm">
          <p className="text-[13px] text-subtle">전체 이슈</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {issues.length}건
          </p>
        </div>
        <div className="rounded-xl border border-hairline bg-white p-5 shadow-sm">
          <p className="text-[13px] text-subtle">미해결</p>
          <p className="mt-2 text-2xl font-semibold text-danger">
            {openCount}건
          </p>
        </div>
        <div className="rounded-xl border border-hairline bg-white p-5 shadow-sm">
          <p className="text-[13px] text-subtle">해결됨</p>
          <p className="mt-2 text-2xl font-semibold text-success">
            {resolvedCount}건
          </p>
        </div>
      </FadeIn>

      <FadeIn
        delay={0.1}
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5"
      >
        {ISSUE_TYPES.map((type) => {
          const count = issues.filter((issue) => issue.type === type).length;
          return (
            <div
              key={type}
              className="rounded-xl border border-hairline bg-white p-4 shadow-sm"
            >
              <p className="text-[13px] text-subtle">
                {ISSUE_TYPE_LABELS[type] ?? type}
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {count}건
              </p>
            </div>
          );
        })}
      </FadeIn>

      <FadeIn delay={0.15} className="mt-10">
        {issues.length === 0 ? (
          <p className="text-[15px] text-subtle">등록된 이슈가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-xl border border-hairline bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-surface px-2.5 py-1 text-[13px] font-medium text-subtle">
                        {ISSUE_TYPE_LABELS[issue.type] ?? issue.type}
                      </span>
                      <StatusBadge status={issue.status} />
                    </div>
                    <p className="mt-2 text-[15px] font-medium text-foreground">
                      {issue.projects?.title ?? "삭제된 프로젝트"}
                    </p>
                    {issue.projects?.merchants?.name && (
                      <p className="text-[13px] text-subtle">
                        {issue.projects.merchants.name}
                      </p>
                    )}
                    <p className="mt-2 text-[14px] leading-relaxed text-subtle">
                      {issue.description}
                    </p>
                  </div>
                  {issue.status === "open" && (
                    <button
                      onClick={() => handleResolve(issue.id)}
                      disabled={resolvingId === issue.id}
                      className="shrink-0 rounded-full border border-hairline px-4 py-2 text-[13px] font-medium text-foreground transition-colors duration-200 hover:bg-surface disabled:opacity-60"
                    >
                      {resolvingId === issue.id ? "처리 중..." : "해결 처리"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </Container>
  );
}
