const express = require('express');
const feedRoute = require('./routes/feedRoute');
const dotenv = require('dotenv');
const connectToDatabase = require('./config/db');
dotenv.config({path:'/Users/rehabmahmoud/UNI/Year 3/GO/LinkSphere/microservices/feedService/.env'});
console.log(`Mongo URI ${process.env.MONGO_URI}`);
connectToDatabase();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/feed', feedRoute);
//Middleware will be added here
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Running on port http://localhost:${PORT}`));