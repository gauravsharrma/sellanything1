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

const loadGoogleMaps = async (apiKey: string) => {
  const existing = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
  if (existing) return;

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  document.head.appendChild(script);

  return new Promise<void>((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps failed to load'));
  });
};

const LocationPicker: React.FC<LocationPickerProps> = ({ address, lat, lng, onChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const mapId = import.meta.env.VITE_GOOGLE_MAP_ID; // you must set this in .env

    if (!apiKey || !mapId) {
      console.error('Google Maps API key or Map ID not provided');
      return;
    }

    const init = async () => {
      try {
        await loadGoogleMaps(apiKey);

        const { Map } = (await window.google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
        const { Marker } = (await window.google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;
        await window.google.maps.importLibrary('places');

        if (!mapRef.current || !inputRef.current) return;

        const center = {
          lat: parseFloat(lat || '0') || 0,
          lng: parseFloat(lng || '0') || 0,
        };

        const map = new Map(mapRef.current, {
          center,
          zoom: 8,
          mapId,
        });

        const marker = new Marker({
          map,
          position: lat && lng ? center : undefined,
        });
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);

        if (address) inputRef.current.value = address;

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place?.geometry?.location) return;

          const location = place.geometry.location;
          const formattedAddress = place.formatted_address || '';

          onChange(formattedAddress, location.lat(), location.lng());
          map.setCenter(location);
          marker.position = location;
        });
      } catch (err) {
        console.error('Google Maps initialization failed', err);
      }
    };

    init();
  }, [address, lat, lng, onChange]);

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter a location"
        className="mt-1 mb-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
      />
      <div ref={mapRef} style={{ height: '200px', width: '100%' }} />
    </div>
  );
};

export default LocationPicker;
