import { createContext, useContext, useEffect, useState } from 'react';
import API from '../services/api';

const DEFAULT_SITE_SETTINGS = {
  hero_title: 'UN NUEVO CAMINO AL RENDIMIENTO',
  hero_description: 'Prendas diseñadas para potenciar tu estilo de vida.',
  hero_button: 'VER COLECCIÓN',
  products_heading: 'Lo Más Vendido',
  footer_message: 'Involucrados en el estilo de vida deportivo, ofreciendo productos enfocados al bienestar y la alta calidad.',
  primary_color: '#8B5CF6',
  secondary_color: '#4F46E5',
  background_color: '#F8FAFC',
  header_symbol_logo_url: null,
  header_wordmark_logo_url: null
};

const SiteCustomizationContext = createContext(null);

export function SiteCustomizationProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    let active = true;

    API.get('/site-settings')
      .then(({ data }) => {
        if (active) {
          setSettings(data);
        }
      })
      .catch((error) => {
        console.error('Error al cargar la personalización del sitio:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--site-primary-color', settings.primary_color);
    root.style.setProperty('--site-secondary-color', settings.secondary_color);
    root.style.setProperty('--site-background-color', settings.background_color);
  }, [settings]);

  return (
    <SiteCustomizationContext.Provider value={{ settings, setSettings }}>
      {children}
    </SiteCustomizationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSiteCustomization() {
  const context = useContext(SiteCustomizationContext);
  if (!context) {
    throw new Error('useSiteCustomization debe usarse dentro de SiteCustomizationProvider.');
  }
  return context;
}
