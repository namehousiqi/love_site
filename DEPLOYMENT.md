# 告白信网站部署指南

## 项目结构

```
love_site/
├── server.js           # Express 服务器入口
├── package.json        # 项目依赖配置
├── data/
│   └── letters/        # 告白信数据存储目录
├── routes/
│   └── letters.js      # 路由和存储模块
├── public/             # 静态文件目录（待创建）
│   ├── editor.html     # 编辑页面
│   └── view.html       # 查看页面
└── .sisyphus/
    └── plans/
```

## API 接口

### 1. 创建告白信
```bash
POST /api/letter
Content-Type: application/json

{
  "title": "亲爱的",
  "subtitle": "我喜欢你",
  "content": "想说的话...",
  "signature": "爱你的",
  "signatureName": "小明",
  "password": "5201314"
}

# 响应
{
  "success": true,
  "id": "abc123"
}
```

### 2. 获取告白信（不含密码）
```bash
GET /api/letter/:id

# 响应
{
  "success": true,
  "letter": {
    "id": "abc123",
    "title": "亲爱的",
    "subtitle": "我喜欢你",
    "content": "想说的话...",
    "signature": "爱你的",
    "signatureName": "小明",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 验证密码并获取完整内容
```bash
POST /api/letter/:id/verify
Content-Type: application/json

{
  "password": "5201314"
}

# 响应（密码正确）
{
  "success": true,
  "letter": { ... }
}

# 响应（密码错误）
{
  "success": false,
  "error": "密码错误"
}
```

## 本地开发

1. 安装依赖
```bash
npm install
```

2. 启动服务器
```bash
npm start
```

3. 访问
- 服务器地址：http://localhost:3000
- 创建告白信：http://localhost:3000/editor.html
- 查看告白信：http://localhost:3000/view.html?id=abc123

## 服务器部署

### 方案 1：直接部署

1. 上传项目到服务器
```bash
scp -r love_site user@your-server:/var/www/
```

2. 在服务器上安装依赖
```bash
cd /var/www/love_site
npm install --production
```

3. 使用 PM2 管理进程
```bash
npm install -g pm2
pm2 start server.js --name love-letter
pm2 save
pm2 startup
```

4. 配置 Nginx（可选）
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 方案 2：Docker 部署

创建 `Dockerfile`：
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

构建并运行：
```bash
docker build -t love-letter .
docker run -p 3000:3000 -d love-letter
```

## 数据备份

告白信数据存储在 `data/letters/` 目录下，每个 JSON 文件对应一封信。

定期备份该目录：
```bash
tar -czf letters-backup-$(date +%Y%m%d).tar.gz data/letters/
```

## 安全建议

1. **HTTPS**: 生产环境务必使用 HTTPS
2. **密码强度**: 建议前端添加密码强度验证
3. **限流**: 添加 API 限流防止暴力破解
4. **数据清理**: 定期清理过期告白信

## 故障排查

### 端口被占用
```bash
# 查看占用端口的进程
lsof -i :3000
# 杀死进程
kill -9 <PID>
```

### 依赖安装失败
```bash
# 清除缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 无法访问
1. 检查防火墙是否开放 3000 端口
2. 检查服务器安全组配置
3. 查看 PM2 日志：`pm2 logs love-letter`
