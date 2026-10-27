import type { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "../../../shared/errors/app-error.js";
import type { AuthUseCases } from "../application/auth.use-cases.js";
import type { AuthUser, UserRole } from "../domain/auth.types.js";
import {
  CSRF_COOKIE,
  SESSION_COOKIE,
  hasValidCsrfToken,
  readCookie,
} from "./auth.cookies.js";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function verifyOrigin(request: Request): void {
  const configuredOrigin =
    process.env.FRONTEND_URL ?? "http://localhost:5173";
  const origin = request.get("origin");

  if (origin !== configuredOrigin) {
    throw new AppError("Request origin is not allowed.", 403);
  }
}

export function createAuthenticationMiddleware(
  authUseCases: AuthUseCases,
): RequestHandler {
  return async (request, response, next): Promise<void> => {
    try {
      const token = readCookie(request, SESSION_COOKIE);

      if (!token) {
        throw new AppError("Authentication required.", 401);
      }

      const session = await authUseCases.getSession(token);
      response.locals.authUser = session.user;
      response.locals.sessionToken = token;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireRoles(...allowedRoles: UserRole[]): RequestHandler {
  return (_request, response, next): void => {
    const user = response.locals.authUser as AuthUser | undefined;

    if (!user) {
      next(new AppError("Authentication required.", 401));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(new AppError("You do not have permission.", 403));
      return;
    }

    next();
  };
}

export function createCsrfMiddleware(): RequestHandler {
  return (request, _response, next: NextFunction): void => {
    try {
      if (!MUTATING_METHODS.has(request.method)) {
        next();
        return;
      }

      verifyOrigin(request);

      const cookieToken = readCookie(request, CSRF_COOKIE);
      const headerToken = request.get("x-csrf-token");

      if (!hasValidCsrfToken(cookieToken, headerToken)) {
        throw new AppError("Invalid CSRF token.", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}