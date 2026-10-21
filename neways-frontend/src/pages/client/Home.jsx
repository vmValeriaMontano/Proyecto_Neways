import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';
import API from '../../services/api';

export default function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);

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
        console.error('Error al cargar datos de la BD:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrado de productos dinámico por categoría o descuento
  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : selectedCategory === 'Descuentos'
    ? products.filter(p => Number(p.discount) > 0)
    : products.filter(p => {
        const catName = p.category_name || p.category?.name || p.category || '';
        return String(catName).toLowerCase() === String(selectedCategory).toLowerCase();
      });

  const handleProductClick = (productId) => {
    if (productId) {
      navigate(`/productDetail/${productId}`);
    }
  };

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

        {/* Filtros de categorías con prevención de duplicados */}
        <div className="px-4 mt-4 mb-6 flex items-center justify-start gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('Todos')}
            className={`text-xs font-medium px-5 py-1.5 rounded-full shrink-0 transition ${
              selectedCategory === 'Todos'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-gray-200 text-slate-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>

          {/* Categoría Automática Única para Ofertas */}
          <button
            onClick={() => setSelectedCategory('Descuentos')}
            className={`text-xs font-medium px-5 py-1.5 rounded-full shrink-0 transition ${
              selectedCategory === 'Descuentos'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
            }`}
          >
            🔥 Descuentos
          </button>

          {/* Listado de Categorías de la BD (Excluyendo la palabra "Descuentos" duplicada si existe) */}
          {categories
            .filter((cat) => {
              const name = (cat.name || cat.nombre || '').toLowerCase().trim();
              return name !== 'descuentos' && name !== 'ofertas' && name !== 'descuento';
            })
            .map((cat) => {
              const catName = cat.name || cat.nombre;
              return (
                <button
                  key={cat.id || catName}
                  onClick={() => setSelectedCategory(catName)}
                  className={`text-xs font-medium px-5 py-1.5 rounded-full shrink-0 transition ${
                    selectedCategory === catName
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-gray-200 text-slate-700 hover:bg-gray-300'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
        </div>

        {/* Sección Productos */}
        <section className="px-4">
          <h2 className="text-left font-bold text-slate-800 text-sm mb-3">
            {selectedCategory === 'Descuentos' ? 'Productos en Oferta' : 'Lo Más Vendido'}
          </h2>

          {loading ? (
            <p className="text-xs text-center text-gray-400 py-6">Cargando productos...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-xs text-center text-gray-400 py-6">
              No hay productos disponibles en "{selectedCategory}".
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {filteredProducts.map((product) => {
                const id = product.id || product._id;
                const originalPrice = Number(product.price || 0);
                const discount = Number(product.discount || 0);
                const finalPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
                const imageUrl = product.image_url || product.image;

                return (
                  <div
                    key={id}
                    onClick={() => handleProductClick(id)}
                    className="bg-white rounded-2xl p-2 shadow-sm cursor-pointer hover:shadow-md transition border border-gray-100 flex flex-col items-start overflow-hidden relative"
                  >
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full z-10 shadow-sm">
                        -{discount}%
                      </span>
                    )}

                    <div className="w-full aspect-square bg-gray-200 rounded-xl mb-2 overflow-hidden flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-400">Sin imagen</span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-slate-800 line-clamp-1 text-left w-full">
                      {product.name}
                    </span>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-purple-600 font-bold">
                        ${finalPrice.toFixed(2)}
                      </span>
                      {discount > 0 && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ${originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <footer className="bg-zinc-800 text-white py-6 px-4 text-center mt-8">
        <p className="text-xs font-mono text-gray-300 max-w-xs mx-auto leading-relaxed">
          "Involucrados en el estilo de vida deportivo, ofreciendo productos enfocados al bienestar y la alta calidad."
        </p>

        <Link
          to="/about"
          className="inline-block mt-4 text-xs font-semibold text-indigo-300 underline underline-offset-4 hover:text-white transition"
        >
          Sobre nosotros
        </Link>

        <p className="text-[10px] text-gray-400 mt-4">
          © 2026 Neways El Salvador. Todos los derechos reservados.
        </p>
      </footer>

      <BottomNav />
    </div>
  );
}