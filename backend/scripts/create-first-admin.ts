import "dotenv/config";
import { createRequire } from "node:module";
import { databasePool } from "../src/config/database.js";
import { PasswordService } from "../src/modules/auth/services/password.service.js";

const require = createRequire(import.meta.url);
const sql = require("mssql/msnodesqlv8") as typeof import("mssql");

async function main(): Promise<void> {
  const email = (process.env.INITIAL_ADMIN_EMAIL ?? "").trim();
  const displayName = (process.env.INITIAL_ADMIN_DISPLAY_NAME ?? "").trim();
  const password = process.env.INITIAL_ADMIN_PASSWORD ?? "";

  delete process.env.INITIAL_ADMIN_PASSWORD;
  delete process.env.INITIAL_ADMIN_EMAIL;
  delete process.env.INITIAL_ADMIN_DISPLAY_NAME;

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid admin email is required.");
  }

  if (!displayName || displayName.length < 2 || displayName.length > 100) {
    throw new Error("Admin display name must be 2-100 characters.");
  }

  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Password must be at least 12 characters and at most 72 UTF-8 bytes.");
  }

  const passwordHash = await new PasswordService().hash(password);
  await databasePool.connect();

  try {
    const transaction = new sql.Transaction(databasePool);

    try {
      await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

      const admins = await new sql.Request(transaction).query(`
        SELECT TOP (1) UserId
        FROM dbo.Users WITH (TABLOCKX, HOLDLOCK)
        WHERE Role = 'Admin';
      `);

      if (admins.recordset.length > 0) {
        throw new Error("An Admin already exists. No account was created.");
      }

      const normalizedEmail = email.toLowerCase();

      const duplicate = await new sql.Request(transaction)
        .input("email", sql.NVarChar(254), normalizedEmail)
        .query(`
          SELECT TOP (1) UserId
          FROM dbo.Users
          WHERE NormalizedEmail = @email;
        `);

      if (duplicate.recordset.length > 0) {
        throw new Error("This email is already registered.");
      }

      await new sql.Request(transaction)
        .input("email", sql.NVarChar(254), email)
        .input("normalizedEmail", sql.NVarChar(254), normalizedEmail)
        .input("passwordHash", sql.NVarChar(255), passwordHash)
        .input("displayName", sql.NVarChar(100), displayName)
        .query(`
          INSERT INTO dbo.Users
            (Email, NormalizedEmail, PasswordHash, DisplayName, Role, Status)
          VALUES
            (@email, @normalizedEmail, @passwordHash, @displayName, 'Admin', 'Active');
        `);

      await transaction.commit();
      console.log("Initial Admin account created successfully.");
    } catch (error) {
      try {
        await transaction.rollback();
      } catch {
        // The transaction may already have ended.
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
    "Admin setup failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
});
