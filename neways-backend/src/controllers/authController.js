const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2d' }
  );
}

async function register(req, res) {
  try {
    const { fullName, email, password, confirmPassword, phone } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Completa todos los campos obligatorios." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "La contraseña debe contener al menos 8 caracteres." });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "El correo electrónico ya está registrado." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role) 
       VALUES ($1, $2, $3, $4, 'cliente') 
       RETURNING id, full_name, email, role, phone, created_at`,
      [fullName, email.toLowerCase(), passwordHash, phone || null]
    );

    const user = result.rows[0];
    const token = signToken(user);

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error("Error en registro:", err);
    return res.status(500).json({ message: "Error interno al registrar usuario." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Correo y contraseña requeridos." });
    }

    const result = await pool.query(
      "SELECT id, full_name, email, password_hash, role, phone FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const token = signToken(user);
    delete user.password_hash;

    return res.json({ token, user });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ message: "Error interno al iniciar sesión." });
  }
}

module.exports = { register, login };