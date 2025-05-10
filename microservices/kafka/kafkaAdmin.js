const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "kafka-admin",
  brokers: "kafka:9092",
});

async function createTopics() {
  const admin = kafka.admin();

  try {
    await admin.connect();
    console.log("Admin connected successfully");

    await admin.createTopics({
      topics: [
        {
          topic: "post_events",
          numPartitions: 3,
          replicationFactor: 1,
        },
        {
          topic: "user_events",
          numPartitions: 3,
          replicationFactor: 1,
        },
      ],
      waitForLeaders: true,
    });

    console.log("Topics created successfully");
  } catch (err) {
    console.error("Admin error:", err);
    process.exit(1);
  } finally {
    await admin.disconnect();
  }
}
createTopics();
module.exports = createTopics;
