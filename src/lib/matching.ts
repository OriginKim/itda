// 매칭 점수 계산 (PROJECT.md 6장)
// 총점(100) = 스킬(40) + 가용시간(20) + 경험(20) + 관심분야(10) + 신뢰도(10)

import type { DbProject, DbStudent } from "./types";

export type MatchStudent = {
  skills: string[];
  interests: string[];
  weeklyHours: number;
  completedCount: number;
  completionRate: number; // 0.0 ~ 1.0
  ontimeRate: number; // 0.0 ~ 1.0
};

export type MatchProject = {
  requiredSkills: string[];
  category: string;
  estimatedHours: number;
};

export type MatchScoreBreakdown = {
  skill: number;
  availability: number;
  experience: number;
  interest: number;
  trust: number;
};

export type MatchScoreResult = {
  total: number;
  breakdown: MatchScoreBreakdown;
};

export function calculateMatchScore(
  student: MatchStudent,
  project: MatchProject,
): MatchScoreResult {
  const requiredTotal = project.requiredSkills.length || 1;
  const ownedCount = project.requiredSkills.filter((requiredSkill) =>
    student.skills.includes(requiredSkill),
  ).length;
  const skill = Math.round((ownedCount / requiredTotal) * 40);

  const availability =
    student.weeklyHours >= project.estimatedHours
      ? 20
      : Math.round((student.weeklyHours / project.estimatedHours) * 20);

  const experience = Math.round(
    (Math.min(student.completedCount, 4) / 4) * 20,
  );

  const interest = student.interests.includes(project.category) ? 10 : 0;

  const trust = Math.round(
    (student.completionRate * 0.6 + student.ontimeRate * 0.4) * 10,
  );

  const total = skill + availability + experience + interest + trust;

  return {
    total,
    breakdown: { skill, availability, experience, interest, trust },
  };
}

export function toMatchStudent(student: DbStudent): MatchStudent {
  return {
    skills: student.skills,
    interests: student.interests,
    weeklyHours: student.weekly_hours,
    completedCount: student.completed_count,
    completionRate: student.completion_rate,
    ontimeRate: student.ontime_rate,
  };
}

export function toMatchProject(project: DbProject): MatchProject {
  return {
    requiredSkills: project.required_skills ?? [],
    category: project.category ?? "",
    estimatedHours: project.estimated_hours ?? 1,
  };
}
