import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    onSampleRef.current = onSample;
  }, [onSample]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      if (cancelled) return;

      if (!inFlightRef.current && !document.hidden) {
        const video = videoRef.current;
        const frame = video ? grabJpegDataUrl(video, maxWidth, JPEG_QUALITY) : null;
        if (frame) {
          inFlightRef.current = true;
          try {
            await onSampleRef.current(frame);
          } catch (err) {
            console.warn('[camera] onSample failed', err);
          } finally {
            inFlightRef.current = false;
          }
        }
      }

      if (!cancelled) timer = setTimeout(tick, intervalMs);
    };

    timer = setTimeout(tick, intervalMs);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [enabled, intervalMs, maxWidth, videoRef]);
}
