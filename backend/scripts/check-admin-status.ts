import { databasePool } from "../src/config/database.js";

async function main(): Promise<void> {
  try {
    await databasePool.connect();

    const result = await databasePool.request().query(`
      SELECT Status, FailedLoginAttempts, LockedUntil, LastLoginAt
      FROM dbo.Users
      WHERE Role = 'Admin';
    `);

    console.table(result.recordset);
  } finally {
    if (databasePool.connected) {
      await databasePool.close();
    }
  }
}

main().catch((error: unknown) => {
  console.error("Admin status check failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
