const axios = require("axios");

const CONNECTOR_CONFIG = {
  name: "mysql-elastic-connector",
  config: {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "root",
    "database.password": "secret",
    "database.server.id": "184054",
    "topic.prefix": "mysql-elastic",
    "database.include.list": "mysql-elastic-sync",
    "table.include.list": "mysql-elastic-sync.table_x",

    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
    "schema.history.internal.kafka.topic": "schema-changes.mysql",

    // Optional tuning
    "include.schema.changes": "false",
    "database.allowPublicKeyRetrieval": "true",
  },
};

(async () => {
  try {
    const response = await axios.post(
      "http://localhost:8083/connectors",
      CONNECTOR_CONFIG,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Connector registered:", response.data.name);
  } catch (err) {
    if (err.response) {
      console.error("Failed:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
})();
