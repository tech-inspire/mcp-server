import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/registerTools.js";

// Parse CLI args manually and set to process.env
process.argv.forEach((arg) => {
  if (arg.startsWith("--")) {
    const [key, value] = arg.substring(2).split("=");
    if (key && value) {
      process.env[key] = value;
    }
  }
});

const server = new McpServer({
  name: "inspire",
  version: "1.0.1",
  capabilities: {
    resources: {},
    tools: {},
  },
});

registerTools(server);

const mcpTransport = new StdioServerTransport();
await server.connect(mcpTransport);
