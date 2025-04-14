const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  app.use('/api/posts', createProxyMiddleware({
    target: process.env.POST_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/posts': '' }
  }));
};
