# ofs-mcp-server

MCP 服务器：将 VSCode 插件（ofs-code-helper）的组件信息通过 MCP 工具暴露给 AI 客户端。

## 功能
- 工具 `get_ofs_components`：获取 ofs-ui 组件及其属性/事件
- 可选前缀过滤（q）
- 通过 VSCode 插件本地服务端 /components 获取数据

## 运行
```bash
pnpm -w --filter ofs-mcp-server dev
# 环境变量：
# MCP_PORT=30330                  # MCP 监听端口
# LOCAL_SERVICE_PORT=36666        # VSCode 插件本地服务端端口
# LOCAL_SERVICE_BASE=http://127.0.0.1:36666 # 可直接指定完整 base
```

## 发布
- 填写 package.json 中的描述、版本，按照 MCP 广场发布规范发布。

## 协议
MIT


