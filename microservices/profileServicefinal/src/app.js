require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const redisClient = require('./config/redis');
const { initProducer } = require('./config/kafka');
const profileRoutes = require('./routes/profileRoute');

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());
app.use('/api/profiles', profileRoutes);

(async () => {
  try {
    await connectDB();
    await redisClient.connect();
    await initProducer();
    app.listen(port, () => console.log(`Profile service running on port ${port}`));
  } catch (err) {
    console.error('Failed to start server:', err);
  }
})();
