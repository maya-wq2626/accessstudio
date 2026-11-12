"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Read-aloud button using the browser Web Speech API. Reads the given text
 * and can stop. Hidden when the browser has no speech support.
 */
export default function ListenButton({
  text,
  label = "Listen",
  className = "btn btn-secondary",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    synth.speak(utter);
    setSpeaking(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className={className}
    >
      <span aria-hidden="true">{speaking ? "🔇" : "🔊"}</span>
      {speaking ? "Stop" : label}
    </button>
  );
}
