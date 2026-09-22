import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';

export default function Header({ cartCount = 0 }) {
  const navigate = useNavigate();

  return (
    <header className="bg-white sticky top-0 z-40 px-4 py-3 shadow-sm border-b border-gray-100 flex items-center justify-between">
      {/* Logo NEWAYS */}
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo-morado-completo.png" alt="NEWAYS" className="h-7 object-contain" />
      </Link>

      {/* Iconos derechas: Búsqueda y Carrito */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/catalog')}
          className="p-1 text-slate-800 hover:text-purple-600 transition"
          aria-label="Buscar"
        >
          <Search size={22} />
        </button>

        <Link to="/cart" className="relative p-1 text-slate-800 hover:text-purple-600 transition">
          <ShoppingBag size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}