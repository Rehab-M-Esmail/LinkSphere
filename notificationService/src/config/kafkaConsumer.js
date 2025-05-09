const { Kafka } = require('kafkajs');
const Notification = require('../models/notificationModel');
const kafka = new Kafka({ clientId: 'notification-service', brokers: [process.env.KAFKA_BROKER] });
const consumer = kafka.consumer({ groupId: 'notification-group' });

module.exports = async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'notifications', fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      await Notification.create(payload);
      console.log('Notification received from Kafka:', payload);
    },
  });
};
