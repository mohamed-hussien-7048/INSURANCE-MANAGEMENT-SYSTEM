
export const USER_ROLES = [
  "Admin",
  "Employee",
  "ReadOnly",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = [
  "Pending",
  "Active",
  "Disabled",
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
}

export interface RegisterUserInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthenticatedSession {
  sessionId: string;
  user: AuthUser;
  expiresAt: Date;
}

export interface LoginResult {
  sessionToken: string;
  user: AuthUser;
  expiresAt: Date;
}

export interface PublicSession {
  sessionId: string;
  user: AuthUser;
  expiresAt: Date;
}
