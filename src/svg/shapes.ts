import type { ShapeMarkupParams, ShapeMarkupResult } from '#src/types.js';

/**
 * Produces four SVG element strings (track, base fill, pattern overlay, stroke)
 * for a given shape type. Empty strings are returned for layers that don't apply.
 *
 * Rendering order: trackShape → baseShape → overlayShape → strokeShape
 */
export function buildShapeMarkup({
  width,
  height,
  shape,
  fillRef,
  opacity,
  strokeColor,
  strokeWidth,
  idPrefix,
  hasPattern,
  trackColor,
  clipAttr,
}: ShapeMarkupParams): ShapeMarkupResult {
  const halfStroke = strokeWidth / 2;
  // Inset dimensions so the stroke doesn't bleed outside the canvas bounds
  const safeWidth = Math.max(0, width - strokeWidth);
  const safeHeight = Math.max(0, height - strokeWidth);

  let trackShape = '';
  // baseShape is always set in one of the branches below
  let baseShape;
  let overlayShape = '';
  let strokeShape = '';

  if (shape === 'circle') {
    const radius = Math.max(0, Math.min(width, height) / 2 - halfStroke);

    if (trackColor) {
      trackShape = `<circle cx="${width / 2}" cy="${height / 2}" r="${radius}" fill="${trackColor}"/>`;
    }

    baseShape = `<circle cx="${width / 2}" cy="${height / 2}" r="${radius}" fill="${fillRef}" fill-opacity="${opacity}" ${clipAttr}/>`;

    if (hasPattern) {
      overlayShape = `<circle cx="${width / 2}" cy="${height / 2}" r="${radius}" fill="url(#${idPrefix}-pattern)" ${clipAttr}/>`;
    }

    if (strokeWidth > 0) {
      strokeShape = `<circle cx="${width / 2}" cy="${height / 2}" r="${radius}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
    }
  } else if (shape === 'rounded-rectangle') {
    // Corner radius: 15 % of the shorter side
    const rx = Math.max(0, Math.min(width, height) * 0.15);

    if (trackColor) {
      trackShape = `<rect x="${halfStroke}" y="${halfStroke}" width="${safeWidth}" height="${safeHeight}" rx="${rx}" ry="${rx}" fill="${trackColor}"/>`;
    }

    baseShape = `<rect x="${halfStroke}" y="${halfStroke}" width="${safeWidth}" height="${safeHeight}" rx="${rx}" ry="${rx}" fill="${fillRef}" fill-opacity="${opacity}" ${clipAttr}/>`;

    if (hasPattern) {
      overlayShape = `<rect x="${halfStroke}" y="${halfStroke}" width="${safeWidth}" height="${safeHeight}" rx="${rx}" ry="${rx}" fill="url(#${idPrefix}-pattern)" ${clipAttr}/>`;
    }

    if (strokeWidth > 0) {
      strokeShape = `<rect x="${halfStroke}" y="${halfStroke}" width="${safeWidth}" height="${safeHeight}" rx="${rx}" ry="${rx}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
    }
  } else {
    // Default: plain rectangle
    if (trackColor) {
      trackShape = `<rect x="${halfStroke}" y="${halfStroke}" width="${safeWidth}" height="${safeHeight}" fill="${trackColor}"/>`;
    }

    baseShape = `<rect x="${halfStroke}" y="${halfStroke}" width="${safeWidth}" height="${safeHeight}" fill="${fillRef}" fill-opacity="${opacity}" ${clipAttr}/>`;

    if (hasPattern) {
      overlayShape = `<rect x="${halfStroke}" y="${halfStroke}" width="${safeWidth}" height="${safeHeight}" fill="url(#${idPrefix}-pattern)" ${clipAttr}/>`;
    }

    if (strokeWidth > 0) {
      strokeShape = `<rect x="${halfStroke}" y="${halfStroke}" width="${safeWidth}" height="${safeHeight}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
    }
  }

  return { trackShape, baseShape, overlayShape, strokeShape };
}
