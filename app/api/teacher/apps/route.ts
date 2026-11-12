import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hasTeacherAccess } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

/** GET: list every app, including hidden ones, for the teacher page. */
export async function GET() {
  const store = await cookies();
  if (!hasTeacherAccess(store)) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const db = getSupabase();
  if (!db) {
    return NextResponse.json(
      { error: "The class wall is not set up yet." },
      { status: 503 },
    );
  }
  const { data, error } = await db
    .from("projects")
    .select("id, title, first_name, kind, subject, look, prompt, hidden, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("Teacher list failed:", error.message);
    return NextResponse.json(
      { error: "Could not load the apps." },
      { status: 500 },
    );
  }
  return NextResponse.json({ projects: data ?? [] });
}

/** PATCH { id, hidden }: hide an app or show it again. */
export async function PATCH(request: Request) {
  const store = await cookies();
  if (!hasTeacherAccess(store)) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const db = getSupabase();
  if (!db) {
    return NextResponse.json(
      { error: "The class wall is not set up yet." },
      { status: 503 },
    );
  }
  let body: { id?: unknown; hidden?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  const hidden = body.hidden === true;
  if (!id) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { error } = await db.from("projects").update({ hidden }).eq("id", id);
  if (error) {
    console.error("Hide failed:", error.message);
    return NextResponse.json(
      { error: "Could not update the app." },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}

/** DELETE { id }: delete an app for good. */
export async function DELETE(request: Request) {
  const store = await cookies();
  if (!hasTeacherAccess(store)) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const db = getSupabase();
  if (!db) {
    return NextResponse.json(
      { error: "The class wall is not set up yet." },
      { status: 503 },
    );
  }
  let body: { id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { error } = await db.from("projects").delete().eq("id", id);
  if (error) {
    console.error("Delete failed:", error.message);
    return NextResponse.json(
      { error: "Could not delete the app." },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
