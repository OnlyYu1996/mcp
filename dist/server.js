#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// MCP 服务器：向 AI 客户端暴露 ofs-ui 组件信息（通过 VSCode 插件本地服务端拉取）
// - 传输层：使用 SDK 的 stdio 传输（当前版本未导出顶层路径，采用动态导入指向实际产物）
// - 协议实现：使用 McpServer.registerTool 方法，符合当前 SDK 版本 API
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const undici_1 = require("undici");
const zod_1 = require("zod");
const fs_1 = require("fs");
const path_1 = require("path");
// 简单的内存缓存
class ComponentCache {
    constructor() {
        this.cache = null;
        this.lastFetch = 0;
        this.TTL = 30000; // 30秒缓存
    }
    isValid() {
        return this.cache !== null && (Date.now() - this.lastFetch) < this.TTL;
    }
    set(data) {
        this.cache = data;
        this.lastFetch = Date.now();
    }
    get() {
        return this.isValid() ? this.cache : null;
    }
    clear() {
        this.cache = null;
        this.lastFetch = 0;
    }
}
// 数据处理器
class ComponentDataProcessor {
    constructor() {
        this.cache = new ComponentCache();
    }
    // 验证和清理组件数据
    validateComponent(component) {
        if (!component || typeof component !== 'object')
            return null;
        const { name, props, events, description, category, version } = component;
        // 必须有名称
        if (!name || typeof name !== 'string')
            return null;
        return {
            name: name.trim(),
            props: props && typeof props === 'object' ? props : undefined,
            events: events && typeof events === 'object' ? events : undefined,
            description: description && typeof description === 'string' ? description.trim() : undefined,
            category: category && typeof category === 'string' ? category.trim() : undefined,
            version: version && typeof version === 'string' ? version.trim() : undefined
        };
    }
    // 过滤组件
    filterComponents(components, query) {
        if (!query)
            return components;
        const prefix = query.toLowerCase().trim();
        return components.filter(component => component.name.toLowerCase().includes(prefix) ||
            component.description?.toLowerCase().includes(prefix) ||
            component.category?.toLowerCase().includes(prefix));
    }
    // 格式化响应数据
    formatResponse(components, query) {
        return {
            components,
            total: components.length,
            filtered: query ? components.length : 0,
            query,
            timestamp: new Date().toISOString()
        };
    }
    // 处理组件数据
    async processComponents(baseUrl, query) {
        // 检查缓存
        const cached = this.cache.get();
        if (cached && !query) {
            return cached;
        }
        try {
            // 获取原始数据
            const res = await (0, undici_1.request)(new URL('/components', baseUrl).toString(), {
                method: 'GET'
            });
            if (res.statusCode !== 200) {
                throw new Error(`Local service error: ${res.statusCode}`);
            }
            const rawData = await res.body.json();
            // 验证和清理数据
            const rawComponents = Array.isArray(rawData.components) ? rawData.components : [];
            const validComponents = rawComponents
                .map(comp => this.validateComponent(comp))
                .filter((comp) => comp !== null);
            // 过滤数据
            const filteredComponents = this.filterComponents(validComponents, query);
            // 格式化响应
            const response = this.formatResponse(filteredComponents, query);
            // 缓存结果（仅缓存未过滤的数据）
            if (!query) {
                this.cache.set(response);
            }
            return response;
        }
        catch (error) {
            // 如果有缓存且查询失败，返回缓存数据
            const cached = this.cache.get();
            if (cached && !query) {
                return {
                    ...cached,
                    components: this.filterComponents(cached.components, query),
                    filtered: query ? cached.components.length : 0,
                    query
                };
            }
            throw error;
        }
    }
    // 清除缓存
    clearCache() {
        this.cache.clear();
    }
}
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
    // 创建数据处理器
    const processor = new ComponentDataProcessor();
    // 注册工具：获取 ofs-ui 组件信息
    server.registerTool('get_ofs_components', {
        title: 'ofs-ui 组件查询',
        description: '获取 ofs-ui 组件及其属性/事件（来自 VSCode 插件本地服务端），包含组件对应的typescript声明',
        inputSchema: {
            q: zod_1.z.string().optional().describe('按名称、描述或分类过滤组件'),
            refresh: zod_1.z.boolean().optional().describe('强制刷新缓存')
        }
    }, async ({ q, refresh }) => {
        try {
            // 强制刷新缓存
            if (refresh) {
                processor.clearCache();
            }
            // 处理组件数据
            const result = await processor.processComponents(baseUrl, q);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
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
        processor.clearCache();
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
    // 使用 stdio 传输与 MCP 客户端通信（由客户端以子进程方式拉起）
    const { StdioServerTransport } = await Promise.resolve().then(() => __importStar(require('@modelcontextprotocol/sdk/server/stdio.js')));
    await server.connect(new StdioServerTransport());
    // eslint-disable-next-line no-console
    console.log(`[ofs-mcp-server] started via stdio, local service: ${baseUrl}`);
    // 启动后主动探测一次，触发 VSCode 插件端的首次连接通知（忽略错误）
    try {
        await (0, undici_1.request)(new URL('/components', baseUrl).toString(), { method: 'GET' });
    }
    catch { }
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[ofs-mcp-server] fatal error', err);
    process.exit(1);
});
