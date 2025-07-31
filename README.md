# 永念 | EternalMemory

永念是一个双纪念系统的纪念网站，支持为宠物和人类创建美丽、持久的纪念页面。用户可以分享回忆，与他人连接，让逝者的精神永远活着。

## 项目结构

```
永念 | EternalMemory/
├── frontend/              # Next.js 15 前端应用
│   ├── app/              # App Router 页面
│   │   ├── api/          # API 路由
│   │   ├── create-obituary/        # 宠物纪念创建
│   │   ├── create-person-obituary/ # 人类纪念创建
│   │   ├── community-pet-obituaries/    # 宠物社区
│   │   ├── community-person-obituaries/ # 人类社区
│   │   └── ...
│   ├── components/       # React 组件
│   │   ├── ui/          # shadcn/ui 组件
│   │   ├── create-obituary/         # 宠物表单组件
│   │   ├── create-person-obituary/  # 人类表单组件
│   │   └── ...
│   ├── lib/             # 工具库
│   ├── prisma/          # 数据库配置
│   ├── public/          # 静态资源
│   └── ...
└── README.md            # 项目说明
```

## 🚀 完整部署教程

### 准备工作

#### 1. 环境要求
- **Node.js**: 18.0.0 或更高版本
- **npm**: 9.0.0 或更高版本
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **邮件服务**: SMTP 服务器 (如 Aruba, Gmail, 阿里云等)

#### 2. 检查环境
```bash
# 检查 Node.js 版本
node --version  # 应显示 v18.0.0+

# 检查 npm 版本
npm --version   # 应显示 9.0.0+
```

### 第一步：克隆和设置项目

#### 1. 克隆项目
```bash
# 克隆项目到本地
git clone <项目仓库地址>
cd "永念 | EternalMemory"
```

#### 2. 进入前端目录
```bash
cd frontend
```

#### 3. 安装依赖
```bash
# 由于 React 19 的依赖冲突，必须使用 legacy-peer-deps
npm install --legacy-peer-deps
```

### 第二步：环境变量配置

#### 1. 创建环境变量文件
```bash
# 创建 .env.local 文件
touch .env.local
```

#### 2. 配置环境变量
在 `.env.local` 文件中添加以下配置：

```bash
# 数据库配置
DATABASE_URL="file:./dev.db"  # 开发环境使用 SQLite
# DATABASE_URL="postgresql://user:password@localhost:5432/eternalmemory"  # 生产环境使用 PostgreSQL

# 应用配置
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # 开发环境
# NEXT_PUBLIC_BASE_URL="https://yourdomain.com"  # 生产环境

# JWT 密钥 (必须设置)
JWT_SECRET="your-super-secret-jwt-key-here-change-this-in-production"

# SMTP 邮件配置 (必须配置)
SMTP_HOST="smtps.aruba.it"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="info@aimodel.it"
SMTP_PASSWORD="your-smtp-password"

# 文件上传配置 (可选)
MAX_FILE_SIZE="5242880"  # 5MB
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif"
```

### 第三步：数据库设置

#### 1. 生成 Prisma 客户端
```bash
npx prisma generate
```

#### 2. 推送数据库架构
```bash
# 开发环境 - 创建/更新数据库表
npx prisma db push

# 如需要重置数据库 (慎用!)
# npx prisma db push --force-reset
```

#### 3. 查看数据库 (可选)
```bash
# 启动 Prisma Studio 查看数据库
npx prisma studio
# 访问 http://localhost:5555
```

### 第四步：开发环境启动

#### 1. 启动开发服务器
```bash
npm run dev
```

#### 2. 访问应用
- 主页: http://localhost:3000
- 宠物纪念系统: http://localhost:3000/pet-memorial
- 人类纪念系统: http://localhost:3000/human-memorial

#### 3. 端口占用解决
如果 3000 端口被占用：
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程 (替换 PID)
kill -9 <PID>

# 或者指定其他端口启动
npm run dev -- -p 3001
```

### 第五步：生产环境部署

#### 1. 构建生产版本
```bash
# 构建优化后的生产版本
npm run build
```

#### 2. 启动生产服务器
```bash
# 启动生产服务器
npm run start
```

#### 3. 使用 PM2 进程管理 (推荐)
```bash
# 安装 PM2
npm install -g pm2

# 创建 ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'eternalmemory',
    script: 'npm',
    args: 'start',
    cwd: './frontend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save
pm2 startup
```

### 第六步：Nginx 反向代理配置

#### 1. 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 2. 配置 Nginx
创建配置文件 `/etc/nginx/sites-available/eternalmemory`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL 证书配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL 安全设置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    
    # 上传文件大小限制
    client_max_body_size 10M;
    
    # 反向代理到 Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # 图片文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

#### 3. 启用配置
```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/eternalmemory /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

### 第七步：SSL 证书配置

#### 使用 Let's Encrypt (免费)
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo crontab -e
# 添加：0 2 * * * certbot renew --quiet
```

### 第八步：数据库生产配置

#### PostgreSQL 配置
```bash
# 安装 PostgreSQL
sudo apt install postgresql postgresql-contrib

# 创建数据库和用户
sudo -u postgres psql
CREATE DATABASE eternalmemory;
CREATE USER eternalmemory_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE eternalmemory TO eternalmemory_user;
\q

# 更新环境变量
DATABASE_URL="postgresql://eternalmemory_user:your_secure_password@localhost:5432/eternalmemory"

# 推送数据库架构
npx prisma db push
```

### 第九步：监控和日志

#### 1. 应用监控
```bash
# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs eternalmemory

# 监控面板
pm2 monit
```

#### 2. Nginx 日志
```bash
# 查看访问日志
sudo tail -f /var/log/nginx/access.log

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 第十步：备份策略

#### 1. 数据库备份
```bash
# 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/eternalmemory"
mkdir -p $BACKUP_DIR

# 备份 PostgreSQL
pg_dump -U eternalmemory_user -h localhost eternalmemory > $BACKUP_DIR/db_backup_$DATE.sql

# 备份上传文件
rsync -av /path/to/uploads/ $BACKUP_DIR/uploads_backup_$DATE/

# 删除 7 天前的备份
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# 设置定时备份
crontab -e
# 添加：0 2 * * * /path/to/backup.sh
```

### 故障排除

#### 常见问题

1. **依赖安装失败**
   ```bash
   # 清除缓存后重新安装
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

2. **数据库连接错误**
   ```bash
   # 检查数据库状态
   npx prisma db push --force-reset
   npx prisma generate
   ```

3. **端口占用**
   ```bash
   # 查找并杀死占用进程
   lsof -i :3000
   kill -9 <PID>
   ```

4. **SMTP 邮件发送失败**
   - 检查 SMTP 配置是否正确
   - 确认邮箱服务商是否开启 SMTP
   - 检查防火墙是否阻止 SMTP 端口

5. **SSL 证书问题**
   ```bash
   # 手动续期证书
   sudo certbot renew
   sudo systemctl reload nginx
   ```

#### 调试命令

```bash
# 检查应用状态
npm run build  # 检查构建是否成功
npm run lint   # 检查代码质量

# 检查数据库
npx prisma studio  # 可视化数据库管理

# 检查进程
pm2 status        # 查看 PM2 进程状态
pm2 logs --lines 100  # 查看最近日志

# 检查系统资源
htop             # 查看系统资源使用
df -h            # 查看磁盘使用
free -m          # 查看内存使用
```

## 快速开发启动

如果您只是想快速启动开发环境：

```bash
# 1. 进入项目目录
cd frontend

# 2. 安装依赖
npm install --legacy-peer-deps

# 3. 设置数据库
npx prisma generate
npx prisma db push

# 4. 启动开发服务器
npm run dev
```

## 功能特性

### 双纪念系统
- ✅ **宠物纪念系统**: 为心爱的宠物创建纪念页面
- ✅ **人类纪念系统**: 为逝去的亲人创建纪念页面
- ✅ **智能路由识别**: 自动检测并显示对应的导航和样式

### 核心功能
- ✅ **多步骤表单**: 信息填写 → 生平故事 → 创建者信息
- ✅ **图片上传系统**: 支持主图 + 9张额外照片，自动预览
- ✅ **用户认证系统**: 注册、登录、邮箱验证
- ✅ **社区互动**: 点亮蜡烛、留言、点赞
- ✅ **筛选搜索**: 按关系分类筛选，关键词搜索
- ✅ **响应式设计**: 完美支持移动端和桌面端

### 技术特性
- ✅ **现代技术栈**: Next.js 15 + React 19 + TypeScript
- ✅ **数据库集成**: Prisma ORM + SQLite/PostgreSQL
- ✅ **邮件系统**: Nodemailer + SMTP 配置
- ✅ **表单验证**: React Hook Form + Zod
- ✅ **UI 组件库**: shadcn/ui + Tailwind CSS
- ✅ **中文本地化**: 完整的中文界面和内容

## 技术栈详情

### 前端技术
- **框架**: Next.js 15.2.4 (App Router)
- **语言**: TypeScript 5.x
- **UI库**: React 19 + shadcn/ui (40+ 组件)
- **样式**: Tailwind CSS 3.4.17
- **图标**: Lucide React
- **表单**: React Hook Form + Zod 验证
- **状态管理**: React Context + useState

### 后端技术
- **API**: Next.js API Routes
- **数据库**: Prisma ORM + SQLite (开发) / PostgreSQL (生产)
- **认证**: bcrypt + JWT
- **邮件**: Nodemailer + SMTP
- **文件上传**: Next.js Built-in 处理

### 开发工具
- **包管理**: npm
- **代码质量**: ESLint + TypeScript
- **构建工具**: Next.js 内置构建系统
- **进程管理**: PM2 (生产环境)
- **反向代理**: Nginx

## 数据库架构

### 核心表结构
- **users**: 用户信息和认证
- **memorials**: 纪念页面主表
- **memorial_images**: 图片管理
- **messages**: 留言系统
- **candles**: 虚拟蜡烛
- **likes**: 点赞系统
- **tags**: 标签系统

### 支持的纪念类型
- **宠物纪念**: 犬类、猫类、鸟类、兔子、仓鼠等 (25+ 品种)
- **人类纪念**: 父母、配偶、子女、朋友、同事等关系

## 开发说明

项目采用 Next.js App Router 架构，使用 TypeScript 严格模式开发。所有页面和组件都完成了中文本地化，支持宠物和人类双纪念系统的完整功能。

### 重要注意事项
1. **依赖安装**: 必须使用 `--legacy-peer-deps` 参数
2. **数据库操作**: 每次 schema 更改后需要运行 `npx prisma generate`
3. **环境变量**: 生产环境必须配置所有必需的环境变量
4. **SMTP 配置**: 邮件功能需要正确的 SMTP 服务器配置