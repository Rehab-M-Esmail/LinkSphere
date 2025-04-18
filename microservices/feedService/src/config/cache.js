/* const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.on('connect', () => console.log('Redis connected'));

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient; */
const redis = require("redis");
const redisClient = redis.createClient({url: process.env.REDIS_URL || "redis://localhost:6379"});
redisClient.on("error", (err) => {
    console.log("Redis Client Error", err);
});
redisClient.on("connect", () => {
    console.log("Redis Client Connected");
});
module.exports = redisClient;
(async () => {
    await redisClient.connect();
})();
