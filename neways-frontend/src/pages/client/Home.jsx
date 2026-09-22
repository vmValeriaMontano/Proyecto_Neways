import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';
import API from '../../services/api';

export default function Home() {
  const navigate = useNavigate();

  // Estados para datos reales del backend
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);

  // Carga de datos desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Hacemos peticiones a las rutas reales expuestas en tu servidor Node.js
        const [resProducts, resCategories] = await Promise.allSettled([
          API.get('/products'),
          API.get('/products/categories') // Ruta real configurada en productRoutes
        ]);

        if (resProducts.status === 'fulfilled') {
          setProducts(resProducts.value.data || []);
        }

        if (resCategories.status === 'fulfilled') {
          setCategories(resCategories.value.data || []);
        }
      } catch (error) {
        console.error('Error al cargar datos de la BD:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrado flexible según categoría seleccionada
  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : products.filter(p => {
        // Obtenemos los campos posibles según lo devuelto por la BD
        const catName = p.category_name || p.category?.name || p.category || '';
        const catId = p.category_id || p.categoryId;

        // Comparamos si el botón seleccionado coincide con el nombre o el ID
        return (
          String(catName).toLowerCase() === String(selectedCategory).toLowerCase() ||
          String(catId) === String(selectedCategory)
        );
      });

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

        {/* Filtros dinámicos de categoría cargados desde la BD */}
        <div className="px-4 mt-4 flex items-center justify-start gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('Todos')}
            className={`text-xs font-medium px-5 py-1.5 rounded-full shrink-0 transition ${
              selectedCategory === 'Todos'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'bg-gray-200 text-slate-700 hover:bg-gray-300'
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
                className={`text-xs font-medium px-5 py-1.5 rounded-full shrink-0 transition ${
                  selectedCategory === catName
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'bg-gray-200 text-slate-700 hover:bg-gray-300'
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>

        {/* Barra de desplazamiento indicadora */}
        <div className="px-6 my-3 flex items-center gap-2 text-gray-300">
          <span className="text-xs">◀</span>
          <div className="flex-1 h-1 bg-gray-300 rounded-full"></div>
          <span className="text-xs">▶</span>
        </div>

        {/* Sección Lo Más Vendido / Productos BD */}
        <section className="px-4">
          <h2 className="text-left font-bold text-slate-800 text-sm mb-3">
            Lo Más Vendido
          </h2>

          {loading ? (
            <p className="text-xs text-center text-gray-400 py-6">Cargando productos de la base de datos...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-xs text-center text-gray-400 py-6">
              No hay productos disponibles para "{selectedCategory}".
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => {
                const id = product.id || product._id;
                const price = typeof product.price === 'number'
                  ? `$${Number(product.price).toFixed(2)}`
                  : product.price;
                const imageUrl = product.image_url || product.image || product.imageUrl || (product.images && product.images[0]);

                return (
                  <div
                    key={id}
                    onClick={() => navigate(`/product/${id}`)}
                    className="bg-white rounded-2xl p-2 shadow-sm cursor-pointer border border-gray-100 flex flex-col items-start overflow-hidden"
                  >
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
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1">{product.name}</span>
                    <span className="text-xs text-purple-600 font-bold mt-1">{price}</span>
                  </div>
                );
              })}
            </div>
          )}
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