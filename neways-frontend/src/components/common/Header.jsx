import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import API from '../../services/api';
import { useSiteCustomization } from '../../context/SiteCustomizationContext';

const countCartItems = (items) => (
  Array.isArray(items)
    ? items.reduce((total, item) => total + (Number(item.quantity) || 1), 0)
    : 0
);

export default function Header() {
  const navigate = useNavigate();
  const { settings } = useSiteCustomization();
  const [cartCount, setCartCount] = useState(0);
  const assetBaseUrl = API.defaults.baseURL.replace(/\/api\/?$/, '');

  const loadCartCount = useCallback(async () => {
    try {
      const response = await API.get('/cart');
      const items = response.data?.items || response.data || [];
      setCartCount(countCartItems(items));
    } catch {
      console.warn('No se pudo obtener el contador del carrito desde la API.');
      try {
        const localCart = JSON.parse(localStorage.getItem('user_cart') || '[]');
        setCartCount(countCartItems(localCart));
      } catch (storageError) {
        console.error('No se pudo leer el carrito local:', storageError);
        setCartCount(0);
      }
    }
  }, []);

  useEffect(() => {
    const handleCartUpdate = (event) => {
      if (Number.isFinite(event.detail?.cartCount)) {
        setCartCount(event.detail.cartCount);
      } else {
        loadCartCount();
      }
    };

    Promise.resolve().then(loadCartCount);
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', loadCartCount);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', loadCartCount);
    };
  }, [loadCartCount]);

  return (
    <header className="bg-white sticky top-0 z-40 px-4 py- shadow-sm border-b border-gray-100 flex items-center justify-between">
      {/* Logo NEWAYS */}
      <Link to="/" className="flex items-center gap-2">
        <img
          src={settings.header_symbol_logo_url ? `${assetBaseUrl}${settings.header_symbol_logo_url}` : '/isotipo-morado-copia.png'}
          alt="NEWAYS"
          className="h-20 md:h-16 lg:h-24 object-contain transition-all duration-300"
        />
      </Link>
      <Link to="/" className="flex items-center gap-2">
        <img
          src={settings.header_wordmark_logo_url ? `${assetBaseUrl}${settings.header_wordmark_logo_url}` : '/logo-morado-letra-copia.png'}
          alt="NEWAYS"
          className="h-28 md:h-16 lg:h-32 object-contain transition-all duration-300"
        />
      </Link>

      {/* Iconos derechas: Búsqueda y Carrito */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/catalog')}
          className="p-1 text-slate-800 hover:text-purple-600 transition"
          aria-label="Buscar"
        >
          <Search size={30} />
        </button>

        <Link to="/cart" className="relative p-1 text-slate-800 hover:text-purple-600 transition">
          <ShoppingBag size={30} />
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