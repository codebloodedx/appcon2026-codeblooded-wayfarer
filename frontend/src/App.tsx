import { useCallback, useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { SimulationFrame } from './components/SimulationFrame';
import { wayfarerIconUrl } from './components/BrandLogo';
import { getTripBriefing, recognizeSign, speakBrowserText } from './features/guidance';
import type { CountryCode, RecognitionDebug, RuleRecord, TripBriefing } from './features/guidance/types';
import { DevicePreviews } from './features/trip/DevicePreviews';
import { LandingPage } from './features/trip/LandingPage';
import { ParkedView } from './features/trip/ParkedView';
import { PreTripBriefing } from './features/trip/PreTripBriefing';
import { SupportedSignsView } from './features/trip/SupportedSignsView';
import { TripScreen } from './features/trip/TripScreen';
import { TripSetup } from './features/trip/TripSetup';
import type { NavigationStatus } from './features/map';
import type { AppView, SimulationMode, TripPlan } from './features/trip/types';

const DEFAULT_TRIP: TripPlan = {
  homeCountry: 'PH',
  destinationCountry: 'JP',
  origin: 'Tokyo Station',
  originSource: 'simulated',
  destination: 'Shibuya, Tokyo',
  useSimulatedOrigin: true,
};

export default function App() {
  const [simulationMode, setSimulationMode] = useState<SimulationMode | null>(null);
  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [pendingTrip, setPendingTrip] = useState<TripPlan | null>(null);
  const [briefing, setBriefing] = useState<TripBriefing | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState<string | null>(null);
  const [reviewingPendingGuidance, setReviewingPendingGuidance] = useState(false);
  const [view, setView] = useState<AppView>('trip');
  const [currentCountry, setCurrentCountry] = useState<CountryCode | null>(null);
  const [latestRule, setLatestRule] = useState<RuleRecord | null>(null);
  const [candidateRule, setCandidateRule] = useState<RuleRecord | null>(null);
  const [recognitionDebug, setRecognitionDebug] = useState<RecognitionDebug | null>(null);
  const [guidanceError, setGuidanceError] = useState<string | null>(null);
  const [navigationStatus, setNavigationStatus] = useState<NavigationStatus>('loading');

  useEffect(() => {
    document.title = 'WayFarer';
    const existingIcon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const favicon = existingIcon ?? document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = wayfarerIconUrl;
    if (!existingIcon) document.head.appendChild(favicon);
  }, []);

  const onCountryResolved = useCallback((country: CountryCode | null, _source: 'gps' | 'selected' | 'simulated') => {
    setCurrentCountry(country);
  }, []);

  useEffect(() => {
    if (!pendingTrip && !trip) return;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
        document.querySelector<HTMLElement>('.simulation-stage')?.scrollTo({ top: 0, behavior: 'auto' });
        document.querySelector<HTMLElement>('.simulation-viewport')?.scrollTo({ top: 0, behavior: 'auto' });
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pendingTrip, reviewingPendingGuidance, trip]);

  async function startTrip(plan: TripPlan) {
    setPendingTrip(plan);
    setReviewingPendingGuidance(false);
    setBriefing(null);
    setBriefingError(null);
    setBriefingLoading(true);
    const locality = plan.destination.split(',').at(-1)?.trim();
    try {
      const result = await getTripBriefing(plan.destinationCountry, locality, plan.homeCountry);
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
    setPendingTrip(null);
    setReviewingPendingGuidance(false);
    setView('trip');
  }

  const handleRecognition = useCallback(async (imageDataUrl: string, speak: boolean, countryOverride?: CountryCode) => {
    const countryCode = countryOverride ?? currentCountry ?? trip?.destinationCountry;
    if (!countryCode) return;
    setGuidanceError(null);
    try {
      const result = await recognizeSign(countryCode, imageDataUrl);
      setRecognitionDebug(result.debug);
      if (result.status === 'recognized') {
        setLatestRule(result.rule);
        setCandidateRule(null);
        return;
      }
      if (result.status === 'candidate') {
        setLatestRule(null);
        setCandidateRule(result.rule);
        return;
      }
      setLatestRule(null);
      setCandidateRule(null);
    } catch (error) {
      setRecognitionDebug(null);
      setGuidanceError(error instanceof Error ? error.message : 'Sign recognition is unavailable.');
      if (speak) throw error;
    }
  }, [currentCountry, trip]);

  function editTrip() {
    window.speechSynthesis?.cancel();
    setTrip(null);
    setPendingTrip(null);
    setReviewingPendingGuidance(false);
    setLatestRule(null);
    setCandidateRule(null);
    setRecognitionDebug(null);
    setGuidanceError(null);
  }

  function changeSimulationMode() {
    window.speechSynthesis?.cancel();
    setSimulationMode(null);
  }

  if (!simulationMode) return <LandingPage onSelect={setSimulationMode} />;

  if (!trip && pendingTrip) {
    return (
      <SimulationFrame mode={simulationMode} onChangeMode={changeSimulationMode}>
        {reviewingPendingGuidance
          ? <ParkedView trip={pendingTrip} latestRule={latestRule} candidateRule={candidateRule} guidanceError={guidanceError} onBack={() => setReviewingPendingGuidance(false)} onCapture={(frame) => void handleRecognition(frame, false, pendingTrip.destinationCountry)} />
          : <PreTripBriefing trip={pendingTrip} briefing={briefing} loading={briefingLoading} error={briefingError} onBack={() => { setPendingTrip(null); setBriefing(null); setBriefingError(null); }} onBrowseGuidance={() => setReviewingPendingGuidance(true)} onContinue={confirmTrip} />}
      </SimulationFrame>
    );
  }
  if (!trip) {
    return (
      <SimulationFrame mode={simulationMode} onChangeMode={changeSimulationMode}>
        <TripSetup initialTrip={DEFAULT_TRIP} onStart={(plan) => void startTrip(plan)} />
      </SimulationFrame>
    );
  }

  return (
    <SimulationFrame mode={simulationMode} onChangeMode={changeSimulationMode}>
      <AppShell
        activeView={view}
        onChangeView={setView}
        cockpit={<TripScreen trip={trip} currentCountry={currentCountry} latestRule={latestRule} candidateRule={candidateRule} recognitionDebug={recognitionDebug} guidanceError={guidanceError} onCountryResolved={onCountryResolved} onRecognize={(frame) => handleRecognition(frame, true)} onUpdateTrip={setTrip} onEditTrip={editTrip} onNavigationStateChange={setNavigationStatus} />}
      >
        {view === 'parked' && <ParkedView trip={trip} latestRule={latestRule} candidateRule={candidateRule} guidanceError={guidanceError} navigationActive={navigationStatus === 'driving' || navigationStatus === 'paused'} onCapture={(frame) => handleRecognition(frame, false)} />}
        {view === 'signs' && <SupportedSignsView countryCode={trip.destinationCountry} />}
        {view === 'devices' && <DevicePreviews trip={trip} />}
      </AppShell>
    </SimulationFrame>
  );
}
