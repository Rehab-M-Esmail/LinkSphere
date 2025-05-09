const express = require('express');
const feedRoute = require('./routes/feedRoute');
// Database connection
const dotenv = require('dotenv');
const connectToDatabase = require('./config/db');
// Add prometheus for metrics
const prometheus = require('prom-client');

//There's an error in the path, it's not working with the relative path so balysha be el absolute path. This should be changed with your path
dotenv.config();
console.log(`Configured PORT in the Feed service: ${process.env.FEED_SERVICE_PORT}`);
// console.log(`Mongo URI ${process.env.MONGO_URI_Feed}`);
// console.log(`Post Service URL: ${process.env.postServiceUrl}`);
connectToDatabase();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create a Registry to register the metrics
const register = new prometheus.Registry();
prometheus.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 500]
});

// Register the metrics
register.registerMetric(httpRequestDurationMicroseconds);

// Add the metrics endpoint before any other routes
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/feed', feedRoute);

const PORT = process.env.FEED_SERVICE_PORT || 3001;
app.listen(PORT, () => console.log(`Running on port http://localhost:${PORT}`));