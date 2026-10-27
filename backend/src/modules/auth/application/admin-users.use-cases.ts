import { AppError } from "../../../shared/errors/app-error.js";
import type {
  UserRole,
  UserStatus,
} from "../domain/auth.types.js";
import type {
  AdminUsersRepository,
} from "../repositories/admin-users.repository.interface.js";

const USER_ROLES: readonly UserRole[] = [
  "Admin",
  "Employee",
  "ReadOnly",
];

const USER_STATUSES: readonly UserStatus[] = [
  "Pending",
  "Active",
  "Disabled",
];

export class AdminUsersUseCases {
  constructor(
    private readonly repository: AdminUsersRepository,
  ) {}

  async listUsers() {
    return this.repository.listUsers();
  }

  async updateUser(
    actorId: string,
    targetId: string,
    changes: {
      role?: UserRole;
      status?: UserStatus;
    },
  ) {
    if (!/^[1-9]\d{0,18}$/.test(targetId)) {
      throw new AppError("Invalid user ID.", 400);
    }

    if (actorId === targetId) {
      throw new AppError(
        "You cannot change your own role or account status.",
        403,
      );
    }

    if (
      changes.role === undefined &&
      changes.status === undefined
    ) {
      throw new AppError("At least one change is required.", 400);
    }

    if (
      changes.role !== undefined &&
      !USER_ROLES.includes(changes.role)
    ) {
      throw new AppError("Invalid role.", 400);
    }

    if (
      changes.status !== undefined &&
      !USER_STATUSES.includes(changes.status)
    ) {
      throw new AppError("Invalid status.", 400);
    }

    const user = await this.repository.updateUser({
      userId: targetId,
      ...changes,
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    return user;
  }
}
