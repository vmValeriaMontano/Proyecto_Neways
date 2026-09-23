const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const adminRoutes = require('./routes/adminRoutes'); // <-- RUTA DE ADMINISTRADOR
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares Globales
app.use(cors());
app.use(express.json());

// Verificación básica de salud de API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Neways Activewear API', time: new Date() });
});

// Enrutamiento de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes); // <-- MÓDULO ADMINISTRATIVO COMPLETO

// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor de Neways escuchando en el puerto ${PORT}`);
});