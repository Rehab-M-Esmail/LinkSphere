# System Monitoring with Grafana and Prometheus

This directory contains configurations for monitoring the LinkSphere microservices using Prometheus and Grafana.

## Components

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Node Exporter**: Host metrics collection
- **cAdvisor**: Container metrics collection

## Access URLs

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (username: admin, password: admin)
- cAdvisor: http://localhost:8082

## Setup Instructions

1. Start the monitoring stack using Docker Compose:
   ```
   docker-compose up -d
   ```

2. Access Grafana at http://localhost:3001 and log in with:
   - Username: admin
   - Password: admin

3. Prometheus datasource should be pre-configured.

4. Import dashboards by navigating to Dashboard > Import in the Grafana UI.
   
   Some recommended dashboards to import (by ID):
   - Node Exporter Full: 1860
   - Docker & System Monitoring: 893
   - Prometheus 2.0 Stats: 3662
   - Custom Microservices Dashboard: (see custom_dashboard.json)

## Adding Metrics to Services

To add Prometheus metrics to a service, you need to:

1. Add a Prometheus client library to your service
2. Expose metrics on a /metrics endpoint
3. Configure Prometheus to scrape the endpoint (already set up in prometheus.yml)

Example for Node.js services:
```javascript
const prometheus = require('prom-client');
const express = require('express');

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

// Add metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
``` 