
import { AppError } from "../../../shared/errors/app-error.js";
import type {
  AuthUser,
  LoginInput,
  LoginResult,
  PublicSession,
  RegisterUserInput,
} from "../domain/auth.types.js";
import type {
  AuthRepository,
} from "../repositories/auth.repository.interface.js";
import {
  PasswordService,
} from "../services/password.service.js";
import {
  SessionTokenService,
} from "../services/session-token.service.js";

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export class AuthUseCases {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordService: PasswordService,
    private readonly sessionTokenService: SessionTokenService,
  ) {}

  async register(input: RegisterUserInput): Promise<AuthUser> {
    const email = input.email.trim();
    const normalizedEmail = email.toLowerCase();
    const displayName = input.displayName.trim();

    if (!displayName || !email || !input.password) {
      throw new AppError("Invalid registration details.", 400);
    }

    const existingUser =
      await this.authRepository.findUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new AppError("Unable to register with these details.", 409);
    }

    const passwordHash =
      await this.passwordService.hash(input.password);

    try {
      return await this.authRepository.createPendingUser({
        email,
        normalizedEmail,
        passwordHash,
        displayName,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new AppError(
          "Unable to register with these details.",
          409,
        );
      }

      throw error;
    }
  }

  async login(input: LoginInput): Promise<LoginResult> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user =
      await this.authRepository.findUserByEmail(normalizedEmail);

    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    if (user.status !== "Active") {
      throw new AppError("Account is not available for login.", 403);
    }

    const now = Date.now();

    if (user.lockedUntil && user.lockedUntil.getTime() > now) {
      throw new AppError("Too many failed attempts. Try again later.", 429);
    }

    const passwordIsValid = await this.passwordService.verify(
      input.password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      const failedAttempts =
        user.lockedUntil && user.lockedUntil.getTime() <= now
          ? 1
          : user.failedLoginAttempts + 1;

      const lockedUntil =
        failedAttempts >= MAX_FAILED_ATTEMPTS
          ? new Date(now + LOCK_DURATION_MS)
          : null;

      await this.authRepository.recordFailedLogin(
        user.userId,
        failedAttempts,
        lockedUntil,
      );

      throw new AppError(
        failedAttempts >= MAX_FAILED_ATTEMPTS
          ? "Too many failed attempts. Try again later."
          : "Invalid email or password.",
        failedAttempts >= MAX_FAILED_ATTEMPTS ? 429 : 401,
      );
    }

    const generatedToken = this.sessionTokenService.generate();
    const expiresAt = new Date(now + SESSION_DURATION_MS);

    await this.authRepository.createSession(
      user.userId,
      generatedToken.tokenHash,
      expiresAt,
    );

    await this.authRepository.recordSuccessfulLogin(user.userId);

    return {
      sessionToken: generatedToken.token,
      user: {
        userId: user.userId,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        status: user.status,
      },
      expiresAt,
    };
  }

  async getSession(token: string): Promise<PublicSession> {
    if (!token) {
      throw new AppError("Authentication required.", 401);
    }

    const tokenHash = this.sessionTokenService.hash(token);
    const session =
      await this.authRepository.findActiveSessionByHash(tokenHash);

    if (!session) {
      throw new AppError("Invalid or expired session.", 401);
    }

    return {
      sessionId: session.sessionId,
      user: session.user,
      expiresAt: session.expiresAt,
    };
  }

  async logout(token: string): Promise<void> {
    if (!token) {
      throw new AppError("Authentication required.", 401);
    }

    const tokenHash = this.sessionTokenService.hash(token);
    await this.authRepository.revokeSession(tokenHash);
  }

  private isUniqueConstraintError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) {
      return false;
    }

    const candidate = error as {
      number?: number;
      code?: string;
    };

    return (
      candidate.number === 2601 ||
      candidate.number === 2627 ||
      (candidate.code === "EREQUEST" &&
        (candidate.number === 2601 || candidate.number === 2627))
    );
  }
}
