import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';
import CheckoutSteps from '../../components/common/CheckoutSteps';
import API from '../../services/api';

// Lista orientativa para El Salvador
const DEPARTAMENTOS_SV = {
  'San Salvador': ['San Salvador', 'Soyapango', 'Ilopango', 'Mejicanos', 'Apopa', 'Santa Tecla'],
  'La Libertad': ['Santa Tecla', 'Antiguo Cuscatlán', 'Nuevo Cuscatlán', 'Colón', 'Zaragoza'],
  'Santa Ana': ['Santa Ana', 'Chalchuapa', 'Metapán'],
  'San Miguel': ['San Miguel', 'Ciudad Barrios'],
  'Sonsonate': ['Sonsonate', 'Acajutla'],
};

export default function ShippingData() {
  const navigate = useNavigate();

  // Cargar datos previos si existen
  const savedData = JSON.parse(localStorage.getItem('checkout_shipping') || '{}');

  const [formData, setFormData] = useState({
    fullName: savedData.fullName || '',
    phone: savedData.phone || '',
    department: savedData.department || '',
    municipality: savedData.municipality || '',
    address: savedData.address || '',
    reference: savedData.reference || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'department') {
        updated.municipality = ''; // Reiniciar municipio si cambia el departamento
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.department || !formData.address) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    try {
      setLoading(true);
      // Guardar localmente para el siguiente paso
      localStorage.setItem('checkout_shipping', JSON.stringify(formData));

      // Sync opcional con backend si existe borrador de orden
      await API.post('/orders/shipping-address', formData).catch(() => {});

      // Redirigir al Paso 2: Pago
      navigate('/checkout/payment');
    } catch (error) {
      console.error('Error guardando dirección:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-28 flex flex-col justify-between font-sans">
      <div>
        <Header cartCount={3} />

        <main className="px-5 pt-2 max-w-md mx-auto">
          {/* Componente Reutilizable de Pasos */}
          <CheckoutSteps currentStep={1} />

          {/* Encabezado de Sección */}
          <div className="text-left mb-5">
            <h1 className="font-extrabold text-slate-800 text-xl">
              Datos de envio
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Completa la información para recibir tu pedido
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Nombre Completo */}
            <div className="bg-white rounded-2xl p-3 flex items-center gap-3 border border-gray-100 shadow-xs focus-within:ring-2 focus-within:ring-indigo-400">
              <span className="text-gray-700 text-lg pl-1">👤</span>
              <input
                type="text"
                name="fullName"
                placeholder="Nombre Completo"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full text-xs text-slate-800 placeholder-gray-500 outline-none bg-transparent"
                required
              />
            </div>

            {/* Teléfono */}
            <div className="bg-white rounded-2xl p-3 flex items-center gap-3 border border-gray-100 shadow-xs focus-within:ring-2 focus-within:ring-indigo-400">
              <span className="text-gray-700 text-lg pl-1">📞</span>
              <input
                type="tel"
                name="phone"
                placeholder="Teléfono"
                value={formData.phone}
                onChange={handleChange}
                className="w-full text-xs text-slate-800 placeholder-gray-500 outline-none bg-transparent"
                required
              />
            </div>

            {/* Departamento y Municipio (Fila) */}
            <div className="grid grid-cols-2 gap-2">
              {/* Departamento */}
              <div className="bg-white rounded-2xl p-3 flex items-center gap-2 border border-gray-100 shadow-xs focus-within:ring-2 focus-within:ring-indigo-400">
                <span className="text-gray-700 text-base">📍</span>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full text-xs text-slate-700 outline-none bg-transparent cursor-pointer"
                  required
                >
                  <option value="" disabled>Departamento</option>
                  {Object.keys(DEPARTAMENTOS_SV).map((dep) => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>

              {/* Municipio */}
              <div className="bg-white rounded-2xl p-3 flex items-center gap-2 border border-gray-100 shadow-xs focus-within:ring-2 focus-within:ring-indigo-400">
                <select
                  name="municipality"
                  value={formData.municipality}
                  onChange={handleChange}
                  className="w-full text-xs text-slate-700 outline-none bg-transparent cursor-pointer"
                  disabled={!formData.department}
                  required
                >
                  <option value="" disabled>Municipio</option>
                  {formData.department &&
                    DEPARTAMENTOS_SV[formData.department]?.map((mun) => (
                      <option key={mun} value={mun}>{mun}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Dirección de Entrega */}
            <div className="bg-white rounded-2xl p-3 flex items-start gap-3 border border-gray-100 shadow-xs focus-within:ring-2 focus-within:ring-indigo-400">
              <span className="text-gray-700 text-lg pl-1 pt-0.5">🏠</span>
              <div className="flex-1">
                <input
                  type="text"
                  name="address"
                  placeholder="Dirrección de entrega"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 placeholder-gray-500 outline-none bg-transparent"
                  required
                />
                <span className="text-[10px] text-gray-400 block text-left mt-0.5">
                  ej.Calle el Mirador , Av principal
                </span>
              </div>
            </div>

            {/* Referencia de Dirección */}
            <div className="bg-white rounded-2xl p-3 flex items-start gap-3 border border-gray-100 shadow-xs focus-within:ring-2 focus-within:ring-indigo-400">
              <div className="w-5 h-5 opacity-0"></div> {/* Espaciador visual para alineación */}
              <div className="flex-1 text-left">
                <input
                  type="text"
                  name="reference"
                  placeholder="Referencia de dirrección"
                  value={formData.reference}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 placeholder-gray-500 outline-none bg-transparent"
                />
                <span className="text-[10px] text-gray-400 block text-left mt-0.5">
                  ej.Csa blanca con portón negro
                </span>
              </div>
            </div>

            {/* Botón Continuar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition active:scale-[0.99] mt-4 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Guardando...' : 'continuar'}</span>
              <span className="text-sm">→</span>
            </button>
          </form>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}