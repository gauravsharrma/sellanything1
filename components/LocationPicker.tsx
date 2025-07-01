import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

interface LocationPickerProps {
  address: string;
  lat: string;
  lng: string;
  onChange: (address: string, lat: string, lng: string) => void;
}

const loadScript = (src: string) => {
  return new Promise<void>((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      if ((existing as HTMLScriptElement).readyState === 'complete') resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
};

const LocationPicker: React.FC<LocationPickerProps> = ({ address, lat, lng, onChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not provided');
      return;
    }
    const src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    let MapClass: any = null;
    let MarkerClass: any = null;
    let AutocompleteClass: any = null;
    let map: any = null;
    let marker: any = null;
    const init = async () => {
      try {
      await loadScript(src);
      if (!mapRef.current || !inputRef.current || !window.google?.maps) return;
      // ensure libraries are loaded when using loading=async
      if (window.google.maps.importLibrary) {
        ({ Map: MapClass } = await window.google.maps.importLibrary('maps'));
        ({ Marker: MarkerClass } = await window.google.maps.importLibrary('marker'));
        ({ Autocomplete: AutocompleteClass } = await window.google.maps.importLibrary('places'));
      } else {
        MapClass = window.google.maps.Map;
        MarkerClass = window.google.maps.Marker;
        AutocompleteClass = window.google.maps.places.Autocomplete;
      }
      if (!MapClass || !MarkerClass || !AutocompleteClass) {
        console.error('Google Maps libraries failed to load');
        return;
      }
      const center = {
        lat: parseFloat(lat || '0') || 0,
        lng: parseFloat(lng || '0') || 0,
      };
      map = new MapClass(mapRef.current, {
        center,
        zoom: 8,
      });
      marker = new MarkerClass({ map });
      if (lat && lng) {
        marker.setPosition(center);
      }
      const autocomplete = new AutocompleteClass(inputRef.current!);
      if (address) inputRef.current!.value = address;
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;
        const loc = place.geometry.location;
        const addr = place.formatted_address || '';
        onChange(addr, loc.lat().toString(), loc.lng().toString());
        map!.setCenter(loc);
        marker!.setPosition(loc);
      });
      } catch (err) {
        console.error('Failed to initialize Google Maps', err);
      }
    };
    init();
  }, []);

  return (
    <div>
      <input ref={inputRef} type="text" className="mt-1 mb-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
      <div ref={mapRef} style={{ height: '200px', width: '100%' }} />
    </div>
  );
};

export default LocationPicker;
