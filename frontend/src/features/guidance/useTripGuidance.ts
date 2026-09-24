import { useCallback, useRef, useState } from 'react';
import { playRuleAlert, recognizeSign } from './guidanceApi';
import type { CountryCode, RecognitionDebug, RuleRecord } from './types';

export function useTripGuidance(countryCode: CountryCode | null) {
  const [latestRule, setLatestRule] = useState<RuleRecord | null>(null);
  const [candidateRule, setCandidateRule] = useState<RuleRecord | null>(null);
  const [recognitionDebug, setRecognitionDebug] = useState<RecognitionDebug | null>(null);
  const [guidanceError, setGuidanceError] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState('Not played');
  const lastSpokenSign = useRef<string | null>(null);

  const handleRecognition = useCallback(
    async (imageDataUrl: string, speak: boolean) => {
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
    },
    [countryCode]
  );

  const resetGuidance = useCallback(() => {
    window.speechSynthesis?.cancel();
    setLatestRule(null);
    setCandidateRule(null);
    setRecognitionDebug(null);
    setGuidanceError(null);
    setAudioStatus('Not played');
    lastSpokenSign.current = null;
  }, []);

  return {
    latestRule,
    candidateRule,
    recognitionDebug,
    guidanceError,
    audioStatus,
    handleRecognition,
    resetGuidance,
  };
}
