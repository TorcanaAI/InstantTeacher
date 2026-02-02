/**
 * InstantTeacher matching engine.
 * Eligibility: online (rostered), subject, year level, no same-school, WWCC verified, not in session.
 * Conflict-of-interest: teacher.schoolName !== student.schoolName, teacher.blockedSchools.
 */

import { prisma } from "@/lib/prisma";

export interface MatchInput {
  subject: string;
  yearLevel: number;
  studentSchoolName: string;
}

export interface EligibleTeacher {
  userId: string;
  teacherProfileId: string;
  name: string | null;
  ratingAvg: number | null;
  totalSessions: number;
  lastSessionEndedAt: Date | null;
  checkedInAt: Date | null;
}

/**
 * Find eligible teachers for a session request.
 * BLOCKS: same school, blocked schools, no WWCC, in session, not checked in.
 */
export async function findEligibleTeachers(
  input: MatchInput
): Promise<EligibleTeacher[]> {
  const { subject, yearLevel, studentSchoolName } = input;

  // Teachers who are checked in on a shift, matching subject/year, WWCC verified.
  const teacherShifts = await prisma.teacherShift.findMany({
    where: {
      status: "CHECKED_IN",
      shift: {
        startAt: { lte: new Date() },
        endAt: { gte: new Date() },
      },
      teacher: {
        wwccVerified: true,
        applicationStatus: "APPROVED",
        subjects: { has: subject },
        yearLevels: { has: yearLevel },
      },
    },
    include: {
      teacher: {
        include: {
          user: {
            include: {
              sessionsAsTeacher: {
                where: {
                  status: { in: ["MATCHED", "ROOM_CREATED", "STUDENT_WAITING", "TEACHER_JOINED", "IN_PROGRESS"] },
                },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: {
      checkedInAt: "asc",
    },
  });

  // Conflict-of-interest: exclude same school and blocked schools
  const notInSession = teacherShifts.filter((ts) => {
    if (ts.teacher.user.sessionsAsTeacher.length > 0) return false;
    const profile = ts.teacher;
    if (profile.schoolName && profile.schoolName === studentSchoolName) return false;
    if (profile.blockedSchools.includes(studentSchoolName)) return false;
    return true;
  });

  // Sort: shortest idle (checkedInAt oldest first = fair), then rating, then totalSessions
  const sorted = notInSession
    .map((ts) => ({
      userId: ts.teacher.user.id,
      teacherProfileId: ts.teacher.id,
      name: ts.teacher.user.name,
      ratingAvg: ts.teacher.ratingAvg,
      totalSessions: ts.teacher.totalSessions,
      lastSessionEndedAt: null as Date | null,
      checkedInAt: ts.checkedInAt,
    }))
    .sort((a, b) => {
      const aIdle = a.checkedInAt?.getTime() ?? 0;
      const bIdle = b.checkedInAt?.getTime() ?? 0;
      if (aIdle !== bIdle) return aIdle - bIdle;
      const aRating = a.ratingAvg ?? 0;
      const bRating = b.ratingAvg ?? 0;
      if (bRating !== aRating) return bRating - aRating;
      return (b.totalSessions ?? 0) - (a.totalSessions ?? 0);
    });

  return sorted.map(({ checkedInAt, ...rest }) => ({
    ...rest,
    lastSessionEndedAt: null,
    checkedInAt: checkedInAt ?? null,
  }));
}

/**
 * Pick best available teacher or null.
 */
export async function pickTeacher(input: MatchInput): Promise<string | null> {
  const eligible = await findEligibleTeachers(input);
  return eligible.length > 0 ? eligible[0].userId : null;
}
