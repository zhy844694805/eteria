# 永念 | EternalMemory

为您心爱的宠物创建美丽、持久的纪念。分享回忆，与他人连接，让它们的精神永远活着。

## 项目结构

```
永念 | EternalMemory/
├── frontend/          # Next.js 前端应用
│   ├── app/          # 应用页面
│   ├── components/   # React 组件
│   ├── public/       # 静态资源
│   └── ...
└── README.md         # 项目说明
```

## 前端服务启动

### 安装依赖

```bash
cd frontend
npm install --legacy-peer-deps
```

### 启动开发服务器

```bash
npm run dev
```

服务将在 http://localhost:3000 启动（如果端口被占用，会自动使用 3001 等其他端口）

### 其他可用命令

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

## 功能特性

- ✅ 创建免费宠物悼念页
- ✅ 上传宠物照片和信息
- ✅ 社区宠物悼念页浏览
- ✅ 点亮虚拟蜡烛和留言
- ✅ 响应式设计，支持移动端
- ✅ 完整中文本地化

## 技术栈

- **前端框架**: Next.js 15
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui
- **图标**: Lucide React
- **语言**: TypeScript
- **包管理**: npm

## 开发说明

项目使用 Next.js App Router 架构，采用 TypeScript 开发。所有页面和组件都已完成中文本地化。

如果在安装依赖时遇到版本冲突，请使用 `--legacy-peer-deps` 参数。