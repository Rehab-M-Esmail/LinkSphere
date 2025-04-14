const proxy = require('express-http-proxy');

function createProxy(serviceUrl) {
  return proxy(serviceUrl, {
    proxyReqPathResolver: req => {
      return req.originalUrl;
    },
    userResDecorator: function(proxyRes, proxyResData) {
      return proxyResData;
    },
  });
}

module.exports = createProxy;
