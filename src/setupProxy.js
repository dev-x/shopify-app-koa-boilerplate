const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

dotenv.config();

module.exports = function(app) {
  app.use(
    /^\/(api|auth|webhooks)/,
    createProxyMiddleware({
      target: `http://localhost:${process.env.SERVER_PORT}`,
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('host', req.hostname);
      },
      changeOrigin: true,
      pathRewrite: {
        '^/auth': '/auth',
        '^/webhooks': '/webhooks',
        '^/api/': '/',
      },
    })
  );
};