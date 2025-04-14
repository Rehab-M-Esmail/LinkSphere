const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  app.use('/api/comments', createProxyMiddleware({
    target: process.env.COMMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/comments': '' }
  }));
};
