const express = require('express');
const postRoute = require('./routes/postRoute');
const dotenv = require('dotenv');
const connectToDatabase = require('./config/db');
const prometheus = require('prom-client');
//There's an error in the path, it's not working with the relative path so balysha be el absolute path. This should be changed with your path
dotenv.config({path: '/Users/rehabmahmoud/UNI/Year 3/GO/LinkSphere/microservices/postService/.env'});
console.log(`Mongo URI from feed service ${process.env.MONGO_URI}`);
connectToDatabase();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/post', postRoute);
//Middleware will be added here

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

const PORT = process.env.POST_SERVICE_PORT || 3000;
app.listen(PORT, () => console.log(`Running on port http://localhost:${PORT}`));

// Add the metrics endpoint before starting the server
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});