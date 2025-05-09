require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const notificationRoutes = require('./routes/notificationRoute');
const kafkaConsumer = require('./config/kafkaConsumer');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(bodyParser.json());
app.use('/api/notifications', notificationRoutes);
require('./config/db')();
require('./config/cache')();
kafkaConsumer();

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});
