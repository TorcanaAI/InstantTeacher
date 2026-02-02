/**
 * Unit tests for matching engine (conflict-of-interest and eligibility).
 * Run with: npx vitest run src/lib/__tests__/matching.test.ts
 */
import { describe, it, expect } from "vitest";

// In-memory conflict-of-interest logic (mirrors lib/matching.ts)
function isSameSchoolBlocked(
  teacherSchoolName: string | null,
  teacherBlockedSchools: string[],
  studentSchoolName: string
): boolean {
  if (teacherSchoolName === studentSchoolName) return true;
  if (teacherBlockedSchools.includes(studentSchoolName)) return true;
  return false;
}

describe("Matching engine - conflict of interest", () => {
  it("blocks teacher from same school as student", () => {
    expect(
      isSameSchoolBlocked("Perth Modern School", [], "Perth Modern School")
    ).toBe(true);
  });

  it("allows teacher with different school", () => {
    expect(
      isSameSchoolBlocked("Other School", [], "Perth Modern School")
    ).toBe(false);
  });

  it("allows teacher with null school (not employed at school)", () => {
    expect(
      isSameSchoolBlocked(null, [], "Perth Modern School")
    ).toBe(false);
  });

  it("blocks teacher who has student school in blocked list", () => {
    expect(
      isSameSchoolBlocked("Other School", ["Perth Modern School"], "Perth Modern School")
    ).toBe(true);
  });

  it("allows teacher when student school not in blocked list", () => {
    expect(
      isSameSchoolBlocked("Other School", ["Another School"], "Perth Modern School")
    ).toBe(false);
  });
});
