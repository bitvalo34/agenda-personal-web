// backend/api/index.js
const app = require('../app');

module.exports = (req, res) => {
  // Si la URL comienza con "/api", la recortamos
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '');
  }
  // Delegamos todo a Express
  return app(req, res);
};
