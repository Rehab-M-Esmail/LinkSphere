const Redis = require('ioredis');
// Create a Redis client instance
const redis = new Redis({
  host: 'localhost',  
  port: 6379,         
});

module.exports = redis;
