"use client";

import { Container } from "@/components/common/container";
import { Badge } from "@/components/common/badge";
import { StatusBadge } from "@/components/common/status-badge";
import { FadeIn } from "@/components/common/fade-in";
import { useRole } from "@/context/role-context";

const ROLE_LABEL: Record<string, string> = {
  merchant: "소상공인",
  student: "학생",
  admin: "관리자",
};

export default function Home() {
  const { role } = useRole();

  return (
    <Container className="flex flex-1 flex-col justify-center py-20">
      <FadeIn>
        <p className="text-[13px] font-medium text-subtle">
          현재 역할: {ROLE_LABEL[role]}
        </p>
        <h1 className="mt-3 max-w-2xl text-5xl font-semibold tracking-tight text-foreground">
          재능잇다
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-subtle">
          소상공인의 막연한 요청을 AI가 수행 가능한 프로젝트로 구조화하고,
          역량이 맞는 대학생과 연결합니다.
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-10 flex flex-wrap items-center gap-2">
        <Badge>디자인</Badge>
        <Badge>콘텐츠</Badge>
        <Badge>영상</Badge>
        <StatusBadge status="recruiting" />
        <StatusBadge status="in_progress" />
        <StatusBadge status="completed" />
      </FadeIn>
    </Container>
  );
}
