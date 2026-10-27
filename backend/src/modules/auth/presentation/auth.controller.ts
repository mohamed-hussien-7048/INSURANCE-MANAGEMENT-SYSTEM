import type { Request, Response, NextFunction } from "express";
import type { AuthUseCases } from "../application/auth.use-cases.js";
import {
  clearAuthCookies,
  issueAuthCookies,
  readCookie,
  SESSION_COOKIE,
} from "./auth.cookies.js";

export class AuthController {
  constructor(private readonly authUseCases: AuthUseCases) {}

  register = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.authUseCases.register(request.body);

      response.status(201).json({
        success: true,
        data: user,
        message: "Registration received. Account approval is required.",
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.authUseCases.login(request.body);
      const csrfToken = issueAuthCookies(response, result.sessionToken);

      response.status(200).json({
        success: true,
        data: {
          user: result.user,
          expiresAt: result.expiresAt,
          csrfToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  me = (_request: Request, response: Response): void => {
    response.status(200).json({
      success: true,
      data: response.locals.authUser,
    });
  };

  logout = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const token = readCookie(request, SESSION_COOKIE);

      if (token) {
        await this.authUseCases.logout(token);
      }

      clearAuthCookies(response);
      response.status(200).json({
        success: true,
        message: "Logged out successfully.",
      });
    } catch (error) {
      next(error);
    }
  };
}