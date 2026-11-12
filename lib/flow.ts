// Shared constants for the student build flow. These are the agreed choices
// Maya approved on 2026-11-11. Do not re-add removed questions:
// no four seed-packet creation types, no who/where/goal-or-mood questions,
// no questions asking whose words, which words, how many words, or which
// problems. The generated app creates its own practice content.

export type AppKind = "game" | "learn";

export const KINDS: { id: AppKind; label: string; desc: string }[] = [
  { id: "game", label: "Play a Game", desc: "A fun game to play" },
  { id: "learn", label: "Learn & Practice", desc: "Practice and learn something new" },
];

export const GAME_TYPES: { id: string; label: string }[] = [
  { id: "word-game", label: "Word game" },
  { id: "math-game", label: "Math game" },
  { id: "memory-game", label: "Memory game" },
  { id: "quiz-game", label: "Quiz game" },
  { id: "adventure-game", label: "Adventure story game" },
];

export const LEARN_SUBJECTS: { id: string; label: string }[] = [
  { id: "vocabulary", label: "Vocabulary" },
  { id: "math", label: "Math" },
  { id: "spelling", label: "Spelling" },
  { id: "reading", label: "Reading" },
  { id: "computer-skills", label: "Computer skills" },
  { id: "daily-life", label: "Daily life skills" },
];

export const SUBJECT_LABEL: Record<string, string> = {
  ...Object.fromEntries(GAME_TYPES.map((t) => [t.id, t.label])),
  ...Object.fromEntries(LEARN_SUBJECTS.map((s) => [s.id, s.label])),
};

// Three detail questions, the same for games and learning. They ask HOW the
// app works, never for content. The app makes up its own words and problems.
export const DETAIL_QUESTIONS: {
  id: string;
  question: string;
  options: { id: string; label: string; prompt: string }[];
}[] = [
  {
    id: "answer-style",
    question: "How do you answer?",
    options: [
      { id: "tap", label: "Tap an answer", prompt: "the student answers by tapping an answer" },
      { id: "match", label: "Match two cards", prompt: "the student answers by matching two cards" },
    ],
  },
  {
    id: "round-length",
    question: "How long is one round?",
    options: [
      { id: "short", label: "Short, a few minutes", prompt: "one round is short, a few minutes" },
      { id: "medium", label: "Medium, about 10 minutes", prompt: "one round is medium, about 10 minutes" },
      { id: "long", label: "Long, with many parts", prompt: "one round is long, with many parts" },
    ],
  },
  {
    id: "timer-purpose",
    question: "What is the timer for?",
    options: [
      { id: "quiz", label: "To finish the quiz", prompt: "the timer counts down to finish the quiz" },
      { id: "practice", label: "To time my practice", prompt: "the timer times the practice" },
      { id: "break", label: "To time a break", prompt: "the timer times a break" },
    ],
  },
];

// Step 2 idea chips, grouped by prompt. Chips add a short phrase to the
// student's prompt. Nothing here asks for content to supply.
export const IDEA_CHIP_GROUPS: {
  id: string;
  heading: string;
  chips: { id: string; label: string; prompt: string }[];
}[] = [
  {
    id: "feel",
    heading: "How should it feel?",
    chips: [
      { id: "fun", label: "Fun", prompt: "make it fun" },
      { id: "calm", label: "Calm", prompt: "make it calm" },
      { id: "exciting", label: "Exciting", prompt: "make it exciting" },
      { id: "friendly", label: "Friendly", prompt: "make it friendly" },
      { id: "relaxing", label: "Relaxing", prompt: "make it relaxing" },
    ],
  },
  {
    id: "help",
    heading: "What should it help with?",
    chips: [
      { id: "new-words", label: "Learn new words", prompt: "help me learn new words" },
      { id: "math", label: "Practice math", prompt: "help me practice math" },
      { id: "remember", label: "Remember things", prompt: "help me remember things" },
      { id: "confident", label: "Feel confident", prompt: "help me feel confident" },
      { id: "faster", label: "Get faster", prompt: "help me get faster" },
    ],
  },
  {
    id: "show",
    heading: "How should it show things?",
    chips: [
      { id: "big-buttons", label: "Big colorful buttons", prompt: "use big colorful buttons" },
      { id: "pictures", label: "Pictures with words", prompt: "use pictures with words" },
      { id: "read-aloud", label: "Read aloud", prompt: "read the words aloud" },
      { id: "simple-steps", label: "Simple steps", prompt: "use simple steps, one at a time" },
    ],
  },
];

export const SENTENCE_STARTERS: { id: string; text: string }[] = [
  { id: "starter-fun", text: "I want the game to be fun." },
  { id: "starter-learn", text: "I want it to help me learn new words." },
  { id: "starter-buttons", text: "I want big buttons and few words on the screen." },
  { id: "starter-quiet", text: "I want it to be calm and quiet." },
];

// Step 4 looks. These palettes are handed to Claude so the generated app
// uses the student's chosen look. Every pairing below was checked for
// WCAG AA contrast (see CONTRAST_AUDIT.md).
export const LOOKS: {
  id: string;
  label: string;
  desc: string;
  colors: { bg: string; text: string; accent: string; accentText: string };
}[] = [
  {
    id: "bright",
    label: "Bright & Energetic",
    desc: "Bright colors, lots of energy",
    colors: { bg: "#FFF6DB", text: "#3E2718", accent: "#B4551F", accentText: "#FFFFFF" },
  },
  {
    id: "calm",
    label: "Calm Ocean",
    desc: "Soft blue, calm and easy to read",
    colors: { bg: "#EAF4F6", text: "#14343B", accent: "#1F5E6B", accentText: "#FFFFFF" },
  },
  {
    id: "sunset",
    label: "Warm Sunset",
    desc: "Warm colors, like the evening sun",
    colors: { bg: "#FDF0E6", text: "#4A2310", accent: "#9A4517", accentText: "#FFFFFF" },
  },
  {
    id: "bold",
    label: "Bold High-Contrast",
    desc: "Black and white, very easy to see",
    colors: { bg: "#FFFFFF", text: "#000000", accent: "#000000", accentText: "#FFFFFF" },
  },
];

export const LOOK_LABEL: Record<string, string> = Object.fromEntries(
  LOOKS.map((l) => [l.id, l.label]),
);
