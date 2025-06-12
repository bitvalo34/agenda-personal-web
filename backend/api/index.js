// backend/api/index.js
const app = require('../app');

module.exports = (req, res) => {
  // Delega todo a tu Express
  return app(req, res);
};
