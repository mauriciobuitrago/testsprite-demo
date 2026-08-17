const express = require('express');
const router  = express.Router();

// Catálogo de productos simulado
let products = [
  { id: 1, name: 'Laptop Pro 15',    category: 'electronics', price: 1299.99, stock: 10 },
  { id: 2, name: 'Teclado Mecánico', category: 'electronics', price: 89.99,   stock: 50 },
  { id: 3, name: 'Monitor 4K 27"',   category: 'electronics', price: 499.99,  stock: 15 },
  { id: 4, name: 'Silla Ergonómica', category: 'furniture',   price: 349.99,  stock: 8  },
  { id: 5, name: 'Escritorio Bambu', category: 'furniture',   price: 229.99,  stock: 20 },
];
let nextId = 6;

/**
 * GET /api/products
 * Listar productos — admite ?category=electronics y ?minPrice=100&maxPrice=500
 */
router.get('/', (req, res) => {
  let result = [...products];

  if (req.query.category) {
    result = result.filter(p => p.category === req.query.category);
  }
  if (req.query.minPrice) {
    result = result.filter(p => p.price >= parseFloat(req.query.minPrice));
  }
  if (req.query.maxPrice) {
    result = result.filter(p => p.price <= parseFloat(req.query.maxPrice));
  }

  res.json({ total: result.length, products: result });
});

/**
 * GET /api/products/:id
 * Obtener un producto por ID
 */
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.json(product);
});

/**
 * POST /api/products
 * Crear un nuevo producto
 */
router.post('/', (req, res) => {
  const { name, category, price, stock } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: 'name, category y price son requeridos' });
  }
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'price debe ser un número positivo' });
  }

  const newProduct = { id: nextId++, name, category, price, stock: stock ?? 0 };
  products.push(newProduct);
  res.status(201).json({ message: 'Producto creado', product: newProduct });
});

/**
 * PUT /api/products/:id
 * Actualizar un producto existente
 */
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const { name, category, price, stock } = req.body;
  if (name)     products[index].name     = name;
  if (category) products[index].category = category;
  if (price !== undefined) products[index].price = price;
  if (stock !== undefined) products[index].stock = stock;

  res.json({ message: 'Producto actualizado', product: products[index] });
});

/**
 * DELETE /api/products/:id
 * Eliminar un producto
 */
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  products.splice(index, 1);
  res.json({ message: 'Producto eliminado exitosamente' });
});

module.exports = router;
