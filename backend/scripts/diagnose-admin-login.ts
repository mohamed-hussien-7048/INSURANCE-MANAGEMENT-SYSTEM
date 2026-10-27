import "dotenv/config";
import sql from "mssql";
import { databasePool } from "../src/config/database.js";
import { PasswordService } from "../src/modules/auth/services/password.service.js";

async function main(): Promise<void> {
  const email = (process.env.INITIAL_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD ?? "";

  delete process.env.INITIAL_ADMIN_EMAIL;
  delete process.env.INITIAL_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  try {
    await databasePool.connect();

    const result = await databasePool.request()
      .input("email", sql.NVarChar(254), email)
      .query(`
        SELECT TOP (1) Status, PasswordHash
        FROM dbo.Users
        WHERE NormalizedEmail = @email;
      `);

    const user = result.recordset[0];

    console.log("UserFound:", Boolean(user));

    if (user) {
      console.log("AccountActive:", user.Status === "Active");
      console.log(
        "PasswordMatches:",
        await new PasswordService().verify(password, user.PasswordHash),
      );
    }
  } finally {
    if (databasePool.connected) {
      await databasePool.close();
    }
  }
}

main().catch((error: unknown) => {
  console.error(
    "Diagnostic failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
});
