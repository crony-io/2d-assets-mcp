import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { assetSchema } from '#src/schemas.js';
import type { AssetInput } from '#src/schemas.js';
import type { AssetConfig } from '#src/types.js';
import { createAssetFile } from '#src/utils/asset.js';

/**
 * Registers the `generate_mock_asset` tool on the given MCP server.
 *
 * The tool accepts a single asset configuration and writes a PNG file
 * (with embedded JSON metadata) to the requested directory.
 */
export function registerGenerateSingleTool(server: McpServer): void {
  server.registerTool(
    'generate_mock_asset',
    {
      description:
        'Generates a single advanced custom mock 2D PNG asset (supports gradients, patterns, text rotation, transparency, and auto-scaling) for game prototypes. Embeds JSON metadata into the PNG (dimensions, color, shape, description) readable by read_image_metadata.',
      inputSchema: assetSchema,
    },
    async (args) => {
      try {
        // The MCP SDK parses and applies Zod defaults before calling this handler,
        // so args is fully typed as AssetInput / AssetConfig at runtime.
        const filepath = await createAssetFile(
          args as AssetInput as AssetConfig,
        );

        return {
          content: [
            {
              type: 'text',
              text: `Successfully created mock asset at ${filepath}`,
            },
          ],
        };
      } catch (error) {
        const err = error as Error;

        return {
          content: [
            { type: 'text', text: `Failed to create asset: ${err.message}` },
          ],
          isError: true,
        };
      }
    },
  );
}
