import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { User, Mail, Phone, Lock } from 'lucide-react';

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
    <div className="min-h-screen bg-[#EFEFEF] flex flex-col items-center justify-between p-6">
      
      {/* TÍTULO SUPERIOR */}
      <div className="w-full max-w-sm text-left">
        <span className="text-gray-400 font-medium text-lg">Registro</span>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center my-auto">
        
        {/* AVATAR Y BIENVENIDA */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full border-4 border-black flex items-center justify-center bg-transparent mb-3">
            <User size={64} className="text-black stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Bienvenido/da
          </h1>
        </div>

        {/* ALERTA DE ERROR */}
        {error && (
          <div className="w-full mb-4 p-3 rounded-xl bg-red-100 border border-red-300 text-red-600 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="w-full bg-white rounded-[32px] p-5 shadow-sm space-y-3">
          
          {/* Nombre Completo */}
          <div className="relative">
            <input
              type="text"
              name="fullName"
              required
              placeholder="Nombre"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-[#60B5FF] text-gray-800 placeholder-gray-600 px-5 py-3.5 rounded-full border-2 border-black focus:outline-none text-sm font-medium"
            />
            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-black" size={22} />
          </div>

          {/* Correo */}
          <div className="relative">
            <input
              type="email"
              name="email"
              required
              placeholder="Correo"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#60B5FF] text-gray-800 placeholder-gray-600 px-5 py-3.5 rounded-full border-2 border-black focus:outline-none text-sm font-medium"
            />
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-black" size={22} />
          </div>

          {/* Teléfono */}
          <div className="relative">
            <input
              type="tel"
              name="phone"
              required
              placeholder="Teléfono"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-[#60B5FF] text-gray-800 placeholder-gray-600 px-5 py-3.5 rounded-full border-2 border-black focus:outline-none text-sm font-medium"
            />
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-black" size={22} />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <input
              type="password"
              name="password"
              required
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#60B5FF] text-gray-800 placeholder-gray-600 px-5 py-3.5 rounded-full border-2 border-black focus:outline-none text-sm font-medium"
            />
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-black" size={22} />
          </div>

          {/* Confirmar Contraseña */}
          <div className="relative">
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Confirmar Contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-[#60B5FF] text-gray-800 placeholder-gray-600 px-5 py-3.5 rounded-full border-2 border-black focus:outline-none text-sm font-medium"
            />
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-black" size={22} />
          </div>

        </form>

        {/* LINK Y BOTÓN */}
        <div className="w-full flex flex-col items-center mt-6 gap-3">
          <Link to="/login" className="text-gray-600 text-sm hover:underline">
            ¿Ya tienes cuenta?
          </Link>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-48 bg-[#6C63FF] hover:bg-[#5b52f0] text-white font-semibold py-2.5 rounded-xl shadow-md transition text-sm disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </div>

      </div>

      {/* LOGO INFERIOR */}
      <div className="mb-2">
        <img src="/logo-morado-completo.png" alt="Neways Logo" className="h-40" />
      </div>

    </div>
  );
}