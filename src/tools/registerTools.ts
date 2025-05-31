import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getSimilarImagesTool } from "./getSimilarImages.js";

export function registerTools(server: McpServer) {
  server.tool(
    getSimilarImagesTool.name,
    getSimilarImagesTool.inputSchema,
    getSimilarImagesTool.metadata,
    getSimilarImagesTool.handler,
  );
}
