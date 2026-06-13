import fs from 'fs';
import path from 'path';

import sharp from 'sharp';

import { embedMetadata } from '#src/image/metadata.js';
import { buildAssetSvgMarkup } from '#src/svg/builder.js';
import type {
  AssetConfig,
  AssetMetadata,
  SpritesheetParams,
} from '#src/types.js';
import { ensureHexPrefix } from '#src/utils/color.js';
import { ensureDirectory } from '#src/utils/fs.js';
import { sanitizeFileBaseName } from '#src/utils/string.js';

/**
 * Helper to normalize all color fields in an asset, guaranteeing the '#' prefix.
 */
function normalizeAssetColors(asset: AssetConfig): AssetConfig {
  return {
    ...asset,
    color: asset.color ? ensureHexPrefix(asset.color) : asset.color,
    trackColor: asset.trackColor
      ? ensureHexPrefix(asset.trackColor)
      : asset.trackColor,
    strokeColor: asset.strokeColor
      ? ensureHexPrefix(asset.strokeColor)
      : asset.strokeColor,
    secondaryColor: asset.secondaryColor
      ? ensureHexPrefix(asset.secondaryColor)
      : asset.secondaryColor,
    patternColor: asset.patternColor
      ? ensureHexPrefix(asset.patternColor)
      : asset.patternColor,
  };
}

/**
 * Renders a single asset configuration into a PNG Buffer with embedded metadata.
 * `extraMeta` is merged on top of the standard metadata fields (used by spritesheet).
 */
export async function createAssetBuffer(
  asset: AssetConfig,
  extraMeta: Record<string, string | number | boolean | null> = {},
): Promise<Buffer> {
  // Normalize the payload
  const normAsset = normalizeAssetColors(asset);

  const idPrefix = sanitizeFileBaseName(
    normAsset.filename || normAsset.text || 'asset',
  );
  const svgMarkup = buildAssetSvgMarkup({ ...normAsset, idPrefix });

  // Rasterize SVG → raw PNG buffer (no metadata yet)
  const rawBuffer = await sharp(Buffer.from(svgMarkup)).png().toBuffer();

  const meta: AssetMetadata = {
    generator: '2d-assets-mcp',
    type: 'asset',
    name: sanitizeFileBaseName(normAsset.filename || normAsset.text || 'asset'),
    width: normAsset.width ?? 128,
    height: normAsset.height ?? 128,
    color: normAsset.color,
    shape: normAsset.shape ?? 'rectangle',
    fillMode: normAsset.fillMode ?? 'solid',
    fillPercent: normAsset.fillPercent ?? 100,
    trackColor: normAsset.trackColor ?? null,
    pattern: normAsset.pattern ?? 'none',
    description: normAsset.assetDescription ?? null,
    // gradient properties (only include if fillMode is gradient)
    ...(normAsset.fillMode !== 'solid' && {
      secondaryColor: normAsset.secondaryColor,
      gradientAngle: normAsset.gradientAngle,
    }),
    // pattern properties (only include if pattern is not 'none')
    ...(normAsset.pattern !== 'none' && {
      patternColor: normAsset.patternColor,
      patternOpacity: normAsset.patternOpacity,
      patternScale: normAsset.patternScale,
    }),
    // text properties (always include, they have defaults)
    textRotation: normAsset.textRotation,
    textPosition: normAsset.textPosition,
    ...(normAsset.fontSize !== undefined && { fontSize: normAsset.fontSize }),
    // stroke properties (always include, they have defaults)
    strokeColor: normAsset.strokeColor,
    strokeWidth: normAsset.strokeWidth,
    createdAt: new Date().toISOString(),
    ...extraMeta,
  };

  return embedMetadata(rawBuffer, meta);
}

/**
 * Renders an asset, appends its dimensions to the filename for easy identification,
 * and writes the PNG (with embedded metadata) directly to disk.
 *
 * IMPORTANT: We write the final buffer directly to avoid passing it back through
 * a second sharp() instance, which would strip the EXIF metadata.
 */
export async function createAssetFile(asset: AssetConfig): Promise<string> {
  ensureDirectory(asset.directory);

  const parsed = path.parse(asset.filename);
  const filenameWithSize = `${parsed.name}_${asset.width ?? 128}x${asset.height ?? 128}${parsed.ext}`;
  const filepath = path.join(asset.directory, filenameWithSize);

  const buffer = await createAssetBuffer(asset);
  await fs.promises.writeFile(filepath, buffer);

  return filepath;
}

/**
 * Composes all asset buffers onto a transparent canvas to produce a single
 * spritesheet PNG (traditional single-row animation strip layout).
 *
 * Sheet dimensions are computed from the maximum asset dimensions so that
 * every frame cell is the same size regardless of individual asset sizes.
 */
export async function createSpriteSheetFile({
  assets,
  directory,
  filename,
  margin = 0,
  spacing = 0,
  sheetMeta = {},
}: SpritesheetParams): Promise<string> {
  if (!assets.length) {
    throw new Error('Cannot create a spritesheet with an empty assets array.');
  }

  ensureDirectory(directory);

  // Normalize all incoming assets before mapping
  const normAssets = assets.map(normalizeAssetColors);

  // Force single-row layout (traditional animation strip)
  const resolvedColumns = normAssets.length;
  const rows = 1;

  // Render all individual asset buffers in parallel
  const assetBuffers = await Promise.all(
    normAssets.map((asset) => createAssetBuffer(asset)),
  );

  const maxWidth = Math.max(...normAssets.map((a) => a.width ?? 128));
  const maxHeight = Math.max(...normAssets.map((a) => a.height ?? 128));

  const sheetWidth =
    margin * 2 + resolvedColumns * maxWidth + (resolvedColumns - 1) * spacing;
  const sheetHeight = margin * 2 + rows * maxHeight + (rows - 1) * spacing;

  // Center each frame within its cell to handle assets smaller than maxWidth/maxHeight
  const composites = normAssets.map((asset, index) => {
    const col = index % resolvedColumns;
    const row = Math.floor(index / resolvedColumns);

    const x =
      margin +
      col * (maxWidth + spacing) +
      Math.floor((maxWidth - (asset.width ?? 128)) / 2);
    const y =
      margin +
      row * (maxHeight + spacing) +
      Math.floor((maxHeight - (asset.height ?? 128)) / 2);

    return { input: assetBuffers[index], left: x, top: y };
  });
  // Build frames array with individual frame metadata
  const frames = normAssets.map((asset, index) => {
    const col = index % resolvedColumns;
    const row = Math.floor(index / resolvedColumns);
    const x =
      margin +
      col * (maxWidth + spacing) +
      Math.floor((maxWidth - (asset.width ?? 128)) / 2);
    const y =
      margin +
      row * (maxHeight + spacing) +
      Math.floor((maxHeight - (asset.height ?? 128)) / 2);

    return {
      index,
      x,
      y,
      width: asset.width ?? 128,
      height: asset.height ?? 128,
      name: sanitizeFileBaseName(
        asset.filename || asset.text || `frame_${index}`,
      ),
      description: asset.assetDescription ?? null,
      color: asset.color,
      shape: asset.shape ?? 'rectangle',
      fillMode: asset.fillMode ?? 'solid',
      fillPercent: asset.fillPercent ?? 100,
      trackColor: asset.trackColor ?? null,
      pattern: asset.pattern ?? 'none',
      ...(asset.fillMode !== 'solid' && {
        secondaryColor: asset.secondaryColor,
        gradientAngle: asset.gradientAngle,
      }),
      ...(asset.pattern !== 'none' && {
        patternColor: asset.patternColor,
        patternOpacity: asset.patternOpacity,
        patternScale: asset.patternScale,
      }),
      textRotation: asset.textRotation,
      textPosition: asset.textPosition,
      ...(asset.fontSize !== undefined && { fontSize: asset.fontSize }),
      strokeColor: asset.strokeColor,
      strokeWidth: asset.strokeWidth,
    };
  });
  // Create transparent canvas and composite all frames onto it
  const rawSheetBuffer = await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 4 as const, // RGBA
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  const meta: AssetMetadata = {
    generator: '2d-assets-mcp',
    type: 'spritesheet',
    totalWidth: sheetWidth,
    totalHeight: sheetHeight,
    columns: resolvedColumns,
    rows,
    frameCount: normAssets.length,
    frameWidth: maxWidth,
    frameHeight: maxHeight,
    margin,
    spacing,
    frames,
    createdAt: new Date().toISOString(),
    ...sheetMeta,
  };

  const sheetBuffer = await embedMetadata(rawSheetBuffer, meta);
  const filepath = path.join(directory, filename);

  // Write buffer directly to preserve EXIF metadata
  await fs.promises.writeFile(filepath, sheetBuffer);

  return filepath;
}
