# 魔塔社区 MCP 服务器部署指南

## 问题解决：魔塔社区不支持 node 命令

### 问题描述
魔塔社区部署时提示：`无法识别的启动命令"node dist/server.js"，请修改。目前支持python -m/uv/uvx/npx开头的命令。`

### 解决方案

#### 1. 使用 npx 命令
将启动命令从 `node` 改为 `npx`，但参数需要明确指定：

```json
{
  "mcpServers": {
    "ofs-mcp-server": {
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

#### 2. 配置 package.json
添加 `bin` 字段和可执行权限：

```json
{
  "bin": {
    "ofs-mcp-server": "dist/server.js"
  },
  "scripts": {
    "postinstall": "chmod +x dist/server.js"
  }
}
```

#### 3. 添加 shebang
在 `src/server.ts` 文件开头添加：

```typescript
#!/usr/bin/env node
```

### 部署步骤

#### 1. 构建项目
```bash
pnpm run build
```

#### 2. 设置可执行权限
```bash
chmod +x dist/server.js
```

#### 3. 测试本地运行
```bash
npx ofs-mcp-server
```

#### 4. 发布到魔塔社区
使用更新后的 `mcp.json` 配置进行部署。

### 支持的启动命令格式

魔塔社区支持以下命令格式：
- ✅ `npx node script.js` (通过 npx 调用 node)
- ✅ `python -m module`
- ✅ `uv run script`
- ✅ `uvx package`
- ❌ `node script.js` (不支持)
- ❌ `npx package-name` (不支持包名方式)

### 验证部署

部署成功后，可以通过以下方式验证：

1. **检查服务状态**：确认 MCP 服务器正常启动
2. **测试工具调用**：验证 `get_ofs_components` 工具可用
3. **检查日志**：查看是否有错误信息

### 故障排除

#### 常见问题
1. **权限错误**：确保 `dist/server.js` 有可执行权限
2. **路径错误**：检查 `bin` 字段配置是否正确
3. **依赖缺失**：确保所有依赖都已安装

#### 调试命令
```bash
# 检查文件权限
ls -la dist/server.js

# 测试可执行性
./dist/server.js

# 检查 npx 路径
which npx
```

### 更新说明

- 修改了 `mcp.json` 使用 `npx` 命令
- 添加了 `package.json` 的 `bin` 字段
- 设置了可执行权限
- 添加了 shebang 行
