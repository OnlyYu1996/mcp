# MCP 服务器连接失败故障排除

## 测试结果
✅ MCP 服务器可以正常启动
✅ 使用 `npx node dist/server.js` 命令正常
✅ 服务器输出正确的启动信息

## 可能的问题和解决方案

### 1. 魔塔社区环境问题

#### 问题：魔塔社区可能不支持 ES 模块
**解决方案：** 创建 CommonJS 版本

```bash
# 创建 CommonJS 版本的启动脚本
cat > dist/server.cjs << 'EOF'
#!/usr/bin/env node
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { request } = require('undici');
const { z } = require('zod');
const { readFileSync } = require('fs');
const { join, dirname } = require('path');
const { fileURLToPath } = require('url');

// 复制 server.ts 的内容，但使用 CommonJS 语法
// ... (需要转换 import 为 require)
EOF

chmod +x dist/server.cjs
```

#### 问题：依赖包未正确安装
**解决方案：** 确保所有依赖都在 package.json 中

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.17.4",
    "undici": "^6.21.3",
    "zod": "^3.25.76"
  }
}
```

### 2. 配置问题

#### 问题：mcp.json 配置不正确
**当前配置：**
```json
{
  "mcpServers": {
    "ofs-ui-mcp": {
      "command": "npx",
      "args": ["node", "dist/server.js"],
      "env": {
        "LOCAL_SERVICE_PORT": "36666",
        "LOCAL_SERVICE_BASE": "http://127.0.0.1:36666"
      }
    }
  }
}
```

#### 替代方案 1：使用绝对路径
```json
{
  "mcpServers": {
    "ofs-ui-mcp": {
      "command": "npx",
      "args": ["node", "./dist/server.js"],
      "cwd": "/path/to/your/mcp/project",
      "env": {
        "LOCAL_SERVICE_PORT": "36666",
        "LOCAL_SERVICE_BASE": "http://127.0.0.1:36666"
      }
    }
  }
}
```

#### 替代方案 2：使用 CommonJS 版本
```json
{
  "mcpServers": {
    "ofs-ui-mcp": {
      "command": "npx",
      "args": ["node", "dist/server.cjs"],
      "env": {
        "LOCAL_SERVICE_PORT": "36666",
        "LOCAL_SERVICE_BASE": "http://127.0.0.1:36666"
      }
    }
  }
}
```

### 3. 环境变量问题

#### 问题：VSCode 插件未运行
**检查步骤：**
1. 确保 VSCode 插件 `ofs-code-helper` 已安装并启用
2. 检查插件是否在端口 36666 启动本地服务
3. 测试连接：`curl http://127.0.0.1:36666/components`

#### 问题：网络连接问题
**解决方案：** 修改环境变量
```json
{
  "env": {
    "LOCAL_SERVICE_PORT": "36666",
    "LOCAL_SERVICE_BASE": "http://localhost:36666"
  }
}
```

### 4. 调试步骤

#### 步骤 1：本地测试
```bash
# 在项目目录中测试
cd /path/to/mcp/project
npx node dist/server.js
```

#### 步骤 2：检查日志
查看魔塔社区的错误日志，寻找具体错误信息。

#### 步骤 3：简化配置
尝试最简单的配置：
```json
{
  "mcpServers": {
    "ofs-ui-mcp": {
      "command": "npx",
      "args": ["node", "dist/server.js"]
    }
  }
}
```

### 5. 常见错误和解决方案

#### 错误：`Cannot find module`
**解决方案：** 确保所有依赖都已安装
```bash
pnpm install
```

#### 错误：`Permission denied`
**解决方案：** 设置执行权限
```bash
chmod +x dist/server.js
```

#### 错误：`EADDRINUSE`
**解决方案：** 检查端口是否被占用
```bash
lsof -i :36666
```

### 6. 推荐的最终配置

```json
{
  "mcpServers": {
    "ofs-ui-mcp": {
      "command": "npx",
      "args": ["node", "dist/server.js"],
      "env": {
        "NODE_ENV": "production",
        "LOCAL_SERVICE_PORT": "36666",
        "LOCAL_SERVICE_BASE": "http://127.0.0.1:36666"
      }
    }
  }
}
```

### 7. 联系支持

如果以上方案都无法解决问题，请提供：
1. 魔塔社区的具体错误信息
2. 服务器启动日志
3. 环境信息（Node.js 版本、操作系统等）
