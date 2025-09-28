"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
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
    await server.connect(new stdio_js_1.StdioServerTransport());
    // eslint-disable-next-line no-console
    console.log('[ofs-mcp-server] minimal started');
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[ofs-mcp-server] minimal fatal error', err);
    process.exit(1);
});
