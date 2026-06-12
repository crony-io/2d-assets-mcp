import path from 'path';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { batchSchema } from '#src/schemas.js';
import type { BatchInput } from '#src/schemas.js';
import type { AssetConfig } from '#src/types.js';
import { createAssetFile, createSpriteSheetFile } from '#src/utils/asset.js';

/**
 * Registers the `generate_mock_asset_batch` tool on the given MCP server.
 *
 * Supports two modes:
 *  - `individual` : writes each asset as a separate PNG file
 *  - `spritesheet`: composites all assets into a single spritesheet PNG
 */
export function registerGenerateBatchTool(server: McpServer): void {
  server.registerTool(
    'generate_mock_asset_batch',
    {
      description:
        'Generates multiple mock 2D PNG assets at once. Can create individual files, a spritesheet, Each PNG has embedded JSON metadata readable by read_image_metadata.',
      inputSchema: batchSchema,
    },
    async (args) => {
      try {
        const {
          assets,
          spritesheetMode,
          sheetFilename,
          sheetDirectory,
          sheetMargin,
          sheetSpacing,
        } = args as BatchInput;

        const results: string[] = [];
        const typedAssets = assets as AssetConfig[];

        const generateIndividuals = spritesheetMode === 'individual';
        const generateSpritesheet = spritesheetMode === 'spritesheet';

        // ── Individual mode: write each asset as its own PNG ────────────────
        if (generateIndividuals) {
          for (const asset of typedAssets) {
            const filepath = await createAssetFile(asset);
            results.push(`${asset.filename} -> ${filepath}`);
          }
        }

        // ── Spritesheet mode: composite all frames onto one canvas ───────────
        if (generateSpritesheet) {
          const outputDirectory = sheetDirectory ?? typedAssets[0].directory;

          const resolvedColumns = typedAssets.length;
          const rows = 1;

          const maxWidth = Math.max(...typedAssets.map((a) => a.width ?? 128));
          const maxHeight = Math.max(
            ...typedAssets.map((a) => a.height ?? 128),
          );

          const sheetWidth =
            sheetMargin * 2 +
            resolvedColumns * maxWidth +
            (resolvedColumns - 1) * sheetSpacing;
          const sheetHeight =
            sheetMargin * 2 + rows * maxHeight + (rows - 1) * sheetSpacing;

          // Embed computed dimensions into the filename for compatibility
          const parsed = path.parse(sheetFilename ?? 'spritesheet.png');
          const resolvedSheetFilename = `${parsed.name}_${sheetWidth}x${sheetHeight}${parsed.ext}`;

          const spriteSheetPath = await createSpriteSheetFile({
            assets: typedAssets,
            directory: outputDirectory,
            filename: resolvedSheetFilename,
            margin: sheetMargin,
            spacing: sheetSpacing,
            sheetMeta: { type: 'batch_spritesheet' },
          });

          results.push(`spritesheet -> ${spriteSheetPath}`);
        }

        // ── Human-readable summary ──────────────────────────────────────────
        const operationDescription =
          spritesheetMode === 'individual'
            ? `${typedAssets.length} individual assets`
            : `1 spritesheet from ${typedAssets.length} assets`;

        return {
          content: [
            {
              type: 'text',
              text: `Successfully created ${operationDescription}:\n${results.join('\n')}`,
            },
          ],
        };
      } catch (error) {
        const err = error as Error;

        return {
          content: [
            {
              type: 'text',
              text: `Batch generation failed or partially failed: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
