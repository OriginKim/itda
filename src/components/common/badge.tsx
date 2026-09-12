import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-hairline bg-surface px-2.5 py-1 text-[13px] font-medium text-subtle",
        className,
      )}
      {...props}
    />
  );
}
