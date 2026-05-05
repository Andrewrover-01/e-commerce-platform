# e-commerce-platform

基于 Vite + Vue3 (Composition API) 开发的仿京东电商平台前端项目，实现完整的购物闭环。

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue 3 (Composition API) | ^3.4.0 |
| 构建工具 | Vite | ^5.0.0 |
| 路由管理 | Vue Router | ^4.3.0 |
| 状态管理 | Pinia | ^2.1.7 |
| HTTP 客户端 | Axios | ^1.6.0 |

## 功能模块

- 🏠 首页：轮播图、限时秒杀、热门商品、新品上市
- 📦 商品列表：分类筛选、关键词搜索、多维排序、分页
- 🔍 商品详情：图片轮播、规格展示、用户评价
- 🛒 购物车：增删改查、金额实时计算
- 👤 用户中心：登录 / 注册、订单管理
- 📋 订单结算：地址填写、支付确认

---

## 本地开发

### 环境要求

- Node.js >= 18.x
- npm >= 9.x（或 pnpm / yarn）

### 快速启动

```bash
# 1. 克隆仓库
git clone https://github.com/Andrewrover-01/e-commerce-platform.git
cd e-commerce-platform

# 2. 安装依赖
npm install

# 3. 启动开发服务器（默认端口 5173）
npm run dev
```

浏览器访问 [http://localhost:5173](http://localhost:5173) 即可预览。

### 常用命令

```bash
npm run dev      # 启动开发服务器（热重载）
npm run build    # 生产环境打包，输出到 dist/
npm run preview  # 本地预览生产构建
```

---

## 生产构建

```bash
npm run build
```

构建完成后，静态资源输出至 `dist/` 目录，可直接部署到任意静态文件服务器。

---

## 部署方式

### 方式一：Nginx 部署

适用于自有云服务器（CentOS / Ubuntu 等）。

#### 1. 打包前端资源

```bash
npm run build
# 将 dist/ 目录上传到服务器，例如 /var/www/e-commerce-platform/
```

#### 2. 安装 Nginx

```bash
# Ubuntu / Debian
sudo apt update && sudo apt install -y nginx

# CentOS / RHEL
sudo yum install -y nginx
```

#### 3. 配置 Nginx

创建配置文件 `/etc/nginx/conf.d/e-commerce.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;   # 替换为你的域名或服务器 IP

    root /var/www/e-commerce-platform;
    index index.html;

    # Vue Router history 模式：所有路由回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源长效缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 开启 Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;
}
```

#### 4. 启动 / 重载 Nginx

```bash
sudo nginx -t                  # 检查配置语法
sudo systemctl enable nginx    # 开机自启
sudo systemctl restart nginx   # 应用配置
```

#### 5. 配置 HTTPS（可选，推荐）

```bash
# 使用 Certbot 申请免费 Let's Encrypt 证书
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### 方式二：Docker 部署

#### 1. 在项目根目录创建 `Dockerfile`

```dockerfile
# ---- 构建阶段 ----
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- 运行阶段 ----
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# 支持 Vue Router history 模式
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. 构建并运行镜像

```bash
# 构建镜像
docker build -t e-commerce-platform:latest .

# 运行容器（映射到宿主机 8080 端口）
docker run -d -p 8080:80 --name e-commerce e-commerce-platform:latest
```

访问 [http://localhost:8080](http://localhost:8080) 即可。

#### 3. 使用 Docker Compose（可选）

在项目根目录创建 `docker-compose.yml`：

```yaml
version: "3.9"
services:
  web:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

```bash
docker compose up -d    # 启动
docker compose down     # 停止
```

---

### 方式三：Vercel 部署（推荐，免费）

1. 登录 [vercel.com](https://vercel.com) 并关联 GitHub 账号
2. 点击 **Add New Project** → 选择本仓库
3. 框架预设选择 **Vite**，保持默认配置即可
4. 点击 **Deploy**，部署完成后 Vercel 会自动分配 HTTPS 域名

每次推送到 `main` 分支时，Vercel 会自动触发重新部署。

---

### 方式四：Netlify 部署

1. 登录 [netlify.com](https://netlify.com) 并关联 GitHub 账号
2. 点击 **Add new site → Import an existing project** → 选择本仓库
3. 构建配置如下：

   | 配置项 | 值 |
   |--------|-----|
   | Build command | `npm run build` |
   | Publish directory | `dist` |

4. 点击 **Deploy site**

为支持 Vue Router history 模式，在项目根目录创建 `public/_redirects` 文件：

```
/*  /index.html  200
```

---

## 项目结构

```
e-commerce-platform/
├── public/               # 公共静态资源
├── src/
│   ├── api/
│   │   └── mock.js       # Mock 数据与 API 工具函数
│   ├── assets/           # 图片、样式等静态资源
│   ├── components/       # 公共组件
│   ├── router/
│   │   └── index.js      # 路由配置（含路由守卫）
│   ├── stores/           # Pinia 状态管理
│   │   ├── cart.js
│   │   ├── product.js
│   │   └── user.js
│   ├── views/            # 页面级组件
│   ├── App.vue
│   └── main.js
├── index.html
├── vite.config.js
└── package.json
```

---

## 环境变量配置

在项目根目录创建 `.env.production` 文件可覆盖生产环境变量（以 `VITE_` 前缀开头的变量会被 Vite 注入到客户端）：

```env
# 示例：替换为真实后端接口地址
VITE_API_BASE_URL=https://api.your-domain.com
```

> **注意**：当前项目使用 Mock 数据，无需真实后端即可完整运行。如需对接真实后端，请修改 `src/api/mock.js` 中的接口实现，改为通过 `axios` 请求 `VITE_API_BASE_URL` 下的对应端点。

---

## License

[MIT](./LICENSE)
