const express = require('express');
const feedRoute = require('./routes/feedRoute');
// Database connection
const dotenv = require('dotenv');
const connectToDatabase = require('./config/db');
//There's an error in the path, it's not working with the relative path so balysha be el absolute path. This should be changed with your path
dotenv.config({path:'/Users/rehabmahmoud/UNI/Year 3/GO/LinkSphere/microservices/feedService/.env'});
console.log(`Configured PORT: ${process.env.PORT}`);
console.log(`Mongo URI ${process.env.MONGO_URI}`);
connectToDatabase();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//caching 
// const redis = require("redis");
// const redisClient = redis.createClient();
// redisClient.on("error", (err) => {
//     console.log("Redis Client Error", err);
// });
// redisClient.on("connect", () => {
//     console.log("Redis Client Connected");
// });
// app.use((req, res, next) => {
//     req.redisClient = redisClient;
//     next();
// });

app.use('/feed', feedRoute);


const PORT = process.env.FEED_SERVICE_PORT || 3001;
app.listen(PORT, () => console.log(`Running on port http://localhost:${PORT}`));