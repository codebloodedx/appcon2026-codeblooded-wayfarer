import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { fileToJpegDataUrl, grabJpegDataUrl } from './frameCapture';
import { useCameraStream } from './useCameraStream';
import { useFrameSampler } from './useFrameSampler';
import type { CameraPanelProps } from './types';
import './CameraPanel.css';

const SAMPLE_INTERVAL_MS = 2500;
const SAMPLE_MAX_WIDTH = 640;
const CAPTURE_MAX_WIDTH = 1280;
const CAPTURE_QUALITY = 0.9;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const FACING_MODE = 'environment' as const;

export function CameraPanel({ active, parked, onSample, onCapture }: CameraPanelProps) {
  const { videoRef, status, message, start, stop } = useCameraStream(FACING_MODE);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const isLive = status === 'live';
  const cameraUnavailable = status === 'denied' || status === 'no-camera' || status === 'error';

  useFrameSampler({
    enabled: isLive && active && !parked,
    intervalMs: SAMPLE_INTERVAL_MS,
    maxWidth: SAMPLE_MAX_WIDTH,
    videoRef,
    onSample,
  });

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!isLive || !parked || !video) return;
    setNotice(null);
    const frame = grabJpegDataUrl(video, CAPTURE_MAX_WIDTH, CAPTURE_QUALITY);
    if (!frame) {
      setNotice('The camera is not ready yet. Try again in a moment.');
      return;
    }
    try {
      onCapture(frame);
    } catch (err) {
      console.warn('[camera] onCapture failed', err);
      setNotice('The photo could not be processed. Try again.');
    }
  }, [isLive, onCapture, parked, videoRef]);

  const handleFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const file = input.files?.[0];
      input.value = '';
      if (!file || !parked || busy) return;

      if (!file.type.startsWith('image/')) {
        setNotice('Choose an image file (JPEG, PNG, or WebP).');
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setNotice('That image is larger than 10 MB. Choose a smaller one.');
        return;
      }

      setBusy(true);
      setNotice(null);
      try {
        const dataUrl = await fileToJpegDataUrl(file, CAPTURE_MAX_WIDTH, CAPTURE_QUALITY);
        onCapture(dataUrl);
      } catch (err) {
        console.warn('[camera] upload failed', err);
        setNotice('That image could not be read. Try a JPEG or PNG.');
      } finally {
        setBusy(false);
      }
    },
    [busy, onCapture, parked],
  );

  return (
    <section className="rr-camera" aria-label="Camera">
      <div className="rr-camera__stage">
        {/* Always mounted so the stream can attach; hidden until live. */}
        <video
          ref={videoRef}
          className={isLive ? 'rr-camera__video' : 'rr-camera__video rr-camera__video--hidden'}
          autoPlay
          muted
          playsInline
        />

        {isLive && (
          <span className="rr-camera__badge" role="status">
            <span className="rr-camera__dot" aria-hidden="true" />
            Live camera
            {parked ? ' · parked' : active ? ' · scanning for signs' : ' · scanning paused'}
          </span>
        )}

        {!isLive && (
          <div className="rr-camera__placeholder">
            {status === 'idle' && <p>Camera is off. Live sign detection starts when you turn it on.</p>}
            {status === 'loading' && <p role="status">Waiting for camera access…</p>}
            {cameraUnavailable && (
              <p role="alert">
                {message}
                {parked
                  ? ' You can upload a photo of a sign instead.'
                  : ' Photo upload is available when parked.'}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rr-camera__controls">
        {(status === 'idle' || cameraUnavailable) && (
          <button type="button" className="rr-camera__btn rr-camera__btn--primary" onClick={start}>
            {status === 'idle' ? 'Start camera' : 'Try camera again'}
          </button>
        )}

        {status === 'loading' && (
          <button type="button" className="rr-camera__btn" onClick={stop}>
            Cancel
          </button>
        )}

        {isLive && (
          <>
            {parked && (
              <button
                type="button"
                className="rr-camera__btn rr-camera__btn--primary"
                onClick={handleCapture}
              >
                Capture sign photo
              </button>
            )}
            <button type="button" className="rr-camera__btn" onClick={stop}>
              Stop camera
            </button>
          </>
        )}

        {cameraUnavailable && parked && (
          <>
            <button
              type="button"
              className="rr-camera__btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
            >
              {busy ? 'Reading photo…' : 'Upload sign photo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="rr-camera__file"
              onChange={handleFile}
              tabIndex={-1}
              aria-hidden="true"
            />
          </>
        )}
      </div>

      {notice && (
        <p className="rr-camera__notice" role="status">
          {notice}
        </p>
      )}
    </section>
  );
}

export default CameraPanel;
