const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Acces interzis. Token lipsă." });
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token invalid sau expirat." });
    }
    req.user = user; // Salvăm datele utilizatorului în req.user (id, role)
    next();
  });
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({ error: "Nu ai permisiunea necesară pentru această acțiune." });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
