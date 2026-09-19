const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Acceso no autorizado. Token faltante." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido o expirado." });
    }
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'administrador') {
    next();
  } else {
    return res.status(403).json({ message: "Acceso restringido a administradores." });
  }
}

module.exports = { authenticateToken, isAdmin };