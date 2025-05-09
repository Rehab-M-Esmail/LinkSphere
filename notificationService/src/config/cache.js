const { createClient } = require('redis');
const client = createClient({ url: process.env.REDIS_URL });
client.connect()
  .then(() => console.log('Redis connected - NotificationService'))
  .catch(err => console.error('Redis error:', err));
module.exports = client;
