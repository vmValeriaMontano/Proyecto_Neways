import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [13.6929, -89.2182];
const SHIPPING_MARKER = L.divIcon({
  className: 'shipping-map-marker',
  html: '<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46" aria-hidden="true"><path fill="#4f46e5" stroke="#fff" stroke-width="2" d="M19 1C9.1 1 1 9.1 1 19c0 12.5 18 26 18 26s18-13.5 18-26C37 9.1 28.9 1 19 1Z"/><circle cx="19" cy="19" r="6" fill="#fff"/></svg>',
  iconSize: [38, 46],
  iconAnchor: [19, 46],
});

export default function ShippingMap({ latitude, longitude, onLocationSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const map = L.map(containerRef.current).setView(DEFAULT_CENTER, 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const selectLocation = (location) => {
      if (!markerRef.current) {
        const marker = L.marker(location, {
          icon: SHIPPING_MARKER,
          draggable: true,
          title: 'Punto de entrega',
          alt: 'Punto de entrega',
        }).addTo(map);
        marker.on('dragend', () => selectLocation(marker.getLatLng()));
        markerRef.current = marker;
      } else {
        markerRef.current.setLatLng(location);
      }

      onLocationSelectRef.current({ lat: location.lat, lng: location.lng });
    };

    map.on('click', (event) => selectLocation(event.latlng));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      markerRef.current?.removeFrom(mapRef.current);
      markerRef.current = null;
      return;
    }

    const location = [latitude, longitude];
    if (!markerRef.current) {
      markerRef.current = L.marker(location, {
        icon: SHIPPING_MARKER,
        draggable: true,
        title: 'Punto de entrega',
        alt: 'Punto de entrega',
      }).addTo(mapRef.current);
      markerRef.current.on('dragend', () => {
        const point = markerRef.current.getLatLng();
        onLocationSelectRef.current({ lat: point.lat, lng: point.lng });
      });
    } else {
      markerRef.current.setLatLng(location);
    }

    mapRef.current.setView(location, 16);
  }, [latitude, longitude]);

  return <div ref={containerRef} className="h-56 w-full rounded-xl z-0" aria-label="Mapa de ubicación de entrega" />;
}
