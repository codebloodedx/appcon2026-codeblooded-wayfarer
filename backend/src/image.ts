const dataUrlPattern = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const maximumImageBytes = 1_500_000;

export type ParsedImage = { mimeType: string; base64: string };

export function parseImageDataUrl(value: unknown): ParsedImage | null {
  if (typeof value !== 'string') return null;
  const match = dataUrlPattern.exec(value);
  if (!match) return null;
  const [, mimeType, base64] = match;
  const estimatedBytes = Math.floor((base64.length * 3) / 4);
  if (estimatedBytes < 1 || estimatedBytes > maximumImageBytes) return null;
  return { mimeType, base64 };
}
