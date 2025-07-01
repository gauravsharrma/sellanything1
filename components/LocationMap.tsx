import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

interface LocationMapProps {
  lat: number;
  lng: number;
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

const LocationMap: React.FC<LocationMapProps> = ({ lat, lng }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || lat === undefined || lng === undefined) {
      return;
    }

    const src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;

    let map: google.maps.Map;
    let marker: google.maps.Marker;

    const initMap = async () => {
      try {
        await loadScript(src);
        if (!window.google || !window.google.maps) return;
        if (!mapRef.current) return;

        const center = { lat, lng };
        map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
        });

        marker = new window.google.maps.Marker({
          position: center,
          map,
        });
      } catch (error) {
        console.error('Google Maps initialization failed:', error);
      }
    };

    initMap();
  }, [lat, lng]);

  return <div ref={mapRef} style={{ height: '300px', width: '100%' }} />;
};

export default LocationMap;
