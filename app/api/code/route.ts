import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  CLASS_COOKIE,
  classCodeConfigured,
  classCodeMatches,
  cookieOptions,
  hasClassAccess,
  sha256,
} from "@/lib/auth";

/** GET: is this browser already past the class code? */
export async function GET() {
  const store = await cookies();
  return NextResponse.json({
    authed: hasClassAccess(store),
    configured: classCodeConfigured(),
  });
}

/** POST { code }: check the class code (a door code, not a login) and set
 *  a cookie holding only a hash of the code. */
export async function POST(request: Request) {
  if (!classCodeConfigured()) {
    return NextResponse.json(
      { error: "The class code is not set up yet." },
      { status: 503 },
    );
  }
  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code || !classCodeMatches(code)) {
    return NextResponse.json(
      { error: "That code did not work." },
      { status: 401 },
    );
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CLASS_COOKIE, sha256(code), cookieOptions);
  return res;
}
