import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { hasClassAccess } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  GENERATE_SYSTEM_PROMPT,
  buildUserPrompt,
  extractHtml,
  htmlLooksSafe,
} from "@/lib/generate-prompt";
import { DETAIL_QUESTIONS, LOOKS } from "@/lib/flow";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 8192;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export async function POST(request: Request) {
  const store = await cookies();
  if (!hasClassAccess(store)) {
    return NextResponse.json(
      { error: "Please type your class code first." },
      { status: 401 },
    );
  }

  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "You have made a lot of apps in the last hour. Please wait a little while, then try again.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The app maker is not set up yet." },
      { status: 503 },
    );
  }

  let body: {
    kind?: unknown;
    subject?: unknown;
    details?: unknown;
    chips?: unknown;
    ownWords?: unknown;
    firstName?: unknown;
    look?: unknown;
    variation?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const kind = body.kind === "game" || body.kind === "learn" ? body.kind : null;
  const subject = typeof body.subject === "string" ? body.subject.slice(0, 60) : "";
  const details =
    body.details && typeof body.details === "object" && !Array.isArray(body.details)
      ? (body.details as Record<string, string>)
      : {};
  const chips = Array.isArray(body.chips)
    ? body.chips.filter((c): c is string => typeof c === "string").slice(0, 20)
    : [];
  const ownWords =
    typeof body.ownWords === "string" ? body.ownWords.slice(0, 1000) : "";
  const firstName =
    typeof body.firstName === "string" ? body.firstName.slice(0, 30) : "";
  const look =
    typeof body.look === "string" && LOOKS.some((l) => l.id === body.look)
      ? body.look
      : "bright";
  const variation =
    typeof body.variation === "number" && body.variation > 0
      ? Math.min(Math.floor(body.variation), 5)
      : 0;

  if (!kind || !subject) {
    return NextResponse.json(
      { error: "Please pick what you want to make first." },
      { status: 400 },
    );
  }
  // Only accept detail answers that are real options.
  for (const [key, value] of Object.entries(details)) {
    const q = DETAIL_QUESTIONS.find((d) => d.id === key);
    if (!q || !q.options.some((o) => o.id === value)) {
      return NextResponse.json({ error: "Bad request." }, { status: 400 });
    }
  }

  let userPrompt = buildUserPrompt({
    kind,
    subject,
    details,
    chips,
    ownWords,
    firstName,
    look,
  });
  if (variation > 0) {
    userPrompt +=
      " Make a different version from the last one. Use different words, problems, and activities.";
  }

  let raw: string;
  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: GENERATE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });
    raw = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { text: string }).text)
      .join("\n");
  } catch (err) {
    console.error("Anthropic generate failed:", err);
    const status =
      err instanceof Error && "status" in err
        ? (err as { status?: number }).status
        : undefined;
    if (status === 401) {
      return NextResponse.json(
        { error: "The app maker is not set up right. Please ask Dr. Maya." },
        { status: 503 },
      );
    }
    if (status === 429) {
      return NextResponse.json(
        { error: "The app maker is busy. Please try again in a minute." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "The app could not be made. Please try again." },
      { status: 502 },
    );
  }

  const html = extractHtml(raw);
  if (!html || !htmlLooksSafe(html)) {
    return NextResponse.json(
      { error: "The app did not come out right. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json(
    { html },
    { headers: { "x-ratelimit-remaining": String(limit.remaining) } },
  );
}
