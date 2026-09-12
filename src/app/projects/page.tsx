"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { Badge } from "@/components/common/badge";
import { StudentSwitcher } from "@/components/common/student-switcher";
import { supabase } from "@/lib/supabase";
import { calculateMatchScore, toMatchProject, toMatchStudent } from "@/lib/matching";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/labels";
import type { DbMerchant, DbProject, DbStudent } from "@/lib/types";
import { useCurrentStudentId } from "@/hooks/use-current-student";

type ProjectWithMerchant = DbProject & {
  merchants: Pick<DbMerchant, "name" | "category" | "district"> | null;
};

function ProjectsContent() {
  const { studentId, setStudentId } = useCurrentStudentId();
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [projects, setProjects] = useState<ProjectWithMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const [{ data: studentData }, { data: projectData }] = await Promise.all([
        supabase.from("students").select("*").order("name"),
        supabase
          .from("projects")
          .select("*, merchants(name, category, district)")
          .eq("status", "recruiting")
          .order("created_at", { ascending: false }),
      ]);
      setStudents(studentData ?? []);
      setProjects((projectData as ProjectWithMerchant[] | null) ?? []);
      if (!studentId && studentData && studentData.length > 0) {
        setStudentId(studentData[0].id);
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStudent = students.find((s) => s.id === studentId) ?? null;

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (categoryFilter !== "all" && project.category !== categoryFilter) {
        return false;
      }
      if (
        difficultyFilter !== "all" &&
        project.difficulty !== difficultyFilter
      ) {
        return false;
      }
      return true;
    });
  }, [projects, categoryFilter, difficultyFilter]);

  if (loading) {
    return (
      <Container className="py-20">
        <p className="text-[15px] text-subtle">불러오는 중...</p>
      </Container>
    );
  }

  return (
    <Container className="py-20">
      <FadeIn className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-subtle">학생</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            프로젝트 둘러보기
          </h1>
        </div>
        {students.length > 0 && (
          <StudentSwitcher
            students={students}
            studentId={studentId ?? students[0].id}
            onChange={setStudentId}
          />
        )}
      </FadeIn>

      <FadeIn delay={0.05} className="mt-8 flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-lg border border-hairline bg-white px-3 py-2 text-[13px] text-foreground"
        >
          <option value="all">전체 카테고리</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(event) => setDifficultyFilter(event.target.value)}
          className="rounded-lg border border-hairline bg-white px-3 py-2 text-[13px] text-foreground"
        >
          <option value="all">전체 난이도</option>
          {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FadeIn>

      {filteredProjects.length === 0 ? (
        <p className="mt-16 text-[15px] text-subtle">
          모집 중인 프로젝트가 없습니다.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, index) => {
            const score = currentStudent
              ? calculateMatchScore(
                  toMatchStudent(currentStudent),
                  toMatchProject(project),
                )
              : null;
            return (
              <FadeIn key={project.id} delay={0.05 * (index % 6)}>
                <Link
                  href={`/projects/${project.id}${
                    studentId ? `?studentId=${studentId}` : ""
                  }`}
                  className="block h-full rounded-xl border border-hairline bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] text-subtle">
                        {project.merchants?.name} · {project.merchants?.category}
                      </p>
                      <h2 className="mt-1 text-[17px] font-medium text-foreground">
                        {project.title}
                      </h2>
                    </div>
                    {score && (
                      <div className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-[13px] font-semibold text-brand">
                        {score.total}점
                      </div>
                    )}
                  </div>

                  <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-subtle">
                    {project.goal}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(project.required_skills ?? []).slice(0, 4).map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[13px] text-subtle">
                    <span>
                      {CATEGORY_LABELS[project.category ?? ""] ?? project.category}
                    </span>
                    <span>·</span>
                    <span>
                      {DIFFICULTY_LABELS[project.difficulty ?? ""] ??
                        project.difficulty}
                    </span>
                    <span>·</span>
                    <span>{project.estimated_hours}시간</span>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      )}
    </Container>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsContent />
    </Suspense>
  );
}
