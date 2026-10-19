import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { User, Mail, Phone, Lock } from 'lucide-react';
import Nav from '../components/Nav';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }

    if (formData.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }

    setLoading(true);

    try {
      // Enviamos las claves exactas que espera tu Backend en Postman
      const response = await API.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone
      });

      if (response.data) {
        alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Error al registrar la cuenta.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#ededed] font-sans text-gray-800">
      
      {/* Barra de navegación superior limpia */}
      <Nav />

      {/* Contenedor principal centrado */}
      <div className="w-full max-w-sm mx-auto flex flex-col items-center my-auto space-y-6 px-4 py-6">
        
        {/* AVATAR Y BIENVENIDA */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#9966FF] to-[#6571fe] flex items-center justify-center p-1 shadow-md">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <User size={42} className="text-[#9966FF] stroke-[2]" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-[#333333] tracking-tight">
            ¡Bienvenido/a!
          </h1>
        </div>

        {/* ALERTA DE ERROR */}
        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 text-xs p-2.5 rounded-2xl text-center">
            {error}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#D9D9D9] space-y-4">
            
            {/* Nombre Completo */}
            <div className="relative flex items-center">
              <input
                type="text"
                name="fullName"
                required
                placeholder="Nombre completo"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full py-3.5 pl-5 pr-12 bg-[#9966FF]/10 text-gray-900 placeholder-gray-500 rounded-2xl border-2 border-[#9966FF] font-medium focus:outline-none focus:ring-2 focus:ring-[#6571fe] transition-all text-sm"
              />
              <User className="absolute right-4 text-[#9966FF] pointer-events-none" size={20} />
            </div>

            {/* Correo */}
            <div className="relative flex items-center">
              <input
                type="email"
                name="email"
                required
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                className="w-full py-3.5 pl-5 pr-12 bg-[#9966FF]/10 text-gray-900 placeholder-gray-500 rounded-2xl border-2 border-[#9966FF] font-medium focus:outline-none focus:ring-2 focus:ring-[#6571fe] transition-all text-sm"
              />
              <Mail className="absolute right-4 text-[#9966FF] pointer-events-none" size={20} />
            </div>

            {/* Teléfono */}
            <div className="relative flex items-center">
              <input
                type="tel"
                name="phone"
                required
                placeholder="Teléfono"
                value={formData.phone}
                onChange={handleChange}
                className="w-full py-3.5 pl-5 pr-12 bg-[#9966FF]/10 text-gray-900 placeholder-gray-500 rounded-2xl border-2 border-[#9966FF] font-medium focus:outline-none focus:ring-2 focus:ring-[#6571fe] transition-all text-sm"
              />
              <Phone className="absolute right-4 text-[#9966FF] pointer-events-none" size={20} />
            </div>

            {/* Contraseña */}
            <div className="relative flex items-center">
              <input
                type="password"
                name="password"
                required
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className="w-full py-3.5 pl-5 pr-12 bg-[#9966FF]/10 text-gray-900 placeholder-gray-500 rounded-2xl border-2 border-[#9966FF] font-medium focus:outline-none focus:ring-2 focus:ring-[#6571fe] transition-all text-sm"
              />
              <Lock className="absolute right-4 text-[#9966FF] pointer-events-none" size={20} />
            </div>

            {/* Confirmar Contraseña */}
            <div className="relative flex items-center">
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full py-3.5 pl-5 pr-12 bg-[#9966FF]/10 text-gray-900 placeholder-gray-500 rounded-2xl border-2 border-[#9966FF] font-medium focus:outline-none focus:ring-2 focus:ring-[#6571fe] transition-all text-sm"
              />
              <Lock className="absolute right-4 text-[#9966FF] pointer-events-none" size={20} />
            </div>

          </div>

          {/* Enlace de Inicio de Sesión modernizado */}
          <div className="text-center pt-1">
            <Link 
              to="/login" 
              className="text-xs text-[#333333] hover:text-[#9966FF] font-semibold transition-colors underline decoration-[#9966FF]/50 hover:decoration-[#9966FF]"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>

          {/* Botón Principal (Registrarme) con degradado institucional */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-48 py-3 bg-gradient-to-r from-[#9966FF] to-[#6571fe] hover:opacity-90 text-white font-bold rounded-2xl shadow-md transition duration-200 disabled:opacity-50 text-sm tracking-wide"
            >
              {loading ? 'Registrando...' : 'Registrarme'}
            </button>
          </div>
        </form>

      </div>

      {/* LOGO INFERIOR */}
      <div className="mt-8 mb-6 flex flex-col items-center">
        <img src="/logo-morado-completo.png" alt="Neways Logo" className="h-32 object-contain" />
      </div>

    </div>
  );
}