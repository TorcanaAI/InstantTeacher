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

// Full subject names (no duplicates). Used in UI and matching.
export const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Science",
  "Chemistry",
  "Physics",
  "Biology",
  "Humanities",
  "History",
  "Geography",
  "French",
  "Mandarin",
  "Afrikaans",
  "Other",
] as const;

export type SubjectKey = (typeof SUBJECTS)[number];

export const SUBJECT_DESCRIPTIONS: Record<SubjectKey, string> = {
  Mathematics: "Homework support, problem-solving, and exam prep for all levels.",
  "English Language": "Reading, writing, comprehension, and essay skills.",
  Science: "General science, experiments, and exam preparation.",
  Chemistry: "Topics, equations, and lab concepts.",
  Physics: "Mechanics, equations, and problem-solving.",
  Biology: "Living systems, ecology, and exam prep.",
  Humanities: "Civics, society, and critical thinking.",
  History: "Sources, essays, and exam technique.",
  Geography: "Physical and human geography, mapping, and essays.",
  French: "Conversation, grammar, and exam preparation.",
  Mandarin: "Conversation, characters, and exam preparation.",
  Afrikaans: "Conversation, grammar, and exam preparation.",
  Other: "General study support and exam prep.",
};

export const YEAR_LEVELS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const TEACHER_JOIN_SLA_MINUTES = 3;
export const STUDENT_NO_SHOW_WAIT_MINUTES = 5;
export const MATCH_TIMEOUT_SECONDS = 30;
export const MATCH_EXTENDED_TIMEOUT_SECONDS = 120;

export const DEFAULT_TIMEZONE = "Australia/Perth";
