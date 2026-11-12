import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hasClassAccess } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

/** POST: publish a generated app to the class wall. */
export async function POST(request: Request) {
  const store = await cookies();
  if (!hasClassAccess(store)) {
    return NextResponse.json(
      { error: "Please type your class code first." },
      { status: 401 },
    );
  }

  const db = getSupabase();
  if (!db) {
    return NextResponse.json(
      { error: "The class wall is not set up yet." },
      { status: 503 },
    );
  }

  let body: {
    title?: unknown;
    firstName?: unknown;
    kind?: unknown;
    subject?: unknown;
    look?: unknown;
    prompt?: unknown;
    html?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim().slice(0, 80) : "";
  const firstName =
    typeof body.firstName === "string" ? body.firstName.trim().slice(0, 30) : null;
  const kind = body.kind === "game" || body.kind === "learn" ? body.kind : null;
  const subject = typeof body.subject === "string" ? body.subject.slice(0, 60) : "";
  const look = typeof body.look === "string" ? body.look.slice(0, 40) : "";
  const prompt = typeof body.prompt === "string" ? body.prompt.slice(0, 3000) : "";
  const html = typeof body.html === "string" ? body.html : "";

  if (!title || !kind || !subject || !html || html.length > 150_000) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const { data, error } = await db
    .from("projects")
    .insert({
      title,
      first_name: firstName || null,
      kind,
      subject,
      look,
      prompt,
      html,
      hidden: false,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Publish failed:", error?.message);
    return NextResponse.json(
      { error: "It could not be published. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id });
}
