import type {
  AuthUser,
} from "../domain/auth.types.js";

export interface StoredAuthUser extends AuthUser {
  normalizedEmail: string;
  passwordHash: string;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

export interface StoredAuthSession {
  sessionId: string;
  user: AuthUser;
  expiresAt: Date;
}

export interface CreatePendingUserInput {
  email: string;
  normalizedEmail: string;
  passwordHash: string;
  displayName: string;
}

export interface AuthRepository {
  findUserByEmail(
    normalizedEmail: string,
  ): Promise<StoredAuthUser | null>;

  createPendingUser(
    input: CreatePendingUserInput,
  ): Promise<AuthUser>;

  recordSuccessfulLogin(userId: string): Promise<void>;

  recordFailedLogin(
    userId: string,
    failedAttempts: number,
    lockedUntil: Date | null,
  ): Promise<void>;

  createSession(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void>;

  findActiveSessionByHash(
    tokenHash: string,
  ): Promise<StoredAuthSession | null>;

  revokeSession(tokenHash: string): Promise<void>;
}
