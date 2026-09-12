"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type Role = "merchant" | "student" | "admin";

export const ROLES: Role[] = ["merchant", "student", "admin"];

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

function isRole(value: string | null): value is Role {
  return value !== null && (ROLES as string[]).includes(value);
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get("role");
  const role: Role = isRole(roleParam) ? roleParam : "merchant";

  const setRole = useCallback(
    (nextRole: Role) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("role", nextRole);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const value = useMemo(() => ({ role, setRole }), [role, setRole]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole은 RoleProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
