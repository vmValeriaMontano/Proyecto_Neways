require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');


const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const locationRoutes = require('./routes/locationRoutes');
const adminRoutes = require('./routes/adminRoutes'); // <-- RUTA DE ADMINISTRADOR
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');
const discountRoutes = require('./routes/discountRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares Globales
const frontendOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = new Set([
  ...frontendOrigins,
  'http://localhost:5173',
  'http://localhost:3000',
]);

app.use(cors({
  origin: (origin, callback) => {
    callback(null, !origin || allowedOrigins.has(origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

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
app.use('/api/locations', locationRoutes); // <-- MÓDULO PÚBLICO DE UBICACIONES
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/admin', adminRoutes); // <-- MÓDULO ADMINISTRATIVO COMPLETO

// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de Neways escuchando en el puerto ${PORT}`);
});