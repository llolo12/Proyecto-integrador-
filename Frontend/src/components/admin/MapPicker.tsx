import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
// Puntarenas, Costa Rica -- centro por defecto del mapa
const DEFAULT_CENTER: [number, number] = [9.9762, -84.8384];
const DEFAULT_ZOOM = 12;
interface MapPickerProps {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number, lng: number) => void;
  otherPoints?: { nombre: string; lat?: number; lng?: number }[];
  height?: number;
}
export default function MapPicker({ lat, lng, onChange, otherPoints = [], height = 320 }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!window.L) {
      const check = setInterval(() => {
        if (window.L && containerRef.current && !mapRef.current) {
          clearInterval(check);
          initMap();
        }
      }, 100);
      return () => clearInterval(check);
    }
    initMap();
    function initMap() {
      const L = window.L;
      const start: [number, number] = lat && lng ? [lat, lng] : DEFAULT_CENTER;
      const map = L.map(containerRef.current as HTMLElement, { attributionControl: true }).setView(
        start,
        lat && lng ? 14 : DEFAULT_ZOOM
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      const marker = L.marker(start, { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
      });
      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng([e.latlng.lat, e.latlng.lng]);
        onChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
      });
      otherPoints
        .filter((p) => p.lat != null && p.lng != null)
        .forEach((p) => {
          L.marker([p.lat as number, p.lng as number], {
            opacity: 0.55,
          })
            .addTo(map)
            .bindPopup(p.nombre);
        });
      mapRef.current = map;
      markerRef.current = marker;
      setReady(true);
      setTimeout(() => map.invalidateSize(), 50);
    }
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!ready || !markerRef.current || lat == null || lng == null) return;
    markerRef.current.setLatLng([lat, lng]);
  }, [lat, lng, ready]);
  return (
    <div className="overflow-hidden rounded-lg border border-pv-sand">
      <div ref={containerRef} style={{ height }} className="w-full bg-pv-sand/30" />
      <div className="flex items-center gap-1.5 bg-pv-sand/40 px-3 py-1.5 text-xs text-pv-gray">
        <MapPin size={12} />
        {lat != null && lng != null
          ? `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
          : 'Hace clic en el mapa o arrastra el marcador para ubicar el destino'}
      </div>
    </div>
  );
}
