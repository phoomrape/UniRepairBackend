const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'unirepair_secret_key_2026_secure';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};
