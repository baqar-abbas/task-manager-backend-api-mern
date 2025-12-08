const jwt = require("jsonwebtoken");

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

/**
 * Verify and decode JWT token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
