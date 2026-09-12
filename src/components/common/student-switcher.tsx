"use client";

import type { DbStudent } from "@/lib/types";

export function StudentSwitcher({
  students,
  studentId,
  onChange,
}: {
  students: DbStudent[];
  studentId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="student-switcher" className="text-[13px] text-subtle">
        내 계정 (데모)
      </label>
      <select
        id="student-switcher"
        value={studentId}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-hairline bg-white px-2.5 py-1.5 text-[13px] font-medium text-foreground"
      >
        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.name} · {student.major}
          </option>
        ))}
      </select>
    </div>
  );
}
