import "dotenv/config";
import { connectDatabase, databasePool } from "../src/config/database.js";

async function main(): Promise<void> {
  try {
    await connectDatabase();

    const result = await databasePool.request().query(`
      SELECT
        DB_NAME() AS databaseName,
        SUSER_SNAME() AS loginName,
        @@SERVERNAME AS serverName
    `);

    console.log("Connection test passed:");
    console.log(JSON.stringify(result.recordset, null, 2));
  } finally {
    if (databasePool.connected) {
      await databasePool.close();
    }
  }
}

void main().catch((error: unknown) => {
  console.error(
    "Connection test failed:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
