const config = require("./config");
const amqp = require("amqplib");
class RabbitMQProducer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.setup();
  }

  async setup() {
    try {
      const amqpServer = "amqp://localhost";
      this.connection = await amqp.connect(amqpServer, {
        clientProperties: { connection_name: "LinkSphere connection" },
      });
      this.channel = await this.connection.createChannel();
      const exchangeName = "LinkSphere";
      await this.channel.assertExchange(exchangeName, "topic");
      console.log("RabbitMQ Producer connected");
    } catch (error) {
      console.error("Error connecting to RabbitMQ:", error);
    }
  }
  async PublishMessage(req, res) {
    try {
      //const msg = req.body.message;
      if (!this.channel) {
        await this.setup();
      }
      const msg = req.body.message;
      if (!msg) {
        console.error("Message is required");
        return;
      }
      if (!req.body.queue) {
        console.error("Queue name is required");
        return;
      }
      const queueName = req.body.queue;
      // Check if the queue exists
      try {
        await this.channel.checkQueue(queueName);
        console.log(`Queue "${queueName}" already exists.`);
      } catch (error) {
        if (error.code === 404) {
          console.log(`Queue "${queueName}" does not exist. Creating it now.`);
          await this.channel.assertQueue(queueName, {
            durable: true,
          });
        } else {
          throw error; // Re-throw unexpected errors
        }
      }
      await this.channel.assertExchange("LinkSphere", "topic");
      await this.channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(msg))
      );
      console.log(` Message sent successfully to queue ${queueName}:`);
      await this.channel.close();
      res.status(200).json({ status: "Message sent successfully" });
    } catch (ex) {
      console.error(ex);
    }
  }
}
module.exports = RabbitMQProducer;
const producer = new RabbitMQProducer();
producer.PublishMessage({
  body: {
    message: { userId: 1, action: "add" },
    queue: "test_queue",
  },
});
