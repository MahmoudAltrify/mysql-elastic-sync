require("dotenv").config();
const mysql = require("mysql2/promise");
console.log(process.env.MYSQL_HOST);
(async () => {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const rows = [
    ["Test 1", "Example row 1"],
    ["Test 2", "Example row 2"],
    ["Test 3", "Example row 3"],
  ];

  await connection.query("INSERT INTO table_x (name, description) VALUES ?", [
    rows,
  ]);
  console.log("✅ Seeded table_x successfully");
  await connection.end();
})();
