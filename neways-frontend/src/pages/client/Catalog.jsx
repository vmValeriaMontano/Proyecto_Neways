import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';
import API from '../../services/api';

export default function Catalog() {
  const navigate = useNavigate();

  // Estados para productos, categorías y favoritos
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('recientes');

  // Carga de datos desde la BD
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resProducts, resCategories, resFavorites] = await Promise.allSettled([
          API.get('/products'),
          API.get('/products/categories'),
          API.get('/favorites')
        ]);

        if (resProducts.status === 'fulfilled') {
          setProducts(resProducts.value.data || []);
        }

        if (resCategories.status === 'fulfilled') {
          setCategories(resCategories.value.data || []);
        }

        if (resFavorites.status === 'fulfilled') {
          const favs = resFavorites.value.data || [];
          setFavoriteIds(favs.map((p) => p.id || p._id));
        } else {
          // Respaldo en localStorage si la API de favoritos falla o no responde
          const localFavs = JSON.parse(localStorage.getItem('user_favorites') || '[]');
          setFavoriteIds(localFavs.map((p) => p.id || p._id));
        }
      } catch (error) {
        console.error('Error al cargar datos del catálogo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para agregar / quitar de Favoritos (Toggle)
  const handleToggleFavorite = async (e, product) => {
    e.stopPropagation(); // Evita navegar a la vista de detalle
    const productId = product.id || product._id;
    const isFav = favoriteIds.includes(productId);

    // Actualización optimista de la UI (cambia inmediatamente)
    const updatedFavIds = isFav
      ? favoriteIds.filter((id) => id !== productId)
      : [...favoriteIds, productId];

    setFavoriteIds(updatedFavIds);

    // Actualización en localStorage
    let localFavs = JSON.parse(localStorage.getItem('user_favorites') || '[]');
    if (isFav) {
      localFavs = localFavs.filter((p) => (p.id || p._id) !== productId);
    } else {
      localFavs.push(product);
    }
    localStorage.setItem('user_favorites', JSON.stringify(localFavs));

    // Envío de petición al Backend
    try {
      await API.post('/favorites/toggle', { productId });
    } catch (error) {
      console.warn('Servidor no respondió al guardar favorito, guardado localmente:', error);
    }
  };

  // Lógica de filtrado por búsqueda y categoría
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'Todos') return matchesSearch;

    const catName = product.category_name || product.category?.name || product.category || '';
    const catId = product.category_id || product.categoryId;

    const matchesCategory =
      String(catName).toLowerCase() === String(selectedCategory).toLowerCase() ||
      String(catId) === String(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Lógica de ordenamiento
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'precio-bajo') return Number(a.price) - Number(b.price);
    if (sortBy === 'precio-alto') return Number(b.price) - Number(a.price);
    return (b.id || b._id) - (a.id || a._id);
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-28 flex flex-col justify-between">
      <div>
        {/* Reutilización del Header global */}
        <Header cartCount={3} />

        <main className="px-4 pt-3">
          {/* Barra de búsqueda */}
          <div className="relative w-full mb-3">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar Productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full py-2 pl-9 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
            />
          </div>

          {/* Filtros dinámicos por Categoría */}
          <div className="flex items-center justify-start gap-2 overflow-x-auto no-scrollbar mb-3">
            <button
              onClick={() => setSelectedCategory('Todos')}
              className={`text-xs font-medium px-4 py-1.5 rounded-full shrink-0 transition ${
                selectedCategory === 'Todos'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              Todos
            </button>

            {categories.map((cat) => {
              const catName = cat.name || cat.nombre || cat.id;
              return (
                <button
                  key={cat.id || cat._id || catName}
                  onClick={() => setSelectedCategory(catName)}
                  className={`text-xs font-medium px-4 py-1.5 rounded-full shrink-0 transition ${
                    selectedCategory === catName
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>

          {/* Opciones de Ordenar por y Filtros avanzados */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-slate-700">
              <span className="text-gray-500 font-medium">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              >
                <option value="recientes">Más recientes</option>
                <option value="precio-bajo">Menor precio</option>
                <option value="precio-alto">Mayor precio</option>
              </select>
            </div>

            <button className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-slate-700 hover:bg-gray-50 transition shadow-sm">
              <span>Filtros</span>
              <span className="text-xs">⚙️</span>
            </button>
          </div>

          {/* Grilla de Productos */}
          {loading ? (
            <p className="text-xs text-center text-gray-400 py-10">Cargando catálogo...</p>
          ) : sortedProducts.length === 0 ? (
            <p className="text-xs text-center text-gray-400 py-10">
              No se encontraron productos disponibles.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {sortedProducts.map((product) => {
                const id = product.id || product._id;
                const isFavorite = favoriteIds.includes(id);
                const price = typeof product.price === 'number'
                  ? `$${Number(product.price).toFixed(2)}`
                  : product.price || '$0.00';
                const imageUrl = product.image_url || product.image || product.imageUrl || (product.images && product.images[0]);

                return (
                  <div
                    key={id}
                    onClick={() => navigate(`/productDetail/${id}`)}
                    className="bg-white rounded-2xl p-2 shadow-sm cursor-pointer border border-gray-100 flex flex-col justify-between relative"
                  >
                    {/* Botón Favoritos (Corazón interactivo) */}
                    <button
                      onClick={(e) => handleToggleFavorite(e, product)}
                      className={`absolute top-3 right-3 text-base z-10 transition-transform active:scale-125 ${
                        isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                      }`}
                      title={isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
                    >
                      {isFavorite ? '♥' : '♡'}
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