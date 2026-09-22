import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Heart, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-full shadow-lg py-2.5 px-6 flex items-center justify-between z-50">
      <Link 
        to="/" 
        className={`p-2 transition ${isActive('/') ? 'text-purple-600' : 'text-slate-700 hover:text-slate-900'}`}
      >
        <Home size={24} />
      </Link>

      <Link 
        to="/catalog" 
        className={`p-2 transition ${isActive('/catalog') ? 'text-purple-600' : 'text-slate-700 hover:text-slate-900'}`}
      >
        <LayoutGrid size={24} />
      </Link>

      <Link 
        to="/favorites" 
        className={`p-2 transition ${isActive('/favorites') ? 'text-purple-600' : 'text-slate-700 hover:text-slate-900'}`}
      >
        <Heart size={24} />
      </Link>

      <Link 
        to="/profile" 
        className={`p-2 transition ${isActive('/profile') ? 'text-purple-600' : 'text-slate-700 hover:text-slate-900'}`}
      >
        <User size={24} />
      </Link>
    </div>
  );
}