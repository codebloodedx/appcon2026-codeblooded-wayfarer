import { useEffect, useRef, useState, type RefObject } from 'react';

type Box = [number, number, number, number];
type Template = { pixels: Uint8Array; x: number; y: number; width: number; height: number; frameWidth: number; frameHeight: number };

const TRACK_WIDTH = 240;
const SEARCH_RADIUS = 18;
const SEARCH_STEP = 2;
const SAMPLE_STEP = 3;
const MAX_DIFFERENCE = 58;

function grayscale(data: Uint8ClampedArray): Uint8Array {
  const result = new Uint8Array(data.length / 4);
  for (let source = 0, target = 0; source < data.length; source += 4, target += 1) {
    result[target] = Math.round(data[source] * 0.299 + data[source + 1] * 0.587 + data[source + 2] * 0.114);
  }
  return result;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function captureTemplate(frame: Uint8Array, frameWidth: number, frameHeight: number, bbox: Box): Template | null {
  const x = clamp(Math.round(bbox[0] * frameWidth), 0, frameWidth - 2);
  const y = clamp(Math.round(bbox[1] * frameHeight), 0, frameHeight - 2);
  const right = clamp(Math.round(bbox[2] * frameWidth), x + 2, frameWidth);
  const bottom = clamp(Math.round(bbox[3] * frameHeight), y + 2, frameHeight);
  const width = right - x;
  const height = bottom - y;
  if (width < 8 || height < 8) return null;
  const pixels = new Uint8Array(width * height);
  for (let row = 0; row < height; row += 1) {
    pixels.set(frame.subarray((y + row) * frameWidth + x, (y + row) * frameWidth + x + width), row * width);
  }
  return { pixels, x, y, width, height, frameWidth, frameHeight };
}

function matchTemplate(frame: Uint8Array, template: Template): { x: number; y: number; difference: number } {
  let best = { x: template.x, y: template.y, difference: Number.POSITIVE_INFINITY };
  const minX = clamp(template.x - SEARCH_RADIUS, 0, template.frameWidth - template.width);
  const maxX = clamp(template.x + SEARCH_RADIUS, 0, template.frameWidth - template.width);
  const minY = clamp(template.y - SEARCH_RADIUS, 0, template.frameHeight - template.height);
  const maxY = clamp(template.y + SEARCH_RADIUS, 0, template.frameHeight - template.height);
  for (let y = minY; y <= maxY; y += SEARCH_STEP) {
    for (let x = minX; x <= maxX; x += SEARCH_STEP) {
      let difference = 0;
      let samples = 0;
      for (let row = 0; row < template.height; row += SAMPLE_STEP) {
        for (let column = 0; column < template.width; column += SAMPLE_STEP) {
          difference += Math.abs(frame[(y + row) * template.frameWidth + x + column] - template.pixels[row * template.width + column]);
          samples += 1;
        }
      }
      const average = samples ? difference / samples : Number.POSITIVE_INFINITY;
      if (average < best.difference) best = { x, y, difference: average };
    }
  }
  return best;
}

export function useDetectionTracker(videoRef: RefObject<HTMLVideoElement | null>, bbox: Box | null, enabled: boolean): Box | null {
  const [trackedBox, setTrackedBox] = useState<Box | null>(bbox);
  const templateRef = useRef<Template | null>(null);
  const pendingBoxRef = useRef<Box | null>(bbox);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const bboxKey = bbox?.join(':') ?? 'none';

  useEffect(() => {
    pendingBoxRef.current = bbox;
    templateRef.current = null;
    setTrackedBox(bbox);
  }, [bboxKey]);

  useEffect(() => {
    if (!enabled || !bbox) return;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    const track = (timestamp: number) => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        animationRef.current = requestAnimationFrame(track);
        return;
      }
      if (timestamp - lastFrameRef.current < 100) {
        animationRef.current = requestAnimationFrame(track);
        return;
      }
      lastFrameRef.current = timestamp;
      const width = TRACK_WIDTH;
      const height = Math.max(1, Math.round(width * video.videoHeight / video.videoWidth));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.drawImage(video, 0, 0, width, height);
      const frame = grayscale(context.getImageData(0, 0, width, height).data);
      if (!templateRef.current && pendingBoxRef.current) {
        templateRef.current = captureTemplate(frame, width, height, pendingBoxRef.current);
      } else if (templateRef.current) {
        const match = matchTemplate(frame, templateRef.current);
        if (match.difference <= MAX_DIFFERENCE) {
          templateRef.current.x = match.x;
          templateRef.current.y = match.y;
          const next: Box = [
            match.x / width,
            match.y / height,
            (match.x + templateRef.current.width) / width,
            (match.y + templateRef.current.height) / height,
          ];
          setTrackedBox(next);
        }
      }
      animationRef.current = requestAnimationFrame(track);
    };
    animationRef.current = requestAnimationFrame(track);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      templateRef.current = null;
    };
  }, [bboxKey, enabled, videoRef]);

  return enabled ? trackedBox : null;
}
