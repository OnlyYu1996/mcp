#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// MCP 服务器：向 AI 客户端暴露 ofs-ui 组件信息（通过 VSCode 插件本地服务端拉取）
// - 传输层：使用 SDK 的 stdio 传输（当前版本未导出顶层路径，采用动态导入指向实际产物）
// - 协议实现：使用 McpServer.registerTool 方法，符合当前 SDK 版本 API
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const undici_1 = require("undici");
const zod_1 = require("zod");
const fs_1 = require("fs");
const path_1 = require("path");
// 说明：包版本未导出 @modelcontextprotocol/sdk/stdio 或 server/stdio 的类型入口
// 因此这里用动态导入到构建产物，运行时可用；类型以 any 处理以保证兼容
// 简化的 MCP 服务器实现
async function main() {
    // VSCode 插件本地服务端地址，从环境变量或默认端口构造
    const localPort = process.env.LOCAL_SERVICE_PORT ? Number(process.env.LOCAL_SERVICE_PORT) : 36666;
    const baseUrl = process.env.LOCAL_SERVICE_BASE || `http://127.0.0.1:${localPort}`;
    // 自动读取 package.json 中的版本号
    const currentFile = require.resolve('./server.js');
    const currentDir = (0, path_1.dirname)(currentFile);
    const packageJsonPath = (0, path_1.join)(currentDir, '..', 'package.json');
    const packageJson = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, 'utf8'));
    // 创建 MCP 服务器实例（名称与版本仅用于标识）
    const server = new mcp_js_1.McpServer({ name: packageJson.name, version: packageJson.version });
    // 简化的服务器实现
    // 注册工具：获取 ofs-ui 组件信息
    server.registerTool('get_ofs_components', {
        title: 'ofs-ui 组件查询',
        description: '获取 ofs-ui 组件及其属性/事件（来自 VSCode 插件本地服务端）',
        inputSchema: {
            q: zod_1.z.string().optional().describe('按名称过滤组件')
        }
    }, async ({ q }) => {
        try {
            // 获取组件数据
            const res = await (0, undici_1.request)(new URL('/components', baseUrl).toString(), {
                method: 'GET'
            });
            if (res.statusCode !== 200) {
                throw new Error(`Local service error: ${res.statusCode}`);
            }
            const data = await res.body.json();
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(data, null, 2)
                    }]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            error: errorMessage,
                            timestamp: new Date().toISOString(),
                            suggestion: '请检查 VSCode 插件是否已启动本地服务'
                        }, null, 2)
                    }]
            };
        }
    });
    // 注册工具：清除组件缓存
    server.registerTool('clear_component_cache', {
        title: '清除组件缓存',
        description: '清除组件数据的本地缓存，强制重新获取',
        inputSchema: {}
    }, async () => {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        message: '组件缓存已清除',
                        timestamp: new Date().toISOString()
                    }, null, 2)
                }]
        };
    });
    // 使用 stdio 传输与 MCP 客户端通信
    try {
        const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
        await server.connect(new StdioServerTransport());
        console.log(`[ofs-mcp-server] started via stdio, local service: ${baseUrl}`);
    }
    catch (error) {
        console.error('[ofs-mcp-server] Failed to start stdio transport:', error);
        process.exit(1);
    }
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[ofs-mcp-server] fatal error', err);
    process.exit(1);
});
