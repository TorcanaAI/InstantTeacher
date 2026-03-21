// InstantTeacher - Homework help with Sunshine & Jack

// Subjects for homework and exam prep
export const SUBJECTS = [
  "English",
  "Mathematics",
  "HASS",
  "Science",
] as const;

export type SubjectKey = (typeof SUBJECTS)[number];

export const SUBJECT_DESCRIPTIONS: Record<SubjectKey, string> = {
  English: "Reading, writing, comprehension, and essay skills.",
  Mathematics: "Homework support, problem-solving, and exam prep.",
  HASS: "Humanities and Social Sciences — civics, history, geography.",
  Science: "General science, experiments, and exam preparation.",
};

export const YEAR_LEVELS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const DEFAULT_TIMEZONE = "Australia/Perth";

// ============ HOMEWORK HELP PRICING ============
export const HOMEWORK_SESSION_MINUTES = 15;
export const HOMEWORK_SESSION_PRICE_CENTS = 700; // $7 per 15 min session
export const SUBSCRIPTION_WEEKLY_PRICE_CENTS = 1000; // $10/week — unlimited sessions
export const SUBSCRIPTION_MONTHLY_PRICE_CENTS = 3000; // $30/month — unlimited sessions

export const PANIC_BUTTON_RESPONSE =
  "Hey, take a breath. You're not alone. Let's slow down together. Whatever you're facing, it's okay to ask for help. If you're feeling overwhelmed, it might really help to talk to a parent, teacher, or someone you trust.";

export const BADGES = [
  { id: "first_question", name: "First Question", emoji: "⭐", description: "Asked your first question" },
  { id: "homework_hero", name: "Homework Hero", emoji: "📚", description: "Asked 10 questions" },
  { id: "streak_7", name: "7 Day Streak", emoji: "🔥", description: "Studied for 7 days in a row" },
  { id: "exam_crusher", name: "Exam Crusher", emoji: "🧠", description: "Completed 20 exam questions" },
  { id: "naplan_ninja", name: "NAPLAN Ninja", emoji: "⚡", description: "Completed a practice test" },
] as const;

export type BadgeId = (typeof BADGES)[number]["id"];

export const FIRST_QUESTION_COUNT = 1;
export const HOMEWORK_HERO_COUNT = 10;
export const STREAK_BADGE_DAYS = 7;
export const EXAM_CRUSHER_COUNT = 20;

/** Sunshine's profile image (koala character). */
export const SUNSHINE_AVATAR_URL = "/sunshine.png";

export const SUNSHINE_INTRODUCTION =
  "Hi! I'm Sunshine — I love helping with homework. I'll take it step by step and cheer you on. Ask me anything!";

/** Jack's profile image (kangaroo character). */
export const JACK_AVATAR_URL = "/jack.png";

export const JACK_INTRODUCTION =
  "Hey! I'm Jack — I'm here to break things down and keep you going. Let's tackle this step by step. Ready when you are!";
