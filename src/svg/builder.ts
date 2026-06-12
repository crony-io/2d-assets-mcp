import { buildFillDefs } from '#src/svg/defs.js';
import { buildShapeMarkup } from '#src/svg/shapes.js';
import type { SvgBuildParams, FontSizeParams } from '#src/types.js';
import {
  shadeHexColor,
  mixHexColors,
  getContrastingTextColor,
} from '#src/utils/color.js';
import { escapeXml } from '#src/utils/string.js';

/**
 * Auto-calculates an appropriate font size that fits the given text
 * within the asset's dimensions. Returns at least 8 px.
 */
export function estimateFontSize({
  text,
  width,
  height,
}: FontSizeParams): number {
  const estimatedCharWidth = width / Math.max(String(text).length, 3);
  let finalFontSize = Math.min(estimatedCharWidth, height * 0.25);
  finalFontSize = Math.max(Math.floor(finalFontSize), 8);

  return finalFontSize;
}

/**
 * Assembles a complete SVG string for a single asset, combining:
 *  - gradient/pattern <defs>
 *  - optional clip-path for fillPercent < 100
 *  - shape layers (track → fill → pattern → stroke)
 *  - centered, auto-scaled, optionally rotated text
 */
export function buildAssetSvgMarkup({
  text,
  color,
  secondaryColor,
  width,
  height,
  shape,
  opacity,
  fillPercent,
  trackColor,
  textPosition,
  fontSize,
  strokeColor,
  strokeWidth,
  textRotation,
  fillMode,
  gradientAngle,
  pattern,
  patternColor,
  patternOpacity,
  patternScale,
  idPrefix = 'asset',
}: SvgBuildParams): string {
  const finalFontSize = fontSize ?? estimateFontSize({ text, width, height });
  const resolvedSecondaryColor = secondaryColor ?? shadeHexColor(color, 0.22);
  const resolvedFillPercent = fillPercent ?? 100;

  // ── Text vertical positioning ──────────────────────────────────────────────

  let textY = '50%';
  let textDy = '0.3em';

  if (textPosition === 'top') {
    textY = `${finalFontSize + strokeWidth + 4}px`;
    textDy = '0';
  } else if (textPosition === 'bottom') {
    textY = `${height - strokeWidth - 6}px`;
    textDy = '0';
  }

  // ── Fill definitions (gradients + patterns) ────────────────────────────────

  const { defs, fillRef, hasPattern } = buildFillDefs({
    idPrefix,
    color,
    secondaryColor: resolvedSecondaryColor,
    fillMode,
    gradientAngle,
    pattern,
    patternColor,
    patternOpacity,
    patternScale,
  });

  // ── Optional clip-path for progress/health-bar style fills ─────────────────

  let clipDef = '';
  let clipAttr = '';

  if (resolvedFillPercent < 100) {
    const clipWidth = width * (Math.max(0, resolvedFillPercent) / 100);
    clipDef = `<clipPath id="${idPrefix}-clip"><rect x="0" y="0" width="${clipWidth}" height="${height}" /></clipPath>`;
    clipAttr = `clip-path="url(#${idPrefix}-clip)"`;
  }

  // ── Shape layers ───────────────────────────────────────────────────────────

  const { trackShape, baseShape, overlayShape, strokeShape } = buildShapeMarkup(
    {
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
    },
  );

  // ── Text color — contrast against mid-point of gradient or solid color ─────

  const textFill = getContrastingTextColor(
    fillMode === 'solid'
      ? color
      : mixHexColors(color, resolvedSecondaryColor, 0.5),
  );

  // Rotation transform (empty string when angle is 0 — no unnecessary attribute)
  const transform =
    textRotation !== 0
      ? `transform="rotate(${textRotation} ${width / 2} ${height / 2})"`
      : '';

  return `
    <svg width="${width}" height="${height}">
      <defs>${defs}${clipDef}</defs>
      ${trackShape}
      ${baseShape}
      ${overlayShape}
      ${strokeShape}
      <text 
        x="50%" 
        y="${textY}" 
        font-family="sans-serif" 
        font-size="${finalFontSize}px" 
        font-weight="bold"
        fill="${textFill}" 
        stroke="#000000" 
        stroke-width="${Math.max(1, Math.floor(finalFontSize / 10))}"
        text-anchor="middle" 
        dy="${textDy}"
        ${transform}
      >
        ${escapeXml(text)}
      </text>
    </svg>
  `;
}
