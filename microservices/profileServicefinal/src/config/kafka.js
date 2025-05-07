const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'profile-service',
  brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();

const initProducer = async () => {
  await producer.connect();
  console.log('Kafka producer connected');
};

module.exports = { producer, initProducer };
