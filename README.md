# 文本分享工具

一个简单而强大的文本分享网站，支持临时文本分享、二维码生成和快捷复制功能。

## 功能特性

- 📝 **文本分享**: 输入文本内容，生成唯一的分享链接
- ⏰ **灵活过期**: 支持1天、7天、30天三种过期时间选项
- 📱 **二维码支持**: 可生成二维码方便移动设备访问
- 📋 **一键复制**: 支持复制文本内容和分享链接
- 🔒 **数据安全**: 使用Redis存储，自动过期删除
- 📱 **响应式设计**: 支持桌面端和移动端访问

## 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Redis
- **二维码**: qrcode.js

## 环境要求

- Node.js 18+
- Redis 6+
- pnpm (推荐) 或 npm

## 安装和运行

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动Redis服务

确保Redis服务正在运行：

```bash
# macOS (使用 Homebrew)
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis-server

# Docker
docker run -d --name redis -p 6379:6379 redis:alpine
```

### 3. 环境配置

创建 `.env.local` 文件（可选，使用默认Redis配置）：

```bash
# Redis 连接URL（默认使用本地Redis）
REDIS_URL=redis://localhost:6379
```

### 4. 启动开发服务器

```bash
pnpm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 运行。

## 使用说明

### 创建分享

1. 访问首页
2. 在文本框中输入要分享的内容（最多10,000字符）
3. 选择过期时间（1天/7天/30天）
4. 选择展示类型（仅文本/文本+二维码）
5. 点击"创建分享链接"

### 查看分享

1. 通过分享链接访问文本
2. 支持复制文本内容和分享链接
3. 二维码类型会同时显示文本和二维码
4. 显示创建时间和剩余有效期

## API接口

### POST /api/text

创建文本分享

**请求体:**
```json
{
  "text": "要分享的文本内容",
  "expiryTime": "1day|7days|30days",
  "displayType": "text|qrcode"
}
```

**响应:**
```json
{
  "id": "8位随机字符串"
}
```

### GET /api/text/[id]

获取文本内容

**响应:**
```json
{
  "text": "文本内容",
  "displayType": "text|qrcode",
  "createdAt": "创建时间ISO字符串",
  "expiresAt": "过期时间ISO字符串"
}
```

## 项目结构

```
text-sharing/
├── pages/                  # Next.js页面
│   ├── index.tsx           # 首页（文本提交）
│   ├── text/[id].tsx       # 文本查看页面
│   └── api/                # API接口
│       ├── text.ts         # 文本提交接口
│       └── text/[id].ts    # 文本获取接口
├── lib/                    # 公共库
│   └── redis.ts           # Redis连接和工具函数
├── styles/                 # 样式文件
└── docs/                   # 文档
```

## 部署

### Vercel部署

1. 推送代码到GitHub
2. 在Vercel中导入项目
3. 配置环境变量 `REDIS_URL`
4. 部署

### 自托管部署

1. 构建应用：`pnpm run build`
2. 启动生产服务器：`pnpm run start`
3. 确保Redis服务可访问

## 开发说明

- 文本ID使用8位随机字符串，确保唯一性
- Redis键格式：`text:{id}`
- 自动过期机制：Redis TTL + 应用层双重检查
- 前端使用Tailwind CSS提供响应式UI
- 支持深色模式适配

## License

MIT License