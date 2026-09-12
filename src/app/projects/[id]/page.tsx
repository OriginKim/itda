"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { Badge } from "@/components/common/badge";
import { StatusBadge } from "@/components/common/status-badge";
import { StudentSwitcher } from "@/components/common/student-switcher";
import { CountUp } from "@/components/common/count-up";
import { supabase } from "@/lib/supabase";
import {
  calculateMatchScore,
  toMatchProject,
  toMatchStudent,
  type MatchScoreBreakdown,
} from "@/lib/matching";
import { fadeInTransition } from "@/lib/motion";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/labels";
import type { DbApplication, DbMerchant, DbProject, DbStudent } from "@/lib/types";
import { useCurrentStudentId } from "@/hooks/use-current-student";
import { useRole } from "@/context/role-context";

type ProjectWithMerchant = DbProject & {
  merchants: Pick<DbMerchant, "name" | "category" | "district"> | null;
};

const SCORE_ROWS: { key: keyof MatchScoreBreakdown; label: string; max: number }[] = [
  { key: "skill", label: "스킬", max: 40 },
  { key: "availability", label: "가용시간", max: 20 },
  { key: "experience", label: "경험", max: 20 },
  { key: "interest", label: "관심분야", max: 10 },
  { key: "trust", label: "신뢰도", max: 10 },
];

function ScoreBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-subtle">{label}</span>
        <span className="font-medium text-foreground">
          {value} / {max}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <motion.div
          className="h-full rounded-full bg-brand"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={fadeInTransition}
        />
      </div>
    </div>
  );
}

function ProjectDetailContent({ id }: { id: string }) {
  const { studentId, setStudentId } = useCurrentStudentId();
  const { withRole } = useRole();
  const [project, setProject] = useState<ProjectWithMerchant | null>(null);
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [myApplication, setMyApplication] = useState<DbApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: projectData }, { data: studentData }] = await Promise.all([
        supabase
          .from("projects")
          .select("*, merchants(name, category, district)")
          .eq("id", id)
          .single(),
        supabase.from("students").select("*").order("name"),
      ]);
      setProject((projectData as ProjectWithMerchant | null) ?? null);
      setStudents(studentData ?? []);
      if (!studentId && studentData && studentData.length > 0) {
        setStudentId(studentData[0].id);
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!studentId) return;
    supabase
      .from("applications")
      .select("*")
      .eq("project_id", id)
      .eq("student_id", studentId)
      .maybeSingle()
      .then(({ data }) => setMyApplication(data ?? null));
  }, [id, studentId]);

  const currentStudent = students.find((s) => s.id === studentId) ?? null;
  const score =
    currentStudent && project
      ? calculateMatchScore(
          toMatchStudent(currentStudent),
          toMatchProject(project),
        )
      : null;

  async function handleApply() {
    if (!project || !currentStudent || !score) return;
    setApplying(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from("applications")
      .insert({
        project_id: project.id,
        student_id: currentStudent.id,
        match_score: score.total,
        score_breakdown: score.breakdown,
        status: "applied",
      })
      .select()
      .single();
    setApplying(false);
    if (insertError || !data) {
      setError("지원에 실패했습니다.");
      return;
    }
    setMyApplication(data);
  }

  if (loading) {
    return (
      <Container className="max-w-3xl py-20">
        <p className="text-[15px] text-subtle">불러오는 중...</p>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container className="max-w-3xl py-20">
        <p className="text-[15px] text-danger">프로젝트를 찾을 수 없습니다.</p>
        <Link
          href={withRole("/projects")}
          className="mt-4 inline-block text-[15px] font-medium text-brand"
        >
          목록으로 돌아가기
        </Link>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-20">
      <FadeIn className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[13px] text-subtle">
            {project.merchants?.name} · {project.merchants?.category} ·{" "}
            {project.merchants?.district}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {project.title}
          </h1>
          <div className="mt-3">
            <StatusBadge status={project.status} />
          </div>
        </div>
        {students.length > 0 && (
          <StudentSwitcher
            students={students}
            studentId={studentId ?? students[0].id}
            onChange={setStudentId}
          />
        )}
      </FadeIn>

      <FadeIn
        delay={0.05}
        className="mt-8 rounded-xl border border-hairline bg-white p-6 shadow-sm"
      >
        <p className="text-[15px] leading-relaxed text-foreground">
          {project.goal}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-[14px] sm:grid-cols-4">
          <div>
            <dt className="text-subtle">카테고리</dt>
            <dd className="mt-1 font-medium text-foreground">
              {CATEGORY_LABELS[project.category ?? ""] ?? project.category}
            </dd>
          </div>
          <div>
            <dt className="text-subtle">난이도</dt>
            <dd className="mt-1 font-medium text-foreground">
              {DIFFICULTY_LABELS[project.difficulty ?? ""] ?? project.difficulty}
            </dd>
          </div>
          <div>
            <dt className="text-subtle">예상 시간</dt>
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

      {score && (
        <FadeIn
          delay={0.1}
          className="mt-6 rounded-xl border border-hairline bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-medium text-foreground">
              {currentStudent?.name}님의 매칭 점수
            </p>
            <p className="text-3xl font-semibold tracking-tight text-brand">
              <CountUp value={score.total} />
              <span className="text-lg text-subtle">점</span>
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {SCORE_ROWS.map((row) => (
              <ScoreBar
                key={row.key}
                label={row.label}
                value={score.breakdown[row.key]}
                max={row.max}
              />
            ))}
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.15} className="mt-8">
        {project.status !== "recruiting" ? (
          <p className="text-[14px] text-subtle">
            현재 모집 중인 프로젝트가 아닙니다.
          </p>
        ) : myApplication ? (
          <p className="text-[15px] font-medium text-success">
            이미 지원했습니다 (매칭 점수 {myApplication.match_score}점)
          </p>
        ) : (
          <button
            onClick={handleApply}
            disabled={applying || !currentStudent}
            className="rounded-full bg-brand px-5 py-2.5 text-[15px] font-medium text-white transition-opacity duration-200 disabled:opacity-60"
          >
            {applying ? "지원하는 중..." : "지원하기"}
          </button>
        )}
        {error && <p className="mt-2 text-[13px] text-danger">{error}</p>}
      </FadeIn>
    </Container>
  );
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={null}>
      <ProjectDetailContent id={id} />
    </Suspense>
  );
}
