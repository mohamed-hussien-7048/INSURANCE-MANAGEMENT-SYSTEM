import "dotenv/config";
const { createRequire } = await import("node:module");

const require = createRequire(import.meta.url);
const sql = require("mssql/msnodesqlv8");

async function main() {
  const server = process.env.DB_SERVER || "KAISER";
  const database = process.env.DB_NAME || "InsuranceManagement";

  const pool = new sql.ConnectionPool({
    server,
    database,
    driver: "ODBC Driver 18 for SQL Server",
    options: {
      trustedConnection: true,
      trustServerCertificate: true
    },
    pool: {
      max: 1,
      min: 0
    }
  });

  try {
    await pool.connect();

    const result = await pool.request().query(`
      SELECT COUNT_BIG(*) AS ActiveAdminCount
      FROM dbo.Users
      WHERE Role = 'Admin'
        AND Status = 'Active';
    `);

    console.log(
      "Active Admin Count:",
      result.recordset[0].ActiveAdminCount
    );
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error("Query failed:", error.message);
  process.exitCode = 1;
});
