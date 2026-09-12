import Link from "next/link";
import { CheckCircle2, ListChecks, PenLine, Users } from "lucide-react";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { CountUp } from "@/components/common/count-up";

const FLOW_STEPS = [
  {
    icon: PenLine,
    title: "요청 등록",
    description: "소상공인이 막연한 요청을 원문 그대로 남깁니다.",
  },
  {
    icon: ListChecks,
    title: "AI 구조화",
    description: "AI가 목표·산출물·필요 스킬을 갖춘 프로젝트로 정리합니다.",
  },
  {
    icon: Users,
    title: "매칭",
    description: "역량과 가용시간이 맞는 대학생이 지원하고 매칭됩니다.",
  },
  {
    icon: CheckCircle2,
    title: "완료",
    description: "프로젝트를 완수하고 서로를 평가하며 신뢰를 쌓습니다.",
  },
];

const STATS = [
  { value: 92, suffix: "%", label: "AI 구조화 정확도" },
  { value: 21, suffix: "%", label: "요청 처리 시간 단축" },
  { value: 48, suffix: "시간", label: "평균 매칭 소요" },
  { value: 10, suffix: "+", label: "활성 대학생 인재" },
];

export default function Home() {
  return (
    <>
      <section className="py-24 sm:py-32">
        <Container>
          <FadeIn>
            <p className="text-[13px] font-medium text-brand">
              AI 기반 프로젝트 매칭
            </p>
            <h1 className="mt-4 max-w-2xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
              막연한 요청을,
              <br />
              실행 가능한 프로젝트로
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-subtle">
              AI가 소상공인의 막연한 요청을 구조화하고, 역량이 맞는
              대학생과 연결합니다.
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/request/new?role=merchant"
              className="rounded-full bg-brand px-6 py-3 text-[15px] font-medium text-white transition-opacity duration-200 hover:opacity-90"
            >
              무료로 요청하기
            </Link>
            <Link
              href="/projects?role=student"
              className="rounded-full border border-hairline px-6 py-3 text-[15px] font-medium text-foreground transition-colors duration-200 hover:bg-surface"
            >
              프로젝트 둘러보기
            </Link>
          </FadeIn>
        </Container>
      </section>

      <section className="border-t border-hairline bg-surface py-20">
        <Container>
          <FadeIn>
            <h2 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[32px]">
              어떻게 진행되나요
            </h2>
          </FadeIn>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW_STEPS.map((step, index) => (
              <FadeIn key={step.title} delay={0.1 * index}>
                <div className="h-full rounded-xl border border-hairline bg-white p-6 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-[13px] font-semibold text-brand">
                    {index + 1}
                  </div>
                  <step.icon
                    size={20}
                    strokeWidth={1.75}
                    className="mt-4 text-brand"
                  />
                  <h3 className="mt-3 text-[16px] font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-subtle">
                    {step.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((stat, index) => (
              <FadeIn
                key={stat.label}
                delay={0.05 * index}
                className="text-center sm:text-left"
              >
                <p className="text-4xl font-semibold tracking-tight text-brand">
                  <CountUp value={stat.value} />
                  {stat.suffix}
                </p>
                <p className="mt-2 text-[13px] text-subtle">{stat.label}</p>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline bg-surface py-20">
        <Container className="text-center">
          <FadeIn>
            <h2 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[32px]">
              지금 시작해보세요
            </h2>
            <p className="mt-3 text-[15px] text-subtle">
              역할 전환으로 소상공인과 학생 양쪽 경험을 모두 확인할 수
              있습니다.
            </p>
          </FadeIn>
          <FadeIn
            delay={0.1}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Link
              href="/request/new?role=merchant"
              className="rounded-full bg-brand px-6 py-3 text-[15px] font-medium text-white transition-opacity duration-200 hover:opacity-90"
            >
              소상공인으로 시작하기
            </Link>
            <Link
              href="/projects?role=student"
              className="rounded-full border border-hairline bg-white px-6 py-3 text-[15px] font-medium text-foreground transition-colors duration-200 hover:bg-surface"
            >
              학생으로 시작하기
            </Link>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
