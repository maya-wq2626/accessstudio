import Link from "next/link";
import { getSupabase, supabaseConfigured, type Project } from "@/lib/supabase";
import { LOOK_LABEL, SUBJECT_LABEL } from "@/lib/flow";

export const dynamic = "force-dynamic";

async function getWallProjects(): Promise<Project[] | null> {
  const db = getSupabase();
  if (!db) return null;
  const { data, error } = await db
    .from("projects")
    .select("id, title, first_name, kind, subject, look, prompt, html, hidden, created_at")
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) {
    console.error("Class wall fetch failed:", error.message);
    return null;
  }
  return (data ?? []) as Project[];
}

export default async function Home() {
  const projects = await getWallProjects();
  const wallReady = supabaseConfigured();

  return (
    <div>
      {/* Welcome */}
      <section aria-labelledby="welcome-heading" className="pt-8 text-center">
        <p className="mx-auto inline-flex min-h-[48px] items-center rounded-full border-2 border-leaf bg-sage px-5 py-2 text-lg font-bold text-leaf">
          <span aria-hidden="true" className="mr-2">
            🌱
          </span>
          grow your ideas with Dr. Maya
        </p>
        <h1
          id="welcome-heading"
          className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl"
        >
          Make your own learning app
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl">
          Pick what you want to make, answer a few easy questions, and watch
          your app come to life. Then share it on the class wall.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/make" className="btn btn-primary text-xl">
            Start Making a New App
          </Link>
          <Link href="#class-wall" className="btn btn-secondary text-xl">
            See the Class Wall
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="mt-14">
        <h2 id="how-heading" className="text-center text-3xl font-bold">
          How it works
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          <li className="card p-6">
            <p className="text-2xl font-bold text-terra" aria-hidden="true">
              1
            </p>
            <h3 className="mt-2 text-xl font-bold">Answer a few questions</h3>
            <p className="mt-1 text-lg">
              Pick a game or something to learn. Tap your choices. Add your
              own words if you want.
            </p>
          </li>
          <li className="card p-6">
            <p className="text-2xl font-bold text-terra" aria-hidden="true">
              2
            </p>
            <h3 className="mt-2 text-xl font-bold">Watch your app grow</h3>
            <p className="mt-1 text-lg">
              Your app is made for you right away, on the same page. You can
              play it and listen to it.
            </p>
          </li>
          <li className="card p-6">
            <p className="text-2xl font-bold text-terra" aria-hidden="true">
              3
            </p>
            <h3 className="mt-2 text-xl font-bold">Share it on the wall</h3>
            <p className="mt-1 text-lg">
              Put your app on the class wall so your classmates can open it
              and play it too.
            </p>
          </li>
        </ol>
      </section>

      {/* Class wall */}
      <section aria-labelledby="wall-heading" id="class-wall" className="mt-14 scroll-mt-8">
        <h2 id="wall-heading" className="text-3xl font-bold">
          Class Wall
        </h2>
        <p className="mt-2 text-xl">Tap any card to open the full app.</p>

        {!wallReady && (
          <p role="status" className="card mt-6 bg-sage p-6 text-xl">
            The class wall is not set up yet. Your teacher will set it up
            soon.
          </p>
        )}

        {wallReady && projects === null && (
          <p role="status" className="card mt-6 bg-sage p-6 text-xl">
            The class wall could not be loaded right now. Please try again
            later.
          </p>
        )}

        {wallReady && projects !== null && projects.length === 0 && (
          <p role="status" className="card mt-6 bg-sage p-6 text-xl">
            No apps yet. Be the first to make one!
          </p>
        )}

        {wallReady && projects !== null && projects.length > 0 && (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/app/${p.id}`}
                  className="card block h-full p-6 hover:border-leaf"
                  aria-label={`Open ${p.title}`}
                >
                  <h3 className="text-2xl font-bold">{p.title}</h3>
                  {p.first_name && (
                    <p className="mt-1 text-lg">By {p.first_name}</p>
                  )}
                  <p className="mt-3 text-lg">
                    {p.kind === "game" ? "Game" : "Practice"} ·{" "}
                    {p.subject ? SUBJECT_LABEL[p.subject] ?? p.subject : "Learning"}
                  </p>
                  {p.look && (
                    <p className="mt-1 text-lg">
                      Look: {LOOK_LABEL[p.look] ?? p.look}
                    </p>
                  )}
                  <p className="mt-3 text-lg font-bold text-leaf">
                    Open the app →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
