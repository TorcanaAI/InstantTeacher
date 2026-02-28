// InstantTeacher - App constants

export const SESSION_DURATIONS = [
  { minutes: 15, label: "15 mins", priceCents: 3000, priceLabel: "$30" },
  { minutes: 30, label: "30 mins", priceCents: 5500, priceLabel: "$55" },
  { minutes: 60, label: "60 mins", priceCents: 9000, priceLabel: "$90" },
] as const;

export const PLATFORM_FEE_PERCENT = 25;
export const TEACHER_PAYOUT_PERCENT = 75;

export const HELP_TYPES = [
  "One question / stuck",
  "Concept explanation",
  "Homework review",
  "Exam prep",
  "Essay feedback",
] as const;

// Only these 4 subjects. Used in UI and matching.
export const SUBJECTS = [
  "English",
  "Mathematics",
  "HASS",
  "Science",
] as const;

export type SubjectKey = (typeof SUBJECTS)[number];

export const SUBJECT_DESCRIPTIONS: Record<SubjectKey, string> = {
  English: "Reading, writing, comprehension, and essay skills.",
  Mathematics: "Homework support, problem-solving, and exam prep for all levels.",
  HASS: "Humanities and Social Sciences — civics, history, geography, and critical thinking.",
  Science: "General science, experiments, and exam preparation.",
};

// Section type: NAPLAN (Years 3, 5, 7, 9) or ATAR (Years 10–12). Stored on session request.
export const SECTION_TYPES = ["NAPLAN", "ATAR"] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

// Year options per section (used on /help/naplan and /help/atar).
export const NAPLAN_YEARS = [3, 5, 7, 9] as const;
export const ATAR_YEARS = [10, 11, 12] as const;

export const YEAR_LEVELS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const TEACHER_JOIN_SLA_MINUTES = 3;
export const STUDENT_NO_SHOW_WAIT_MINUTES = 5;
export const MATCH_TIMEOUT_SECONDS = 30;
export const MATCH_EXTENDED_TIMEOUT_SECONDS = 120;

export const DEFAULT_TIMEZONE = "Australia/Perth";

// ============ INSTANT SUNSHINE CHILD ============
export const SUNSHINE_QUESTION_BLOCK_SIZE = 5;
export const SUNSHINE_QUESTION_BLOCK_PRICE_CENTS = 500; // $5
export const SUNSHINE_READING_SESSION_PRICE_CENTS = 1000; // $10
export const SUNSHINE_READING_YEARS = [1, 2, 3, 4, 5] as const; // Years 1-5 only

/** User-facing description for Sunshine (live reading correction + Q&A). */
export const SUNSHINE_DESCRIPTION =
  "Sunshine listens while you read aloud, gives gentle corrections, and asks comprehension questions at the end. Hello, my name is Sunshine — ask me a question or let's read a book together. Pay-as-you-go, no subscription.";
