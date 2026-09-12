"use client";

import { Suspense, useEffect, useState } from "react";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { Badge } from "@/components/common/badge";
import { StatusBadge } from "@/components/common/status-badge";
import { StudentSwitcher } from "@/components/common/student-switcher";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABELS } from "@/lib/labels";
import type { DbMerchant, DbProject, DbStudent } from "@/lib/types";
import { useCurrentStudentId } from "@/hooks/use-current-student";

type ProjectWithMerchant = DbProject & {
  merchants: Pick<DbMerchant, "name"> | null;
};

function ProjectListItem({ project }: { project: ProjectWithMerchant }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-hairline bg-white p-4 shadow-sm">
      <div>
        <p className="text-[15px] font-medium text-foreground">
          {project.title}
        </p>
        <p className="text-[13px] text-subtle">{project.merchants?.name}</p>
      </div>
      <StatusBadge status={project.status} />
    </div>
  );
}

function ProfileContent() {
  const { studentId, setStudentId } = useCurrentStudentId();
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [projects, setProjects] = useState<ProjectWithMerchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("students")
      .select("*")
      .order("name")
      .then(({ data }) => {
        setStudents(data ?? []);
        if (!studentId && data && data.length > 0) {
          setStudentId(data[0].id);
        }
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!studentId) return;
    supabase
      .from("projects")
      .select("*, merchants(name)")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setProjects((data as ProjectWithMerchant[] | null) ?? []));
  }, [studentId]);

  const currentStudent = students.find((s) => s.id === studentId) ?? null;

  if (loading) {
    return (
      <Container className="max-w-2xl py-20">
        <p className="text-[15px] text-subtle">불러오는 중...</p>
      </Container>
    );
  }

  if (!currentStudent) {
    return (
      <Container className="max-w-2xl py-20">
        <p className="text-[15px] text-subtle">학생 데이터가 없습니다.</p>
      </Container>
    );
  }

  const inProgress = projects.filter((p) => p.status === "in_progress");
  const completed = projects.filter((p) => p.status === "completed");

  return (
    <Container className="max-w-2xl py-20">
      <FadeIn className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-subtle">학생</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {currentStudent.name}
          </h1>
          <p className="mt-1 text-[14px] text-subtle">{currentStudent.major}</p>
        </div>
        <StudentSwitcher
          students={students}
          studentId={studentId ?? students[0].id}
          onChange={setStudentId}
        />
      </FadeIn>

      <FadeIn
        delay={0.05}
        className="mt-8 rounded-xl border border-hairline bg-white p-6 shadow-sm"
      >
        <p className="text-[13px] text-subtle">스킬</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {currentStudent.skills.map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
        </div>

        <p className="mt-5 text-[13px] text-subtle">관심 분야</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {currentStudent.interests.map((interest) => (
            <Badge key={interest}>
              {CATEGORY_LABELS[interest] ?? interest}
            </Badge>
          ))}
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-4 text-[14px]">
          <div>
            <dt className="text-subtle">주간 가용시간</dt>
            <dd className="mt-1 font-medium text-foreground">
              {currentStudent.weekly_hours}시간
            </dd>
          </div>
          <div>
            <dt className="text-subtle">완료 프로젝트</dt>
            <dd className="mt-1 font-medium text-foreground">
              {currentStudent.completed_count}건
            </dd>
          </div>
          <div>
            <dt className="text-subtle">신뢰도</dt>
            <dd className="mt-1 font-medium text-foreground">
              {Math.round(
                (currentStudent.completion_rate * 0.6 +
                  currentStudent.ontime_rate * 0.4) *
                  100,
              )}
              %
            </dd>
          </div>
        </dl>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-10">
        <h2 className="text-lg font-medium text-foreground">
          진행중인 프로젝트
        </h2>
        {inProgress.length === 0 ? (
          <p className="mt-3 text-[14px] text-subtle">
            진행중인 프로젝트가 없습니다.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {inProgress.map((project) => (
              <ProjectListItem key={project.id} project={project} />
            ))}
          </div>
        )}
      </FadeIn>

      <FadeIn delay={0.15} className="mt-10">
        <h2 className="text-lg font-medium text-foreground">
          완료한 프로젝트
        </h2>
        {completed.length === 0 ? (
          <p className="mt-3 text-[14px] text-subtle">
            완료한 프로젝트가 없습니다.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {completed.map((project) => (
              <ProjectListItem key={project.id} project={project} />
            ))}
          </div>
        )}
      </FadeIn>
    </Container>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}
