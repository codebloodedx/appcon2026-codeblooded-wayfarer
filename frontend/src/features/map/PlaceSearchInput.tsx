import { useEffect, useRef, useState } from 'react';
import type { CountryCode } from '../guidance/types';
import { configureGoogleMaps, importLibrary } from './googleMaps';

export type PlaceSelection = {
  label: string;
  coordinate?: { lat: number; lng: number };
};

type Suggestion = {
  id: string;
  label: string;
  secondary: string;
  coordinate?: { lat: number; lng: number };
  prediction?: google.maps.places.PlacePrediction;
};

const popularLocations: Record<CountryCode, Suggestion[]> = {
  JP: [
    { id: 'jp-shibuya-crossing', label: 'Shibuya Crossing', secondary: 'Shibuya, Tokyo, Japan', coordinate: { lat: 35.6595, lng: 139.7005 } },
    { id: 'jp-shibuya-station', label: 'Shibuya Station', secondary: 'Shibuya, Tokyo, Japan', coordinate: { lat: 35.658, lng: 139.7016 } },
    { id: 'jp-tokyo-station', label: 'Tokyo Station', secondary: 'Chiyoda, Tokyo, Japan', coordinate: { lat: 35.6812, lng: 139.7671 } },
    { id: 'jp-tokyo-tower', label: 'Tokyo Tower', secondary: 'Minato, Tokyo, Japan', coordinate: { lat: 35.6586, lng: 139.7454 } },
    { id: 'jp-sensoji', label: 'Sensō-ji', secondary: 'Asakusa, Tokyo, Japan', coordinate: { lat: 35.7148, lng: 139.7967 } },
    { id: 'jp-narita', label: 'Narita International Airport', secondary: 'Narita, Chiba, Japan', coordinate: { lat: 35.772, lng: 140.3929 } },
  ],
  PH: [
    { id: 'ph-moa', label: 'SM Mall of Asia', secondary: 'Pasay, Metro Manila, Philippines', coordinate: { lat: 14.5352, lng: 120.9822 } },
    { id: 'ph-nu-manila', label: 'National University Manila', secondary: 'Sampaloc, Manila, Philippines', coordinate: { lat: 14.6042, lng: 120.9947 } },
    { id: 'ph-rizal-park', label: 'Rizal Park', secondary: 'Ermita, Manila, Philippines', coordinate: { lat: 14.5826, lng: 120.9797 } },
    { id: 'ph-bgc', label: 'Bonifacio High Street', secondary: 'Taguig, Metro Manila, Philippines', coordinate: { lat: 14.5508, lng: 121.0523 } },
    { id: 'ph-makati', label: 'Makati Central Business District', secondary: 'Makati, Metro Manila, Philippines', coordinate: { lat: 14.5547, lng: 121.0244 } },
    { id: 'ph-naia-3', label: 'Ninoy Aquino International Airport Terminal 3', secondary: 'Pasay, Metro Manila, Philippines', coordinate: { lat: 14.5186, lng: 121.0198 } },
  ],
};

function localSuggestions(countryCode: CountryCode, value: string): Suggestion[] {
  const query = value.trim().toLocaleLowerCase();
  if (!query) return popularLocations[countryCode].slice(0, 5);
  return popularLocations[countryCode]
    .filter((item) => `${item.label} ${item.secondary}`.toLocaleLowerCase().includes(query))
    .slice(0, 5);
}

type Props = {
  id: string;
  label: string;
  value: string;
  countryCode: CountryCode;
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSelect: (selection: PlaceSelection) => void;
};

export function PlaceSearchInput({ id, label, value, countryCode, placeholder, disabled = false, onChange, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const requestId = useRef(0);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    if (disabled || !open) {
      setSuggestions([]);
      return;
    }
    const local = localSuggestions(countryCode, value);
    setSuggestions(local);
    if (value.trim().length < 2 || !configureGoogleMaps()) return;
    const id = ++requestId.current;
    const timer = window.setTimeout(async () => {
      try {
        const { AutocompleteSessionToken, AutocompleteSuggestion } = await importLibrary('places');
        sessionToken.current ??= new AutocompleteSessionToken();
        const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: value,
          includedRegionCodes: [countryCode.toLowerCase()],
          region: countryCode.toLowerCase(),
          language: 'en',
          sessionToken: sessionToken.current,
        });
        if (id !== requestId.current) return;
        const googleSuggestions = response.suggestions.flatMap((item) => {
          const prediction = item.placePrediction;
          if (!prediction) return [];
          return [{
            id: prediction.placeId,
            label: prediction.mainText?.text || prediction.text.text,
            secondary: prediction.secondaryText?.text || '',
            prediction,
          }];
        });
        const labels = new Set(local.map((item) => item.label.toLocaleLowerCase()));
        setSuggestions([...local, ...googleSuggestions.filter((item) => !labels.has(item.label.toLocaleLowerCase()))].slice(0, 6));
      } catch {
        if (id === requestId.current) setSuggestions(local);
      }
    }, 260);
    return () => window.clearTimeout(timer);
  }, [countryCode, disabled, open, value]);

  async function selectSuggestion(item: Suggestion) {
    setOpen(false);
    setSuggestions([]);
    if (item.coordinate) {
      onSelect({ label: [item.label, item.secondary].filter(Boolean).join(', '), coordinate: item.coordinate });
      sessionToken.current = null;
      return;
    }
    try {
      if (!item.prediction) return onSelect({ label: [item.label, item.secondary].filter(Boolean).join(', ') });
      const place = item.prediction.toPlace();
      await place.fetchFields({ fields: ['location', 'formattedAddress', 'displayName'] });
      const location = place.location;
      onSelect({
        label: place.formattedAddress || place.displayName || item.label,
        coordinate: location ? { lat: location.lat(), lng: location.lng() } : undefined,
      });
    } catch {
      onSelect({ label: [item.label, item.secondary].filter(Boolean).join(', ') });
    } finally {
      sessionToken.current = null;
    }
  }

  return (
    <div className="place-search">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <span aria-hidden="true">⌖</span>
        <input
          id={id}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={`${id}-suggestions`}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onChange={(event) => { onChange(event.target.value); setOpen(true); }}
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="place-suggestions" id={`${id}-suggestions`} role="listbox">
          {suggestions.map((item) => (
            <li key={item.id} role="option" aria-selected="false">
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => void selectSuggestion(item)}>
                <span aria-hidden="true">●</span><span><strong>{item.label}</strong>{item.secondary && <small>{item.secondary}</small>}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
