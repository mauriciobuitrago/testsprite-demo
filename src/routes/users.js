const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_demo';

// Middleware de autenticación
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

// Datos simulados
const { users } = require('./auth');

/**
 * GET /api/users
 * Listar todos los usuarios (requiere auth)
 */
router.get('/', authenticate, (req, res) => {
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json({ total: safeUsers.length, users: safeUsers });
});

/**
 * GET /api/users/:id
 * Obtener un usuario por ID (requiere auth)
 */
router.get('/:id', authenticate, (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

/**
 * PUT /api/users/:id
 * Actualizar un usuario (requiere auth, solo el propio usuario o admin)
 */
router.put('/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado para modificar este usuario' });
  }

  const { name, email } = req.body;
  if (name) users[userIndex].name = name;
  if (email) users[userIndex].email = email;

  const { password, ...safeUser } = users[userIndex];
  res.json({ message: 'Usuario actualizado', user: safeUser });
});

/**
 * DELETE /api/users/:id
 * Eliminar un usuario (solo admin)
 */
router.delete('/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo admins pueden eliminar usuarios' });
  }

  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  users.splice(userIndex, 1);
  res.json({ message: 'Usuario eliminado exitosamente' });
});

module.exports = router;
