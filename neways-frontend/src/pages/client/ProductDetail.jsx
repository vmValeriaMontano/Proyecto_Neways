import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';
import API from '../../services/api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Estados de la vista
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/products/${id}`);
        const data = res.data;
        setProduct(data);

        const prodVariants = data.variants || [];
        setVariants(prodVariants);

        if (prodVariants.length > 0) {
          setSelectedSize(prodVariants[0].size);
          setSelectedColor(prodVariants[0].color);
        }
      } catch (error) {
        console.error('Error al cargar detalle del producto:', error);
      } finally { // <-- CORREGIDO AQUÍ (Antes decía "} font-medium {")
        setLoading(false);
      }
    };

    if (id) fetchProductDetails();
  }, [id]);

  // Manejo de colores por defecto si la BD no envía códigos HEX exactos
  const getColorStyle = (colorName) => {
    const name = colorName.toLowerCase();
    if (name.includes('azul') || name.includes('blue')) return '#b4c6ff';
    if (name.includes('amarillo') || name.includes('yellow')) return '#fde68a';
    if (name.includes('rosa') || name.includes('pink') || name.includes('púrpura')) return '#f5d0fe';
    if (name.includes('negro') || name.includes('black')) return '#1e293b';
    if (name.includes('blanco') || name.includes('white')) return '#ffffff';
    return '#cbd5e1';
  };

  const availableSizes = [...new Set(variants.map((v) => v.size))];
  const availableColors = [...new Set(variants.map((v) => v.color))];

  // Si no hay variantes dinámicas, cargamos opciones de respaldo para reflejar la UI
  const displaySizes = availableSizes.length > 0 ? availableSizes : ['S', 'M', 'L', 'XL'];
  const displayColors = availableColors.length > 0 ? availableColors : ['Azul', 'Amarillo', 'Rosa'];

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const selectedVariant = variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );

      const payload = {
        variant_id: selectedVariant ? selectedVariant.id : id,
        quantity: quantity
      };

      await API.post('/cart', payload);
      alert('¡Producto agregado al carrito con éxito!');
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('No se pudo agregar al carrito. Verifica tu conexión.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-xs text-gray-500">Cargando producto...</p>
      </div>
    );
  }

  const imageUrl =
    product?.image_url ||
    product?.image ||
    product?.imageUrl ||
    (product?.images && product?.images[0]);

  const priceFormatted =
    typeof product?.price === 'number'
      ? `$${Number(product.price).toFixed(2)}`
      : product?.price || '$0.00';

  return (
    <div className="min-h-screen bg-[#f3f3f3] pb-28 flex flex-col justify-between font-sans">
      <div>
        {/* Header Superior */}
        <Header cartCount={3} />

        <main className="px-5 pt-2">
          {/* Tarjeta / Imagen Principal del Producto */}
          <div className="w-full h-64 bg-[#d9d9d9] rounded-3xl flex items-end p-6 relative overflow-hidden shadow-sm">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product?.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null}
            <h1 className="text-3xl font-extrabold text-slate-800 z-10 leading-tight">
              {product?.name || 'Producto'}
            </h1>
          </div>

          {/* Carrusel / Indicadores de Puntos */}
          <div className="flex justify-center gap-2 mt-3 mb-6">
            {[0, 1, 2, 3].map((idx) => (
              <span
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`h-2.5 rounded-full cursor-pointer transition-all ${
                  activeImageIndex === idx
                    ? 'w-6 bg-indigo-500'
                    : 'w-2.5 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Precio */}
          <div className="mb-4">
            <span className="text-base font-bold text-indigo-400 block">
              {priceFormatted}
            </span>
          </div>

          {/* Sección de Color */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Color
            </label>
            <div className="flex items-center gap-3">
              {displayColors.map((col) => {
                const isSelected = selectedColor === col;
                return (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    style={{ backgroundColor: getColorStyle(col) }}
                    className={`w-9 h-9 rounded-full border border-black/10 transition-transform ${
                      isSelected ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105' : ''
                    }`}
                    title={col}
                  />
                );
              })}
            </div>
          </div>

          {/* Sección de Talla */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Talla
            </label>
            <div className="flex items-center gap-2">
              {displaySizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-11 h-9 rounded-2xl text-xs font-bold transition ${
                      isSelected
                        ? 'bg-[#2d3139] text-white'
                        : 'bg-white text-slate-800 border border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caja de Descripción */}
          <div className="bg-white rounded-2xl p-4 shadow-sm min-h-[90px] mb-6">
            <p className="text-xs text-gray-500 leading-relaxed">
              {product?.description || 'Descripcion del producto'}
            </p>
          </div>

          {/* Selector de Cantidad y Botón de Agregar al Carrito */}
          <div className="flex items-center gap-3 mb-4">
            {/* Control de Cantidad */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden h-11">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-full text-gray-400 font-medium text-base flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-10 text-center font-bold text-slate-800 text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-full text-gray-400 font-medium text-base flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>

            {/* Botón Principal */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition"
            >
              <span className="text-sm">🛒</span>
              <span>{addingToCart ? 'Agregando...' : 'Agregar al carrito'}</span>
            </button>
          </div>
        </main>
      </div>

      {/* Navegación Inferior */}
      <BottomNav />
    </div>
  );
}