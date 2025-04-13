const express = require('express');
const app = express();

//Middleware will be added here
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));