import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, Tag, Layers, ShoppingBag, Users, LogOut, Plus, Edit2, Trash2, RefreshCw 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('products');

  // Estados de datos
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal y Formulario Productos
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category_id: '', image_url: ''
  });

  // Modal y Formulario Categorías
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  // Modal y Formulario Variantes
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [variantForm, setVariantForm] = useState({ size: 'M', color: 'Negro', stock: 10 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const [resP, resC] = await Promise.all([API.get('/products'), API.get('/admin/categories')]);
        setProducts(resP.data || []);
        setCategories(resC.data || []);
      } else if (activeTab === 'categories') {
        const res = await API.get('/admin/categories');
        setCategories(res.data || []);
      } else if (activeTab === 'orders') {
        const res = await API.get('/admin/orders');
        setOrders(res.data || []);
      } else if (activeTab === 'users') {
        const res = await API.get('/admin/users');
        setUsersList(res.data || []);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- MÉTODOS DE PRODUCTOS ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await API.put(`/admin/products/${editingProduct.id}`, productForm);
      } else {
        await API.post('/admin/products', productForm);
      }
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar producto');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('¿Deseas deshabilitar/eliminar este producto del catálogo?')) {
      await API.delete(`/admin/products/${id}`);
      fetchData();
    }
  };

  // --- MÉTODOS DE CATEGORÍAS ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/categories', { name: categoryName });
      setCategoryName('');
      setShowCategoryModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar categoría');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (confirm('¿Eliminar esta categoría?')) {
      await API.delete(`/admin/categories/${id}`);
      fetchData();
    }
  };

  // --- MÉTODOS DE VARIANTES (Talla/Color/Stock) ---
  const handleSaveVariant = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/variants', {
        product_id: selectedProductId,
        ...variantForm
      });
      setShowVariantModal(false);
      alert('Variante y stock agregados exitosamente.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al agregar variante');
    }
  };

  // --- MÉTODOS DE PEDIDOS ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/admin/orders/${orderId}/status`, { order_status: newStatus });
      fetchData();
    } catch (err) {
      alert('Error al cambiar el estado del pedido');
    }
  };

  return (
    <div className="flex h-screen bg-neways-gray-bg">
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-neways-dark-heavy text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 border-b border-neways-dark-surface">
            <img src="/isotipo-blanco.png" alt="Neways Logo" className="h-8" />
            <div>
              <h1 className="font-bold text-lg leading-tight">NEWAYS</h1>
              <span className="text-xs text-neways-purple font-medium uppercase tracking-wider">Panel Admin</span>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'products' ? 'bg-neways-purple text-white' : 'text-gray-400 hover:bg-neways-dark-surface hover:text-white'
              }`}
            >
              <Package size={18} /> Productos
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'categories' ? 'bg-neways-purple text-white' : 'text-gray-400 hover:bg-neways-dark-surface hover:text-white'
              }`}
            >
              <Tag size={18} /> Categorías
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'orders' ? 'bg-neways-purple text-white' : 'text-gray-400 hover:bg-neways-dark-surface hover:text-white'
              }`}
            >
              <ShoppingBag size={18} /> Pedidos
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'users' ? 'bg-neways-purple text-white' : 'text-gray-400 hover:bg-neways-dark-surface hover:text-white'
              }`}
            >
              <Users size={18} /> Usuarios
            </button>
          </nav>
        </div>

        <div className="border-t border-neways-dark-surface pt-4">
          <div className="px-2 mb-3">
            <p className="text-xs text-gray-400">Sesión iniciada como:</p>
            <p className="text-sm font-semibold truncate">{user?.full_name}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DE CONTENIDO */}
      <main className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500 gap-2">
            <RefreshCw className="animate-spin" size={20} />
            <span>Cargando datos...</span>
          </div>
        ) : (
          <>
            {/* TAB PRODUCTOS */}
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-neways-dark">Gestión de Productos</h2>
                    <p className="text-sm text-neways-gray-subtext">Crea, edita o elimina prendas e inventario del catálogo.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: '', description: '', price: '', category_id: categories[0]?.id || '', image_url: '' });
                      setShowProductModal(true);
                    }}
                    className="flex items-center gap-2 bg-neways-purple hover:bg-neways-purple-hover text-white px-4 py-2 rounded-lg font-medium shadow-md transition"
                  >
                    <Plus size={18} /> Nuevo Producto
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-neways-gray-border overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-neways-gray-border text-xs uppercase font-semibold text-neways-gray-subtext">
                      <tr>
                        <th className="p-4">Producto</th>
                        <th className="p-4">Categoría</th>
                        <th className="p-4">Precio</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neways-gray-border text-sm">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-4 flex items-center gap-3">
                            <img 
                              src={p.image_url || '/placeholder-product.jpg'} 
                              onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
                              alt={p.name} 
                              className="w-12 h-12 object-cover rounded-md border" 
                            />
                            <div>
                              <span className="font-semibold text-neways-dark block">{p.name}</span>
                              <span className="text-xs text-gray-500 truncate max-w-xs block">{p.description}</span>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-slate-600">{p.category_name || 'Sin Categoría'}</td>
                          <td className="p-4 font-bold text-neways-purple">${Number(p.price).toFixed(2)}</td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button
                                title="Agregar Variantes y Stock"
                                onClick={() => { setSelectedProductId(p.id); setShowVariantModal(true); }}
                                className="p-2 text-neways-blue hover:bg-blue-50 rounded-lg transition"
                              >
                                <Layers size={18} />
                              </button>
                              <button
                                title="Editar Producto"
                                onClick={() => {
                                  setEditingProduct(p);
                                  setProductForm({
                                    name: p.name,
                                    description: p.description,
                                    price: p.price,
                                    category_id: p.category_id,
                                    image_url: p.image_url
                                  });
                                  setShowProductModal(true);
                                }}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                title="Eliminar Producto"
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CATEGORÍAS */}
            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-neways-dark">Categorías de la Tienda</h2>
                    <p className="text-sm text-neways-gray-subtext">Agrupa tus prendas o Gift Cards.</p>
                  </div>
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="flex items-center gap-2 bg-neways-purple hover:bg-neways-purple-hover text-white px-4 py-2 rounded-lg font-medium shadow-md transition"
                  >
                    <Plus size={18} /> Nueva Categoría
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories.map((c) => (
                    <div key={c.id} className="bg-white p-5 rounded-xl border border-neways-gray-border shadow-sm flex justify-between items-center">
                      <span className="font-semibold text-lg text-neways-dark">{c.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB PEDIDOS */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold text-neways-dark mb-6">Órdenes Realizadas</h2>
                <div className="bg-white rounded-xl shadow-sm border border-neways-gray-border overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b text-xs uppercase font-semibold text-neways-gray-subtext">
                      <tr>
                        <th className="p-4">Orden ID</th>
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Estado del Pedido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neways-gray-border text-sm">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold">#ORD-{o.id}</td>
                          <td className="p-4">
                            <div className="font-medium text-neways-dark">{o.full_name}</div>
                            <div className="text-xs text-gray-500">{o.phone} | {o.department}</div>
                          </td>
                          <td className="p-4 font-bold text-neways-purple">${Number(o.total).toFixed(2)}</td>
                          <td className="p-4">
                            <select
                              value={o.order_status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-neways-purple"
                            >
                              <option value="recibido">Recibido</option>
                              <option value="preparando">Preparando</option>
                              <option value="enviado">Enviado</option>
                              <option value="entregado">Entregado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB USUARIOS (SECCIÓN AGREGADA) */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-bold text-neways-dark mb-1">Usuarios Registrados</h2>
                <p className="text-sm text-neways-gray-subtext mb-6">Administra las cuentas y roles registrados en el sistema.</p>

                <div className="bg-white rounded-xl shadow-sm border border-neways-gray-border overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b text-xs uppercase font-semibold text-neways-gray-subtext">
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Nombre Completo</th>
                        <th className="p-4">Correo Electrónico</th>
                        <th className="p-4">Rol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neways-gray-border text-sm">
                      {usersList.length > 0 ? (
                        usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="p-4 font-bold text-gray-500">#{u.id}</td>
                            <td className="p-4 font-semibold text-neways-dark">{u.full_name || 'Sin Nombre'}</td>
                            <td className="p-4 text-slate-600">{u.email}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                u.role === 'admin' || u.role === 'administrador'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                              }`}>
                                {u.role || 'cliente'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-gray-500">
                            No hay usuarios registrados o no se encontraron datos.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODALES... */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-neways-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Descripción</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-neways-purple outline-none"
                  rows="2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-neways-purple outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Categoría</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-neways-purple outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">URL de Imagen</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-neways-purple outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neways-purple hover:bg-neways-purple-hover text-white rounded-lg text-sm font-medium"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Nueva Categoría</h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-neways-purple outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neways-purple hover:bg-neways-purple-hover text-white rounded-lg text-sm font-medium"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVariantModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Agregar Variante y Stock</h3>
            <form onSubmit={handleSaveVariant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Talla</label>
                <input
                  type="text"
                  placeholder="Ej. S, M, L, Única"
                  required
                  value={variantForm.size}
                  onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-neways-purple"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Color</label>
                <input
                  type="text"
                  placeholder="Ej. Negro, Azul, Digital"
                  required
                  value={variantForm.color}
                  onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-neways-purple"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Stock (Unidades)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={variantForm.stock}
                  onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-neways-purple"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVariantModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neways-purple hover:bg-neways-purple-hover text-white rounded-lg text-sm font-medium"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}