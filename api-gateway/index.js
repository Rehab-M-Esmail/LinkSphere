const express = require('express');
const proxy = require('express-http-proxy');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// Logging middleware
app.use(morgan('dev'));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// JWT Verification Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

// Proxy Routes
app.use('/api/auth', proxy(process.env.AUTH_SERVICE_URL));
app.use('/api/users', verifyToken, proxy(process.env.USER_SERVICE_URL));
app.use('/api/posts', verifyToken, proxy(process.env.POST_SERVICE_URL));
app.use('/api/events', verifyToken, proxy(process.env.EVENT_SERVICE_URL));
app.use('/api/notifications', verifyToken, proxy(process.env.NOTIFICATION_SERVICE_URL));

app.get('/', (req, res) => {
  res.send('Welcome to LinkSphere API Gateway!');
});

app.listen(PORT, () => {
  console.log(`API Gateway running at http://localhost:${PORT}`);
});
