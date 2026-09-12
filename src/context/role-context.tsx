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
  withRole: (path: string) => string;
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

  // 다른 화면으로 이동할 때도 현재 역할(role)이 URL에서 유지되도록
  // 링크/router.push 대상 경로에 role 쿼리를 붙여주는 헬퍼.
  const withRole = useCallback(
    (path: string) => {
      const [base, query = ""] = path.split("?");
      const params = new URLSearchParams(query);
      params.set("role", role);
      return `${base}?${params.toString()}`;
    },
    [role],
  );

  const value = useMemo(
    () => ({ role, setRole, withRole }),
    [role, setRole, withRole],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole은 RoleProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
