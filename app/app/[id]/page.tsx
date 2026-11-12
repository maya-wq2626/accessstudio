import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase, type Project } from "@/lib/supabase";
import { LOOK_LABEL, SUBJECT_LABEL } from "@/lib/flow";
import ListenButton from "@/components/ListenButton";

export const dynamic = "force-dynamic";

export default async function AppDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getSupabase();
  if (!db) notFound();

  const { data, error } = await db
    .from("projects")
    .select("id, title, first_name, kind, subject, look, prompt, html, hidden, created_at")
    .eq("id", id)
    .eq("hidden", false)
    .single();

  if (error || !data) notFound();
  const project = data as Project;

  const subjectLabel = project.subject
    ? SUBJECT_LABEL[project.subject] ?? project.subject
    : "learning";
  const listenText = `${project.title}. ${
    project.kind === "game" ? "A game" : "A practice app"
  } about ${subjectLabel}.`;

  return (
    <section aria-labelledby="app-heading" className="pt-8">
      <Link href="/#class-wall" className="btn btn-secondary">
        ← Back to Class Wall
      </Link>

      <h1 id="app-heading" className="mt-6 text-4xl font-bold">
        {project.title}
      </h1>
      <p className="mt-2 text-xl">
        {project.first_name ? `By ${project.first_name}. ` : ""}
        {project.kind === "game" ? "Game" : "Practice"} · {subjectLabel}
        {project.look ? ` · ${LOOK_LABEL[project.look] ?? project.look}` : ""}
      </p>

      <div className="mt-6">
        <ListenButton text={listenText} label="Listen" />
      </div>

      <div className="card mt-6 overflow-hidden">
        <iframe
          title={project.title}
          srcDoc={project.html}
          sandbox="allow-scripts"
          className="h-[700px] w-full border-0 bg-white"
        />
      </div>

      <div className="mt-6">
        <Link href="/#class-wall" className="btn btn-secondary">
          ← Back to Class Wall
        </Link>
      </div>
    </section>
  );
}
