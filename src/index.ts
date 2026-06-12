#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createServer } from '#src/server.js';

/**
 * Bootstraps the MCP server and connects it to the stdio transport.
 * The server then listens for tool calls from the host application (e.g. Claude Desktop).
 */
async function run(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch((error: Error) => {
  console.error('Server error:', error);
  process.exit(1);
});
