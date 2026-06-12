import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerGenerateBatchTool } from '#src/tools/generateBatch.js';
import { registerGenerateSingleTool } from '#src/tools/generateSingle.js';
import { registerReadMetadataTool } from '#src/tools/readMetadata.js';

/**
 * Creates and fully configures the MCP server.
 *
 * Each tool is registered via its own dedicated module. To add a new tool,
 * create a `src/tools/yourTool.ts` and call its register function here.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: '2d-assets-mcp',
    version: '0.1.1',
  });

  registerGenerateSingleTool(server);
  registerGenerateBatchTool(server);
  registerReadMetadataTool(server);

  return server;
}
