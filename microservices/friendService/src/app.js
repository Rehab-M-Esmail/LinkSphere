const express = require('express');
const axios = require('axios');
const friendRoute = require('./routes/friendRoute');
const dotenv = require('dotenv');
const friend = require('./models/friend');
const prometheus = require('prom-client');
dotenv.config();
const connectToDatabase = require('./config/db');
connectToDatabase();
const buildGraphNodes = async()=> {
    try {
        //const response = await axios.get(`${process.env.USER_SERVICE_URI}/users/ids`);
        const response = await axios.get(`${process.env.USER_SERVICE_URI || 'http://userservice:3002'}/users/ids`);
        const users = Array.isArray(response.data) ? response.data : response.data.ids || [];
        
        //console.log(users);
        if(!users || users.length === 0) {
            console.log('No users found');
            return;
        }
        //console.log(typeof users);
        // Create nodes for each user
        users.forEach((userId) => {
                    friend.createUserNode(userId);
                }
        );
        console.log('Nodes created successfully');
        //res.status(201).json({ message: 'Nodes created successfully' });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}
friend.createUserNode(12);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("Graph nodes creation started");
buildGraphNodes();
app.use('/friend',friendRoute );

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

const PORT = process.env.P0RT_FRIEND_SERVICE|| 7474;
app.listen(PORT, () => console.log(`Running on port http://localhost:${PORT}`));