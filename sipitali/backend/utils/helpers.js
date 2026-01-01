// Helper functions

exports.generateToken = (id) => {
  const jwt = require('jsonwebtoken');
  const { secret, expiresIn } = require('../config/jwt');
  return jwt.sign({ id }, secret, { expiresIn });
};

exports.sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
  };
  if (data) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

