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

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      if ((existingScript as HTMLScriptElement).readyState === 'complete') {
        resolve();
        return;
      }
      existingScript.addEventListener('load', () => resolve());
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script.'));
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

    const src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;

    let map: google.maps.Map;
    let marker: google.maps.Marker;
    let autocomplete: google.maps.places.Autocomplete;

    const initMap = async () => {
      try {
        await loadScript(src);

        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.error('Google Maps or Places library failed to load');
          return;
        }

        if (!mapRef.current || !inputRef.current) return;

        const center = {
          lat: parseFloat(lat || '0') || 0,
          lng: parseFloat(lng || '0') || 0,
        };

        map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 8,
        });

        marker = new window.google.maps.Marker({
          position: lat && lng ? center : undefined,
          map,
        });

        autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);

        if (address) inputRef.current.value = address;

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          const location = place.geometry.location;
          const formattedAddress = place.formatted_address || '';

          onChange(formattedAddress, location.lat().toString(), location.lng().toString());

          map.setCenter(location);
          marker.setPosition(location);
        });
      } catch (error) {
        console.error('Google Maps initialization failed:', error);
      }
    };

    initMap();
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
