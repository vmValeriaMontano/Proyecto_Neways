import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CircleCheck } from 'lucide-react';
import Header from '../../components/common/Header';
import CheckoutSteps from '../../components/common/CheckoutSteps';
import BottomNav from '../../components/common/BottomNav';

export default function CheckoutSuccess() {
  const navigate = useNavigate();

  const checkoutResult = JSON.parse(
    localStorage.getItem('checkout_result') || 'null'
  );

  // Si no existe información del pedido
  if (!checkoutResult) {
    return (
      <div className="min-h-screen bg-[#f1f1f1] flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800 mb-3">
            No hay información del pedido
          </h1>

          <button
            onClick={() => navigate('/')}
            className="bg-[#6366f1] text-white px-6 py-3 rounded-xl font-bold"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const subtotal = Number(checkoutResult.subtotal || 0);
  const shipping = Number(checkoutResult.shipping || 0);
  const total = Number(checkoutResult.total || 0);
  const orderId = checkoutResult.orderId || '00000';

  return (
    <div className="min-h-screen bg-[#f1f1f1] text-slate-800 pb-24 font-sans">

      {/* Header */}
      <Header cartCount={0} />

      {/* Contenido */}
      <div className="mx-auto w-full max-w-md min-h-screen bg-[#f1f1f1]">

        <main className="px-5 pt-1">

          {/* Pasos del checkout */}
          <CheckoutSteps currentStep={3} />

          {/* Check grande de compra exitosa */}
          <div className="flex justify-center mt-1 mb-3">
            <CircleCheck
              size={46}
              strokeWidth={1.8}
              className="text-slate-800"
            />
          </div>

          {/* Título */}
          <h1 className="text-center text-[25px] font-extrabold text-slate-900">
            Compra realizada con éxito
          </h1>

          <p className="text-center text-[16px] text-gray-500 mt-3 mb-7">
            Gracias por tu compra
          </p>

          {/* Resumen */}
          <section className="bg-white rounded-2xl shadow-sm px-6 py-5 mb-7">

            <h2 className="text-center text-[20px] font-extrabold text-slate-900 mb-5">
              Resumen de pedido
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between items-center">
                <span className="text-[15px] text-gray-600">
                  Producto
                </span>

                <span className="text-[15px] font-medium text-slate-800">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[15px] text-gray-600">
                  Envío
                </span>

                <span className="text-[15px] font-medium text-slate-800">
                  ${shipping.toFixed(2)}
                </span>
              </div>

            </div>
          </section>

          {/* Total */}
          <section className="bg-white rounded-2xl shadow-sm px-6 py-5 mb-7 flex justify-between items-center">

            <span className="text-[20px] font-extrabold text-slate-900">
              Total pagado
            </span>

            <span className="text-[20px] font-extrabold text-[#6366f1]">
              ${total.toFixed(2)}
            </span>

          </section>

          {/* Pedido */}
          <section className="bg-white rounded-2xl shadow-sm px-6 py-5 mb-7 flex items-center gap-5">

            <Truck
              size={48}
              strokeWidth={1.7}
              className="text-gray-600 shrink-0"
            />

            <div>
              <p className="text-[16px] font-medium text-slate-700">
                Pedido #{String(orderId).padStart(5, '0')}
              </p>

              <p className="text-[14px] text-gray-500 mt-1">
                Recibirás tu pedido pronto
              </p>

              {checkoutResult.transactionId && (
                <p className="text-[11px] text-gray-400 mt-2">
                  Transacción: {checkoutResult.transactionId}
                </p>
              )}
            </div>

          </section>

          {/* Botón */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full bg-[#6366f1] hover:bg-[#5558e8] text-white font-bold text-[15px] py-4 rounded-xl transition"
          >
            Volver al inicio
          </button>

        </main>
      </div>

      {/* Menú inferior */}
      <BottomNav />

    </div>
  );
}