import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	ArrowLeft,
	Check,
	ChevronRight,
	CircleHelp,
	Clock3,
	LogOut,
	PackageCheck,
	Pencil,
	Phone,
	ReceiptText,
	Truck,
	UserRound,
	X,
} from 'lucide-react';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const statusDetails = {
	recibido: { label: 'Recibido', icon: Clock3, style: 'bg-blue-50 text-blue-700' },
	preparando: { label: 'En preparación', icon: PackageCheck, style: 'bg-amber-50 text-amber-700' },
	enviado: { label: 'Enviado', icon: Truck, style: 'bg-violet-50 text-violet-700' },
	entregado: { label: 'Entregado', icon: Check, style: 'bg-emerald-50 text-emerald-700' },
	cancelado: { label: 'Cancelado', icon: X, style: 'bg-rose-50 text-rose-700' },
};

const formatDate = (date) => new Intl.DateTimeFormat('es', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
}).format(new Date(date));

export default function UserProfile() {
	const navigate = useNavigate();
	const { user, logout, updateUser } = useAuth();
	const cachedProfile = user || JSON.parse(localStorage.getItem('user') || '{}');
	const [profile, setProfile] = useState(cachedProfile);
	const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
	const [orders, setOrders] = useState([]);
	const [activeTab, setActiveTab] = useState('personal');
	const [editing, setEditing] = useState(false);
	const [loadingProfile, setLoadingProfile] = useState(true);
	const [loadingOrders, setLoadingOrders] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		if (!localStorage.getItem('token')) {
			navigate('/login', { replace: true });
			return;
		}

		API.get('/auth/me')
			.then(({ data }) => {
				setProfile(data);
				setForm({ fullName: data.full_name || '', email: data.email || '', phone: data.phone || '' });
			})
			.catch(() => {
				setForm({ fullName: cachedProfile.full_name || '', email: cachedProfile.email || '', phone: cachedProfile.phone || '' });
			})
			.finally(() => setLoadingProfile(false));

		API.get('/orders/my-orders')
			.then(({ data }) => setOrders(Array.isArray(data) ? data : []))
			.catch(() => setError('No se pudo cargar tu historial de pedidos.'))
			.finally(() => setLoadingOrders(false));
	}, [navigate, cachedProfile.email, cachedProfile.full_name, cachedProfile.phone]);

	const handleLogout = () => {
		logout();
		navigate('/login', { replace: true });
	};

	const startEditing = () => {
		setForm({ fullName: profile.full_name || '', email: profile.email || '', phone: profile.phone || '' });
		setError('');
		setMessage('');
		setEditing(true);
	};

	const handleSave = async (event) => {
		event.preventDefault();
		setSaving(true);
		setError('');
		setMessage('');
		try {
			const { data } = await API.patch('/auth/me', form);
			setProfile(data);
			setForm({ fullName: data.full_name || '', email: data.email || '', phone: data.phone || '' });
			updateUser(data);
			setEditing(false);
			setMessage('Tus datos se actualizaron.');
		} catch (err) {
			setError(err.response?.data?.message || 'No se pudieron guardar tus datos.');
		} finally {
			setSaving(false);
		}
	};

	const customerName = profile.full_name || 'Cliente Neways';
	const initials = customerName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

	return (
		<div className="min-h-screen bg-[#f2f3f4] pb-28">
			<Header />

			<main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-5 sm:px-6">
				<button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900" aria-label="Volver">
					<ArrowLeft size={17} /> Volver
				</button>

				<section className="overflow-hidden rounded-b-2xl rounded-t-[26px] bg-[#646cf5] text-white shadow-sm">
					<div className="flex items-center gap-4 px-6 py-7 sm:px-8 sm:py-9">
						<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-[#646cf5] sm:h-20 sm:w-20">
							<span className="text-lg font-bold">{initials}</span>
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium uppercase tracking-wide text-white/75">Mi cuenta</p>
							<h1 className="mt-1 truncate text-xl font-bold sm:text-2xl">{customerName}</h1>
							<p className="truncate text-sm text-white/85">{profile.email || 'Actualiza tus datos personales'}</p>
						</div>
					</div>
					<div className="flex items-center justify-between border-t border-white/20 px-6 py-3 text-sm sm:px-8">
						<span>{orders.length} {orders.length === 1 ? 'pedido realizado' : 'pedidos realizados'}</span>
						<img src="/logo-morado-completo.png" alt="Neways" className="h-7 brightness-0 invert" />
					</div>
				</section>

				<div className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
					<nav aria-label="Secciones de cuenta" className="flex gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:self-start">
						<button onClick={() => setActiveTab('personal')} className={`flex min-w-max items-center gap-3 rounded-lg px-4 py-3 text-sm transition lg:w-full ${activeTab === 'personal' ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
							<UserRound size={17} /> Información personal <ChevronRight size={15} className="ml-auto hidden lg:block" />
						</button>
						<button onClick={() => setActiveTab('orders')} className={`flex min-w-max items-center gap-3 rounded-lg px-4 py-3 text-sm transition lg:w-full ${activeTab === 'orders' ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
							<ReceiptText size={17} /> Historial de pedidos <ChevronRight size={15} className="ml-auto hidden lg:block" />
						</button>
						<button onClick={handleLogout} className="flex min-w-max items-center gap-3 rounded-lg px-4 py-3 text-sm text-rose-600 transition hover:bg-rose-50 lg:mt-3 lg:w-full lg:border-t lg:border-gray-100 lg:rounded-none lg:pt-4">
							<LogOut size={17} /> Cerrar sesión
						</button>
					</nav>

					<section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
						{activeTab === 'personal' ? (
							<>
								<div className="mb-6 flex items-start justify-between gap-4">
									<div>
										<h2 className="text-lg font-bold text-slate-800">Información personal</h2>
										<p className="mt-1 text-sm text-slate-500">Consulta y mantén actualizados tus datos.</p>
									</div>
									{!editing && <button onClick={startEditing} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-slate-600 hover:bg-slate-50" aria-label="Editar datos personales" title="Editar datos personales"><Pencil size={16} /></button>}
								</div>

								{loadingProfile ? <p className="py-8 text-center text-sm text-slate-500">Cargando tus datos...</p> : editing ? (
									<form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
										<label className="text-sm font-medium text-slate-700">Nombre completo
											<input required name="fullName" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
										</label>
										<label className="text-sm font-medium text-slate-700">Correo electrónico
											<input required type="email" name="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
										</label>
										<label className="text-sm font-medium text-slate-700 sm:col-span-2">Teléfono
											<input type="tel" name="phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:max-w-md" />
										</label>
										<div className="flex gap-3 sm:col-span-2">
											<button disabled={saving} type="submit" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
											<button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button>
										</div>
									</form>
								) : (
									<dl className="divide-y divide-gray-100">
										<div className="flex gap-3 py-4"><UserRound size={18} className="mt-0.5 text-slate-400" /><div><dt className="text-xs text-slate-500">Nombre completo</dt><dd className="mt-1 text-sm font-medium text-slate-800">{profile.full_name || 'Sin registrar'}</dd></div></div>
										<div className="flex gap-3 py-4"><CircleHelp size={18} className="mt-0.5 text-slate-400" /><div><dt className="text-xs text-slate-500">Correo electrónico</dt><dd className="mt-1 text-sm font-medium text-slate-800">{profile.email || 'Sin registrar'}</dd></div></div>
										<div className="flex gap-3 py-4"><Phone size={18} className="mt-0.5 text-slate-400" /><div><dt className="text-xs text-slate-500">Teléfono</dt><dd className="mt-1 text-sm font-medium text-slate-800">{profile.phone || 'Sin registrar'}</dd></div></div>
									</dl>
								)}
							</>
						) : (
							<>
								<div className="mb-6">
									<h2 className="text-lg font-bold text-slate-800">Historial de pedidos</h2>
									<p className="mt-1 text-sm text-slate-500">Revisa el estado de tus compras.</p>
								</div>
								{loadingOrders ? <p className="py-8 text-center text-sm text-slate-500">Cargando tus pedidos...</p> : orders.length === 0 ? (
									<div className="py-10 text-center">
										<ReceiptText size={30} className="mx-auto text-slate-300" />
										<p className="mt-3 text-sm font-semibold text-slate-700">Aún no tienes pedidos</p>
										<button onClick={() => navigate('/catalog')} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700">Explorar catálogo</button>
									</div>
								) : (
									<div className="divide-y divide-gray-100">
										{orders.map((order) => {
											const status = statusDetails[String(order.order_status || '').toLowerCase()] || { label: order.order_status || 'Pendiente', icon: Clock3, style: 'bg-gray-100 text-gray-700' };
											const StatusIcon = status.icon;
											return (
												<article key={order.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
													<div>
														<p className="text-sm font-semibold text-slate-800">Pedido #{order.id}</p>
														<p className="mt-1 text-xs text-slate-500">{order.created_at ? formatDate(order.created_at) : 'Fecha no disponible'}</p>
														<p className="mt-2 text-sm font-semibold text-slate-700">${Number(order.total || 0).toFixed(2)}</p>
													</div>
													<span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${status.style}`}><StatusIcon size={14} />{status.label}</span>
												</article>
											);
										})}
									</div>
								)}
							</>
						)}
						{(error || message) && <p role="status" className={`mt-4 text-sm ${error ? 'text-rose-600' : 'text-emerald-700'}`}>{error || message}</p>}
					</section>
				</div>
			</main>

			<BottomNav />
		</div>
	);
}
