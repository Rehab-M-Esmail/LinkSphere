const amqp = require("amqplib");
const config = require("./config");

class RabbitMQConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.init();
  }
  async init() {
    const amqpServer = config.rabbitMQ.url;
    this.connection = await amqp.connect(amqpServer, {
      clientProperties: { connection_name: "LinkSphere Consumer" },
    });
    this.channel = await this.connection.createChannel();
    console.log("RabbitMQ Consumer connected");
  }
  async setup(queue) {
    try {
      // Ensure the queue exists
      await this.channel.assertQueue(queue, {
        durable: true,
      });
      console.log(`Waiting for messages in queue: ${queue}`);

      // Array to store messages
      const messages = [];
      const message = await this.channel.consume(
        queue,
        (message) => {
          if (message != null) {
            const msgContent = message.content.toString();
            messages.push({ content: JSON.parse(msgContent) });
          }
        },
        { noAck: false }
      );

      console.log(`Retrieved ${messages.length} messages from queue: ${queue}`);
      return messages;
    } catch (error) {
      console.error("Error setting up RabbitMQ Consumer:", error);
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log("RabbitMQ Consumer connection closed");
    } catch (error) {
      console.error("Error closing RabbitMQ Consumer connection:", error);
    }
  }
}

// Create and start the consumer
// const consumer = new RabbitMQConsumer();
// consumer.setup("test_queue");

module.exports = RabbitMQConsumer;
