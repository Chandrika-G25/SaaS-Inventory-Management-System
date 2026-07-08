const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "replace-this-with-a-long-random-string";
const JWT_EXPIRES_IN = "7d";

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
