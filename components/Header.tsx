"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SHELF_BANNER_DATA_URI } from "@/lib/banner-image";

/**
 * Full-width running header on every page: the watercolor shelf banner,
 * edge to edge, with the AccessStudio title pill and a hamburger menu.
 * The menu is a dropdown that only opens when tapped, so it never
 * distracts students while they work.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="w-full">
      <div className="relative w-full">
        <img
          src={SHELF_BANNER_DATA_URI}
          alt=""
          aria-hidden="true"
          className="h-[clamp(104px,17vw,168px)] w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex min-h-[56px] items-center rounded-full border-2 border-leaf bg-white/95 px-6 py-3 text-2xl font-bold text-soil sm:text-3xl"
            aria-label="AccessStudio home"
          >
            <span aria-hidden="true" className="mr-2 text-leaf">
              🌱
            </span>
            AccessStudio
          </Link>

          <div className="absolute right-4 sm:right-6" ref={menuRef}>
            <button
              ref={buttonRef}
              type="button"
              className="inline-flex min-h-[48px] min-w-[48px] items-center gap-2 rounded-full border-2 border-soil bg-white/95 px-5 py-2 text-lg font-bold text-soil"
              aria-expanded={open}
              aria-haspopup="true"
              aria-controls="main-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span aria-hidden="true" className="flex flex-col gap-[5px]">
                <span className="block h-[3px] w-6 bg-soil" />
                <span className="block h-[3px] w-6 bg-soil" />
                <span className="block h-[3px] w-6 bg-soil" />
              </span>
              Menu
            </button>
            {open && (
              <nav aria-label="Main menu">
                <ul
                  id="main-menu"
                  className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border-2 border-soil bg-white py-2 shadow-lg"
                >
                  <li>
                    <Link
                      href="/"
                      className="block min-h-[48px] px-5 py-3 text-lg font-bold text-soil hover:bg-sage"
                      onClick={() => setOpen(false)}
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#class-wall"
                      className="block min-h-[48px] px-5 py-3 text-lg font-bold text-soil hover:bg-sage"
                      onClick={() => setOpen(false)}
                    >
                      Class Wall
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/make"
                      className="block min-h-[48px] px-5 py-3 text-lg font-bold text-soil hover:bg-sage"
                      onClick={() => setOpen(false)}
                    >
                      Start a New App
                    </Link>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
