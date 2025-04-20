const express = require('express');
const feedRoute = require('./routes/feedRoute');
// Database connection
const dotenv = require('dotenv');
const connectToDatabase = require('./config/db');
//There's an error in the path, it's not working with the relative path so balysha be el absolute path. This should be changed with your path
dotenv.config();
console.log(`Configured PORT in the Feed service: ${process.env.FEED_SERVICE_PORT}`);
// console.log(`Mongo URI ${process.env.MONGO_URI_Feed}`);
// console.log(`Post Service URL: ${process.env.postServiceUrl}`);
connectToDatabase();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/feed', feedRoute);

const PORT = process.env.FEED_SERVICE_PORT || 3001;
app.listen(PORT, () => console.log(`Running on port http://localhost:${PORT}`));