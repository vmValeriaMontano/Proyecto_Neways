import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import CheckoutSteps from '../../components/common/CheckoutSteps';
import BottomNav from '../../components/common/BottomNav';
import API from '../../services/api';

export default function PaymentData() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [shipping, setShipping] = useState(null);
  const [form, setForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: '',
  });

  useEffect(() => {
    const loadCheckout = async () => {
      try {
        const savedShipping = JSON.parse(localStorage.getItem('checkout_shipping') || 'null');

        if (!savedShipping) {
          alert('Primero completa los datos de envío.');
          navigate('/shippingData');
          return;
        }

        setShipping(savedShipping);

        try {
          const response = await API.get('/cart');
          const items = response.data?.items || response.data || [];
          setCartItems(items.length ? items : JSON.parse(localStorage.getItem('user_cart') || '[]'));
        } catch (error) {
          const localCart = JSON.parse(localStorage.getItem('user_cart') || '[]');
          setCartItems(localCart);
        }
      } catch (error) {
        console.error('Error cargando checkout:', error);
        alert('No se pudo cargar la información del pedido.');
        navigate('/shippingData');
      } finally {
        setLoading(false);
      }
    };

    loadCheckout();
  }, [navigate]);

  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const price = Number(item.price || item.product?.price || item.variant?.price || 0);
        const qty = Number(item.quantity || 1);
        return sum + price * qty;
      }, 0),
    [cartItems]
  );

  const shippingCost = Number(shipping?.shippingCost || 0);
  const total = subtotal + shippingCost;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shipping) {
      alert('Falta la información de envío.');
      navigate('/shippingData');
      return;
    }

    if (!form.cardNumber || !form.cardName || !form.expiry || !form.cvc) {
      alert('Completa los datos de la tarjeta.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Tu carrito está vacío.');
      navigate('/cart');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        fullName: shipping.fullName,
        phone: shipping.phone,
        department: shipping.department,
        municipality: shipping.municipality,
        address: shipping.address,
        addressReference: shipping.reference || shipping.addressReference || null,
        card: {
          cardNumber: form.cardNumber,
          cardName: form.cardName,
          expiry: form.expiry,
          cvc: form.cvc,
        },
      };

      const response = await API.post('/orders', payload);

      localStorage.setItem('checkout_result', JSON.stringify(response.data));
      localStorage.removeItem('user_cart');
      localStorage.removeItem('checkout_shipping');

      navigate('/checkoutSuccess');
    } catch (error) {
      console.error('Error creando la orden:', error);
      const msg = error?.response?.data?.message || 'No se pudo procesar el pago. Intenta nuevamente.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600 font-medium">
        Cargando checkout...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-28 flex flex-col justify-between font-sans">
      <div>
        <Header cartCount={cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} />

        <main className="px-5 pt-2 max-w-md mx-auto">
          <CheckoutSteps currentStep={2} />

          <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <h1 className="text-xl font-extrabold text-slate-800 text-center">Método de pago</h1>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-gray-100 p-3 text-left">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Envío</span>
                  <span className="font-bold text-slate-800">${Number(shippingCost || 0).toFixed(2)}</span>
                </div>
                <div className="mt-2 text-[11px] text-gray-500">
                  {shipping?.department || 'Sin departamento'} • {shipping?.municipality || 'Sin municipio'}
                </div>
                <div className="mt-1 text-[11px] text-gray-500">{shipping?.address || 'Sin dirección'}</div>
              </div>

              <div className="rounded-2xl bg-gray-100 p-3 text-left">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Envío</span>
                  <span className="font-bold text-slate-800">${Number(shippingCost || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 mt-3 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-indigo-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-3 flex items-center gap-3">
                <span className="text-lg">💳</span>
                <input
                  type="text"
                  name="cardNumber"
                  value={form.cardNumber}
                  onChange={handleChange}
                  placeholder="Número de tarjeta"
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-gray-500 outline-none"
                  required
                />
              </div>

              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-3 flex items-center gap-3">
                <span className="text-lg">👤</span>
                <input
                  type="text"
                  name="cardName"
                  value={form.cardName}
                  onChange={handleChange}
                  placeholder="Nombre del titular"
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-gray-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-3 flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <input
                    type="text"
                    name="expiry"
                    value={form.expiry}
                    onChange={handleChange}
                    placeholder="MM/AA"
                    className="w-full bg-transparent text-xs text-slate-800 placeholder-gray-500 outline-none"
                    required
                  />
                </div>

                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-3 flex items-center gap-2">
                  <span className="text-lg">🔒</span>
                  <input
                    type="text"
                    name="cvc"
                    value={form.cvc}
                    onChange={handleChange}
                    placeholder="CVV"
                    className="w-full bg-transparent text-xs text-slate-800 placeholder-gray-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Procesando...' : 'Pagar pedido'}
              </button>
            </form>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}