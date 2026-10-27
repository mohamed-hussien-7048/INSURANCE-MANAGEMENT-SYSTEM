import "dotenv/config";
import { createRequire } from "node:module";
import { databasePool } from "../src/config/database.js";
import { PasswordService } from "../src/modules/auth/services/password.service.js";

const require = createRequire(import.meta.url);
const sql = require("mssql/msnodesqlv8") as typeof import("mssql");

async function main(): Promise<void> {
  const email = (process.env.ADMIN_RESET_EMAIL ?? "").trim();
  const password = process.env.ADMIN_RESET_PASSWORD ?? "";

  delete process.env.ADMIN_RESET_EMAIL;
  delete process.env.ADMIN_RESET_PASSWORD;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid Admin email is required.");
  }

  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Password must be at least 12 characters and at most 72 UTF-8 bytes.");
  }

  const passwordHash = await new PasswordService().hash(password);
  await databasePool.connect();

  try {
    const transaction = new sql.Transaction(databasePool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
      const normalizedEmail = email.toLowerCase();

      const result = await new sql.Request(transaction)
        .input("email", sql.NVarChar(254), normalizedEmail)
        .query(`
          SELECT TOP (1) UserId, Role, Status
          FROM dbo.Users WITH (UPDLOCK, HOLDLOCK)
          WHERE NormalizedEmail = @email;
        `);

      const user = result.recordset[0];

      if (!user || user.Role !== "Admin" || user.Status !== "Active") {
        throw new Error("No active Admin account matched. No password was changed.");
      }

      await new sql.Request(transaction)
        .input("userId", sql.Int, user.UserId)
        .input("passwordHash", sql.NVarChar(255), passwordHash)
        .query(`
          UPDATE dbo.Users
          SET PasswordHash = @passwordHash,
              FailedLoginAttempts = 0,
              LockedUntil = NULL,
              UpdatedAt = SYSUTCDATETIME()
          WHERE UserId = @userId
            AND Role = 'Admin'
            AND Status = 'Active';
        `);

      await transaction.commit();
      console.log("Admin password updated successfully.");
    } catch (error) {
      try {
        await transaction.rollback();
      } catch {
        // Transaction may already have ended.
      }
      throw error;
    }
  } finally {
    if (databasePool.connected) {
      await databasePool.close();
    }
  }
}

main().catch((error: unknown) => {
  console.error(
    "Password reset failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
});

