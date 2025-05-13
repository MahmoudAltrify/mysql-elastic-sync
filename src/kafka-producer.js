const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "mysql-sync",
  brokers: ["kafka:9092"], // TODO: double check this
});

const producer = kafka.producer();

async function sendToKafka(topic, message) {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
  await producer.disconnect();
}

module.exports = { sendToKafka };
