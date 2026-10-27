import type { Request, Response } from "express";
import { randomBytes, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ts_session";
export const CSRF_COOKIE = "ts_csrf";

const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

function cookieOptions(httpOnly: boolean, maxAge?: number) {
  return {
    httpOnly,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

export function readCookie(
  request: Request,
  name: string,
): string | undefined {
  const header = request.headers.cookie;
  if (!header) return undefined;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;

    if (part.slice(0, separator).trim() !== name) continue;

    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return undefined;
    }
  }

  return undefined;
}

export function issueAuthCookies(
  response: Response,
  sessionToken: string,
): string {
  const csrfToken = randomBytes(32).toString("hex");

  response.cookie(
    SESSION_COOKIE,
    sessionToken,
    cookieOptions(true, SESSION_MAX_AGE_MS),
  );

  response.cookie(
    CSRF_COOKIE,
    csrfToken,
    cookieOptions(false, SESSION_MAX_AGE_MS),
  );

  return csrfToken;
}

export function clearAuthCookies(response: Response): void {
  response.clearCookie(SESSION_COOKIE, cookieOptions(true));
  response.clearCookie(CSRF_COOKIE, cookieOptions(false));
}

export function hasValidCsrfToken(
  cookieToken: string | undefined,
  headerToken: string | undefined,
): boolean {
  if (!cookieToken || !headerToken) return false;

  const cookieBuffer = Buffer.from(cookieToken, "utf8");
  const headerBuffer = Buffer.from(headerToken, "utf8");

  return cookieBuffer.length === headerBuffer.length &&
    timingSafeEqual(cookieBuffer, headerBuffer);
}