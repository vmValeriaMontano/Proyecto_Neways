import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';
import API from '../../services/api';

export default function Catalog() {
  const navigate = useNavigate();

  // Estados para productos y categorías
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
        const [resProducts, resCategories] = await Promise.allSettled([
          API.get('/products'),
          API.get('/products/categories')
        ]);

        if (resProducts.status === 'fulfilled') {
          setProducts(resProducts.value.data || []);
        }

        if (resCategories.status === 'fulfilled') {
          setCategories(resCategories.value.data || []);
        }
      } catch (error) {
        console.error('Error al cargar catálogo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    // 'recientes' como predeterminado (por ID descendente)
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
                    {/* Botón Favoritos (Corazón) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Agregar lógica de favoritos si aplica
                      }}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-sm z-10"
                    >
                      ♡
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