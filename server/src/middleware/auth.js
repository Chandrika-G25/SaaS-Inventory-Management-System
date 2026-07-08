const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach org + user context to every downstream request.
    // Every query in this app MUST filter by req.organizationId.
    req.userId = payload.userId;
    req.organizationId = payload.organizationId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
