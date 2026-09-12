"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ShieldCheck, Store } from "lucide-react";
import { useRole, type Role } from "@/context/role-context";
import { Container } from "@/components/common/container";
import { cn } from "@/lib/utils";

const ROLE_ITEMS: {
  value: Role;
  label: string;
  icon: typeof Store;
  path: string;
}[] = [
  { value: "merchant", label: "소상공인", icon: Store, path: "/request/new" },
  { value: "student", label: "학생", icon: GraduationCap, path: "/projects" },
  { value: "admin", label: "관리자", icon: ShieldCheck, path: "/admin" },
];

export function Header() {
  const { role } = useRole();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          itda
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-hairline bg-surface p-1">
          {ROLE_ITEMS.map(({ value, label, icon: Icon, path }) => {
            const active = role === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => router.push(`${path}?role=${value}`)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors duration-200",
                  active
                    ? "bg-brand text-white"
                    : "text-subtle hover:text-foreground",
                )}
              >
                <Icon size={14} strokeWidth={2} />
                {label}
              </button>
            );
          })}
        </nav>
      </Container>
    </header>
  );
}
