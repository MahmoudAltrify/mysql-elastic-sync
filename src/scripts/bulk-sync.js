require("dotenv").config();
const mysql = require("mysql2/promise");
const { Client } = require("@elastic/elasticsearch");

(async () => {
  const INDEX_NAME = "table_x";
  const shouldReset = process.argv.includes("--reset");

  // Connect to MySQL
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  // Connect to Elasticsearch
  const es = new Client({ node: process.env.ELASTICSEARCH_NODE });

  // Reset index if and only if (--reset) flag is passed
  if (shouldReset) {
    try {
      await es.indices.delete({ index: INDEX_NAME });
      console.log(`Deleted existing index '${INDEX_NAME}'`);
    } catch (err) {
      if (err.meta?.statusCode === 404) {
        console.log(`Index '${INDEX_NAME}' not found (nothing to delete)`);
      } else {
        throw err;
      }
    }
  }

  // Ensure index exists with proper mapping
  const { statusCode: existsStatus } = await es.indices.exists({
    index: INDEX_NAME,
  });
  if (existsStatus === 404) {
    await es.indices.create({
      index: INDEX_NAME,
      body: {
        mappings: {
          properties: {
            id: { type: "integer" },
            name: { type: "text" },
            description: { type: "text" },
            updated_at: { type: "date" },
          },
        },
      },
    });
    console.log(`Index '${INDEX_NAME}' created with custom mappings`);
  } else {
    console.log(`Index '${INDEX_NAME}' already exists`);
  }

  // Get all rows
  const [rows] = await db.execute("SELECT * FROM table_x");
  console.log(`Found ${rows.length} rows to sync...`);

  if (rows.length === 0) {
    console.log("Nothing to sync.");
    await db.end();
    return;
  }

  // Prepare bulk payload
  const body = rows.flatMap((row) => [
    { index: { _index: INDEX_NAME, _id: row.id } },
    row,
  ]);

  // Send to Elasticsearch
  const bulkResponse = await es.bulk({ refresh: true, body });

  if (bulkResponse.errors) {
    console.error("Errors during bulk insert:", bulkResponse);
  } else {
    console.log(`Synced ${rows.length} records to Elasticsearch.`);
  }

  await db.end();
})();
