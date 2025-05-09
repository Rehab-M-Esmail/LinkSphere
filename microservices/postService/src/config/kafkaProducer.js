// Simple mock of Kafka producer
const publishEvent = () => {
  return {
    publishEvent: (topic, event) => {
      console.log(`Event published to ${topic}:`, event);
      // In a real implementation, we would actually send to Kafka
      return Promise.resolve();
    }
  };
};

module.exports = { publishEvent }; 