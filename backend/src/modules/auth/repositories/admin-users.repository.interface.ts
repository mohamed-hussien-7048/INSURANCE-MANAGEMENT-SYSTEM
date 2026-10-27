import type {
  UserRole,
  UserStatus,
} from "../domain/auth.types.js";

export interface AdminUser {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface UpdateAdminUserInput {
  userId: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface AdminUsersRepository {
  listUsers(): Promise<AdminUser[]>;
  updateUser(input: UpdateAdminUserInput): Promise<AdminUser | null>;
}
