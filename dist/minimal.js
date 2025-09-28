"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
async function main() {
    const server = new mcp_js_1.McpServer({ name: 'ofs-mcp-server', version: '0.0.0' });
    server.registerTool('ping', {
        title: 'Ping',
        description: 'Health check',
        inputSchema: {}
    }, async () => {
        return {
            content: [{ type: 'text', text: 'pong' }]
        };
    });
    const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
    await server.connect(new StdioServerTransport());
    // eslint-disable-next-line no-console
    console.log('[ofs-mcp-server] minimal started');
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[ofs-mcp-server] minimal fatal error', err);
    process.exit(1);
});
