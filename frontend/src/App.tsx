import { useCallback, useEffect, useRef, useState } from 'react';
import { AppShell } from './components/AppShell';
import { wayfarerLogoUrl } from './components/BrandLogo';
import { SimulationFrame } from './components/SimulationFrame';
import { getTripBriefing, playRuleAlert, recognizeSign, speakBrowserText } from './features/guidance';
import type { CountryCode, RecognitionDebug, RuleRecord, TripBriefing } from './features/guidance/types';
import { DevicePreviews } from './features/trip/DevicePreviews';
import { ParkedView } from './features/trip/ParkedView';
import { PreTripBriefing } from './features/trip/PreTripBriefing';
import { SupportedSignsView } from './features/trip/SupportedSignsView';
import { TripScreen } from './features/trip/TripScreen';
import { TripSetup } from './features/trip/TripSetup';
import type { AppView, SimulationMode, TripPlan } from './features/trip/types';

const DEFAULT_TRIP: TripPlan = {
  homeCountry: 'PH',
  destinationCountry: 'JP',
  destination: 'Shibuya, Tokyo',
  useSimulatedOrigin: true,
};

export default function App() {
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('phone');
  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [pendingTrip, setPendingTrip] = useState<TripPlan | null>(null);
  const [briefing, setBriefing] = useState<TripBriefing | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState<string | null>(null);
  const [view, setView] = useState<AppView>('trip');
  const [currentCountry, setCurrentCountry] = useState<CountryCode | null>(null);
  const [locationSource, setLocationSource] = useState<'gps' | 'selected' | 'simulated'>('selected');
  const [latestRule, setLatestRule] = useState<RuleRecord | null>(null);
  const [candidateRule, setCandidateRule] = useState<RuleRecord | null>(null);
  const [recognitionDebug, setRecognitionDebug] = useState<RecognitionDebug | null>(null);
  const [guidanceError, setGuidanceError] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState('Not played');
  const lastSpokenSign = useRef<string | null>(null);

  useEffect(() => {
    document.title = 'WayFarer';
    const existingIcon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const favicon = existingIcon ?? document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = wayfarerLogoUrl;
    if (!existingIcon) document.head.appendChild(favicon);
  }, []);

  const onCountryResolved = useCallback((country: CountryCode | null, source: 'gps' | 'selected' | 'simulated') => {
    setCurrentCountry(country);
    setLocationSource(source);
  }, []);

  async function startTrip(plan: TripPlan) {
    setPendingTrip(plan);
    setBriefing(null);
    setBriefingError(null);
    setBriefingLoading(true);
    const locality = plan.destination.split(',').at(-1)?.trim();
    try {
      const result = await getTripBriefing(plan.destinationCountry, locality);
      setBriefing(result);
      if (result.status === 'ready') {
        try {
          speakBrowserText(result.speechText, 0.92);
        } catch (error) {
          setBriefingError(error instanceof Error ? error.message : 'Spoken briefing is unavailable.');
        }
      }
    } catch (error) {
      setBriefingError(error instanceof Error ? error.message : 'The briefing could not be loaded.');
    } finally {
      setBriefingLoading(false);
    }
  }

  function confirmTrip() {
    if (!pendingTrip) return;
    setTrip(pendingTrip);
    setCurrentCountry(pendingTrip.destinationCountry);
    setLocationSource(pendingTrip.useSimulatedOrigin ? 'simulated' : 'selected');
    setPendingTrip(null);
    setView('trip');
  }

  const handleRecognition = useCallback(async (imageDataUrl: string, speak: boolean) => {
    const countryCode = currentCountry ?? trip?.destinationCountry;
    if (!countryCode) return;
    setGuidanceError(null);
    try {
      const result = await recognizeSign(countryCode, imageDataUrl);
      setRecognitionDebug(result.debug);
      if (result.status === 'recognized') {
        setLatestRule(result.rule);
        setCandidateRule(null);
        if (speak && lastSpokenSign.current !== result.signId) {
          lastSpokenSign.current = result.signId;
          setAudioStatus('Speaking reviewed alert');
          try {
            await playRuleAlert(countryCode, result.signId);
            setAudioStatus('Reviewed alert played');
          } catch (error) {
            setAudioStatus('Audio unavailable');
            setGuidanceError(error instanceof Error ? error.message : 'The alert could not be played.');
          }
        }
        return;
      }
      if (result.status === 'candidate') {
        setLatestRule(null);
        setCandidateRule(result.rule);
        setAudioStatus('Candidate detected · silent');
        lastSpokenSign.current = null;
        return;
      }
      setLatestRule(null);
      setCandidateRule(null);
      setAudioStatus('Unknown · silent');
      lastSpokenSign.current = null;
    } catch (error) {
      setRecognitionDebug(null);
      setGuidanceError(error instanceof Error ? error.message : 'Sign recognition is unavailable.');
      setAudioStatus('Recognition error');
    }
  }, [currentCountry, trip]);

  function editTrip() {
    window.speechSynthesis?.cancel();
    setTrip(null);
    setPendingTrip(null);
    setLatestRule(null);
    setCandidateRule(null);
    setRecognitionDebug(null);
    setGuidanceError(null);
    setAudioStatus('Not played');
    lastSpokenSign.current = null;
  }

  function toggleSimulationMode() {
    setSimulationMode((prev) => (prev === 'phone' ? 'desktop' : 'phone'));
  }

  function handleUpdateTrip(updatedTrip: TripPlan) {
    setTrip(updatedTrip);
    setCurrentCountry(updatedTrip.destinationCountry);
    setLocationSource(updatedTrip.useSimulatedOrigin ? 'simulated' : 'selected');
  }

  // Pre-Trip Safety Briefing Screen
  if (!trip && pendingTrip) {
    return (
      <SimulationFrame mode={simulationMode} onToggleMode={toggleSimulationMode}>
        <PreTripBriefing
          trip={pendingTrip}
          briefing={briefing}
          loading={briefingLoading}
          error={briefingError}
          onBack={() => {
            setPendingTrip(null);
            setBriefing(null);
            setBriefingError(null);
          }}
          onContinue={confirmTrip}
        />
      </SimulationFrame>
    );
  }

  // Initial Direct Landing Page / Trip Setup
  if (!trip) {
    return (
      <SimulationFrame mode={simulationMode} onToggleMode={toggleSimulationMode}>
        <TripSetup initialTrip={DEFAULT_TRIP} onStart={(plan) => void startTrip(plan)} />
      </SimulationFrame>
    );
  }

  // Active Google Maps Driving Cockpit & Overlays
  return (
    <SimulationFrame mode={simulationMode} onToggleMode={toggleSimulationMode}>
      <AppShell
        activeView={view}
        trip={trip}
        onChangeView={setView}
        onEditTrip={editTrip}
        onUpdateTrip={handleUpdateTrip}
        cockpit={
          <TripScreen
            trip={trip}
            currentCountry={currentCountry}
            locationSource={locationSource}
            latestRule={latestRule}
            candidateRule={candidateRule}
            recognitionDebug={recognitionDebug}
            guidanceError={guidanceError}
            audioStatus={audioStatus}
            onCountryResolved={onCountryResolved}
            onRecognize={(frame) => handleRecognition(frame, true)}
            onPark={() => setView('parked')}
          />
        }
      >
        {view === 'parked' && (
          <ParkedView
            trip={trip}
            currentCountry={currentCountry}
            locationSource={locationSource}
            latestRule={latestRule}
            candidateRule={candidateRule}
            guidanceError={guidanceError}
            onCapture={(frame) => void handleRecognition(frame, false)}
          />
        )}
        {view === 'signs' && <SupportedSignsView countryCode={trip.destinationCountry} />}
        {view === 'devices' && <DevicePreviews trip={trip} />}
      </AppShell>
    </SimulationFrame>
  );
}
