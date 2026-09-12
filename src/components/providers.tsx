"use client";

import { Suspense, type ReactNode } from "react";
import { RoleProvider } from "@/context/role-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <RoleProvider>{children}</RoleProvider>
    </Suspense>
  );
}
