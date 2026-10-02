import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import CheckoutSteps from '../../components/common/CheckoutSteps';
import BottomNav from '../../components/common/BottomNav';

export default function PaymentData() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 pb-28 flex flex-col justify-between font-sans">
      <div>
        <Header cartCount={3} />

        <main className="px-5 pt-2 max-w-md mx-auto">
          <CheckoutSteps currentStep={2} />

          <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
            <h1 className="text-xl font-extrabold text-slate-800">
              Método de pago
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Los pagos aún no están habilitados. No se realizará ningún cargo.
            </p>
            <button
              type="button"
              onClick={() => navigate('/shippingData')}
              className="mt-6 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
            >
              Volver a datos de envío
            </button>
          </section>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}