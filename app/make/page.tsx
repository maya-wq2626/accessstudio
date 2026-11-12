"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DETAIL_QUESTIONS,
  GAME_TYPES,
  IDEA_CHIP_GROUPS,
  KINDS,
  LEARN_SUBJECTS,
  LOOKS,
  SENTENCE_STARTERS,
  SUBJECT_LABEL,
  type AppKind,
} from "@/lib/flow";
import { buildUserPrompt } from "@/lib/generate-prompt";
import ListenButton from "@/components/ListenButton";

const TOTAL_STEPS = 4;

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function MakePage() {
  const [codeChecked, setCodeChecked] = useState(false);
  const [codeConfigured, setCodeConfigured] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeBusy, setCodeBusy] = useState(false);

  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<AppKind | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [chips, setChips] = useState<string[]>([]);
  const [ownWords, setOwnWords] = useState("");
  const [firstName, setFirstName] = useState("");
  const [look, setLook] = useState("bright");

  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const micRef = useRef<SpeechRecognitionLike | null>(null);

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [variation, setVariation] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState("");

  useEffect(() => {
    setMicSupported(getSpeechRecognition() !== null);
    fetch("/api/code")
      .then((r) => r.json())
      .then((d: { authed?: boolean; configured?: boolean }) => {
        setAuthed(Boolean(d.authed));
        setCodeConfigured(d.configured !== false);
      })
      .catch(() => setCodeConfigured(true))
      .finally(() => setCodeChecked(true));
    return () => {
      try {
        micRef.current?.stop();
      } catch {
        /* mic may already be stopped */
      }
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const subjects = kind === "game" ? GAME_TYPES : LEARN_SUBJECTS;
  const subjectLabel = subject ? SUBJECT_LABEL[subject] ?? subject : "";
  const appTitle = firstName.trim()
    ? `${firstName.trim()}'s app`
    : "Your app";

  const promptText = useMemo(
    () =>
      kind && subject
        ? buildUserPrompt({
            kind,
            subject,
            details,
            chips,
            ownWords,
            firstName: firstName.trim(),
            look,
          })
        : "",
    [kind, subject, details, chips, ownWords, firstName, look],
  );

  const step1Ready =
    kind !== null &&
    subject !== null &&
    DETAIL_QUESTIONS.every((q) => Boolean(details[q.id]));

  function toggleChip(prompt: string) {
    setChips((prev) =>
      prev.includes(prompt) ? prev.filter((c) => c !== prompt) : [...prev, prompt],
    );
  }

  function addStarter(text: string) {
    setOwnWords((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
  }

  function toggleMic() {
    const SR = getSpeechRecognition();
    if (!SR) return;
    if (listening) {
      try {
        micRef.current?.stop();
      } catch {
        /* already stopped */
      }
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setOwnWords((prev) =>
        prev.trim() ? `${prev.trim()} ${transcript}` : transcript,
      );
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    micRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  async function submitCode(event: React.FormEvent) {
    event.preventDefault();
    setCodeBusy(true);
    setCodeError("");
    try {
      const res = await fetch("/api/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (res.ok) {
        setAuthed(true);
      } else {
        setCodeError("That code did not work. Please try again.");
      }
    } catch {
      setCodeError("Something went wrong. Please try again.");
    } finally {
      setCodeBusy(false);
    }
  }

  async function generate(nextVariation: number) {
    if (!kind || !subject) return;
    setGenerating(true);
    setGenError("");
    setGeneratedHtml(null);
    setPublishedId(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          subject,
          details,
          chips,
          ownWords,
          firstName: firstName.trim(),
          look,
          variation: nextVariation,
        }),
      });
      const data: { html?: string; error?: string } = await res.json();
      if (!res.ok || !data.html) {
        throw new Error(data.error ?? "The app could not be made.");
      }
      setGeneratedHtml(data.html);
      setVariation(nextVariation);
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setGenError(
        err instanceof Error
          ? err.message
          : "The app could not be made. Please try again.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function publish() {
    if (!generatedHtml || !kind || !subject) return;
    setPublishing(true);
    setPublishError("");
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: appTitle,
          firstName: firstName.trim() || null,
          kind,
          subject,
          look,
          prompt: promptText,
          html: generatedHtml,
        }),
      });
      const data: { id?: string; error?: string } = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data.error ?? "It could not be published.");
      }
      setPublishedId(data.id);
    } catch (err) {
      setPublishError(
        err instanceof Error ? err.message : "It could not be published.",
      );
    } finally {
      setPublishing(false);
    }
  }

  function goStep(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!codeChecked) {
    return (
      <p role="status" className="pt-10 text-center text-xl">
        Loading…
      </p>
    );
  }

  if (!codeConfigured) {
    return (
      <section aria-labelledby="setup-heading" className="mx-auto max-w-2xl pt-10">
        <h1 id="setup-heading" className="text-3xl font-bold">
          Not set up yet
        </h1>
        <p className="mt-4 text-xl">
          The class code has not been set up yet. Please ask Dr. Maya to set
          it up, then come back.
        </p>
      </section>
    );
  }

  if (!authed) {
    return (
      <section aria-labelledby="code-heading" className="mx-auto max-w-2xl pt-10">
        <h1 id="code-heading" className="text-3xl font-bold">
          Welcome to AccessStudio
        </h1>
        <p className="mt-4 text-xl">
          First, type your class code. It is the door code Dr. Maya gave your
          class. It is not a login, and it does not ask for your name.
        </p>
        <form onSubmit={submitCode} className="card mt-6 bg-paper p-6">
          <label htmlFor="class-code" className="field-label">
            Class code
          </label>
          <input
            id="class-code"
            name="class-code"
            type="text"
            autoComplete="off"
            className="text-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          {codeError && (
            <p role="alert" className="mt-3 text-lg font-bold text-terra">
              {codeError}
            </p>
          )}
          <button type="submit" className="btn btn-primary mt-6 w-full text-xl" disabled={codeBusy}>
            {codeBusy ? "Checking…" : "Start Making"}
          </button>
        </form>
        <p className="mt-4 text-lg">
          This app keeps you safe. It never asks for your full name, address,
          or phone number.
        </p>
      </section>
    );
  }

  // ---- Result view ----
  if (step === 5 && generatedHtml) {
    return (
      <section aria-labelledby="result-heading" className="pt-8">
        <h1 id="result-heading" className="text-center text-4xl font-bold">
          {appTitle}
        </h1>
        <p className="mt-2 text-center text-xl">
          {subjectLabel ? `A ${kind === "game" ? "game" : "practice app"} about ${subjectLabel.toLowerCase()}.` : ""}
        </p>

        <div className="card mt-6 overflow-hidden">
          <iframe
            title={appTitle}
            srcDoc={generatedHtml}
            sandbox="allow-scripts"
            className="h-[650px] w-full border-0 bg-white"
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <ListenButton
            text={`${appTitle}. ${subjectLabel ? `A ${kind === "game" ? "game" : "practice app"} about ${subjectLabel}.` : ""} It is ready to play.`}
            label="Listen"
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => generate(variation + 1)}
            disabled={generating}
          >
            {generating ? "Making a new version…" : "Try Another Version"}
          </button>
          <button
            type="button"
            className="btn btn-terra"
            onClick={publish}
            disabled={publishing || publishedId !== null}
          >
            {publishedId
              ? "On the Class Wall ✓"
              : publishing
                ? "Publishing…"
                : "Publish to Class Wall"}
          </button>
        </div>

        {genError && (
          <p role="alert" className="mt-4 text-center text-lg font-bold text-terra">
            {genError}
          </p>
        )}
        {publishError && (
          <p role="alert" className="mt-4 text-center text-lg font-bold text-terra">
            {publishError}
          </p>
        )}
        {publishedId && (
          <p role="status" className="card mt-6 bg-sage p-6 text-center text-xl">
            Your app is on the class wall! You can{" "}
            <Link href={`/app/${publishedId}`} className="font-bold underline">
              open it here
            </Link>{" "}
            or{" "}
            <Link href="/#class-wall" className="font-bold underline">
              see the whole wall
            </Link>
            .
          </p>
        )}
        <div className="mt-8 text-center">
          <Link href="/make" className="btn btn-secondary" onClick={() => window.location.reload()}>
            Start a New App
          </Link>
        </div>
      </section>
    );
  }

  // ---- Wizard steps ----
  return (
    <div className="pt-8">
      <h1 className="text-center text-3xl font-bold sm:text-4xl">
        Make your own app
      </h1>

      <div className="mx-auto mt-6 max-w-2xl" aria-label="Progress">
        <p className="text-center text-lg font-bold" aria-live="polite">
          Step {step} of {TOTAL_STEPS}
        </p>
        <div
          className="mt-2 h-4 overflow-hidden rounded-full border-2 border-soil bg-white"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label={`Step ${step} of ${TOTAL_STEPS}`}
        >
          <div
            className="h-full bg-leaf transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          {step === 1 && (
            <section aria-labelledby="step1-heading">
              <h2 id="step1-heading" className="text-2xl font-bold">
                Step 1: What are you making?
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2" role="group" aria-label="Play a game or learn and practice">
                {KINDS.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    className="choice-card"
                    aria-pressed={kind === k.id}
                    onClick={() => {
                      setKind(k.id);
                      setSubject(null);
                      setDetails({});
                    }}
                  >
                    {k.label}
                    <span className="choice-desc">{k.desc}</span>
                  </button>
                ))}
              </div>

              {kind && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold">
                    {kind === "game" ? "What kind of game?" : "What do you want to learn?"}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-3" role="group" aria-label="Subject">
                    {subjects.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="chip"
                        aria-pressed={subject === s.id}
                        onClick={() => {
                          setSubject(s.id);
                          setDetails({});
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {subject && (
                <div className="mt-8 space-y-8">
                  {DETAIL_QUESTIONS.map((q) => (
                    <div key={q.id}>
                      <h3 className="text-xl font-bold">{q.question}</h3>
                      <div className="mt-4 flex flex-wrap gap-3" role="group" aria-label={q.question}>
                        {q.options.map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            className="chip"
                            aria-pressed={details[q.id] === o.id}
                            onClick={() =>
                              setDetails((d) => ({ ...d, [q.id]: o.id }))
                            }
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="step2-heading">
              <h2 id="step2-heading" className="text-2xl font-bold">
                Step 2: Add your ideas
              </h2>
              <p className="mt-2 text-lg">
                Tap the ideas you like. Add your own words if you want. Your
                prompt grows below.
              </p>

              {IDEA_CHIP_GROUPS.map((group) => (
                <div key={group.id} className="mt-8">
                  <h3 className="text-xl font-bold">{group.heading}</h3>
                  <div className="mt-4 flex flex-wrap gap-3" role="group" aria-label={group.heading}>
                    {group.chips.map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        className="chip"
                        aria-pressed={chips.includes(chip.prompt)}
                        onClick={() => toggleChip(chip.prompt)}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-8">
                <h3 className="text-xl font-bold">Sentence starters</h3>
                <p className="mt-1 text-lg">
                  Tap one to add it to your own words.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {SENTENCE_STARTERS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="chip"
                      onClick={() => addStarter(s.text)}
                    >
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <label htmlFor="own-words" className="field-label">
                  Add your own words
                </label>
                <textarea
                  id="own-words"
                  rows={4}
                  className="text-input"
                  placeholder="Type your own words here…"
                  value={ownWords}
                  onChange={(e) => setOwnWords(e.target.value)}
                />
                <div className="mt-3">
                  {micSupported ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      aria-pressed={listening}
                      onClick={toggleMic}
                    >
                      <span aria-hidden="true">🎤</span>
                      {listening ? "Listening… Tap to stop" : "Speak your words"}
                    </button>
                  ) : (
                    <p className="text-lg">
                      Voice input is not available on this device. You can
                      type instead.
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="step3-heading">
              <h2 id="step3-heading" className="text-2xl font-bold">
                Step 3: Your first name
              </h2>
              <p className="mt-2 text-lg">
                Your first name goes on your finished app, like{" "}
                <strong>Josh&rsquo;s app</strong>. This step is optional. You
                can skip it.
              </p>
              <div className="card mt-6 bg-sage p-6">
                <p className="text-lg font-bold">
                  This app keeps you safe.
                </p>
                <p className="mt-1 text-lg">
                  It never asks for your full name, address, or phone number.
                  Only your first name, only if you want to share it.
                </p>
              </div>
              <div className="mt-6">
                <label htmlFor="first-name" className="field-label">
                  First name (optional)
                </label>
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  autoComplete="given-name"
                  className="text-input"
                  placeholder="For example: Josh"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  maxLength={30}
                />
              </div>
            </section>
          )}

          {step === 4 && (
            <section aria-labelledby="step4-heading">
              <h2 id="step4-heading" className="text-2xl font-bold">
                Step 4: Pick a look
              </h2>
              <p className="mt-2 text-lg">
                Pick the colors for your app.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2" role="group" aria-label="Pick a look">
                {LOOKS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className="choice-card"
                    aria-pressed={look === l.id}
                    onClick={() => setLook(l.id)}
                  >
                    <span
                      aria-hidden="true"
                      className="mb-2 block h-10 rounded-lg border border-soil"
                      style={{ background: l.colors.bg }}
                    />
                    {l.label}
                    <span className="choice-desc">{l.desc}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10 flex flex-wrap gap-4">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => goStep(step - 1)}
              >
                ← Back
              </button>
            )}
            {step < TOTAL_STEPS && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={step === 1 && !step1Ready}
                onClick={() => goStep(step + 1)}
              >
                Next →
              </button>
            )}
            {step === TOTAL_STEPS && (
              <button
                type="button"
                className="btn btn-terra text-xl"
                disabled={generating}
                onClick={() => generate(0)}
              >
                {generating ? "Growing your app…" : "🌱 Make My App"}
              </button>
            )}
          </div>
          {generating && (
            <p role="status" className="mt-4 text-lg">
              Growing your app… This can take a little while.
            </p>
          )}
          {genError && (
            <p role="alert" className="mt-4 text-lg font-bold text-terra">
              {genError}
            </p>
          )}
        </div>

        {/* Live prompt panel, always visible */}
        <aside aria-labelledby="prompt-heading" className="lg:sticky lg:top-6 lg:self-start">
          <div className="card bg-paper p-6">
            <h2 id="prompt-heading" className="text-xl font-bold">
              My prompt so far
            </h2>
            <p className="mt-1 text-base">
              This is what you are telling the app to make.
            </p>
            {promptText ? (
              <p className="mt-4 text-lg" aria-live="polite">
                {promptText}
              </p>
            ) : (
              <p className="mt-4 text-lg" aria-live="polite">
                Pick what you want to make, and your prompt will grow here.
              </p>
            )}
            {kind && subject && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex min-h-[48px] items-center rounded-full bg-sage px-4 text-base font-bold">
                  {kind === "game" ? "Game" : "Practice"}
                </span>
                <span className="inline-flex min-h-[48px] items-center rounded-full bg-sage px-4 text-base font-bold">
                  {subjectLabel}
                </span>
                <span className="inline-flex min-h-[48px] items-center rounded-full bg-sage px-4 text-base font-bold">
                  {LOOKS.find((l) => l.id === look)?.label ?? look}
                </span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
