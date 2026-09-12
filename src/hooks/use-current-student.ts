"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * 인증을 구현하지 않으므로, 데모에서 "나"로 볼 학생을
 * URL 쿼리(studentId)로 전환할 수 있게 한다.
 */
export function useCurrentStudentId() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const studentId = searchParams.get("studentId");

  const setStudentId = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("studentId", id);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { studentId, setStudentId };
}
