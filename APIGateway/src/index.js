require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

require('./routes/userRoutes')(app);
require('./routes/postRoutes')(app);
require('./routes/commentRoutes')(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
