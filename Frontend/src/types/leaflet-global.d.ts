declare global {
  interface Window {
    L: LeafletGlobal;
  }
  interface LeafletGlobal {
    map: (el: HTMLElement, options?: Record<string, unknown>) => LeafletMap;
    tileLayer: (url: string, options?: Record<string, unknown>) => LeafletLayer;
    marker: (latlng: [number, number], options?: Record<string, unknown>) => LeafletMarker;
    icon: (options: Record<string, unknown>) => unknown;
  }
  interface LeafletLayer {
    addTo: (map: LeafletMap) => LeafletLayer;
  }
  interface LeafletMarker {
    addTo: (map: LeafletMap) => LeafletMarker;
    setLatLng: (latlng: [number, number]) => LeafletMarker;
    on: (event: string, handler: (e: unknown) => void) => LeafletMarker;
    getLatLng: () => { lat: number; lng: number };
    bindPopup: (content: string) => LeafletMarker;
    remove: () => void;
  }
  interface LeafletMap {
    setView: (latlng: [number, number], zoom: number) => LeafletMap;
    on: (event: string, handler: (e: { latlng: { lat: number; lng: number } }) => void) => LeafletMap;
    remove: () => void;
    invalidateSize: () => void;
  }
}
export {};
