const express = require("express");
const imageRoute = require("./routes/imageRoute");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const prometheus = require('prom-client');
dotenv.config();
const connectToDatabase = require("./config/db");
connectToDatabase();
const app = express();

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

//app.use(bodyParser.json());
app.use("/", imageRoute);
//app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.IMAGE_SERVCE_PORT || 6000;

app.listen(PORT, () => console.log(`Running on port http://localhost:${PORT}`));
