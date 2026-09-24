import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { grabJpegDataUrl } from './frameCapture';

interface Options {
  enabled: boolean;
  intervalMs: number;
  maxWidth: number;
  videoRef: RefObject<HTMLVideoElement | null>;
  onSample: (imageDataUrl: string) => Promise<void>;
}

const JPEG_QUALITY = 0.7;

export function useFrameSampler({ enabled, intervalMs, maxWidth, videoRef, onSample }: Options) {
  const onSampleRef = useRef(onSample);
  const inFlightRef = useRef(false);
  const [status, setStatus] = useState<'idle' | 'waiting' | 'analyzing' | 'complete' | 'error'>('idle');

  useEffect(() => {
    onSampleRef.current = onSample;
  }, [onSample]);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setStatus('waiting');

    const tick = async () => {
      if (cancelled) return;
      let nextDelay = intervalMs;

      if (!inFlightRef.current && !document.hidden) {
        const video = videoRef.current;
        const frame = video ? grabJpegDataUrl(video, maxWidth, JPEG_QUALITY) : null;
        if (frame) {
          inFlightRef.current = true;
          setStatus('analyzing');
          try {
            await onSampleRef.current(frame);
            if (!cancelled) setStatus('complete');
          } catch (err) {
            console.warn('[camera] onSample failed', err);
            if (!cancelled) setStatus('error');
            const retryAfterMs = err && typeof err === 'object' && 'retryAfterMs' in err && typeof err.retryAfterMs === 'number'
              ? err.retryAfterMs
              : 0;
            nextDelay = Math.max(intervalMs, retryAfterMs);
          } finally {
            inFlightRef.current = false;
          }
        }
      }

      if (!cancelled) timer = setTimeout(tick, nextDelay);
    };

    timer = setTimeout(tick, intervalMs);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [enabled, intervalMs, maxWidth, videoRef]);

  return status;
}
