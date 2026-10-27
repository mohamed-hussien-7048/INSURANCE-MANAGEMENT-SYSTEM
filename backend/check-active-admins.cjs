const sql = require("mssql");

async function main() {
  const config = {
    server: process.env.DB_SERVER || "KAISER",
    database: "InsuranceManagement",
    options: {
      trustedConnection: true,
      trustServerCertificate: true,
      encrypt: false
    }
  };

  let pool;

  try {
    pool = await sql.connect(config);

    const result = await pool.request().query(
      "SELECT COUNT_BIG(*) AS ActiveAdminCount " +
      "FROM dbo.Users " +
      "WHERE Role = 'Admin' AND Status = 'Active';"
    );

    console.log("Active Admin Count:", result.recordset[0].ActiveAdminCount);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

main().catch((error) => {
  console.error("Query failed:", error.message);
  process.exitCode = 1;
});
