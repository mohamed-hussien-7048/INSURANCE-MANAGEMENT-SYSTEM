import "dotenv/config";
import { connectDatabase, databasePool } from "../src/config/database.js";

async function main(): Promise<void> {
  try {
    await connectDatabase();

    const columns = await databasePool.request().query(`
      SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName,
             DATA_TYPE AS dataType,
             CHARACTER_MAXIMUM_LENGTH AS maxLength,
             IS_NULLABLE AS isNullable,
             COLUMN_DEFAULT AS columnDefault
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'dbo'
        AND TABLE_NAME IN ('Users', 'AuthSessions')
      ORDER BY TABLE_NAME, ORDINAL_POSITION;
    `);

    const constraints = await databasePool.request().query(`
      SELECT t.name AS tableName, c.name AS constraintName,
             c.type_desc AS constraintType
      FROM sys.objects c
      INNER JOIN sys.tables t ON c.parent_object_id = t.object_id
      WHERE t.schema_id = SCHEMA_ID('dbo')
        AND t.name IN ('Users', 'AuthSessions')
        AND c.type IN ('PK', 'UQ', 'F', 'C', 'D')
      ORDER BY t.name, c.type_desc, c.name;
    `);

    const indexes = await databasePool.request().query(`
      SELECT t.name AS tableName, i.name AS indexName,
             i.is_unique AS isUnique,
             i.is_primary_key AS isPrimaryKey
      FROM sys.indexes i
      INNER JOIN sys.tables t ON i.object_id = t.object_id
      WHERE t.schema_id = SCHEMA_ID('dbo')
        AND t.name IN ('Users', 'AuthSessions')
        AND i.name IS NOT NULL
      ORDER BY t.name, i.name;
    `);

    console.log(JSON.stringify({
      columns: columns.recordset,
      constraints: constraints.recordset,
      indexes: indexes.recordset,
    }, null, 2));
  } finally {
    if (databasePool.connected) await databasePool.close();
  }
}

void main().catch((error: unknown) => {
  console.error("Schema inspection failed:", error);
  process.exitCode = 1;
});
