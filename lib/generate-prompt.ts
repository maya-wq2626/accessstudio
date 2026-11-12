import { DETAIL_QUESTIONS, LOOKS, SUBJECT_LABEL } from "./flow";

export type GenerateInput = {
  kind: "game" | "learn";
  subject: string;
  details: Record<string, string>;
  chips: string[];
  ownWords: string;
  firstName: string;
  look: string;
};

const SELF_CONTENT_LINE =
  "The app must make up its own practice content in its own JavaScript. " +
  "For vocabulary it makes up its own words. For math it makes up its own " +
  "problems. For a quiz it makes up its own questions. The student never " +
  "types in words, problems, or lists, and no teacher provides any material. " +
  "Do not ask the student for any content, and do not leave a blank list for " +
  "someone else to fill in.";

export const GENERATE_SYSTEM_PROMPT = `You build learning apps for adult college students with intellectual and developmental disabilities. Your apps must be respectful, adult, plain, encouraging, and easy to use. Never talk down to the student. Never use childish words or pictures.

LANGUAGE
- Use plain, simple adult language. Short sentences.
- Use short headed sections when you write any text.
- Be encouraging. Say what the student can do, not what they cannot do.

WHAT YOU RETURN
- Return ONE complete, self-contained HTML document only. No introduction, no explanation, no markdown fences.
- Inline CSS in a <style> tag and inline JavaScript in a <script> tag. No external URLs of any kind. No links out of the page. No <form> tags. No <iframe>, <object>, or <embed> tags. Nothing that collects personal information. No sign-in, no name field, no email field.
- The document IS the working app: a playable game or a practice app the student can use right away. It must work with no other files.
- The app must make up its own practice content in its own JavaScript. ${SELF_CONTENT_LINE}
- Keep a big pool of practice content: at least 20 questions, words, or problems, more than one round ever needs. Every round picks a different random set from the pool, so the practice feels new each time.
- Mix up the order of the answer choices every round, so the right answer is not always in the same place. Never put the right answer first every time.
- For fill-in-the-blank questions, the sentence must show the blank as _____ where the missing word goes, and the missing word must not appear anywhere else in the sentence. Never show a complete sentence and call it fill in the blank.
- Never ask the student to type an answer. Answers are always chosen by tapping, or by matching two cards. No text boxes for answers.
- Include a big Listen button that reads the main text aloud with the browser speech feature (window.speechSynthesis). Include a Start over button that starts a new round with fresh questions, words, or problems from the pool, not the same ones again.
- Use large text (at least 18 pixels for body text) and big tap targets (at least 48 pixels tall). Use high contrast colors, at least 4.5 to 1 for text.
- Keep the screen calm and simple. One thing to do at a time. Big buttons with clear words on them.
- When the student answers, say right away if it is right, in kind words, and let them try again if it is wrong. Never show a score as a failure. Celebrate finishing.
- Make sure the JavaScript runs without errors. Check that every button works. Before finishing, check every question and fix any that cannot be answered: a blank must really be blank, the right answer must be there to find, the right answer must not always sit in the same place, and the question must not give the answer away. Most important, check that every marked correct answer is truly correct. For vocabulary, make sure each definition really matches its word. If you are not sure a definition is right, use a different word you are sure about. For math, work out each problem yourself step by step and check the answer before you mark it correct. The marked answer must be the true result of the calculation.`;

/** Builds the plain-language user prompt sent to Claude, from the
 *  student's guided choices. This is the same wording the student sees in
 *  the "My prompt so far" panel. */
export function buildUserPrompt(input: GenerateInput): string {
  const kindWord = input.kind === "game" ? "game" : "practice app";
  const subjectLabel = SUBJECT_LABEL[input.subject] ?? input.subject;
  const lines: string[] = [];

  lines.push(
    `Build me a ${kindWord} about ${subjectLabel.toLowerCase()}.`,
  );

  for (const q of DETAIL_QUESTIONS) {
    const chosen = input.details[q.id];
    const option = q.options.find((o) => o.id === chosen);
    if (option) lines.push(`In this app, ${option.prompt}.`);
  }

  for (const chip of input.chips) {
    lines.push(`Please ${chip}.`);
  }

  if (input.ownWords.trim()) {
    lines.push(input.ownWords.trim());
  }

  const look = LOOKS.find((l) => l.id === input.look);
  if (look) {
    lines.push(
      `Use the "${look.label}" look: background ${look.colors.bg}, main text ${look.colors.text}, buttons and accents ${look.colors.accent} with white text on them.`,
    );
  }

  lines.push(
    "Make the app right away. Do not ask me for anything else. The app makes up its own words and problems.",
  );

  return lines.join(" ");
}

/** Extracts the HTML document from Claude's reply, stripping markdown
 *  fences if Claude added them. Returns null when nothing usable is found. */
export function extractHtml(raw: string): string | null {
  let text = raw.trim();
  const fenced = text.match(/```(?:html)?\s*([\s\S]*?)\s*```/i);
  if (fenced) text = fenced[1].trim();
  if (!/<(!doctype|html)/i.test(text)) return null;
  return text;
}

/** Safety check on generated HTML before it is stored or shown. The app
 *  runs in a sandboxed iframe, and this is a second layer of protection. */
export function htmlLooksSafe(html: string): boolean {
  if (html.length > 150_000) return false;
  const lower = html.toLowerCase();
  const banned = [
    "<form",
    "<iframe",
    "<object",
    "<embed",
    "<link",
    "<meta http-equiv",
    "http://",
    "https://",
    "src=",
    "javascript:",
    "onerror=",
    "fetch(",
    "xmlhttprequest",
    "localstorage",
    "sessionstorage",
    "document.cookie",
  ];
  return !banned.some((token) => lower.includes(token));
}
