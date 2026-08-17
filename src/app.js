const express = require('express');
const app = express();

app.use(express.json());

// ─── Rutas ───────────────────────────────────────────────
const authRoutes     = require('./routes/auth');
const usersRoutes    = require('./routes/users');
const productsRoutes = require('./routes/products');

app.use('/api/auth',     authRoutes);
app.use('/api/users',    usersRoutes);
app.use('/api/products', productsRoutes);

// ─── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API corriendo correctamente' });
});

// ─── 404 global ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ─── Arranque ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
});

module.exports = app;
