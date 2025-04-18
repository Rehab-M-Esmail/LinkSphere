const redis = require('redis');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let redisClient = null;
let redisEnabled = false;

const initializeRedis = async () => {
  try {
    if (process.env.REDIS_ENABLED === 'false') {
      console.log('Redis is disabled in environment');
      return false;
    }

    redisClient = redis.createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      retry_strategy: function(options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          console.log('Redis connection refused, retrying...');
          return 3000;
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          console.log('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          console.log('Redis max retries reached');
          return new Error('Max retries reached');
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
      redisEnabled = false;
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis successfully');
      redisEnabled = true;
    });

    redisClient.on('ready', () => {
      console.log('Redis client is ready');
      redisEnabled = true;
    });

    redisClient.on('end', () => {
      console.log('Redis connection ended');
      redisEnabled = false;
    });

    await redisClient.connect();
    return true;
  } catch (err) {
    console.error('Failed to initialize Redis:', err);
    redisClient = null;
    redisEnabled = false;
    return false;
  }
};

module.exports = {
  redisClient,
  redisEnabled,
  initializeRedis
}; 