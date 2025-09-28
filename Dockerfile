# 使用 Node.js 官方镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json ./
COPY pnpm-lock.yaml* ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建项目
RUN pnpm run build

# 暴露端口（如果需要）
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV LOCAL_SERVICE_PORT=36666
ENV LOCAL_SERVICE_BASE=http://127.0.0.1:36666

# 启动命令
CMD ["node", "dist/server.js"]
