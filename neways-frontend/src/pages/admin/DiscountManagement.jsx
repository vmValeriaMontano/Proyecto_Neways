import { useCallback, useEffect, useState } from 'react';
import { Copy, Edit2, Plus, RefreshCw, Tag, Trash2 } from 'lucide-react';
import API from '../../services/api';

const initialForm = {
  name: '',
  code: '',
  scope: 'global',
  category_id: '',
  product_id: '',
  color: '',
  size: '',
  amount_type: 'percent',
  amount: '',
  starts_at: '',
  ends_at: '',
  max_redemptions: '',
  is_active: true,
};

const toDateTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const formatDate = (value) => (
  value ? new Date(value).toLocaleString() : 'Sin límite'
);

const getDiscountStatus = (discount) => {
  if (!discount.is_active) return 'Inactivo';
  if (discount.max_redemptions && Number(discount.redemption_count) >= Number(discount.max_redemptions)) {
    return 'Agotado';
  }
  const now = Date.now();
  if (discount.starts_at && new Date(discount.starts_at).getTime() > now) return 'Programado';
  if (discount.ends_at && new Date(discount.ends_at).getTime() <= now) return 'Vencido';
  return 'Activo';
};

const makeCouponCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
};

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [discountResponse, categoryResponse, productResponse] = await Promise.all([
        API.get('/admin/discounts'),
        API.get('/admin/categories'),
        API.get('/products'),
      ]);
      setDiscounts(discountResponse.data || []);
      setCategories(categoryResponse.data || []);
      setProducts(productResponse.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudieron cargar los descuentos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load remote discount data when the management tab is mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleEdit = (discount) => {
    setEditingId(discount.id);
    setForm({
      name: discount.name,
      code: discount.code || '',
      scope: discount.scope,
      category_id: discount.category_id || '',
      product_id: discount.product_id || '',
      color: discount.color || '',
      size: discount.size || '',
      amount_type: discount.amount_type,
      amount: discount.amount,
      starts_at: toDateTimeInput(discount.starts_at),
      ends_at: toDateTimeInput(discount.ends_at),
      max_redemptions: discount.max_redemptions || '',
      is_active: discount.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      amount: Number(form.amount),
      category_id: form.category_id || null,
      product_id: form.product_id || null,
      max_redemptions: form.max_redemptions || null,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    };

    try {
      if (editingId) {
        await API.put(`/admin/discounts/${editingId}`, payload);
      } else {
        await API.post('/admin/discounts', payload);
      }
      resetForm();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo guardar el descuento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (discount) => {
    if (!window.confirm(`¿Desactivar "${discount.name}"?`)) return;
    setError('');
    try {
      await API.delete(`/admin/discounts/${discount.id}`);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo desactivar el descuento.');
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      setError('No se pudo copiar el código. Selecciónalo y cópialo manualmente.');
    }
  };

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const fieldClass = 'w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600';
  const labelClass = 'mb-1 block text-xs font-semibold uppercase text-gray-600';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Descuentos y cupones</h2>
          <p className="mt-1 text-sm text-gray-500">
            Crea promociones globales o por categoría, color, talla y prenda. Los descuentos no se acumulan: se aplica el mejor por artículo.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Tag className="text-purple-600" size={19} />
          <h3 className="text-lg font-bold text-slate-800">
            {editingId ? 'Editar descuento' : 'Crear descuento'}
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className={labelClass}>Nombre de la promoción</span>
            <input className={fieldClass} required value={form.name} onChange={(event) => updateForm('name', event.target.value)} />
          </label>
          <label>
            <span className={labelClass}>Código (opcional)</span>
            <span className="flex gap-2">
              <input
                className={fieldClass}
                value={form.code}
                maxLength={32}
                placeholder="Vacío = descuento automático"
                onChange={(event) => {
                  const code = event.target.value.toUpperCase();
                  setForm((current) => ({
                    ...current,
                    code,
                    max_redemptions: code ? current.max_redemptions : '',
                  }));
                }}
              />
              <button
                type="button"
                title="Generar código"
                onClick={() => updateForm('code', makeCouponCode())}
                className="shrink-0 rounded-lg border border-slate-300 px-3 text-slate-600 hover:bg-slate-50"
              >
                Generar
              </button>
            </span>
          </label>

          <label>
            <span className={labelClass}>Aplicar a</span>
            <select className={fieldClass} value={form.scope} onChange={(event) => updateForm('scope', event.target.value)}>
              <option value="global">Toda la tienda</option>
              <option value="category">Categoría / estilo</option>
              <option value="color">Color</option>
              <option value="size">Talla</option>
              <option value="product">Prenda específica</option>
            </select>
          </label>

          {form.scope === 'category' && (
            <label>
              <span className={labelClass}>Categoría</span>
              <select className={fieldClass} required value={form.category_id} onChange={(event) => updateForm('category_id', event.target.value)}>
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
          )}
          {form.scope === 'product' && (
            <label>
              <span className={labelClass}>Prenda</span>
              <select className={fieldClass} required value={form.product_id} onChange={(event) => updateForm('product_id', event.target.value)}>
                <option value="">Selecciona una prenda</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
            </label>
          )}
          {form.scope === 'color' && (
            <label>
              <span className={labelClass}>Color exacto de la variante</span>
              <input className={fieldClass} required value={form.color} onChange={(event) => updateForm('color', event.target.value)} placeholder="Ej. Negro" />
            </label>
          )}
          {form.scope === 'size' && (
            <label>
              <span className={labelClass}>Talla exacta de la variante</span>
              <input className={fieldClass} required value={form.size} onChange={(event) => updateForm('size', event.target.value)} placeholder="Ej. M" />
            </label>
          )}

          <label>
            <span className={labelClass}>Tipo de descuento</span>
            <select className={fieldClass} value={form.amount_type} onChange={(event) => updateForm('amount_type', event.target.value)}>
              <option value="percent">Porcentaje</option>
              <option value="fixed">Monto fijo por prenda</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>{form.amount_type === 'percent' ? 'Porcentaje (%)' : 'Monto ($)'}</span>
            <input
              className={fieldClass}
              type="number"
              min="0.01"
              max={form.amount_type === 'percent' ? 100 : undefined}
              step="0.01"
              required
              value={form.amount}
              onChange={(event) => updateForm('amount', event.target.value)}
            />
          </label>

          <label>
            <span className={labelClass}>Disponible desde (opcional)</span>
            <input className={fieldClass} type="datetime-local" value={form.starts_at} onChange={(event) => updateForm('starts_at', event.target.value)} />
          </label>
          <label>
            <span className={labelClass}>Vence (opcional)</span>
            <input className={fieldClass} type="datetime-local" value={form.ends_at} onChange={(event) => updateForm('ends_at', event.target.value)} />
          </label>

          {form.code && (
            <label>
              <span className={labelClass}>Máximo de canjes (opcional)</span>
              <input
                className={fieldClass}
                type="number"
                min="1"
                step="1"
                value={form.max_redemptions}
                onChange={(event) => updateForm('max_redemptions', event.target.value)}
                placeholder="Sin límite"
              />
            </label>
          )}
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.is_active} onChange={(event) => updateForm('is_active', event.target.checked)} />
            Descuento activo
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Cancelar edición
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
          >
            {saving ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear descuento'}
          </button>
        </div>
      </form>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-bold text-slate-800">Promociones creadas</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
            <RefreshCw className="animate-spin" size={17} /> Cargando descuentos...
          </div>
        ) : discounts.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">Aún no hay descuentos creados.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {discounts.map((discount) => {
              const status = getDiscountStatus(discount);
              return (
                <article key={discount.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-800">{discount.name}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        status === 'Activo' ? 'bg-emerald-100 text-emerald-700'
                          : status === 'Programado' ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {discount.amount_type === 'percent' ? `${Number(discount.amount)}%` : `$${Number(discount.amount).toFixed(2)} por prenda`}
                      {' · '}
                      {discount.scope === 'global' ? 'Toda la tienda'
                        : discount.scope === 'category' ? `Categoría: ${discount.category_name || 'Eliminada'}`
                          : discount.scope === 'product' ? `Prenda: ${discount.product_name || 'Eliminada'}`
                            : discount.scope === 'color' ? `Color: ${discount.color}` : `Talla: ${discount.size}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Vigencia: {formatDate(discount.starts_at)} — {formatDate(discount.ends_at)}
                      {discount.code && ` · Canjes: ${discount.redemption_count}/${discount.max_redemptions || '∞'}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {discount.code && (
                      <button
                        type="button"
                        onClick={() => copyCode(discount.code)}
                        className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 hover:bg-purple-100"
                        title="Copiar código"
                      >
                        {discount.code} <Copy size={14} />
                      </button>
                    )}
                    <button type="button" onClick={() => handleEdit(discount)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Editar">
                      <Edit2 size={17} />
                    </button>
                    {discount.is_active && (
                      <button type="button" onClick={() => handleDelete(discount)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Desactivar">
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
