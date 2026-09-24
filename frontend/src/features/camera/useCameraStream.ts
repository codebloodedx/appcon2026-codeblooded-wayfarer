import { useCallback, useEffect, useRef, useState } from 'react';
import type { CameraStatus } from './types';

export function useCameraStream(facingMode: 'environment' | 'user') {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const attemptRef = useRef(0);
  const pendingRef = useRef(false);
  const wasDeniedRef = useRef(false);

  const [status, setStatus] = useState<CameraStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const releaseStream = useCallback(() => {
    const stream = streamRef.current;
    streamRef.current = null;
    stream?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }, []);

  const stop = useCallback(() => {
    attemptRef.current += 1;
    pendingRef.current = false;
    releaseStream();
    setStatus('idle');
    setMessage(null);
  }, [releaseStream]);

  const start = useCallback(async () => {
    if (streamRef.current || pendingRef.current) return;

    const attempt = ++attemptRef.current;
    pendingRef.current = true;
    setStatus('loading');
    setMessage(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      pendingRef.current = false;
      setStatus('error');
      setMessage('This browser cannot open the camera. Use HTTPS or localhost, and a current browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (attempt !== attemptRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      wasDeniedRef.current = false;
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          if (streamRef.current !== stream) return;
          releaseStream();
          setStatus('error');
          setMessage('The camera was disconnected. Reconnect it and start again.');
        };
      });

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      if (attempt !== attemptRef.current) return;

      pendingRef.current = false;
      setStatus('live');
    } catch (err) {
      if (attempt !== attemptRef.current) return; // stop() already reset state
      pendingRef.current = false;
      releaseStream();

      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
        setStatus('denied');
        if (wasDeniedRef.current) {
          setMessage(
            'Camera is still blocked and your browser won\'t ask again automatically. ' +
              'Open this site\'s settings (tap the icon next to the address bar), set Camera to "Allow", then reload the page.'
          );
        } else {
          setMessage(
            'Camera permission was denied. Live detection is off until you allow it. ' +
              'If "Try camera again" doesn\'t prompt you, enable Camera for this site in your browser settings, then reload.'
          );
        }
        wasDeniedRef.current = true;
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') {
        setStatus('no-camera');
        setMessage('No camera was found on this device. Live detection is off.');
      } else if (name === 'NotReadableError' || name === 'AbortError') {
        setStatus('error');
        setMessage('The camera is busy or unavailable. Close other apps using it and try again.');
      } else {
        setStatus('error');
        setMessage('The camera could not be started. Try again.');
      }
    }
  }, [facingMode, releaseStream]);

  useEffect(
    () => () => {
      attemptRef.current += 1;
      pendingRef.current = false;
      releaseStream();
    },
    [releaseStream],
  );

  return { videoRef, status, message, start, stop };
}
