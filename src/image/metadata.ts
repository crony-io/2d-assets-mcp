import sharp from 'sharp';

import type { AssetMetadata } from '#src/types.js';

/**
 * Embeds a JSON metadata object into a PNG buffer via EXIF ImageDescription.
 *
 * The metadata is stringified and stored under IFD0.ImageDescription so that
 * any EXIF-aware tool can read it back without binary TIFF knowledge.
 */
export async function embedMetadata(
  buffer: Buffer,
  meta: AssetMetadata,
): Promise<Buffer> {
  return sharp(buffer)
    .withMetadata({
      exif: {
        IFD0: {
          ImageDescription: JSON.stringify(meta),
        },
      },
    })
    .png()
    .toBuffer();
}

/**
 * Extremely robust EXIF parser that completely bypasses TIFF layout rules.
 *
 * Instead of walking the TIFF byte structure, it searches the raw EXIF buffer
 * as a UTF-8 string for our known JSON "generator" key and then back-tracks
 * to the opening brace. This approach is immune to padding, byte-order issues,
 * and unusual IFD layouts.
 *
 * Returns the raw JSON string, or null if the signature is not found.
 */
export function extractJsonMetadataFromExif(
  buf: Buffer | null | undefined,
): string | null {
  if (!buf) return null;

  try {
    const str = buf.toString('utf8');

    // Locate the stable identifier always present in our embedded JSON
    const searchStr = '"generator":"2d-assets-mcp"';
    const searchIdx = str.indexOf(searchStr);

    if (searchIdx === -1) return null;

    // Back-track to the nearest opening brace before the identifier
    const startIdx = str.lastIndexOf('{', searchIdx);

    if (startIdx === -1) return null;

    // EXIF ASCII fields are null-terminated; find the closing null byte
    let endIdx = str.indexOf('\0', startIdx);

    if (endIdx === -1) {
      // Fallback: scan backwards for the last closing brace
      endIdx = str.lastIndexOf('}') + 1;
    }

    if (endIdx <= startIdx) return null;

    return str.substring(startIdx, endIdx);
  } catch {
    return null;
  }
}

/**
 * Reads a PNG file with sharp, extracts its EXIF buffer, and attempts to
 * parse our embedded JSON metadata from it.
 *
 * Returns the parsed metadata object, or null if none is found / parse fails.
 */
export async function readEmbeddedMetadata(
  filepath: string,
): Promise<AssetMetadata | null> {
  try {
    const metadata = await sharp(filepath).metadata();

    if (!metadata.exif) return null;

    const descString = extractJsonMetadataFromExif(metadata.exif);

    if (!descString) return null;

    return JSON.parse(descString) as AssetMetadata;
  } catch {
    return null;
  }
}
