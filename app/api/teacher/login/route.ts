import { NextResponse } from "next/server";
import {
  TEACHER_COOKIE,
  cookieOptions,
  sha256,
  teacherPasswordConfigured,
  teacherPasswordMatches,
} from "@/lib/auth";

/** POST { password }: check the teacher password and set a cookie holding
 *  only a hash of it. */
export async function POST(request: Request) {
  if (!teacherPasswordConfigured()) {
    return NextResponse.json(
      { error: "The teacher password is not set up yet." },
      { status: 503 },
    );
  }
  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const password = typeof body.password === "string" ? body.password : "";
  if (!password || !teacherPasswordMatches(password)) {
    return NextResponse.json(
      { error: "That password did not work." },
      { status: 401 },
    );
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TEACHER_COOKIE, sha256(password), cookieOptions);
  return res;
}
