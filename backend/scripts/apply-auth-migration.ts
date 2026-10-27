import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { databasePool } from "../src/config/database.js";

const require = createRequire(import.meta.url);
const sql = require("mssql/msnodesqlv8") as typeof import("mssql");

async function main(): Promise<void> {
  let transaction: InstanceType<typeof sql.Transaction> | undefined;

  try {
    await databasePool.connect();

    const inspection = await databasePool.request().query(`
      SELECT
        DB_NAME() AS databaseName,
        OBJECT_ID(N'dbo.Customers', N'U') AS customersTableId,
        OBJECT_ID(N'dbo.Users', N'U') AS usersTableId,
        OBJECT_ID(N'dbo.AuthSessions', N'U') AS authSessionsTableId;

      SELECT COUNT_BIG(*) AS customerCount
      FROM dbo.Customers;
    `);

    const info = inspection.recordsets[0][0];
    const beforeCount = String(inspection.recordsets[1][0].customerCount);

    if (info.databaseName !== "InsuranceManagement") {
      throw new Error("Unexpected database. Migration cancelled.");
    }

    if (info.customersTableId === null) {
      throw new Error("Customers table not found. Migration cancelled.");
    }

    if (
      info.usersTableId !== null ||
      info.authSessionsTableId !== null
    ) {
      throw new Error(
        "At least one auth table already exists. Manual review required.",
      );
    }

    console.log("Target database:", info.databaseName);
    console.log("Customer count before migration:", beforeCount);

    const migrationPath = resolve(
      process.cwd(),
      "../database/migrations/002_create_auth_tables.sql",
    );

    const migration = (await readFile(migrationPath, "utf8"))
      .replace(/^\uFEFF/, "")
      .replace(/^\s*GO\s*;?\s*$/gim, "");

    if (!migration.trim()) {
      throw new Error("Migration file is empty. Nothing executed.");
    }

    transaction = new sql.Transaction(databasePool);
    await transaction.begin();

    await new sql.Request(transaction).batch(migration);

    const verification = await new sql.Request(transaction).query(`
      SELECT
        OBJECT_ID(N'dbo.Users', N'U') AS usersTableId,
        OBJECT_ID(N'dbo.AuthSessions', N'U') AS authSessionsTableId;

      SELECT COUNT_BIG(*) AS customerCount
      FROM dbo.Customers;
    `);

    const tables = verification.recordsets[0][0];
    const afterCount = String(
      verification.recordsets[1][0].customerCount,
    );

    if (
      tables.usersTableId === null ||
      tables.authSessionsTableId === null
    ) {
      throw new Error("Post-migration verification failed.");
    }

    if (beforeCount !== afterCount) {
      throw new Error(
        "Customer count changed. Transaction will be rolled back.",
      );
    }

    await transaction.commit();
    transaction = undefined;

    console.log("Migration committed successfully.");
    console.log("Users table: verified");
    console.log("AuthSessions table: verified");
    console.log("Customer count after migration:", afterCount);
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
        console.log("Transaction rolled back.");
      } catch {
        console.error("Rollback failed; inspect the database immediately.");
      }
    }

    throw error;
  } finally {
    if (databasePool.connected) {
      await databasePool.close();
    }
  }
}

main().catch((error: unknown) => {
  console.error(
    "Migration failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
});
