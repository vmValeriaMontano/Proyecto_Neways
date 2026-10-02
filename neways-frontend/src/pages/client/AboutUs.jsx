import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';

// Cambia estos datos por los reales de la marca
const WHATSAPP_URL = 'https://wa.me/50300000000';
const INSTAGRAM_URL = 'https://www.instagram.com/neways.sv/';
const UBICACION_URL = 'https://www.google.com/maps/place/Neways+Boutique/@13.6981783,-89.2435459,17z/data=!3m1!4b1!4m6!3m5!1s0x8f633142867ab68d:0x2cb070c4040d99ba!8m2!3d13.6981731!4d-89.240971!16s%2Fg%2F11txsdwhz1?entry=ttu&g_ep=EgoyMDI2MDkyOS4wIKXMDSoASAFQAw%3D%3D';

// Si tienes el logo como imagen, pon aquí su ruta (ej. import logo from '../../assets/logo-neways.png')
const LOGO_SRC = '/logo-negro-completo.png';

const svg = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
};

const IconUser = ({ className }) => (
  <svg {...svg} className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);
const IconGear = ({ className }) => (
  <svg {...svg} className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconSearch = ({ className }) => (
  <svg {...svg} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.5-4.5" />
  </svg>
);
const IconWhatsapp = ({ className }) => (
  <svg {...svg} className={className}>
    <path d="M4 20l1.3-4.2A8 8 0 1112 20a8 8 0 01-3.9-1z" />
    <path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .7c-.8-.4-1.6-1.2-2-2l.7-1-1-2z" />
  </svg>
);
const IconInstagram = ({ className }) => (
  <svg {...svg} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" />
  </svg>
);
const IconPin = ({ className }) => (
  <svg {...svg} className={className}>
    <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

// Logo del banner (aproximado). Se reemplaza por la imagen si defines LOGO_SRC
function Logo() {
  if (LOGO_SRC) {
    return <img src={LOGO_SRC} alt="Neways" className="w-full max-w-[96px] md:max-w-[220px] h-auto" />;
  }
  return (
    <div className="flex flex-col items-center text-zinc-900" aria-label="Neways">
      <svg viewBox="0 0 24 28" className="w-9 h-10" aria-hidden="true">
        <path d="M3 2h5v24H3zM10 8l5-6v24h-5z" fill="currentColor" />
        <path d="M17 2h4v24h-4z" fill="currentColor" />
      </svg>
      <span className="text-lg font-extrabold italic tracking-tight leading-none">neways</span>
    </div>
  );
}

// Textos tomados del Manual de Identidad Corporativa de Neways
const tarjetas = [
  {
    titulo: '¿Quiénes Somos?',
    texto:
      'Neways es una marca salvadoreña del ámbito deportivo. Su nombre juega con "new ways" (nuevos caminos): una alternativa eficaz a la forma tradicional de ver el entrenamiento deportivo, inspirada en las formas geométricas y en las calles que permiten llegar al mismo destino por diferentes caminos.',
    Icono: IconUser,
  },
  {
    titulo: 'Nuestra misión',
    texto:
      'Involucrarnos en el estilo de vida deportivo de nuestra sociedad, posicionándonos como una marca referente en el ámbito, ofreciendo productos enfocados al bienestar y la alta calidad.',
    Icono: IconGear,
  },
  {
    titulo: 'Nuestra visión',
    texto:
      'Ser una marca líder en el ámbito deportivo para fomentar las prácticas del bienestar físico y mental, y consolidarnos como una empresa salvadoreña comprometida con el estilo y el desarrollo personal de nuestros clientes.',
    Icono: IconSearch,
  },
];

const contactos = [
  { nombre: 'WhatsApp', accion: 'Escríbenos', href: WHATSAPP_URL, Icono: IconWhatsapp },
  { nombre: 'Instagram', accion: 'Síguenos', href: INSTAGRAM_URL, Icono: IconInstagram },
  { nombre: 'Ubicación', accion: 'Encuéntranos', href: UBICACION_URL, Icono: IconPin },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-neutral-100 pb-28">
      <Header cartCount={3} />

      <main className="w-full max-w-5xl mx-auto px-4 md:px-8 mt-3 md:mt-6 flex flex-col gap-4 md:gap-6">
        {/* Banner: morado con corte diagonal + gris con logo */}
        <section
          aria-labelledby="about-titulo"
          className="relative min-h-[170px] md:min-h-[280px] overflow-hidden rounded md:rounded-lg bg-zinc-300"
        >
          <div
            className="absolute inset-0 bg-[#5b5bf0]"
            style={{ clipPath: 'polygon(0 0, 52% 0, 72% 45%, 47% 100%, 0 100%)' }}
          />
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ clipPath: 'polygon(0 0, 52% 0, 72% 45%, 47% 100%, 0 100%)' }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line x1="89.5" y1="0" x2="44" y2="100" stroke="#d4d4d8" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="85.5" y1="0" x2="40" y2="100" stroke="#d4d4d8" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>

          <div className="relative flex items-center justify-between min-h-[170px] md:min-h-[280px] px-4 md:px-12 py-5">
            <div className="w-[46%] text-white text-left">
              <h1 id="about-titulo" className="text-xl md:text-4xl font-semibold leading-tight">
                SOMOS MÁS QUE NEGOCIOS
              </h1>
              <span className="block w-14 md:w-24 h-px my-2 md:my-4 bg-white" aria-hidden="true" />
              <p className="text-sm md:text-lg leading-snug">
                Prendas diseñadas para potenciar tu estilo de vida.
              </p>
            </div>
            <div className="w-[24%] flex justify-center">
              <Logo />
            </div>
          </div>
        </section>

        {/* Tarjetas: quiénes somos, misión, visión (texto siempre visible) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {tarjetas.map(({ titulo, texto, Icono }) => (
            <section
              key={titulo}
              className="flex items-center md:items-start md:flex-col gap-4 md:gap-3 p-4 bg-white rounded-2xl shadow-[0_4px_6px_rgba(0,0,0,0.25)] text-left"
            >
              <span className="shrink-0 w-14 h-14 grid place-items-center rounded-full border-2 border-[#5b5bf0] text-zinc-900">
                <Icono className="w-7 h-7" />
              </span>
              <span className="self-stretch w-px bg-gray-300 md:hidden" aria-hidden="true" />
              <div className="flex-1">
                <h2 className="text-sm md:text-base font-bold text-zinc-900">{titulo}</h2>
                <span className="block w-8 h-0.5 mt-1 bg-[#5b5bf0]" aria-hidden="true" />
                <p className="mt-2 text-xs md:text-sm leading-relaxed text-slate-600">{texto}</p>
              </div>
            </section>
          ))}
        </div>

        {/* Contacto */}
        <section aria-label="Contáctanos" className="flex flex-col gap-3 w-full md:max-w-2xl md:mx-auto">
          <h2 className="bg-[#5b5bf0] text-white text-center font-bold text-[11px] py-1 rounded">
            Contactanos
          </h2>
          <div className="grid grid-cols-3 bg-white rounded-2xl shadow-[0_4px_6px_rgba(0,0,0,0.25)]">
            {contactos.map(({ nombre, accion, href, Icono }) => (
              <a
                key={nombre}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center py-2.5 px-1 text-center text-zinc-900 border-l border-gray-300 first:border-l-0"
              >
                <Icono className="w-6 h-6 mb-1" />
                <strong className="text-[10px]">{nombre}</strong>
                <span className="text-[9px] text-zinc-600">{accion}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Botón al catálogo */}
        <section aria-label="Catálogo" className="flex flex-col gap-3 w-full md:max-w-2xl md:mx-auto">
          <Link
            to="/catalog"
            className="block text-center bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs md:text-sm py-2.5 rounded-lg transition md:max-w-xs md:mx-auto md:w-full"
          >
            Ver catálogo
          </Link>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}