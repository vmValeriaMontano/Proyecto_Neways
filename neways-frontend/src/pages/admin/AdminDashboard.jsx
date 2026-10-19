import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, Tag, Layers, ShoppingBag, Users, MapPin, LogOut, Plus, Edit2, Trash2, RefreshCw, Eye 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('products');

  // Estados de datos
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal y Formulario Productos (Con campo descuento opcional)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category_id: '', image_url: '', discount: ''
  });

  // Modal y Formulario Categorías
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  // Modal y Formulario Variantes / Stock
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productVariants, setProductVariants] = useState([]);
  const [variantForm, setVariantForm] = useState({ size: 'M', color: 'Negro', stock: 10 });

  // Modal y Formulario Ubicaciones (Departamentos / Costo de envío)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departmentForm, setDepartmentForm] = useState({ name: '', shipping_cost: '' });

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
      } else if (activeTab === 'locations') {
        const res = await API.get('/admin/departments');
        setDepartments(res.data || []);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    window.location.href = '/login';
  };

  // --- MÉTODOS DE PRODUCTOS ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        discount: productForm.discount === '' ? 0 : Number(productForm.discount)
      };

      if (editingProduct) {
        await API.put(`/admin/products/${editingProduct.id}`, payload);
      } else {
        await API.post('/admin/products', payload);
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

  // --- MÉTODOS DE VARIANTES Y STOCK ---
  const handleOpenInventory = async (productId) => {
    setSelectedProductId(productId);
    try {
      const res = await API.get(`/admin/products/${productId}/variants`);
      setProductVariants(res.data || []);
      setShowInventoryModal(true);
    } catch (err) {
      alert('Error al cargar las variantes del producto');
    }
  };

  const handleSaveVariant = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/variants', {
        product_id: selectedProductId,
        ...variantForm
      });
      setShowVariantModal(false);
      // Recargar inventario si está abierto
      const res = await API.get(`/admin/products/${selectedProductId}/variants`);
      setProductVariants(res.data || []);
      alert('Variante y stock agregados exitosamente.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al agregar variante');
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (confirm('¿Eliminar esta variante y su stock?')) {
      try {
        await API.delete(`/admin/variants/${variantId}`);
        setProductVariants(productVariants.filter(v => v.id !== variantId));
      } catch (err) {
        alert('Error al eliminar la variante');
      }
    }
  };

  const handleUpdateStockValue = async (variantId, newStock) => {
    try {
      await API.put(`/admin/variants/${variantId}/stock`, { stock: Number(newStock) });
    } catch (err) {
      alert('Error al actualizar el stock');
    }
  };

  // --- MÉTODOS DE DEPARTAMENTOS ---
  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await API.put(`/admin/departments/${editingDepartment.id}`, departmentForm);
      } else {
        await API.post('/admin/departments', departmentForm);
      }
      setShowDepartmentModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar departamento');
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (confirm('¿Deseas eliminar este departamento?')) {
      await API.delete(`/admin/departments/${id}`);
      fetchData();
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/admin/orders/${orderId}/status`, { order_status: newStatus });
      fetchData();
    } catch (err) {
      alert('Error al cambiar el estado del pedido');
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 border-b border-slate-800">
            <img src="/isotipo-blanco.png" alt="Neways Logo" className="h-8" />
            <div>
              <h1 className="font-bold text-lg leading-tight">NEWAYS</h1>
              <span className="text-xs text-purple-400 font-medium uppercase tracking-wider">Panel Admin</span>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'products' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package size={18} /> Productos
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'categories' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Tag size={18} /> Categorías
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'orders' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShoppingBag size={18} /> Pedidos
            </button>

            <button
              onClick={() => setActiveTab('locations')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'locations' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <MapPin size={18} /> Ubicaciones / Envíos
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users size={18} /> Usuarios
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <div className="px-2 mb-3">
            <p className="text-xs text-gray-400">Sesión iniciada como:</p>
            <p className="text-sm font-semibold truncate">{user?.full_name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
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
                    <h2 className="text-2xl font-bold text-slate-800">Gestión de Productos</h2>
                    <p className="text-sm text-gray-500">Crea, edita o administra inventario y descuentos del catálogo.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: '', description: '', price: '', category_id: categories[0]?.id || '', image_url: '', discount: '' });
                      setShowProductModal(true);
                    }}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition"
                  >
                    <Plus size={18} /> Nuevo Producto
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-gray-500">
                      <tr>
                        <th className="p-4">Producto</th>
                        <th className="p-4">Categoría</th>
                        <th className="p-4">Precio / Descuento</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
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
                              <span className="font-semibold text-slate-800 block">{p.name}</span>
                              <span className="text-xs text-gray-500 truncate max-w-xs block">{p.description}</span>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-slate-600">{p.category_name || 'Sin Categoría'}</td>
                          <td className="p-4">
                            <span className="font-bold text-purple-600">${Number(p.price).toFixed(2)}</span>
                            {p.discount > 0 && (
                              <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                -{p.discount}% Desc.
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button
                                title="Ver / Administrar Stock e Inventario"
                                onClick={() => handleOpenInventory(p.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                title="Agregar Variante y Stock"
                                onClick={() => { setSelectedProductId(p.id); setShowVariantModal(true); }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
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
                                    image_url: p.image_url,
                                    discount: p.discount || ''
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
                    <h2 className="text-2xl font-bold text-slate-800">Categorías de la Tienda</h2>
                    <p className="text-sm text-gray-500">Agrupa tus prendas o Gift Cards.</p>
                  </div>
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition"
                  >
                    <Plus size={18} /> Nueva Categoría
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories.map((c) => (
                    <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                      <span className="font-semibold text-lg text-slate-800">{c.name}</span>
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

            {/* TAB UBICACIONES */}
            {activeTab === 'locations' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Departamentos y Costos de Envío</h2>
                    <p className="text-sm text-gray-500">Gestiona los departamentos habilitados y su precio de envío.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingDepartment(null);
                      setDepartmentForm({ name: '', shipping_cost: '' });
                      setShowDepartmentModal(true);
                    }}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition"
                  >
                    <Plus size={18} /> Nuevo Departamento
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b text-xs uppercase font-semibold text-gray-500">
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Departamento</th>
                        <th className="p-4">Costo de Envío</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {departments.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold text-gray-500">#{d.id}</td>
                          <td className="p-4 font-semibold text-slate-800">{d.name}</td>
                          <td className="p-4 font-bold text-purple-600">${Number(d.shipping_cost).toFixed(2)}</td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingDepartment(d);
                                  setDepartmentForm({ name: d.name, shipping_cost: d.shipping_cost });
                                  setShowDepartmentModal(true);
                                }}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteDepartment(d.id)}
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

            {/* TAB PEDIDOS */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Órdenes Realizadas</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b text-xs uppercase font-semibold text-gray-500">
                      <tr>
                        <th className="p-4">Orden ID</th>
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Estado del Pedido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold">#ORD-{o.id}</td>
                          <td className="p-4">
                            <div className="font-medium text-slate-800">{o.full_name}</div>
                            <div className="text-xs text-gray-500">{o.phone} | {o.department}</div>
                          </td>
                          <td className="p-4 font-bold text-purple-600">${Number(o.total).toFixed(2)}</td>
                          <td className="p-4">
                            <select
                              value={o.order_status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-600"
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

            {/* TAB USUARIOS */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Usuarios Registrados</h2>
                <p className="text-sm text-gray-500 mb-6">Administra las cuentas y roles registrados en el sistema.</p>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b text-xs uppercase font-semibold text-gray-500">
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Nombre Completo</th>
                        <th className="p-4">Correo Electrónico</th>
                        <th className="p-4">Rol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {usersList.length > 0 ? (
                        usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="p-4 font-bold text-gray-500">#{u.id}</td>
                            <td className="p-4 font-semibold text-slate-800">{u.full_name || 'Sin Nombre'}</td>
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

      {/* MODAL DEPARTAMENTO */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{editingDepartment ? 'Editar Departamento' : 'Nuevo Departamento'}</h3>
            <form onSubmit={handleSaveDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Costo de Envío ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={departmentForm.shipping_cost}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, shipping_cost: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepartmentModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRODUCTO (Con Descuento Opcional) */}
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
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Descripción</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
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
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Descuento % (Opcional)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Ej. 15"
                    value={productForm.discount}
                    onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Categoría</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">URL de Imagen</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VER / EDITAR INVENTARIO (STOCK & VARIANTES) */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Inventario y Variantes</h3>
            <p className="text-xs text-gray-500 mb-4">Modifica el stock disponible o elimina variantes de este producto.</p>
            
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border rounded-xl p-2 mb-4">
              {productVariants.length > 0 ? (
                productVariants.map((v) => (
                  <div key={v.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Talla: {v.size} | Color: {v.color}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        defaultValue={v.stock}
                        onBlur={(e) => handleUpdateStockValue(v.id, e.target.value)}
                        className="w-20 border rounded-lg px-2 py-1 text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <span className="text-xs text-gray-500">unidades</span>
                      <button
                        onClick={() => handleDeleteVariant(v.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar variante"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-center text-gray-400 py-6">Este producto aún no tiene variantes ni stock registrado.</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowInventoryModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CATEGORÍA */}
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
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR VARIANTE */}
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
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600"
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
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600"
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
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600"
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
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