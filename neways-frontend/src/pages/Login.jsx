import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Importamos Link para la navegación real de rutas

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = "http://localhost:5000/api/auth/login";

    try {
      const response = await axios.post(endpoint, formData);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user || {}));

        // Ejecuta la redirección instantánea configurada en App.jsx
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Ocurrió un error. Verifica tus credenciales.",
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[#ececec] py-8 px-4 font-sans text-gray-800">
      {/* Contenedor principal centrado */}
      <div className="w-full max-w-sm flex flex-col items-center my-auto space-y-6">
        {/* Ícono de usuario e ícono del perfil */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-24 h-24 rounded-full border-[3px] border-black flex items-center justify-center p-2">
            <svg
              className="w-full h-full text-black"
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
          <h2 className="text-2xl font-bold text-gray-900">
            Bienvenido/da
          </h2>
        </div>

        {/* Tarjeta blanca con bordes redondeados que envuelve los inputs */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="bg-white p-5 rounded-[2.5rem] shadow-sm space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 text-xs p-2.5 rounded-2xl text-center">
                {error}
              </div>
            )}

            {/* Input de Correo */}
            <div className="relative flex items-center">
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Correo"
                className="w-full py-3.5 pl-5 pr-12 bg-[#60b3fa] text-gray-900 placeholder-gray-700 rounded-2xl border-2 border-black font-medium focus:outline-none"
              />
              <div className="absolute right-4 pointer-events-none text-black">
                <svg
                  className="w-6 h-6"
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

            {/* Input de Contraseña */}
            <div className="relative flex items-center">
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña"
                className="w-full py-3.5 pl-5 pr-12 bg-[#60b3fa] text-gray-900 placeholder-gray-700 rounded-2xl border-2 border-black font-medium focus:outline-none"
              />
              <div className="absolute right-4 pointer-events-none text-black">
                <svg
                  className="w-6 h-6"
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

          {/* Enlace directo a tu componente Register.jsx cambiando la URL real */}
          <div className="text-center pt-2">
            <Link
              to="/register"
              className="text-sm text-gray-700 hover:text-black font-medium transition-colors hover:underline"
            >
              ¿No tienes cuenta?
            </Link>
          </div>

          {/* Botón Principal (Login) */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-48 py-2.5 bg-[#6b73ff] hover:bg-[#5860f0] text-white font-semibold rounded-xl shadow-md transition duration-200"
            >
              Login
            </button>
          </div>
        </form>
      </div>

      {/* Logo de Neways en el pie de página */}
      <div className="mt-8 flex flex-col items-center">
        <img src="/logo-morado-completo.png" alt="Neways Logo" className="h-40" />
      </div>
    </div>
  );
};

export default Login;
