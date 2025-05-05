require('dotenv').config();
const express = require('express');
const app = express();
const connectToDatabase = require('./config/neo4j');
const profileRoutes = require('./routes/profileRoutes');

app.use(express.json());
app.use('/profile', profileRoutes);

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => {
    console.log(`Profile Service running on port ${PORT}`);
    connectToDatabase();
});
