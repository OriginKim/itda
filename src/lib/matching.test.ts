import { describe, expect, it } from "vitest";
import { calculateMatchScore } from "@/lib/matching";

describe("calculateMatchScore", () => {
  it("모든 조건을 완벽히 충족하면 100점을 반환한다", () => {
    const result = calculateMatchScore(
      {
        skills: ["photoshop", "illustrator"],
        interests: ["design"],
        weeklyHours: 20,
        completedCount: 5,
        completionRate: 1.0,
        ontimeRate: 1.0,
      },
      {
        requiredSkills: ["photoshop", "illustrator"],
        category: "design",
        estimatedHours: 10,
      },
    );

    expect(result.total).toBe(100);
    expect(result.breakdown).toEqual({
      skill: 40,
      availability: 20,
      experience: 20,
      interest: 10,
      trust: 10,
    });
  });

  it("아무 조건도 충족하지 못하면 0점을 반환한다", () => {
    const result = calculateMatchScore(
      {
        skills: [],
        interests: [],
        weeklyHours: 0,
        completedCount: 0,
        completionRate: 0,
        ontimeRate: 0,
      },
      {
        requiredSkills: ["video"],
        category: "video",
        estimatedHours: 10,
      },
    );

    expect(result.total).toBe(0);
    expect(result.breakdown).toEqual({
      skill: 0,
      availability: 0,
      experience: 0,
      interest: 0,
      trust: 0,
    });
  });

  it("부분 조건 충족 시 각 항목이 반올림되어 합산된다", () => {
    const result = calculateMatchScore(
      {
        skills: ["a"],
        interests: ["design"],
        weeklyHours: 1,
        completedCount: 2,
        completionRate: 0.85,
        ontimeRate: 0.9,
      },
      {
        requiredSkills: ["a", "b", "c"],
        category: "design",
        estimatedHours: 3,
      },
    );

    // skill: (1/3)*40 = 13.33 -> 13
    // availability: (1/3)*20 = 6.67 -> 7
    // experience: (2/4)*20 = 10
    // interest: 10 (category 일치)
    // trust: (0.85*0.6 + 0.9*0.4)*10 = 8.7 -> 9
    expect(result.breakdown).toEqual({
      skill: 13,
      availability: 7,
      experience: 10,
      interest: 10,
      trust: 9,
    });
    expect(result.total).toBe(49);
  });
});
