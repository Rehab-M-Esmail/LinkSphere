const amqp = require("amqplib");
const config = require("./config");

class RabbitMQConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
  }
  async setup(queue) {
    try {
      const amqpServer = config.rabbitMQ.url;
      this.connection = await amqp.connect(amqpServer, {
        clientProperties: { connection_name: "LinkSphere Consumer" },
      });
      this.channel = await this.connection.createChannel();
      console.log("RabbitMQ Consumer connected");

      // Ensure the queue exists
      await this.channel.assertQueue(queue, {
        durable: true,
      });

      console.log(`Waiting for messages in queue: ${queue}`);

      // Array to store messages
      const messages = [];

      // Consume messages from the queue
      this.channel.consume(
        queue,
        (message) => {
          if (message !== null) {
            const msgContent = message.content.toString();
            console.log(`Received message: ${msgContent}`);

            // Add the message to the array
            messages.push(JSON.parse(msgContent));

            // Acknowledge the message
            this.channel.ack(message);
          }
        },
        { noAck: false } // Ensure messages are acknowledged
      );
      // Wait for a short period to collect messages, then send them in the response
      setTimeout(() => {
        console.log("Sending collected messages in response:", messages);
      }, 2000);
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
