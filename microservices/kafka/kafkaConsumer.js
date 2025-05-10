const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "social-network-consumer",
  brokers: ["kafka1:9092", "kafka2:9092"],
});

async function createConsumer(topic, groupId, callback) {
  const consumer = kafka.consumer({ groupId });

  await consumer.connect();
  console.log(`Connected to Kafka Consumer with group ID: ${groupId}`);
  await consumer.subscribe({ topic });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      await callback(event);
    },
  });
}

module.exports = { createConsumer };
