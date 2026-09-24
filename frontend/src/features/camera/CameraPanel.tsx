import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { ChangeEvent } from 'react';
import { fileToJpegDataUrl, grabJpegDataUrl } from './frameCapture';
import { useCameraStream } from './useCameraStream';
import { useFrameSampler } from './useFrameSampler';
import type { CameraPanelProps } from './types';
import { fitNormalizedBoxToCover } from './detectionOverlay';
import { useDetectionTracker } from './useDetectionTracker';
import './CameraPanel.css';

const SAMPLE_INTERVAL_MS = 2500;
const SAMPLE_MAX_WIDTH = 960;
const CAPTURE_MAX_WIDTH = 1280;
const CAPTURE_QUALITY = 0.9;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_ENCODED_IMAGE_CHARS = 2_000_000;
const FACING_MODE = 'environment' as const;

export function CameraPanel({ active, parked, onSample, onCapture, detection = null, recognitionStatus = 'waiting' }: CameraPanelProps) {
  const { videoRef, status, message, start, stop } = useCameraStream(FACING_MODE);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [boxStyle, setBoxStyle] = useState<CSSProperties | null>(null);

  const isLive = status === 'live';
  const cameraUnavailable = status === 'denied' || status === 'no-camera' || status === 'error';
  const trackedBox = useDetectionTracker(videoRef, detection?.bbox ?? null, isLive && !parked && Boolean(detection));

  useEffect(() => {
    if (!active) stop();
  }, [active, stop]);

  const samplingStatus = useFrameSampler({
    enabled: isLive && active && !parked,
    intervalMs: SAMPLE_INTERVAL_MS,
    maxWidth: SAMPLE_MAX_WIDTH,
    videoRef,
    onSample,
  });

  useEffect(() => {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!isLive || !detection || !stage || !video) {
      setBoxStyle(null);
      return;
    }
    const updateBox = () => {
      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;
      const sourceWidth = video.videoWidth;
      const sourceHeight = video.videoHeight;
      if (!stageWidth || !stageHeight || !sourceWidth || !sourceHeight) return setBoxStyle(null);
      setBoxStyle(fitNormalizedBoxToCover(trackedBox ?? detection.bbox, sourceWidth, sourceHeight, stageWidth, stageHeight));
    };
    updateBox();
    const observer = new ResizeObserver(updateBox);
    observer.observe(stage);
    video.addEventListener('loadedmetadata', updateBox);
    return () => {
      observer.disconnect();
      video.removeEventListener('loadedmetadata', updateBox);
    };
  }, [detection, isLive, trackedBox, videoRef]);

  const scanLabel = samplingStatus === 'analyzing'
    ? 'Analyzing frame…'
    : recognitionStatus === 'recognized'
      ? 'Supported sign detected'
      : recognitionStatus === 'candidate'
        ? 'Candidate sign detected'
        : recognitionStatus === 'unknown'
          ? 'No supported sign in latest frame'
          : recognitionStatus === 'error' || samplingStatus === 'error'
            ? 'Recognition request failed'
            : 'Waiting for next sample';

  const handleCapture = useCallback(async () => {
    const video = videoRef.current;
    if (!isLive || !parked || !video) return;
    setNotice(null);
    const frame = grabJpegDataUrl(video, CAPTURE_MAX_WIDTH, CAPTURE_QUALITY);
    if (!frame) {
      setNotice('The camera is not ready yet. Try again in a moment.');
      return;
    }
    if (frame.length > MAX_ENCODED_IMAGE_CHARS) {
      setNotice('This photo is too large for sign recognition. Move closer and try again.');
      return;
    }
    try {
      setBusy(true);
      await onCapture(frame);
      setPreviewUrl(frame);
      setNotice('Photo analyzed. Review the recognized meaning and source below.');
    } catch (err) {
      console.warn('[camera] onCapture failed', err);
      setNotice('The photo could not be processed. Try again.');
    } finally {
      setBusy(false);
    }
  }, [isLive, onCapture, parked, videoRef]);

  const handleFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const file = input.files?.[0];
      input.value = '';
      if (!file || !parked || busy) return;

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
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
        if (dataUrl.length > MAX_ENCODED_IMAGE_CHARS) {
          setNotice('This photo is too large for sign recognition. Choose a smaller photo.');
          return;
        }
        setPreviewUrl(dataUrl);
        await onCapture(dataUrl);
        setNotice('Uploaded photo analyzed. This is parked analysis, not live detection.');
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
      <div ref={stageRef} className="rr-camera__stage">
        {/* Always mounted so the stream can attach; hidden until live. */}
        <video
          ref={videoRef}
          className={isLive ? 'rr-camera__video' : 'rr-camera__video rr-camera__video--hidden'}
          autoPlay
          muted
          playsInline
        />

        {!isLive && previewUrl && <img className="rr-camera__photo-preview" src={previewUrl} alt="Uploaded traffic sign for parked analysis" />}

        {isLive && detection && boxStyle && (
          <div className={`rr-camera__detection rr-camera__detection--${detection.status}`} style={boxStyle} aria-label={`${detection.label}, ${Math.round(detection.confidence * 100)} percent confidence`}>
            <span>{detection.label} · {Math.round(detection.confidence * 100)}%</span>
          </div>
        )}

        {isLive && (
          <span className="rr-camera__badge" role="status">
            <span className="rr-camera__dot" aria-hidden="true" />
            Live camera
            {parked ? ' · parked' : active ? ' · scanning for signs' : ' · scanning paused'}
          </span>
        )}

        {isLive && !parked && <span className={`rr-camera__scan-status rr-camera__scan-status--${recognitionStatus}`} role="status">{scanLabel}</span>}

        {!isLive && !previewUrl && (
          <div className="rr-camera__placeholder">
            {status === 'idle' && <p>Start the camera to show the live tracking square and hear concise sign guidance while driving.</p>}
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
          <button type="button" className="rr-camera__btn rr-camera__btn--primary" onClick={start} disabled={!active}>
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
                disabled={busy}
              >
                {busy ? 'Analyzing photo…' : 'Capture sign photo'}
              </button>
            )}
            <button type="button" className="rr-camera__btn" onClick={stop}>
              Stop camera
            </button>
          </>
        )}

        {parked && (
          <>
            <button
              type="button"
              className="rr-camera__btn rr-camera__btn--primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
            >
              {busy ? 'Reading photo…' : 'Upload sign photo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="rr-camera__file"
              onChange={handleFile}
              tabIndex={-1}
              aria-hidden="true"
            />
            {previewUrl && <button type="button" className="rr-camera__btn" onClick={() => { setPreviewUrl(null); setNotice(null); }}>Clear photo</button>}
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
