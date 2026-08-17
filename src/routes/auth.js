const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

const SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_demo';

// Usuarios simulados en memoria (en producción usarías una DB)
const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@demo.com',
    password: bcrypt.hashSync('admin123', 8),
    role: 'admin'
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane@demo.com',
    password: bcrypt.hashSync('jane123', 8),
    role: 'user'
  }
];

/**
 * POST /api/auth/register
 * Registrar un nuevo usuario
 */
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email y password son requeridos' });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password: bcrypt.hashSync(password, 8),
    role: 'user'
  };
  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, role: newUser.role }, SECRET, { expiresIn: '24h' });

  res.status(201).json({
    message: 'Usuario registrado exitosamente',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    token
  });
});

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son requeridos' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '24h' });

  res.json({
    message: 'Login exitoso',
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token
  });
});

module.exports = router;
module.exports.users = users; // exportar para reutilizar en otras rutas
