import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Nav from "../components/Nav"; 

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = "http://localhost:5000/api/auth/login";

    try {
      const response = await axios.post(endpoint, formData);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user || {}));

        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Ocurrió un error. Verifica tus credenciales.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#ededed] font-sans text-gray-800">
      {/* Barra de navegación superior limpia sin lupa ni carrito */}
      <Nav />

      {/* Contenedor principal centrado */}
      <div className="w-full max-w-sm mx-auto flex flex-col items-center my-auto space-y-6 px-4">
        
        {/* Ícono de usuario / perfil modernizado con degradado y tono institucional */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#9966FF] to-[#6571fe] flex items-center justify-center p-1 shadow-md">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-[#9966FF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-[#333333] tracking-tight">
            ¡Bienvenido/a!
          </h2>
        </div>

        {/* Tarjeta blanca con bordes redondeados que envuelve los inputs */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#D9D9D9] space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 text-xs p-2.5 rounded-2xl text-center">
                {error}
              </div>
            )}

            {/* Input de Correo con estilo moderno y color institucional */}
            <div className="relative flex items-center">
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Correo electrónico"
                className="w-full py-3.5 pl-5 pr-12 bg-[#9966FF]/10 text-gray-900 placeholder-gray-500 rounded-2xl border-2 border-[#9966FF] font-medium focus:outline-none focus:ring-2 focus:ring-[#6571fe] transition-all text-sm"
              />
              <div className="absolute right-4 pointer-events-none text-[#9966FF]">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Input de Contraseña con estilo moderno y color institucional */}
            <div className="relative flex items-center">
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña"
                className="w-full py-3.5 pl-5 pr-12 bg-[#9966FF]/10 text-gray-900 placeholder-gray-500 rounded-2xl border-2 border-[#9966FF] font-medium focus:outline-none focus:ring-2 focus:ring-[#6571fe] transition-all text-sm"
              />
              <div className="absolute right-4 pointer-events-none text-[#9966FF]">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Enlace de Registro modernizado */}
          <div className="text-center pt-1">
            <Link
              to="/register"
              className="text-xs text-[#333333] hover:text-[#9966FF] font-semibold transition-colors underline decoration-[#9966FF]/50 hover:decoration-[#9966FF]"
            >
              ¿No tienes cuenta? Regístrate aquí
            </Link>
          </div>

          {/* Botón Principal (Login) con degradado institucional */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-48 py-3 bg-gradient-to-r from-[#9966FF] to-[#6571fe] hover:opacity-90 text-white font-bold rounded-2xl shadow-md transition duration-200 disabled:opacity-50 text-sm tracking-wide"
            >
              {loading ? "Entrando..." : "Login"}
            </button>
          </div>
        </form>
      </div>

      {/* Logo de Neways en el pie de página */}
      <div className="mt-8 mb-6 flex flex-col items-center">
        <img src="/logo-morado-completo.png" alt="Neways Logo" className="h-32 object-contain" />
      </div>
    </div>
  );
};

export default Login;