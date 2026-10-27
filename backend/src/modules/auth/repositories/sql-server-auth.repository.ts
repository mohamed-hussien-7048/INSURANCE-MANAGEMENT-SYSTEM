import type {
  AdminUser,
  AdminUsersRepository,
  UpdateAdminUserInput,
} from "./admin-users.repository.interface.js";
import { createRequire } from "node:module";
import { databasePool } from "../../../config/database.js";
import type {
  AuthUser,
  UserRole,
  UserStatus,
} from "../domain/auth.types.js";
import type {
  AuthRepository,
  CreatePendingUserInput,
  StoredAuthSession,
  StoredAuthUser,
} from "./auth.repository.interface.js";

const require = createRequire(import.meta.url);
const sql = require("mssql/msnodesqlv8") as typeof import("mssql");

const USER_COLUMNS = `
  CAST(UserId AS varchar(20)) AS userId,
  Email AS email,
  NormalizedEmail AS normalizedEmail,
  PasswordHash AS passwordHash,
  DisplayName AS displayName,
  Role AS role,
  Status AS status,
  FailedLoginAttempts AS failedLoginAttempts,
  LockedUntil AS lockedUntil
`;

const SESSION_COLUMNS = `
  CAST(s.SessionId AS varchar(20)) AS sessionId,
  CAST(u.UserId AS varchar(20)) AS userId,
  u.Email AS email,
  u.DisplayName AS displayName,
  u.Role AS role,
  u.Status AS status,
  s.ExpiresAt AS expiresAt
`;

interface UserRow {
  userId: string;
  email: string;
  normalizedEmail: string;
  passwordHash: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

interface SessionRow {
  sessionId: string;
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  expiresAt: Date;
}

function toAuthUser(row: {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
}): AuthUser {
  return {
    userId: row.userId,
    email: row.email,
    displayName: row.displayName,
    role: row.role,
    status: row.status,
  };
}

export class SqlServerAuthRepository implements AuthRepository, AdminUsersRepository {
  async findUserByEmail(
    normalizedEmail: string,
  ): Promise<StoredAuthUser | null> {
    const result = await databasePool
      .request()
      .input("normalizedEmail", sql.NVarChar(254), normalizedEmail)
      .query<UserRow>(
        `SELECT ${USER_COLUMNS}
         FROM dbo.Users
         WHERE NormalizedEmail = @normalizedEmail;`,
      );

    const row = result.recordset[0];

    if (!row) {
      return null;
    }

    return {
      ...toAuthUser(row),
      normalizedEmail: row.normalizedEmail,
      passwordHash: row.passwordHash,
      failedLoginAttempts: row.failedLoginAttempts,
      lockedUntil: row.lockedUntil,
    };
  }

  async createPendingUser(
    input: CreatePendingUserInput,
  ): Promise<AuthUser> {
    const result = await databasePool
      .request()
      .input("email", sql.NVarChar(254), input.email)
      .input("normalizedEmail", sql.NVarChar(254), input.normalizedEmail)
      .input("passwordHash", sql.NVarChar(255), input.passwordHash)
      .input("displayName", sql.NVarChar(100), input.displayName)
      .query<UserRow>(`
        INSERT INTO dbo.Users (
          Email,
          NormalizedEmail,
          PasswordHash,
          DisplayName,
          Role,
          Status
        )
        OUTPUT
          CAST(inserted.UserId AS varchar(20)) AS userId,
          inserted.Email AS email,
          inserted.NormalizedEmail AS normalizedEmail,
          inserted.PasswordHash AS passwordHash,
          inserted.DisplayName AS displayName,
          inserted.Role AS role,
          inserted.Status AS status,
          inserted.FailedLoginAttempts AS failedLoginAttempts,
          inserted.LockedUntil AS lockedUntil
        VALUES (
          @email,
          @normalizedEmail,
          @passwordHash,
          @displayName,
          'Employee',
          'Pending'
        );
      `);

    const row = result.recordset[0];

    if (!row) {
      throw new Error("The pending user could not be created.");
    }

    return toAuthUser(row);
  }

  async recordSuccessfulLogin(userId: string): Promise<void> {
    await databasePool
      .request()
      .input("userId", sql.BigInt, userId)
      .query(`
        UPDATE dbo.Users
        SET FailedLoginAttempts = 0,
            LockedUntil = NULL,
            LastLoginAt = SYSUTCDATETIME(),
            UpdatedAt = SYSUTCDATETIME()
        WHERE UserId = @userId
          AND Status = 'Active';
      `);
  }

  async recordFailedLogin(
    userId: string,
    failedAttempts: number,
    lockedUntil: Date | null,
  ): Promise<void> {
    await databasePool
      .request()
      .input("userId", sql.BigInt, userId)
      .input("failedAttempts", sql.Int, failedAttempts)
      .input("lockedUntil", sql.DateTime2, lockedUntil)
      .query(`
        UPDATE dbo.Users
        SET FailedLoginAttempts = @failedAttempts,
            LockedUntil = @lockedUntil,
            UpdatedAt = SYSUTCDATETIME()
        WHERE UserId = @userId;
      `);
  }

  async createSession(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await databasePool
      .request()
      .input("userId", sql.BigInt, userId)
      .input("tokenHash", sql.Char(64), tokenHash)
      .input("expiresAt", sql.DateTime2, expiresAt)
      .query(`
        INSERT INTO dbo.AuthSessions (UserId, TokenHash, ExpiresAt)
        SELECT u.UserId, @tokenHash, @expiresAt
        FROM dbo.Users AS u
        WHERE u.UserId = @userId
          AND u.Status = 'Active';

        IF @@ROWCOUNT = 0
          THROW 50001, 'Active user required.', 1;
      `);
  }

  async findActiveSessionByHash(
    tokenHash: string,
  ): Promise<StoredAuthSession | null> {
    const result = await databasePool
      .request()
      .input("tokenHash", sql.Char(64), tokenHash)
      .query<SessionRow>(`
        SELECT ${SESSION_COLUMNS}
        FROM dbo.AuthSessions AS s
        INNER JOIN dbo.Users AS u ON u.UserId = s.UserId
        WHERE s.TokenHash = @tokenHash
          AND s.RevokedAt IS NULL
          AND s.ExpiresAt > SYSUTCDATETIME()
          AND u.Status = 'Active';
      `);

    const row = result.recordset[0];

    if (!row) {
      return null;
    }

    return {
      sessionId: row.sessionId,
      user: toAuthUser(row),
      expiresAt: row.expiresAt,
    };
  }

  async revokeSession(tokenHash: string): Promise<void> {
    await databasePool
      .request()
      .input("tokenHash", sql.Char(64), tokenHash)
      .query(`
        UPDATE dbo.AuthSessions
        SET RevokedAt = SYSUTCDATETIME()
        WHERE TokenHash = @tokenHash
          AND RevokedAt IS NULL;
      `);
  }

  async listUsers(): Promise<AdminUser[]> {
    const result = await databasePool.request().query<AdminUser>(`
      SELECT
        CAST(UserId AS varchar(20)) AS userId,
        Email AS email,
        DisplayName AS displayName,
        Role AS role,
        Status AS status,
        CreatedAt AS createdAt,
        LastLoginAt AS lastLoginAt
      FROM dbo.Users
      ORDER BY CreatedAt DESC, UserId DESC;
    `);

    return result.recordset;
  }

  async updateUser(
    input: UpdateAdminUserInput,
  ): Promise<AdminUser | null> {
    const transaction = new sql.Transaction(databasePool);

    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
      const request = transaction.request();

      request.input("userId", sql.BigInt, input.userId);
      request.input("role", sql.NVarChar(20), input.role ?? null);
      request.input("status", sql.NVarChar(20), input.status ?? null);

      const result = await request.query<AdminUser>(`
        DECLARE @CurrentRole NVARCHAR(20);
        DECLARE @CurrentStatus NVARCHAR(20);

        SELECT
          @CurrentRole = Role,
          @CurrentStatus = Status
        FROM dbo.Users WITH (UPDLOCK, HOLDLOCK)
        WHERE UserId = @userId;

        IF @CurrentRole IS NOT NULL
        BEGIN
          IF (
            @CurrentRole = 'Admin'
            AND @CurrentStatus = 'Active'
            AND (
              (@role IS NOT NULL AND @role <> 'Admin')
              OR (@status IS NOT NULL AND @status <> 'Active')
            )
          )
          BEGIN
            DECLARE @ActiveAdmins INT;

            SELECT @ActiveAdmins = COUNT(*)
            FROM dbo.Users WITH (UPDLOCK, HOLDLOCK)
            WHERE Role = 'Admin'
              AND Status = 'Active';

            IF @ActiveAdmins <= 1
              THROW 50002, 'Cannot remove the last active administrator.', 1;
          END;

          UPDATE dbo.Users
          SET
            Role = COALESCE(@role, Role),
            Status = COALESCE(@status, Status),
            UpdatedAt = SYSUTCDATETIME()
          WHERE UserId = @userId;

          SELECT
            CAST(UserId AS varchar(20)) AS userId,
            Email AS email,
            DisplayName AS displayName,
            Role AS role,
            Status AS status,
            CreatedAt AS createdAt,
            LastLoginAt AS lastLoginAt
          FROM dbo.Users
          WHERE UserId = @userId;
        END;
      `);

      await transaction.commit();
      return result.recordset[0] ?? null;
    } catch (error) {
      await transaction.rollback();

      const candidate = error as { number?: number };

      if (candidate.number === 50002) {
        throw new Error(
          "Cannot disable or demote the last active administrator.",
        );
      }

      throw error;
    }
  }}


