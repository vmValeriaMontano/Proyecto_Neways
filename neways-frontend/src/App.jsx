import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/client/Home';
import Catalog from './pages/client/Catalog';
import ProductDetail from './pages/client/ProductDetail';
import Cart from './pages/client/Cart';
import ShippingData from './pages/client/ShippingData';


import Favorites from './pages/client/Favorites';

import { AuthProvider } from './context/AuthContext';

// Componente para proteger la ruta de Admin (valida token Y rol de administrador)
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si no es administrador, no lo deja entrar a /admin y lo manda al inicio
  if (user.role !== 'administrador') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  // Función para redirigir según el rol guardado tras iniciar sesión
  const handleLoginRedirect = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'administrador') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/';
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/favorites" element={<Favorites />} />
      {/* RUTA DE DETALLE DE PRODUCTO (Soporta ID dinámico y estático) */}
      <Route path="/productDetail/:id" element={<ProductDetail />} />
      <Route path="/productDetail" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/shippingData" element={<ShippingData />} />


      <Route 
        path="/login" 
        element={<Login onLoginSuccess={handleLoginRedirect} />} 
      />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/admin" 
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        } 
      />
      {/* Redirección por defecto al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}