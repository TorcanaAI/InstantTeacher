/**
 * Learning streak and badge logic for homework help.
 */

import { prisma } from "@/lib/prisma";
import {
  BADGES,
  FIRST_QUESTION_COUNT,
  HOMEWORK_HERO_COUNT,
  STREAK_BADGE_DAYS,
  EXAM_CRUSHER_COUNT,
  type BadgeId,
} from "@/lib/constants";

/** Get today's date at midnight UTC (for streak comparison). */
function todayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Update streak for student after activity. Returns new streak count and optional message for assistant. */
export async function updateStreak(studentId: string): Promise<{
  newStreak: number;
  streakMessage?: string;
}> {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { streakCurrent: true, streakLastActivityDate: true },
  });
  if (!student) return { newStreak: 0 };

  const today = todayUtc();
  const last = student.streakLastActivityDate
    ? new Date(student.streakLastActivityDate)
    : null;
  if (last) {
    last.setUTCHours(0, 0, 0, 0);
  }

  let newStreak: number;
  if (!last) {
    newStreak = 1;
  } else {
    const diffDays = Math.floor((today.getTime() - last.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays === 0) {
      newStreak = student.streakCurrent; // same day, no change
    } else if (diffDays === 1) {
      newStreak = student.streakCurrent + 1;
    } else {
      newStreak = 1; // missed a day, reset
    }
  }

  await prisma.studentProfile.update({
    where: { id: studentId },
    data: {
      streakCurrent: newStreak,
      streakLastActivityDate: today,
    },
  });

  const streakMessage =
    newStreak > 0
      ? `${newStreak}-day streak`
      : undefined;
  return { newStreak, streakMessage };
}

/** Ensure a badge is unlocked for a student if not already. */
async function unlockBadge(studentId: string, badgeId: BadgeId): Promise<void> {
  await prisma.studentBadge.upsert({
    where: {
      studentId_badgeId: { studentId, badgeId },
    },
    create: { studentId, badgeId },
    update: {},
  });
}

/** Check and unlock badges after activity. Call after updating streak or question counts. */
export async function checkBadges(studentId: string, context: {
  totalQuestionsAsked?: number;
  streakCurrent?: number;
  examQuestionsCompleted?: number;
  completedPracticeTest?: boolean;
}): Promise<void> {
  const { totalQuestionsAsked = 0, streakCurrent = 0, examQuestionsCompleted = 0, completedPracticeTest = false } = context;

  if (totalQuestionsAsked >= FIRST_QUESTION_COUNT) {
    await unlockBadge(studentId, "first_question");
  }
  if (totalQuestionsAsked >= HOMEWORK_HERO_COUNT) {
    await unlockBadge(studentId, "homework_hero");
  }
  if (streakCurrent >= STREAK_BADGE_DAYS) {
    await unlockBadge(studentId, "streak_7");
  }
  if (examQuestionsCompleted >= EXAM_CRUSHER_COUNT) {
    await unlockBadge(studentId, "exam_crusher");
  }
  if (completedPracticeTest) {
    await unlockBadge(studentId, "naplan_ninja");
  }
}

/** Count total user messages (questions) for a student across all homework sessions. */
export async function countQuestionsAsked(studentId: string): Promise<number> {
  const n = await prisma.homeworkSessionMessage.count({
    where: {
      session: { studentId },
      role: "USER",
    },
  });
  return n;
}

export { BADGES };
