import { cn } from "@/lib/utils";

type StatusVariant = "neutral" | "brand" | "success" | "danger";

const STATUS_CONFIG: Record<string, { label: string; variant: StatusVariant }> = {
  // projects.status
  draft: { label: "초안", variant: "neutral" },
  pending_approval: { label: "승인 대기", variant: "neutral" },
  recruiting: { label: "모집중", variant: "brand" },
  in_progress: { label: "진행중", variant: "brand" },
  reviewing: { label: "검수중", variant: "brand" },
  completed: { label: "완료", variant: "success" },
  // applications.status
  applied: { label: "지원함", variant: "neutral" },
  accepted: { label: "수락됨", variant: "success" },
  rejected: { label: "거절됨", variant: "danger" },
  // issues.status
  open: { label: "미해결", variant: "danger" },
  resolved: { label: "해결됨", variant: "success" },
};

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  neutral: "border-hairline bg-surface text-subtle",
  brand: "border-brand/20 bg-brand/10 text-brand",
  success: "border-success/20 bg-success/10 text-success",
  danger: "border-danger/20 bg-danger/10 text-danger",
};

const DOT_CLASSES: Record<StatusVariant, string> = {
  neutral: "bg-subtle",
  brand: "bg-brand",
  success: "bg-success",
  danger: "bg-danger",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "neutral" as const };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] font-medium",
        VARIANT_CLASSES[config.variant],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASSES[config.variant])} />
      {config.label}
    </span>
  );
}
