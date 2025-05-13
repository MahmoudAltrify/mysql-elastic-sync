const { Kafka } = require("kafkajs");
const { Client } = require("@elastic/elasticsearch");
require("dotenv").config();

const kafka = new Kafka({
  clientId: "mysql-sync-consumer",
  brokers: ["kafka:29092"],
});

const consumer = kafka.consumer({ groupId: "mysql-sync-group" });

const es = new Client({ node: process.env.ELASTICSEARCH_NODE });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "mysql-elastic.mysql-elastic-sync.table_x",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = JSON.parse(message.value.toString());
      const payload = value?.payload;

      if (!payload) return;

      const after = payload.after;
      const op = payload.op;

      if (op === "c" || op === "u") {
        await es.index({
          index: "table_x",
          id: after.id,
          document: after,
        });
        console.log(`Indexed document id=${after.id}`);
      } else if (op === "d") {
        await es.delete({
          index: "table_x",
          id: payload.before?.id,
        });
        console.log(`Deleted document id=${payload.before?.id}`);
      }
    },
  });
};

run().catch(console.error);
