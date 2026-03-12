const jwt = require("jsonwebtoken");

/**
 * Tạo JWT cho test - cần JWT_SECRET trong .env
 */
function createTestToken(payload = {}) {
  const secret = process.env.JWT_SECRET || "test-secret";
  return jwt.sign(
    { id: 1, role: "user", ...payload },
    secret,
    { expiresIn: "1h" }
  );
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { createTestToken, authHeader };
