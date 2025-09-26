# ofs-mcp-server 概述

## 功能描述

`ofs-mcp-server` 是一个 Model Context Protocol (MCP) 服务器，专门用于向 AI 客户端提供 ofs-ui 组件信息。它通过连接 VSCode 插件的本地服务端来获取组件数据，并提供智能的数据处理和缓存功能。

## 核心特性

### 🔄 智能数据处理
- **数据验证**: 自动验证和清理组件数据，确保数据质量
- **数据过滤**: 支持按名称、描述或分类进行智能过滤
- **数据格式化**: 统一的数据格式，包含元数据信息

### ⚡ 性能优化
- **内存缓存**: 30秒 TTL 缓存，减少重复请求
- **缓存管理**: 支持强制刷新缓存
- **错误恢复**: 网络错误时自动使用缓存数据

### 🛠️ 工具功能

#### 1. `get_ofs_components` - 组件查询工具
**功能**: 获取 ofs-ui 组件及其属性/事件信息

**参数**:
- `q` (可选): 查询字符串，支持按名称、描述或分类过滤
- `refresh` (可选): 布尔值，强制刷新缓存

**返回格式**:
```json
{
  "components": [
    {
      "name": "组件名称",
      "props": { "属性": "值" },
      "events": { "事件": "描述" },
      "description": "组件描述",
      "category": "组件分类",
      "version": "版本号"
    }
  ],
  "total": 10,
  "filtered": 5,
  "query": "搜索关键词",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 2. `clear_component_cache` - 缓存管理工具
**功能**: 清除组件数据的本地缓存

**参数**: 无

**返回格式**:
```json
{
  "message": "组件缓存已清除",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 数据流程

```
AI 客户端 → MCP 服务器 → 数据处理器 → VSCode 本地服务 → 组件数据
                ↓
            缓存层 (30秒 TTL)
                ↓
            数据验证和格式化
                ↓
            AI 客户端
```

## 错误处理

- **网络错误**: 自动使用缓存数据（如果可用）
- **数据错误**: 提供详细的错误信息和解决建议
- **服务不可用**: 返回友好的错误提示

## 配置选项

通过环境变量配置：

- `LOCAL_SERVICE_PORT`: VSCode 插件本地服务端口（默认: 36666）
- `LOCAL_SERVICE_BASE`: 本地服务基础 URL（默认: http://127.0.0.1:${port}）

## 使用示例

### 基本查询
```json
{
  "tool": "get_ofs_components"
}
```

### 带过滤的查询
```json
{
  "tool": "get_ofs_components",
  "arguments": {
    "q": "button"
  }
}
```

### 强制刷新缓存
```json
{
  "tool": "get_ofs_components",
  "arguments": {
    "refresh": true
  }
}
```

### 清除缓存
```json
{
  "tool": "clear_component_cache"
}
```


