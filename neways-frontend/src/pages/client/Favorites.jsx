import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';
import API from '../../services/api';

export default function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);

        const response = await API.get('/favorites');
        setFavorites(response.data || []);
      } catch (error) {
        console.info('Ruta /favorites no detectada en backend. Usando almacenamiento local.');
        const localFavs = JSON.parse(localStorage.getItem('user_favorites') || '[]');
        setFavorites(localFavs);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (e, targetId) => {
    e.stopPropagation(); // Evita redirigir a la pantalla de detalle

    try {
      await API.delete(`/favorites/${targetId}`);
    } catch (error) {
      // Si falla la API, continúa eliminando de la vista
    }

    const updated = favorites.filter((item) => {
      const id = item.product_id || item.id || item._id;
      return id !== targetId;
    });

    setFavorites(updated);
    localStorage.setItem('user_favorites', JSON.stringify(updated));
  };

  const handleProductClick = (productId) => {
    if (productId) {
      navigate(`/productDetail/${productId}`); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-28 flex flex-col justify-between">
      <div>
        <Header cartCount={3} />

        <main className="px-4 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-left font-bold text-slate-800 text-base">
              Mis Favoritos
            </h1>
            <span className="text-xs text-gray-500 font-medium">
              {favorites.length} {favorites.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>

          {loading ? (
            <p className="text-xs text-center text-gray-400 py-10">Cargando tus favoritos...</p>
          ) : favorites.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 mt-4">
              <span className="text-3xl block mb-2">❤️</span>
              <p className="text-xs font-semibold text-slate-700">Aún no tienes favoritos</p>
              <p className="text-[11px] text-gray-400 mt-1 mb-4">
                Guarda los productos que más te gusten presionando el ícono de corazón en el catálogo.
              </p>
              <button
                onClick={() => navigate('/catalog')}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs py-2 px-5 rounded-xl transition shadow-sm"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favorites.map((item) => {
                // Soporte si el objeto viene plano o anidado desde SQL JOIN (e.g. item.product_id vs item.id)
                const product = item.product || item;
                const productId = item.product_id || product.id || product._id;
                
                const price = typeof product.price === 'number'
                  ? `$${Number(product.price).toFixed(2)}`
                  : product.price || '$0.00';
                  
                const imageUrl = product.image_url || product.image || product.imageUrl || (product.images && product.images[0]);

                return (
                  <div
                    key={productId}
                    onClick={() => handleProductClick(productId)}
                    className="bg-white rounded-2xl p-2 shadow-sm cursor-pointer border border-gray-100 flex flex-col justify-between relative hover:shadow-md transition active:scale-[0.98]"
                  >
                    {/* Botón para remover de Favoritos */}
                    <button
                      onClick={(e) => handleRemoveFavorite(e, productId)}
                      className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center text-red-500 hover:text-red-600 shadow-sm z-10 transition"
                      title="Quitar de Favoritos"
                    >
                      ♥
                    </button>

                    {/* Contenedor de Imagen */}
                    <div className="w-full aspect-square bg-gray-200 rounded-xl mb-2 overflow-hidden flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400">Sin imagen</span>
                      )}
                    </div>

                    {/* Nombre y Precio */}
                    <div className="text-left px-1 pb-1">
                      <span className="text-xs font-semibold text-slate-800 block line-clamp-1">
                        {product.name || 'Producto'}
                      </span>
                      <span className="text-xs text-indigo-600 font-bold block mt-0.5">
                        {price}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}