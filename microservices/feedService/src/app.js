const express = require('express');
const app = express();

//Middleware will be added here
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));