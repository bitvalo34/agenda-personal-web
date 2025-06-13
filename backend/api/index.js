// backend/api/index.js
const app = require('../app');

module.exports = (req, res) => {

  if (req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '');
  }

  return app(req, res);
};
