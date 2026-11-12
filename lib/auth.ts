import { createHash, timingSafeEqual } from "crypto";

/** Minimal structural type for the cookie store returned by
 *  `await cookies()` in Next.js. This avoids importing Next's internals. */
export type CookieStore = {
  get(name: string): { value: string } | undefined;
};

export const CLASS_COOKIE = "as_class";
export const TEACHER_COOKIE = "as_teacher";
const COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}

export function classCodeConfigured(): boolean {
  return Boolean(process.env.CLASS_ACCESS_CODE);
}

export function teacherPasswordConfigured(): boolean {
  return Boolean(process.env.TEACHER_ADMIN_PASSWORD);
}

/** The class code is a door code, not a login. The cookie stores only a
 *  hash of the code, never the code itself. */
export function classCodeMatches(code: string): boolean {
  const env = process.env.CLASS_ACCESS_CODE;
  if (!env) return false;
  return safeEqual(sha256(code), sha256(env));
}

export function hasClassAccess(cookies: CookieStore): boolean {
  if (!classCodeConfigured()) return false;
  const value = cookies.get(CLASS_COOKIE)?.value;
  if (!value) return false;
  return safeEqual(value, sha256(process.env.CLASS_ACCESS_CODE as string));
}

export function teacherPasswordMatches(password: string): boolean {
  const env = process.env.TEACHER_ADMIN_PASSWORD;
  if (!env) return false;
  return safeEqual(sha256(password), sha256(env));
}

export function hasTeacherAccess(cookies: CookieStore): boolean {
  if (!teacherPasswordConfigured()) return false;
  const value = cookies.get(TEACHER_COOKIE)?.value;
  if (!value) return false;
  return safeEqual(value, sha256(process.env.TEACHER_ADMIN_PASSWORD as string));
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: COOKIE_MAX_AGE,
  secure: process.env.NODE_ENV === "production",
};
