export function isVideoReady(video: HTMLVideoElement): boolean {
  return video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;
}

function drawToJpegDataUrl(
  source: CanvasImageSource,
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  quality: number,
): string | null {
  const scale = Math.min(1, maxWidth / srcWidth);
  const width = Math.max(1, Math.round(srcWidth * scale));
  const height = Math.max(1, Math.round(srcHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  canvas.width = 0;
  canvas.height = 0;
  return dataUrl.startsWith('data:image/jpeg') ? dataUrl : null;
}

export function grabJpegDataUrl(
  video: HTMLVideoElement,
  maxWidth: number,
  quality: number,
): string | null {
  if (!isVideoReady(video)) return null;
  return drawToJpegDataUrl(video, video.videoWidth, video.videoHeight, maxWidth, quality);
}

export async function fileToJpegDataUrl(
  file: File,
  maxWidth: number,
  quality: number,
): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const result = drawToJpegDataUrl(img, img.naturalWidth, img.naturalHeight, maxWidth, quality);
    if (!result) throw new Error('Could not encode image');
    return result;
  } finally {
    URL.revokeObjectURL(url);
  }
}
