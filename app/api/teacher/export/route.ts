import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hasTeacherAccess } from "@/lib/auth";
import { getSupabase, type Project } from "@/lib/supabase";

function csvCell(value: string | null | boolean | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

/** GET ?format=csv|json: export all apps for portfolios or IEP and
 *  transition records. The generated HTML is not included; the export
 *  carries the prompt and the app details instead. */
export async function GET(request: Request) {
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
  const format = new URL(request.url).searchParams.get("format") ?? "csv";
  const { data, error } = await db
    .from("projects")
    .select("id, title, first_name, kind, subject, look, prompt, hidden, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Export failed:", error.message);
    return NextResponse.json(
      { error: "Could not export the apps." },
      { status: 500 },
    );
  }
  const projects = (data ?? []) as Partial<Project>[];

  if (format === "json") {
    return new NextResponse(JSON.stringify(projects, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="accessstudio-apps.json"',
      },
    });
  }

  const header = [
    "id",
    "title",
    "first_name",
    "kind",
    "subject",
    "look",
    "created_at",
    "hidden",
    "prompt",
  ];
  const lines = [
    header.join(","),
    ...projects.map((p) =>
      [
        csvCell(p.id),
        csvCell(p.title),
        csvCell(p.first_name),
        csvCell(p.kind),
        csvCell(p.subject),
        csvCell(p.look),
        csvCell(p.created_at),
        csvCell(p.hidden),
        csvCell(p.prompt),
      ].join(","),
    ),
  ];
  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="accessstudio-apps.csv"',
    },
  });
}
