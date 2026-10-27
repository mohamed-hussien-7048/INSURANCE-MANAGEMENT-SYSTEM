import "dotenv/config";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sql = require("mssql/msnodesqlv8") as typeof import("mssql");

const server = process.env.DB_SERVER;
const database = process.env.DB_NAME;

if (!server || !database) {
  throw new Error("Database environment variables are missing.");
}

const databaseConfig = {
  server,
  database,
  driver: "ODBC Driver 18 for SQL Server",
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

export const databasePool = new sql.ConnectionPool(databaseConfig);

export async function connectDatabase(): Promise<void> {
  await databasePool.connect();

  const result = await databasePool
    .request()
    .query("SELECT DB_NAME() AS databaseName, SUSER_SNAME() AS loginName");

  const connection = result.recordset[0];

  console.log(`Connected to database: ${connection.databaseName}`);
  console.log(`Authenticated as: ${connection.loginName}`);
}
