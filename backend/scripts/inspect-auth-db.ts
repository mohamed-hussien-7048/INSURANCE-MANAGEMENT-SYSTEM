import "dotenv/config";
import { databasePool } from "../src/config/database.js";

async function main(): Promise<void> {
  try {
    await databasePool.connect();

    const result = await databasePool.request().query(`
      SELECT
        DB_NAME() AS databaseName,
        CAST(SERVERPROPERTY('ServerName') AS NVARCHAR(128)) AS serverName,
        OBJECT_ID(N'dbo.Customers', N'U') AS customersTableId,
        OBJECT_ID(N'dbo.Users', N'U') AS usersTableId,
        OBJECT_ID(N'dbo.AuthSessions', N'U') AS authSessionsTableId;

      SELECT COUNT_BIG(*) AS customerCount
      FROM dbo.Customers;
    `);

    const databaseInfo = result.recordsets[0][0];
    console.log("Database inspection:");
    console.log(JSON.stringify(databaseInfo, null, 2));

    if (result.recordsets[1]) {
      console.log("Customer row count:");
      console.log(JSON.stringify(result.recordsets[1][0], null, 2));
    }
  } finally {
    if (databasePool.connected) {
      await databasePool.close();
    }
  }
}

main().catch((error: unknown) => {
  console.error(
    "Database inspection failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
});
