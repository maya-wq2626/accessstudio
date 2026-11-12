"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LOOK_LABEL, SUBJECT_LABEL } from "@/lib/flow";

type TeacherProject = {
  id: string;
  title: string;
  first_name: string | null;
  kind: string | null;
  subject: string | null;
  look: string | null;
  prompt: string | null;
  hidden: boolean;
  created_at: string;
};

export default function TeacherPage() {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [projects, setProjects] = useState<TeacherProject[]>([]);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const res = await fetch("/api/teacher/apps");
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) throw new Error("Could not load the apps.");
      const data: { projects?: TeacherProject[] } = await res.json();
      setProjects(data.projects ?? []);
      setAuthed(true);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Could not load the apps.",
      );
    }
  }, []);

  useEffect(() => {
    load().finally(() => setChecked(true));
  }, [load]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError("That password did not work. Please try again.");
        return;
      }
      setPassword("");
      await load();
    } catch {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function setHidden(id: string, hidden: boolean) {
    setBusyId(id);
    setNotice("");
    try {
      const res = await fetch("/api/teacher/apps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, hidden }),
      });
      if (!res.ok) throw new Error("Could not update the app.");
      await load();
      setNotice(hidden ? "The app is now hidden." : "The app is shown again.");
    } catch {
      setNotice("Could not update the app. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusyId(id);
    setNotice("");
    try {
      const res = await fetch("/api/teacher/apps", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Could not delete the app.");
      await load();
      setNotice("The app was deleted.");
    } catch {
      setNotice("Could not delete the app. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (!checked) {
    return (
      <p role="status" className="pt-10 text-center text-xl">
        Loading…
      </p>
    );
  }

  if (!authed) {
    return (
      <section aria-labelledby="teacher-heading" className="mx-auto max-w-2xl pt-10">
        <h1 id="teacher-heading" className="text-3xl font-bold">
          Teacher page
        </h1>
        <p className="mt-4 text-xl">
          This page is for Dr. Maya only. Type the teacher password to
          continue.
        </p>
        <form onSubmit={login} className="card mt-6 bg-paper p-6">
          <label htmlFor="teacher-password" className="field-label">
            Teacher password
          </label>
          <input
            id="teacher-password"
            name="teacher-password"
            type="password"
            autoComplete="current-password"
            className="text-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {loginError && (
            <p role="alert" className="mt-3 text-lg font-bold text-terra">
              {loginError}
            </p>
          )}
          <button type="submit" className="btn btn-primary mt-6 w-full text-xl" disabled={loginBusy}>
            {loginBusy ? "Checking…" : "Open Teacher Page"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section aria-labelledby="teacher-heading" className="pt-8">
      <h1 id="teacher-heading" className="text-3xl font-bold">
        Teacher page
      </h1>
      <p className="mt-2 text-xl">
        All student apps are here. Hide or delete any card with one tap.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <a href="/api/teacher/export?format=csv" className="btn btn-secondary">
          Export as CSV
        </a>
        <a href="/api/teacher/export?format=json" className="btn btn-secondary">
          Export as JSON
        </a>
      </div>

      {notice && (
        <p role="status" className="card mt-6 bg-sage p-4 text-lg">
          {notice}
        </p>
      )}
      {loadError && (
        <p role="alert" className="mt-6 text-lg font-bold text-terra">
          {loadError}
        </p>
      )}

      {projects.length === 0 ? (
        <p role="status" className="card mt-6 bg-sage p-6 text-xl">
          No apps yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {projects.map((p) => (
            <li key={p.id} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {p.title}
                    {p.hidden && (
                      <span className="ml-3 rounded-full bg-sage px-3 py-1 text-base font-bold text-soil">
                        Hidden
                      </span>
                    )}
                  </h2>
                  <p className="mt-1 text-lg">
                    {p.first_name ? `By ${p.first_name}. ` : ""}
                    {p.kind === "game" ? "Game" : "Practice"} ·{" "}
                    {p.subject ? SUBJECT_LABEL[p.subject] ?? p.subject : "Learning"}
                    {p.look ? ` · ${LOOK_LABEL[p.look] ?? p.look}` : ""}
                  </p>
                  <p className="mt-1 text-base">
                    Made {new Date(p.created_at).toLocaleString("en-US")}
                  </p>
                  {p.prompt && (
                    <p className="mt-3 text-lg">
                      <strong>Prompt:</strong> {p.prompt}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/app/${p.id}`} className="btn btn-secondary">
                    Open
                  </Link>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={busyId === p.id}
                    onClick={() => setHidden(p.id, !p.hidden)}
                  >
                    {p.hidden ? "Show again" : "Hide"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-terra"
                    disabled={busyId === p.id}
                    onClick={() => remove(p.id, p.title)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
