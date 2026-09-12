"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { supabase } from "@/lib/supabase";

type Merchant = {
  id: string;
  name: string;
  category: string;
  district: string;
};

export default function NewRequestPage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [merchantId, setMerchantId] = useState("");
  const [rawRequest, setRawRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("merchants")
      .select("id, name, category, district")
      .order("name")
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError("매장 목록을 불러오지 못했습니다.");
          return;
        }
        setMerchants(data ?? []);
        if (data && data.length > 0) {
          setMerchantId(data[0].id);
        }
      });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!merchantId) {
      setError("매장을 선택해주세요.");
      return;
    }
    if (rawRequest.trim().length < 10) {
      setError("요청 내용을 10자 이상 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawRequest }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "AI 구조화에 실패했습니다.");
      }

      const structured = await res.json();

      const { data, error: insertError } = await supabase
        .from("projects")
        .insert({
          merchant_id: merchantId,
          raw_request: rawRequest,
          title: structured.title,
          goal: structured.goal,
          category: structured.category,
          deliverables: structured.deliverables,
          required_skills: structured.requiredSkills,
          difficulty: structured.difficulty,
          estimated_hours: structured.estimatedHours,
          duration_days: structured.durationDays,
          revision_count: structured.revisionCount,
          is_out_of_scope: structured.isOutOfScope,
          out_of_scope_reason: structured.outOfScopeReason,
          suggested_split: structured.suggestedSplit,
          status: "draft",
        })
        .select()
        .single();

      if (insertError || !data) {
        throw new Error("프로젝트 저장에 실패했습니다.");
      }

      router.push(`/request/${data.id}/review`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
      );
      setSubmitting(false);
    }
  }

  return (
    <Container className="max-w-2xl py-20">
      <FadeIn>
        <p className="text-[13px] font-medium text-subtle">소상공인</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          어떤 도움이 필요하신가요?
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-subtle">
          막연하게 적어주셔도 괜찮아요. AI가 수행 가능한 프로젝트로
          정리해드립니다.
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label
              htmlFor="merchant"
              className="text-[13px] font-medium text-foreground"
            >
              매장
            </label>
            <select
              id="merchant"
              value={merchantId}
              onChange={(event) => setMerchantId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-hairline bg-white px-3 py-2.5 text-[15px] text-foreground"
            >
              {merchants.map((merchant) => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.name} · {merchant.category} ({merchant.district})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="rawRequest"
              className="text-[13px] font-medium text-foreground"
            >
              요청 내용
            </label>
            <textarea
              id="rawRequest"
              value={rawRequest}
              onChange={(event) => setRawRequest(event.target.value)}
              rows={6}
              placeholder="예) 카페 신메뉴 홍보용 인스타 카드뉴스 만들어주세요"
              className="mt-2 w-full rounded-lg border border-hairline bg-white px-3 py-2.5 text-[15px] leading-relaxed text-foreground placeholder:text-subtle"
            />
          </div>

          {error && <p className="text-[13px] text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[15px] font-medium text-white transition-opacity duration-200 disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "AI가 분석하고 있어요" : "AI로 구조화하기"}
          </button>
        </form>
      </FadeIn>
    </Container>
  );
}
