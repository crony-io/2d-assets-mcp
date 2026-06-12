import type {
  FillDefsParams,
  FillDefsResult,
  GradientCoords,
} from '#src/types.js';
import { shadeHexColor, getContrastingTextColor } from '#src/utils/color.js';

/**
 * Converts a gradient angle (degrees) into SVG gradient vector coordinates.
 * The returned values are fractions (0..1) used in x1/y1/x2/y2 attributes.
 */
export function angleToGradientCoords(angleDeg: number): GradientCoords {
  const rad = (angleDeg * Math.PI) / 180;
  const vx = Math.cos(rad);
  const vy = Math.sin(rad);

  return {
    x1: 0.5 - vx / 2,
    y1: 0.5 - vy / 2,
    x2: 0.5 + vx / 2,
    y2: 0.5 + vy / 2,
  };
}

/**
 * Builds the SVG <defs> content for gradient and/or pattern fills.
 *
 * Returns:
 *  - `defs`       raw SVG string to inject inside a <defs> block
 *  - `fillRef`    value to use as the `fill` attribute on shape elements
 *  - `hasPattern` whether a pattern overlay was generated
 */
export function buildFillDefs({
  idPrefix,
  color,
  secondaryColor,
  fillMode,
  gradientAngle,
  pattern,
  patternColor,
  patternOpacity,
  patternScale,
}: FillDefsParams): FillDefsResult {
  let defs = '';
  // Default fill is the solid primary color; overridden below for gradients
  let fillRef = color;

  const resolvedSecondary = secondaryColor ?? shadeHexColor(color, 0.22);
  const resolvedPatternColor = patternColor ?? getContrastingTextColor(color);

  // ── Gradient fills ─────────────────────────────────────────────────────────

  if (fillMode === 'linear-gradient') {
    const { x1, y1, x2, y2 } = angleToGradientCoords(gradientAngle);
    defs += `
        <linearGradient id="${idPrefix}-gradient" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
            <stop offset="0%" stop-color="${color}" />
            <stop offset="100%" stop-color="${resolvedSecondary}" />
        </linearGradient>`;
    fillRef = `url(#${idPrefix}-gradient)`;
  } else if (fillMode === 'radial-gradient') {
    defs += `
        <radialGradient id="${idPrefix}-gradient" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="${color}" />
            <stop offset="100%" stop-color="${resolvedSecondary}" />
        </radialGradient>`;
    fillRef = `url(#${idPrefix}-gradient)`;
  }

  // ── Pattern overlays ───────────────────────────────────────────────────────

  if (pattern !== 'none') {
    const tile = Math.max(2, patternScale);
    // Scale stroke width relative to tile size; minimum of 1px
    const strokeWidth = Math.max(1, Math.floor(tile / 7));

    if (pattern === 'stripes') {
      defs += `
            <pattern id="${idPrefix}-pattern" patternUnits="userSpaceOnUse" width="${tile}" height="${tile}">
                <path d="M 0 ${tile} L ${tile} 0" stroke="${resolvedPatternColor}" stroke-opacity="${patternOpacity}" stroke-width="${strokeWidth}" />
            </pattern>`;
    } else if (pattern === 'dots') {
      defs += `
            <pattern id="${idPrefix}-pattern" patternUnits="userSpaceOnUse" width="${tile}" height="${tile}">
                <circle cx="${tile / 2}" cy="${tile / 2}" r="${Math.max(1, tile / 8)}" fill="${resolvedPatternColor}" fill-opacity="${patternOpacity}" />
            </pattern>`;
    } else if (pattern === 'grid') {
      defs += `
            <pattern id="${idPrefix}-pattern" patternUnits="userSpaceOnUse" width="${tile}" height="${tile}">
                <path d="M ${tile} 0 L 0 0 0 ${tile}" fill="none" stroke="${resolvedPatternColor}" stroke-opacity="${patternOpacity}" stroke-width="${strokeWidth}" />
            </pattern>`;
    }
  }

  return {
    defs,
    fillRef,
    hasPattern: pattern !== 'none',
  };
}
