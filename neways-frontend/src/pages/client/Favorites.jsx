import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';
import API from '../../services/api';

export default function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga de productos favoritos
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);

        // 1. Intentamos consultar a la API si la ruta existe
        const response = await API.get('/favorites');
        setFavorites(response.data || []);
      } catch (error) {
        // 2. Si la ruta /favorites no existe en el backend, usamos localStorage como respaldo
        console.info('Ruta /favorites no detectada en backend. Usando almacenamiento local.');
        const localFavs = JSON.parse(localStorage.getItem('user_favorites') || '[]');
        setFavorites(localFavs);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Función para eliminar un producto de Favoritos
  const handleRemoveFavorite = async (e, productId) => {
    e.stopPropagation(); // Evita navegar a la vista de detalle al presionar el corazón

    try {
      // Intenta eliminar en el backend si la ruta existe
      await API.delete(`/favorites/${productId}`);
    } catch (error) {
      // Si falla o no existe la ruta, continúa silenciosamente
    }

    // Actualiza el estado local y localStorage
    const updated = favorites.filter((p) => (p.id || p._id) !== productId);
    setFavorites(updated);
    localStorage.setItem('user_favorites', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-28 flex flex-col justify-between">
      <div>
        {/* Reutilización del Header global */}
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

          {/* Grilla de Productos Favoritos */}
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
              {favorites.map((product) => {
                const id = product.id || product._id;
                const price = typeof product.price === 'number'
                  ? `$${Number(product.price).toFixed(2)}`
                  : product.price || '$0.00';
                const imageUrl = product.image_url || product.image || product.imageUrl || (product.images && product.images[0]);

                return (
                  <div
                    key={id}
                    onClick={() => navigate(`/product/${id}`)}
                    className="bg-white rounded-2xl p-2 shadow-sm cursor-pointer border border-gray-100 flex flex-col justify-between relative"
                  >
                    {/* Botón para remover de Favoritos (Corazón Relleno) */}
                    <button
                      onClick={(e) => handleRemoveFavorite(e, id)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-600 text-base z-10 p-1"
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

      {/* Navegación inferior persistente */}
      <BottomNav />
    </div>
  );
}