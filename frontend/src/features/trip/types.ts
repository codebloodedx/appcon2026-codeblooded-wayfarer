export type CountryCode = 'PH' | 'JP';
export type AppView = 'trip' | 'parked' | 'signs' | 'devices';
export type SimulationMode = 'phone' | 'desktop';

export type TripPlan = {
  homeCountry: CountryCode;
  destinationCountry: CountryCode;
  destination: string;
  useSimulatedOrigin: boolean;
};

export type InterfaceState = 'ready' | 'loading' | 'location-denied' | 'camera-denied' | 'unknown' | 'offline' | 'map-key';
