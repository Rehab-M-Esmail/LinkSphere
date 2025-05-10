const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  clientId: "social-network",
  brokers: ["kafka1:9092", "kafka2:9092"],
});

const producer = kafka.producer();

async function publishEvent(topic, event) {
  await producer.connect();
  console.log("Connected to Kafka Producer");
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(event) }],
  });
  console.log(`Event published to topic ${topic}:`, event);
  await producer.disconnect();
  console.log("Disconnected from Kafka Producer");
}

module.exports = { publishEvent };
