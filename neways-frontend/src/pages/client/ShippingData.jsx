import { lazy, Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';
import CheckoutSteps from '../../components/common/CheckoutSteps';
import API from '../../services/api';

const ShippingMap = lazy(() => import('../../components/common/ShippingMap'));

const hasSavedCoordinates = (data) => (
  Number.isFinite(data.latitude) && Number.isFinite(data.longitude)
);

const normalizeLocationName = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\b(departamento|department|province|provincia)\b/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const findLocationMatch = (locations, names) => {
  const normalizedNames = names.map(normalizeLocationName).filter(Boolean);
  const exactMatch = locations.find((location) => (
    normalizedNames.includes(normalizeLocationName(location.name))
  ));

  if (exactMatch) return exactMatch;

  const partialMatches = locations.filter((location) => {
    const locationName = normalizeLocationName(location.name);
    return normalizedNames.some((name) => (
      name.startsWith(`${locationName} `) || locationName.startsWith(`${name} `)
    ));
  });

  return partialMatches.length === 1 ? partialMatches[0] : null;
};

export default function ShippingData() {
  const navigate = useNavigate();

  // Cargar datos previos si existen
  const savedData = JSON.parse(localStorage.getItem('checkout_shipping') || '{}');
  const savedCoordinates = hasSavedCoordinates(savedData);

  const [departments, setDepartments] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedDeptObj, setSelectedDeptObj] = useState(null);
  const [addressSearch, setAddressSearch] = useState(savedData.address || '');
  const [addressSearchVersion, setAddressSearchVersion] = useState(savedCoordinates ? -1 : 0);
  const [mapMessage, setMapMessage] = useState('Escribe una dirección o mueve el marcador para elegir el punto de entrega.');
  const reverseGeocodeTimer = useRef(null);
  const reverseGeocodeController = useRef(null);
  const savedDepartment = savedData.department || '';

  const [formData, setFormData] = useState({
    fullName: savedData.fullName || '',
    phone: savedData.phone || '',
    department: savedData.department || '',
    municipality: savedData.municipality || '',
    address: savedData.address || '',
    houseNumber: savedData.houseNumber || '',
    reference: savedData.reference || '',
    shippingCost: savedData.shippingCost || 0,
    latitude: savedCoordinates ? savedData.latitude : null,
    longitude: savedCoordinates ? savedData.longitude : null,
  });

  const [loading, setLoading] = useState(false);

  const fetchMunicipalities = useCallback(async (departmentId) => {
    try {
      const res = await API.get(`/locations/departments/${departmentId}/municipalities`);
      return res.data || [];
    } catch (err) {
      console.error('Error al obtener municipios:', err);
      return null;
    }
  }, []);

  // Cargar lista de departamentos al montar
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await API.get('/locations/departments');
        setDepartments(res.data || []);

        // Si había un departamento previamente guardado, cargar sus municipios
        if (savedDepartment) {
          const match = res.data.find((d) => d.name === savedDepartment);
          if (match) {
            setSelectedDeptObj(match);
            const savedMunicipalities = await fetchMunicipalities(match.id);
            if (savedMunicipalities) setMunicipalities(savedMunicipalities);
          }
        }
      } catch (err) {
        console.error('Error al obtener departamentos:', err);
      }
    };
    fetchDepartments();
  }, [fetchMunicipalities, savedDepartment]);

  useEffect(() => () => {
    clearTimeout(reverseGeocodeTimer.current);
    reverseGeocodeController.current?.abort();
  }, []);

  useEffect(() => {
    if (addressSearchVersion < 0 || addressSearch.trim().length < 4) return undefined;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const query = [addressSearch, formData.municipality, formData.department]
        .filter(Boolean)
        .join(', ');
      const params = new URLSearchParams({ format: 'jsonv2', limit: '1', q: query });

      try {
        setMapMessage('Buscando la dirección en el mapa...');
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`Geocodificación fallida (${response.status}).`);

        const [result] = await response.json();
        if (!result) {
          setMapMessage('No encontramos esa dirección. Puedes elegir el punto directamente en el mapa.');
          return;
        }

        setFormData((prev) => ({
          ...prev,
          latitude: Number(result.lat),
          longitude: Number(result.lon),
        }));
        setMapMessage('Ubicación encontrada. Puedes ajustar el punto moviendo el marcador.');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error buscando la dirección en el mapa:', error);
          setMapMessage('No fue posible buscar la dirección. Puedes elegir el punto directamente en el mapa.');
        }
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    addressSearch,
    addressSearchVersion,
    formData.department,
    formData.municipality,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'department' || name === 'municipality' || name === 'address') {
      clearTimeout(reverseGeocodeTimer.current);
      reverseGeocodeController.current?.abort();
    }

    if (name === 'department') {
      const deptObj = departments.find((d) => d.name === value);
      setSelectedDeptObj(deptObj || null);

      setFormData((prev) => ({
        ...prev,
        department: value,
        municipality: '', // Reiniciar municipio si cambia el departamento
        shippingCost: deptObj ? Number(deptObj.shipping_cost) : 0,
        latitude: null,
        longitude: null,
      }));
      setAddressSearchVersion((version) => (version < 0 ? 0 : version + 1));

      if (deptObj) {
        fetchMunicipalities(deptObj.id).then((result) => {
          if (result) setMunicipalities(result);
        });
      } else {
        setMunicipalities([]);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === 'address' || name === 'municipality'
          ? { latitude: null, longitude: null }
          : {}),
      }));
      if (name === 'address') {
        setAddressSearch(value);
        setAddressSearchVersion((version) => version + 1);
      } else if (name === 'municipality') {
        setAddressSearchVersion((version) => (version < 0 ? 0 : version + 1));
      }
    }
  };

  const handleMapLocationSelect = ({ lat, lng }) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    setAddressSearchVersion(-1);
    setMapMessage('Consultando la dirección del punto seleccionado...');

    clearTimeout(reverseGeocodeTimer.current);
    reverseGeocodeController.current?.abort();
    const controller = new AbortController();
    reverseGeocodeController.current = controller;

    reverseGeocodeTimer.current = setTimeout(async () => {
      const params = new URLSearchParams({
        format: 'jsonv2',
        lat: String(lat),
        lon: String(lng),
        zoom: '18',
        addressdetails: '1',
      });

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`Geocodificación inversa fallida (${response.status}).`);

        const result = await response.json();
        if (!result.display_name) {
          setMapMessage('No encontramos una dirección para este punto; puedes escribirla manualmente.');
          return;
        }
        if (controller.signal.aborted) return;

        const parts = result.address || {};
        const address = [
          [parts.house_number, parts.road].filter(Boolean).join(' '),
          parts.neighbourhood || parts.suburb,
          parts.city || parts.town || parts.village,
        ].filter(Boolean).join(', ') || result.display_name;
        setAddressSearch(address);

        const departmentNames = [
          parts.state,
          parts.state_district,
          parts.province,
          parts.region,
          parts.county,
        ];
        const municipalityNames = [
          parts.city,
          parts.town,
          parts.village,
          parts.municipality,
          parts.city_district,
          parts.suburb,
          parts.district,
          parts.borough,
          parts.county,
        ];
        const department = findLocationMatch(departments, departmentNames);

        if (!department) {
          setSelectedDeptObj(null);
          setMunicipalities([]);
          setFormData((prev) => ({
            ...prev,
            address,
            department: '',
            municipality: '',
            shippingCost: 0,
          }));
          setMapMessage('Dirección actualizada; selecciona el departamento y municipio manualmente.');
          return;
        }

        const departmentMunicipalities = await fetchMunicipalities(department.id);
        if (controller.signal.aborted) return;
        if (!departmentMunicipalities) {
          setSelectedDeptObj(department);
          setMunicipalities([]);
          setFormData((prev) => ({
            ...prev,
            address,
            department: department.name,
            municipality: '',
            shippingCost: Number(department.shipping_cost),
          }));
          setMapMessage('Departamento actualizado; no se pudieron cargar los municipios. Selecciónalo manualmente.');
          return;
        }

        const municipality = findLocationMatch(departmentMunicipalities, municipalityNames);
        setSelectedDeptObj(department);
        setMunicipalities(departmentMunicipalities);
        setFormData((prev) => ({
          ...prev,
          address,
          department: department.name,
          municipality: municipality?.name || '',
          shippingCost: Number(department.shipping_cost),
        }));
        setMapMessage(municipality
          ? 'Dirección, departamento y municipio actualizados desde el punto seleccionado.'
          : 'Dirección y departamento actualizados; selecciona el municipio manualmente.');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error obteniendo la dirección del punto:', error);
          setMapMessage('No fue posible obtener la dirección del punto. Puedes escribirla manualmente.');
        }
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.department || !formData.address) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    try {
      setLoading(true);
      // Guardar localmente para el siguiente paso (incluye costo de envío)
      localStorage.setItem('checkout_shipping', JSON.stringify(formData));

      // Sync opcional con backend si existe borrador de orden
      await API.post('/orders/shipping-address', formData).catch(() => {});

      // Redirigir al Paso 2: Pago
      navigate('/paymentData');
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
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.name}>
                      {dep.name}
                    </option>
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
                  {municipalities.map((mun) => (
                    <option key={mun.id} value={mun.name}>
                      {mun.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Muestra costo de envío según el departamento seleccionado */}
            {selectedDeptObj && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2.5 flex justify-between items-center text-xs text-indigo-900 font-medium">
                <span>Costo de envío estimado:</span>
                <span className="font-bold text-indigo-700">${Number(selectedDeptObj.shipping_cost).toFixed(2)}</span>
              </div>
            )}

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

            <div className="bg-white rounded-2xl p-3 flex items-center gap-3 border border-gray-100 shadow-xs focus-within:ring-2 focus-within:ring-indigo-400">
              <span className="text-gray-700 text-lg pl-1" aria-hidden="true">🏢</span>
              <div className="flex-1">
                <label htmlFor="houseNumber" className="sr-only">Número de casa o apartamento</label>
                <input
                  id="houseNumber"
                  type="text"
                  name="houseNumber"
                  placeholder="Número de casa o apartamento"
                  value={formData.houseNumber}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 placeholder-gray-500 outline-none bg-transparent"
                />
              </div>
            </div>

            <section className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs">
              <h2 className="text-xs font-semibold text-slate-800 mb-1">Ubica tu dirección en el mapa</h2>
              <p className="text-[10px] text-gray-500 mb-2">
                La ubicación se moverá al escribir una dirección. También puedes arrastrar el marcador.
              </p>
              <Suspense fallback={<div className="h-56 w-full rounded-xl bg-slate-100" />}>
                <ShippingMap
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationSelect={handleMapLocationSelect}
                />
              </Suspense>
              <p className="text-[10px] text-gray-500 mt-2" role="status" aria-live="polite">
                {mapMessage}
              </p>
            </section>

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