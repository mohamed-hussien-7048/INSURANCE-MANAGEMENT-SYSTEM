import "dotenv/config";
import { databasePool } from "../src/config/database.js";
import sql from "mssql";

async function main(): Promise<void> {
  try {
    await databasePool.connect();

    const result = await databasePool.request().query(`
      SELECT
        COUNT_BIG(*) AS TotalAdmins,
        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS ActiveAdmins,
        SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) AS PendingAdmins,
        SUM(CASE WHEN Status = 'Disabled' THEN 1 ELSE 0 END) AS DisabledAdmins
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
  console.error("Admin account check failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});

