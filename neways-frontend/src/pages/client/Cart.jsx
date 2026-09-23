import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';
import API from '../../services/api';

export default function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Cargar ítems del carrito
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await API.get('/cart');
      setCartItems(response.data?.items || response.data || []);
    } catch (error) {
      console.info('Ruta /cart no detectada en backend. Usando almacenamiento local.');
      const localCart = JSON.parse(localStorage.getItem('user_cart') || '[]');
      setCartItems(localCart);
    }{
      setLoading(false);
    }
  };

  // Cambiar cantidad (+ / -)
  const handleQuantityChange = async (cartItemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    // Actualización optimista en interfaz
    const updatedCart = cartItems.map((item) => {
      const id = item.id || item.cart_item_id || item.variant_id;
      if (id === cartItemId) {
        return { ...item, quantity: newQty };
      }
      return item;
    });

    setCartItems(updatedCart);
    localStorage.setItem('user_cart', JSON.stringify(updatedCart));

    // Intentar sync con Backend
    try {
      await API.put(`/cart/${cartItemId}`, { quantity: newQty });
    } catch (error) {
      console.warn('No se pudo sincronizar la cantidad con la API');
    }
  };

  // Eliminar un producto del carrito
  const handleRemoveItem = async (cartItemId) => {
    const updatedCart = cartItems.filter((item) => {
      const id = item.id || item.cart_item_id || item.variant_id;
      return id !== cartItemId;
    });

    setCartItems(updatedCart);
    localStorage.setItem('user_cart', JSON.stringify(updatedCart));

    try {
      await API.delete(`/cart/${cartItemId}`);
    } catch (error) {
      console.warn('No se pudo eliminar el producto en la API');
    }
  };

  // Aplicar cupón de descuento ficticio
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'NEWAYS10') {
      setDiscount(0.10); // 10% de descuento
      alert('¡Cupón del 10% aplicado con éxito!');
    } else {
      alert('Cupón no válido');
      setDiscount(0);
    }
  };

  // Cálculos del Total
  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.price || item.product?.price || item.variant?.price || 0);
    const qty = Number(item.quantity || 1);
    return acc + price * qty;
  }, 0);

  const discountAmount = subtotal * discount;
  const shippingCost = subtotal > 0 ? (subtotal > 50 ? 0 : 3.50) : 0; // Envío gratis si pasa de $50
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  return (
    <div className="min-h-screen bg-slate-100 pb-32 flex flex-col justify-between font-sans">
      <div>
        <Header cartCount={cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} />

        <main className="px-4 pt-4 max-w-lg mx-auto">
          {/* Título de la vista */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-left font-bold text-slate-800 text-base">
              Carrito de Compras
            </h1>
            <span className="text-xs text-gray-500 font-medium">
              {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>

          {loading ? (
            <p className="text-xs text-center text-gray-400 py-10">Cargando tu carrito...</p>
          ) : cartItems.length === 0 ? (
            /* Estado Vacío */
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 mt-4">
              <span className="text-4xl block mb-2">🛒</span>
              <p className="text-xs font-bold text-slate-700">Tu carrito está vacío</p>
              <p className="text-[11px] text-gray-400 mt-1 mb-5">
                ¿Aún no te decides? Revisa nuestro catálogo y añade tus prendas favoritas.
              </p>
              <button
                onClick={() => navigate('/catalog')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition shadow-sm"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Lista de Ítems */}
              <div className="flex flex-col gap-3">
                {cartItems.map((item) => {
                  const itemId = item.id || item.cart_item_id || item.variant_id;
                  const product = item.product || item;
                  const name = product.name || item.name || 'Producto';
                  const price = Number(item.price || product.price || 0);
                  const imageUrl = item.image_url || product.image_url || product.image;
                  const color = item.color || item.variant?.color;
                  const size = item.size || item.variant?.size;

                  return (
                    <div
                      key={itemId}
                      className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center justify-between gap-3"
                    >
                      {/* Imagen */}
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                        {imageUrl ? (
                          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-gray-400">Sin foto</span>
                        )}
                      </div>

                      {/* Info del Producto */}
                      <div className="flex-1 text-left">
                        <h2 className="text-xs font-bold text-slate-800 line-clamp-1">{name}</h2>
                        
                        {/* Muestra variante si existe */}
                        {(size || color) && (
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                            {size && <span>Talla: {size}</span>}
                            {size && color && <span> | </span>}
                            {color && <span>Color: {color}</span>}
                          </p>
                        )}

                        <span className="text-xs text-indigo-600 font-extrabold block mt-1">
                          ${price.toFixed(2)}
                        </span>
                      </div>

                      {/* Controles de Cantidad y Eliminación */}
                      <div className="flex flex-col items-end justify-between h-16 py-0.5">
                        <button
                          onClick={() => handleRemoveItem(itemId)}
                          className="text-gray-400 hover:text-red-500 text-xs transition p-1"
                          title="Eliminar producto"
                        >
                          ✕
                        </button>

                        <div className="flex items-center border border-gray-200 rounded-lg bg-slate-50 overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(itemId, item.quantity || 1, -1)}
                            className="w-6 h-6 text-xs text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-800">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(itemId, item.quantity || 1, 1)}
                            className="w-6 h-6 text-xs text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Cupón de Descuento */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Código de cupón (ej. NEWAYS10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Aplicar
                </button>
              </form>

              {/* Resumen de la Orden */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2 mt-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-700">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Descuento ({discount * 100}%)</span>
                    <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500">
                  <span>Envío</span>
                  <span className="font-semibold text-slate-700">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600 font-bold">Gratis</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="h-px bg-gray-100 my-1"></div>

                <div className="flex justify-between text-sm font-bold text-slate-800">
                  <span>Total</span>
                  <span className="text-indigo-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Botón de Pago / ShippingData */}
              <button
                onClick={() => navigate('/shippingData')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition active:scale-[0.99] mt-1"
              >
                Proceder al Pago
              </button>
            </div>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}