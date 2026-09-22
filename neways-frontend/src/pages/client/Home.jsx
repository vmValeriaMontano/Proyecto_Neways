import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';

export default function Home() {
  const navigate = useNavigate();

  // Datos mock para "Lo Más Vendido"
  const popularProducts = [
    { id: 1, name: 'Producto', price: '$0.00', image: '' },
    { id: 2, name: 'Producto', price: '$0.00', image: '' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-28 flex flex-col justify-between">
      <div>
        <Header cartCount={3} />

        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 text-white p-6 rounded-b-xl shadow-md text-left">
          <h1 className="text-2xl font-extrabold uppercase tracking-wide leading-snug">
            UN NUEVO CAMINO AL RENDIMIENTO
          </h1>
          <p className="text-xs text-indigo-100 mt-2 mb-4">
            Prendas diseñadas para potenciar tu estilo de vida.
          </p>
          <button
            onClick={() => navigate('/catalog')}
            className="bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs py-2.5 px-6 rounded-lg tracking-wider transition"
          >
            VER COLECCIÓN
          </button>
        </section>

        {/* Filtros rápidos de categoría */}
        <div className="px-4 mt-4 flex items-center justify-start gap-2 overflow-x-auto no-scrollbar">
          <button className="bg-purple-500 text-white text-xs font-medium px-5 py-1.5 rounded-full shadow-sm shrink-0">
            Todos
          </button>
          <button className="bg-gray-200 text-slate-700 text-xs font-medium px-5 py-1.5 rounded-full shrink-0">
            Mujer
          </button>
          <button className="bg-gray-200 text-slate-700 text-xs font-medium px-5 py-1.5 rounded-full shrink-0">
            Accesorios
          </button>
        </div>

        {/* Barra de desplazamiento indicadora */}
        <div className="px-6 my-3 flex items-center gap-2 text-gray-300">
          <span className="text-xs">◀</span>
          <div className="flex-1 h-1 bg-gray-300 rounded-full"></div>
          <span className="text-xs">▶</span>
        </div>

        {/* Sección Lo Más Vendido */}
        <section className="px-4">
          <h2 className="text-left font-bold text-slate-800 text-sm mb-3">
            Lo Más Vendido
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {popularProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white rounded-2xl p-2 shadow-sm cursor-pointer border border-gray-100 flex flex-col items-start"
              >
                <div className="w-full aspect-square bg-gray-200 rounded-xl mb-2"></div>
                <span className="text-xs font-semibold text-slate-800">{product.name}</span>
                <span className="text-xs text-purple-600 font-bold">{product.price}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer / Lema */}
      <footer className="bg-zinc-800 text-white py-6 px-4 text-center mt-8">
        <p className="text-xs font-mono text-gray-300 max-w-xs mx-auto leading-relaxed">
          "Involucrados en el estilo de vida deportivo, ofreciendo productos enfocados al bienestar y la alta calidad."
        </p>
        <p className="text-[10px] text-gray-400 mt-4">
          © 2026 Neways El Salvador. Todos los derechos reservados.
        </p>
      </footer>

      <BottomNav />
    </div>
  );
}