import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let configured = false;

export function configureGoogleMaps(): boolean {
  if (configured) return true;
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) return false;
  setOptions({ key, v: 'weekly', language: 'en' });
  configured = true;
  return true;
}

export { importLibrary };
