export type CountryCode = 'PH' | 'JP';
export type AppView = 'trip' | 'navigation' | 'reviewed-guidance' | 'sign-recognition' | 'settings';
export type SimulationMode = 'phone' | 'desktop';

export type TripPlan = {
  homeCountry: CountryCode;
  destinationCountry: CountryCode;
  origin: string;
  originCoordinate?: { lat: number; lng: number };
  originSource: 'gps' | 'selected' | 'simulated';
  destination: string;
  destinationCoordinate?: { lat: number; lng: number };
  useSimulatedOrigin: boolean;
};

export type InterfaceState = 'ready' | 'loading' | 'location-denied' | 'camera-denied' | 'unknown' | 'offline' | 'map-key';
