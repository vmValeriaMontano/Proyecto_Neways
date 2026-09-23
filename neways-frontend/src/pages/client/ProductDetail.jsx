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

        // Seleccionar por defecto la primera variante disponible con stock
        const firstAvailable = prodVariants.find((v) => v.stock > 0) || prodVariants[0];
        if (firstAvailable) {
          setSelectedSize(firstAvailable.size);
          setSelectedColor(firstAvailable.color);
        }
      } catch (error) {
        console.error('Error al cargar detalle del producto:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductDetails();
  }, [id]);

  // Paleta de colores para la interfaz
  const getColorStyle = (colorName) => {
    const name = colorName ? colorName.toLowerCase() : '';
    if (name.includes('azul')) return '#3b82f6';
    if (name.includes('amarillo')) return '#eab308';
    if (name.includes('rosa')) return '#ec4899';
    if (name.includes('negro')) return '#0f172a';
    if (name.includes('blanco')) return '#ffffff';
    if (name.includes('rojo')) return '#ef4444';
    if (name.includes('verde')) return '#22c55e';
    return '#94a3b8';
  };

  // Listas únicas de Tallas y Colores existentes para este producto
  const availableSizes = [...new Set(variants.map((v) => v.size))];
  const availableColors = [...new Set(variants.map((v) => v.color))];

  // Buscar la variante exacta seleccionada
  const currentVariant = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  // Verificar si la combinación actual tiene stock disponible
  const currentStock = currentVariant ? currentVariant.stock : 0;
  const isCombinationAvailable = currentVariant && currentStock > 0;

  const handleAddToCart = async () => {
    if (!currentVariant) {
      alert('Esta combinación de talla y color no está disponible.');
      return;
    }

    if (quantity > currentStock) {
      alert(`Solo hay ${currentStock} unidades disponibles de esta combinación.`);
      return;
    }

    try {
      setAddingToCart(true);
      const payload = {
        variant_id: currentVariant.id,
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
        <Header cartCount={3} />

        <main className="px-5 pt-2">
          {/* Imagen Principal */}
          <div className="w-full h-64 bg-[#d9d9d9] rounded-3xl flex items-end p-6 relative overflow-hidden shadow-sm">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product?.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null}
            <h1 className="text-3xl font-extrabold text-slate-800 z-10 leading-tight drop-shadow-md">
              {product?.name || 'Producto'}
            </h1>
          </div>

          {/* Indicador de Precio y Stock */}
          <div className="flex items-center justify-between mt-4 mb-4">
            <span className="text-xl font-bold text-indigo-600">
              {priceFormatted}
            </span>

            {/* Aviso Dinámico de Stock */}
            {isCombinationAvailable ? (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                En stock: {currentStock} unidades
              </span>
            ) : (
              <span className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                Agotado / No disponible
              </span>
            )}
          </div>

          {/* Selección de Talla */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Talla
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {availableSizes.map((size) => {
                const isSelected = selectedSize === size;
                
                // Comprobar si la talla tiene stock en al menos un color
                const hasAnyStock = variants.some(
                  (v) => v.size === size && v.stock > 0
                );

                return (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      // Ajustar el color automáticamente a uno válido para esta talla
                      const validVariant = variants.find(
                        (v) => v.size === size && v.stock > 0
                      ) || variants.find((v) => v.size === size);
                      if (validVariant) setSelectedColor(validVariant.color);
                    }}
                    className={`w-11 h-9 rounded-2xl text-xs font-bold transition ${
                      isSelected
                        ? 'bg-[#2d3139] text-white shadow-md'
                        : 'bg-white text-slate-800 border border-gray-200 hover:bg-gray-50'
                    } ${!hasAnyStock ? 'opacity-40 line-through' : ''}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selección de Color */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Color {selectedColor && <span className="font-normal text-gray-500">({selectedColor})</span>}
            </label>
            <div className="flex items-center gap-3">
              {availableColors.map((col) => {
                const isSelected = selectedColor === col;

                // Buscar variante con la Talla seleccionada y este Color
                const variantForColor = variants.find(
                  (v) => v.size === selectedSize && v.color === col
                );

                const hasStock = variantForColor && variantForColor.stock > 0;
                const exists = Boolean(variantForColor);

                return (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    disabled={!exists}
                    style={{ backgroundColor: getColorStyle(col) }}
                    className={`w-9 h-9 rounded-full border border-black/20 relative transition-transform ${
                      isSelected ? 'ring-4 ring-indigo-500/30 scale-110 border-indigo-600' : ''
                    } ${!hasStock ? 'opacity-30 cursor-not-allowed' : ''}`}
                    title={`${col} ${!exists ? '(No disponible)' : !hasStock ? '(Agotado)' : ''}`}
                  >
                    {/* Tachado si la combinación no existe o está agotada */}
                    {!hasStock && (
                      <span className="absolute inset-0 flex items-center justify-center text-red-600 text-xs font-bold">
                        ✕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-white rounded-2xl p-4 shadow-sm min-h-[80px] mb-6 border border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed">
              {product?.description || 'Sin descripción disponible.'}
            </p>
          </div>

          {/* Control de Cantidad y Botón de Carrito */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden h-11 shadow-sm">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={!isCombinationAvailable}
                className="w-8 h-full text-gray-500 font-medium text-base flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
              >
                -
              </button>
              <span className="w-10 text-center font-bold text-slate-800 text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                disabled={!isCombinationAvailable || quantity >= currentStock}
                className="w-8 h-full text-gray-500 font-medium text-base flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || !isCombinationAvailable}
              className={`flex-1 text-white font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] ${
                isCombinationAvailable
                  ? 'bg-[#6366f1] hover:bg-[#4f46e5]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="text-sm">🛒</span>
              <span>
                {addingToCart
                  ? 'Agregando...'
                  : !isCombinationAvailable
                  ? 'Sin Stock Disponible'
                  : 'Agregar al carrito'}
              </span>
            </button>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}