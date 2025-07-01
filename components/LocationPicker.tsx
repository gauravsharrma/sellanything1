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
    let map: google.maps.Map | null = null;
    let marker: google.maps.Marker | null = null;
    loadScript(src).then(() => {
      if (!mapRef.current || !inputRef.current || !window.google) return;
      const center = {
        lat: parseFloat(lat || '0') || 0,
        lng: parseFloat(lng || '0') || 0,
      };
      map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 8,
      });
      marker = new window.google.maps.Marker({ map });
      if (lat && lng) {
        marker.setPosition(center);
      }
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current!);
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
    });
  }, []);

  return (
    <div>
      <input ref={inputRef} type="text" className="mt-1 mb-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
      <div ref={mapRef} style={{ height: '200px', width: '100%' }} />
    </div>
  );
};

export default LocationPicker;
