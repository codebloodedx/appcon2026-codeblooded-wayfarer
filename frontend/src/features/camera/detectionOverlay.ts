export type PixelBox = { left: number; top: number; width: number; height: number };

export function fitNormalizedBoxToCover(
  bbox: [number, number, number, number],
  sourceWidth: number,
  sourceHeight: number,
  stageWidth: number,
  stageHeight: number,
): PixelBox | null {
  if ([sourceWidth, sourceHeight, stageWidth, stageHeight].some((value) => !Number.isFinite(value) || value <= 0)) return null;
  const [xMin, yMin, xMax, yMax] = bbox;
  if (xMin < 0 || yMin < 0 || xMax > 1 || yMax > 1 || xMin >= xMax || yMin >= yMax) return null;
  const scale = Math.max(stageWidth / sourceWidth, stageHeight / sourceHeight);
  const renderedWidth = sourceWidth * scale;
  const renderedHeight = sourceHeight * scale;
  const cropX = (renderedWidth - stageWidth) / 2;
  const cropY = (renderedHeight - stageHeight) / 2;
  const left = Math.max(0, xMin * renderedWidth - cropX);
  const top = Math.max(0, yMin * renderedHeight - cropY);
  const right = Math.min(stageWidth, xMax * renderedWidth - cropX);
  const bottom = Math.min(stageHeight, yMax * renderedHeight - cropY);
  return right > left && bottom > top ? { left, top, width: right - left, height: bottom - top } : null;
}
