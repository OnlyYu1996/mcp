# ofs-mcp-server 部署指南

## 魔塔社区托管部署配置

### 1. 项目结构
```
packages/mcp/
├── src/
│   └── server.ts          # MCP 服务器主文件
├── dist/
│   └── server.js         # 编译后的服务器文件
├── package.json          # 项目配置
├── mcp.json             # MCP 客户端配置
├── Dockerfile           # Docker 镜像配置
├── docker-compose.yml   # Docker Compose 配置
└── env.example          # 环境变量示例
```

### 2. 环境变量配置

#### 必需环境变量
- `LOCAL_SERVICE_PORT`: VSCode 插件本地服务端口（默认：36666）
- `LOCAL_SERVICE_BASE`: VSCode 插件本地服务地址（默认：http://127.0.0.1:36666）

#### 可选环境变量
- `NODE_ENV`: 运行环境（production/development）
- `MCP_PORT`: MCP 服务器端口（默认：30330）

### 3. 部署方式

#### 方式一：直接部署
```bash
# 构建项目
pnpm run build

# 启动服务器
pnpm start
```

#### 方式二：Docker 部署
```bash
# 构建 Docker 镜像
pnpm run docker:build

# 运行容器
pnpm run docker:run
```

#### 方式三：Docker Compose 部署
```bash
# 启动服务
pnpm run docker:compose

# 停止服务
pnpm run docker:compose:down
```

### 4. 魔塔社区配置

#### MCP 客户端配置 (mcp.json)
```json
{
  "mcpServers": {
    "ofs-mcp-server": {
      "command": "node",
      "args": ["dist/server.js"],
      "env": {
        "LOCAL_SERVICE_PORT": "36666",
        "LOCAL_SERVICE_BASE": "http://127.0.0.1:36666"
      }
    }
  }
}
```

### 5. 服务配置

#### 健康检查
- 检查间隔：30秒
- 超时时间：10秒
- 重试次数：3次
- 启动等待：40秒

#### 端口配置
- 容器内部端口：3000
- 外部映射端口：3000（可自定义）

### 6. 依赖关系

#### 前置条件
- VSCode 插件 `ofs-code-helper` 必须运行
- 插件本地服务端必须在指定端口运行
- Node.js 18+ 环境

#### 网络要求
- 能够访问 VSCode 插件本地服务端
- 支持 stdio 通信协议

### 7. 故障排除

#### 常见问题
1. **连接失败**：检查 VSCode 插件是否启动
2. **端口冲突**：修改 `LOCAL_SERVICE_PORT` 环境变量
3. **权限问题**：确保有足够权限访问本地服务

#### 日志查看
```bash
# Docker 容器日志
docker logs ofs-mcp-server

# Docker Compose 日志
docker-compose logs ofs-mcp-server
```

### 8. 性能优化

#### 缓存配置
- 组件数据缓存：30秒 TTL
- 内存缓存：自动清理过期数据
- 强制刷新：支持 `refresh` 参数

#### 资源限制
- 内存使用：建议 128MB+
- CPU 使用：单核心即可
- 磁盘空间：50MB+

### 9. 监控和维护

#### 监控指标
- 服务可用性
- 响应时间
- 缓存命中率
- 错误率

#### 维护任务
- 定期清理缓存
- 监控服务状态
- 更新依赖版本
- 备份配置数据
