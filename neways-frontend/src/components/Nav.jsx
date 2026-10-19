import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';

export default function Header({ cartCount = 0 }) {
  const navigate = useNavigate();

  return (
<header className="bg-white sticky top-0 z-40 px-4 py-2 shadow-sm border-b border-gray-100 flex items-center justify-center">      {/* Logo NEWAYS */}
      <Link to="/" className="flex items-center gap-2">
        <img src="/isotipo-morado-copia.png" alt="NEWAYS" className="h-20 md:h-16 lg:h-24 object-contain transition-all duration-300" />
      </Link>
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo-morado-letra-copia.png" alt="NEWAYS" className="h-28 md:h-16 lg:h-32 object-contain transition-all duration-300" />
      </Link>
    </header>
  );
}