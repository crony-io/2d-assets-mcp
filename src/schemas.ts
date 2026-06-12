import { z } from 'zod';

// ─── Shared visual field schemas ──────────────────────────────────────────────
// Kept as a plain ZodRawShape so it can be spread into assetSchema and
// also so MCP SDK's registerTool receives the shape it expects.

export const visualSchemaFields = {
  color: z.string().describe("Background hex color code, e.g., '#FF5733'"),
  width: z
    .number()
    .default(128)
    .describe('Width in pixels. Default is 128 when missing.'),
  height: z
    .number()
    .default(128)
    .describe('Height in pixels. Default is 128 when missing.'),
  shape: z
    .enum(['rectangle', 'rounded-rectangle', 'circle'])
    .default('rectangle')
    .describe(
      'The geometric shape of the asset. Default is rectangle when missing.',
    ),
  opacity: z
    .number()
    .min(0)
    .max(1)
    .default(1.0)
    .describe(
      'Opacity of the background shape from 0.0 (transparent) to 1.0 (opaque). Default is 1.0 when missing.',
    ),
  fillPercent: z
    .number()
    .min(0)
    .max(100)
    .default(100)
    .describe(
      'Percentage of the asset to fill, useful for health or progress bars (0-100). Default is 100.',
    ),
  trackColor: z
    .string()
    .optional()
    .describe(
      "Background color for the unfilled portion of the asset when fillPercent < 100. Hex code, e.g., '#333333'",
    ),
  textPosition: z
    .enum(['center', 'top', 'bottom'])
    .default('center')
    .describe(
      'Vertical alignment of the text. Default is center when missing.',
    ),
  fontSize: z
    .number()
    .optional()
    .describe(
      'Optional explicit font size in pixels. If omitted, it auto-scales to fit.',
    ),
  strokeColor: z
    .string()
    .default('#000000')
    .describe(
      'Color of the asset border hex code. Default is #000000 when missing.',
    ),
  strokeWidth: z
    .number()
    .default(4)
    .describe(
      'Width of the asset border in pixels. Set to 0 for no border. Default is 4 when missing.',
    ),
  textRotation: z
    .number()
    .default(0)
    .describe(
      'Rotation angle for the text in degrees. Default is 0 when missing.',
    ),
  fillMode: z
    .enum(['solid', 'linear-gradient', 'radial-gradient'])
    .default('solid')
    .describe('Background fill mode. Default is solid when missing.'),
  secondaryColor: z
    .string()
    .optional()
    .describe(
      'Secondary color used for gradients. If omitted, a derived variant of color will be used.',
    ),
  gradientAngle: z
    .number()
    .default(45)
    .describe(
      'Angle for linear gradients in degrees. Ignored for radial gradients. Default is 45 when missing.',
    ),
  pattern: z
    .enum(['none', 'stripes', 'dots', 'grid'])
    .default('none')
    .describe('Optional pattern overlay. Default is none when missing.'),
  patternColor: z
    .string()
    .optional()
    .describe(
      'Pattern color. If omitted, a derived contrast color will be used.',
    ),
  patternOpacity: z
    .number()
    .min(0)
    .max(1)
    .default(0.18)
    .describe(
      'Pattern overlay opacity from 0.0 to 1.0. Default is 0.18 when missing.',
    ),
  patternScale: z
    .number()
    .min(2)
    .default(16)
    .describe('Pattern tile size in pixels. Default is 16 when missing.'),
} as const;

// ─── Single asset schema (ZodRawShape for MCP SDK) ────────────────────────────

export const assetSchema = {
  filename: z.string().describe("Name of the file, e.g., 'player_idle.png'"),
  directory: z.string().describe('Absolute path to the target project folder'),
  text: z.string().describe('Text to display on the asset'),
  assetDescription: z
    .string()
    .optional()
    .describe(
      "Human-readable description of this asset stored as image metadata. Useful for models without vision to understand the asset later. E.g. 'Player idle placeholder, blue rectangle 128x128'",
    ),
  ...visualSchemaFields,
} as const;

// z.object() wrapper — used ONLY for type inference and array item validation
export const assetObjectSchema = z.object(assetSchema);

/** Inferred output type of a fully parsed (defaults applied) asset config */
export type AssetInput = z.infer<typeof assetObjectSchema>;

// ─── Batch tool schema (ZodRawShape for MCP SDK) ──────────────────────────────

export const batchSchema = {
  assets: z
    .array(assetObjectSchema)
    .min(1)
    .describe(
      'An array of asset configuration objects to generate simultaneously',
    ),
  spritesheetMode: z
    .enum(['individual', 'spritesheet'])
    .default('spritesheet')
    .describe(
      'individual = create separate PNGs only, spritesheet = create only a spritesheet PNG. Default is spritesheet when missing.',
    ),
  sheetFilename: z
    .string()
    .default('spritesheet.png')
    .describe(
      'Filename for the generated spritesheet. Default is spritesheet.png when missing.',
    ),
  sheetDirectory: z
    .string()
    .optional()
    .describe(
      'Optional output directory for the spritesheet. Defaults to the first asset directory.',
    ),
  sheetMargin: z
    .number()
    .min(0)
    .default(8)
    .describe(
      'Outer margin around the spritesheet in pixels. Default is 8 when missing.',
    ),
  sheetSpacing: z
    .number()
    .min(0)
    .default(8)
    .describe(
      'Spacing between spritesheet cells in pixels. Default is 8 when missing.',
    ),
} as const;

export const batchObjectSchema = z.object(batchSchema);

/** Inferred output type of a fully parsed batch request */
export type BatchInput = z.infer<typeof batchObjectSchema>;

// ─── Read metadata schema (ZodRawShape for MCP SDK) ──────────────────────────

export const readMetadataSchema = {
  filepath: z
    .string()
    .describe('Absolute path to the PNG file to read metadata from'),
} as const;

export const readMetadataObjectSchema = z.object(readMetadataSchema);

/** Inferred output type of a fully parsed read-metadata request */
export type ReadMetadataInput = z.infer<typeof readMetadataObjectSchema>;
