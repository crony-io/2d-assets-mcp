import type { RGB } from '#src/types.js';

/**
 * Parses a 6-digit hex string (with or without #) into an RGB object.
 * Throws on invalid input.
 */
export function hexToRgb(hex: string): RGB {
  const normalized = String(hex).trim().replace(/^#/, '');

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

/**
 * Converts an RGB object back into a lowercase hex string (e.g. '#ff5733').
 * Clamps and rounds each channel before conversion.
 */
export function rgbToHex({ r, g, b }: RGB): string {
  const clamp = (n: number): number =>
    Math.max(0, Math.min(255, Math.round(n)));

  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Lightens (amount > 0) or darkens (amount < 0) a hex color.
 * @param hex    Source hex color
 * @param amount Float in -1.0..1.0 range
 */
export function shadeHexColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  const target = amount < 0 ? 0 : 255;
  const p = Math.min(1, Math.abs(amount));

  return rgbToHex({
    r: (target - rgb.r) * p + rgb.r,
    g: (target - rgb.g) * p + rgb.g,
    b: (target - rgb.b) * p + rgb.b,
  });
}

/**
 * Linearly interpolates between two hex colors.
 * @param ratio 0.0 = fully hexA, 1.0 = fully hexB
 */
export function mixHexColors(hexA: string, hexB: string, ratio = 0.5): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const t = Math.max(0, Math.min(1, ratio));

  return rgbToHex({
    r: a.r * (1 - t) + b.r * t,
    g: a.g * (1 - t) + b.g * t,
    b: a.b * (1 - t) + b.b * t,
  });
}

/**
 * Computes the relative luminance (WCAG formula) of a hex color.
 * Range: 0 (black) to 1 (white).
 */
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);

  const srgb = [r, g, b].map((v) => {
    const c = v / 255;

    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Returns either a near-black or white hex string that contrasts
 * well against the given background color.
 */
export function getContrastingTextColor(referenceHex: string): string {
  return getLuminance(referenceHex) > 0.55 ? '#111111' : '#FFFFFF';
}
