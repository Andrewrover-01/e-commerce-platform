# 电商平台后端服务

Node.js + Express RESTful API，为用户端和管理端提供统一数据接口。

---

## 技术栈

| 层次 | 技术 |
|---|---|
| 运行时 | Node.js ≥ 18 |
| Web 框架 | Express 4 |
| 认证 | JWT (jsonwebtoken) + bcryptjs |
| 参数校验 | express-validator |
| 安全 | helmet, cors |
| 日志 | morgan |
| 数据持久化 | 内存存储（可切换 MySQL / PostgreSQL JSON 记录表） |
| 缓存/队列 | Redis（缓存 + 队列事件，支持内存回退） |

---

## 项目结构

```
backend/
├── src/
│   ├── config/              # 配置（端口、JWT、数据库、Redis）
│   │   ├── index.js
│   │   ├── database.js
│   │   └── redis.js
│   ├── models/              # 数据模型 / Schema 定义
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── category.model.js
│   │   ├── order.model.js
│   │   ├── cart.model.js
│   │   ├── coupon.model.js
│   │   ├── review.model.js
│   │   ├── banner.model.js
│   │   ├── notice.model.js
│   │   └── article.model.js
│   ├── repositories/        # 数据访问层（DAL）
│   │   ├── base.repository.js   ← 通用 CRUD
│   │   ├── user.repository.js
│   │   ├── product.repository.js
│   │   ├── category.repository.js
│   │   ├── order.repository.js
│   │   ├── cart.repository.js
│   │   ├── coupon.repository.js
│   │   ├── review.repository.js
│   │   ├── banner.repository.js
│   │   ├── notice.repository.js
│   │   ├── article.repository.js
│   │   └── log.repository.js
│   ├── services/            # 业务逻辑层
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── product.service.js
│   │   ├── category.service.js
│   │   ├── order.service.js
│   │   ├── cart.service.js
│   │   ├── coupon.service.js
│   │   ├── cache.service.js
│   │   ├── queue.service.js
│   │   ├── log-event.service.js
│   │   └── admin/
│   │       ├── dashboard.service.js
│   │       ├── product.service.js
│   │       ├── order.service.js
│   │       ├── user.service.js
│   │       ├── marketing.service.js
│   │       ├── finance.service.js
│   │       └── content.service.js
│   ├── controllers/         # 控制层（HTTP 请求处理）
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── product.controller.js
│   │   ├── category.controller.js
│   │   ├── order.controller.js
│   │   ├── cart.controller.js
│   │   └── admin/
│   │       ├── dashboard.controller.js
│   │       ├── product.controller.js
│   │       ├── order.controller.js
│   │       ├── user.controller.js
│   │       ├── marketing.controller.js
│   │       ├── finance.controller.js
│   │       └── content.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js    # JWT 验证
│   │   ├── admin.middleware.js   # 管理员角色校验
│   │   ├── validate.middleware.js# express-validator 错误处理
│   │   └── error.middleware.js   # 全局异常处理
│   ├── routes/
│   │   ├── index.js             # 路由总入口 /api/v1
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── product.routes.js
│   │   ├── category.routes.js
│   │   ├── order.routes.js
│   │   ├── cart.routes.js
│   │   └── admin/
│   │       ├── index.js         # 管理端路由 /api/v1/admin
│   │       ├── auth.routes.js
│   │       ├── dashboard.routes.js
│   │       ├── product.routes.js
│   │       ├── order.routes.js
│   │       ├── user.routes.js
│   │       ├── marketing.routes.js
│   │       ├── finance.routes.js
│   │       └── content.routes.js
│   └── app.js                   # Express 应用入口
├── .env.example
└── package.json
```

---

## 快速开始

```bash
# 1. 进入目录
cd backend

# 2. 安装依赖
npm install

# 3. 复制环境变量文件并按需修改
cp .env.example .env

# 4. 开发模式启动（热重载）
npm run dev

# 5. 生产模式启动
npm start
```

服务启动后访问：
- 健康检查：`GET http://localhost:3001/health`
- API 根路径：`http://localhost:3001/api/v1`

---

## API 一览

### 用户端 `/api/v1`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/auth/register` | 注册 | ✗ |
| POST | `/auth/login` | 登录 | ✗ |
| GET | `/products` | 商品列表（支持分页/筛选/排序） | ✗ |
| GET | `/products/hot` | 热销商品 | ✗ |
| GET | `/products/new` | 新品 | ✗ |
| GET | `/products/flash-sale` | 限时抢购 | ✗ |
| GET | `/products/:id` | 商品详情 | ✗ |
| GET | `/categories` | 分类列表 | ✗ |
| GET | `/categories/tree` | 分类树 | ✗ |
| GET | `/user/profile` | 获取用户信息 | ✓ |
| PUT | `/user/profile` | 更新用户信息 | ✓ |
| GET | `/cart` | 获取购物车 | ✓ |
| POST | `/cart/items` | 加入购物车 | ✓ |
| PUT | `/cart/items/:productId` | 修改数量 | ✓ |
| DELETE | `/cart/items/:productId` | 删除单项 | ✓ |
| DELETE | `/cart` | 清空购物车 | ✓ |
| PATCH | `/cart/items/:productId/select` | 勾选/取消 | ✓ |
| GET | `/orders` | 我的订单列表 | ✓ |
| POST | `/orders` | 提交订单 | ✓ |
| GET | `/orders/:id` | 订单详情 | ✓ |
| POST | `/orders/:id/cancel` | 取消订单 | ✓ |

### 管理端 `/api/v1/admin`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | 管理员登录 |
| GET | `/dashboard/overview` | 数据概览 |
| GET | `/dashboard/recent-orders` | 最近订单 |
| GET/POST/PUT/DELETE | `/products` | 商品管理 |
| GET/POST/PUT/DELETE | `/products/categories` | 分类管理 |
| GET/PATCH/POST | `/orders` | 订单管理 / 状态更新 |
| GET/POST | `/orders/refunds` | 退款管理 |
| GET/POST/PUT/PATCH | `/users` | 用户管理 |
| GET/POST/PUT/DELETE | `/marketing/coupons` | 优惠券管理 |
| GET | `/marketing/activities` | 活动管理（预留） |
| GET | `/finance/overview` | 财务概览 |
| GET | `/finance/statements` | 流水明细 |
| GET/POST/PUT/DELETE | `/content/banners` | 轮播图管理 |
| GET/POST/PUT/DELETE | `/content/notices` | 公告管理 |
| GET/POST/PUT/DELETE | `/content/articles` | 文章管理 |
| GET/POST/DELETE | `/content/reviews` | 评价审核 |

---

## 统一响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

错误响应示例：
```json
{
  "code": 422,
  "message": "参数校验失败",
  "errors": [{ "field": "email", "message": "邮箱格式不正确" }]
}
```

---

## 持久化 / 缓存 / 队列配置

1. 在 `.env` 中设置 `DB_TYPE=mysql` 或 `DB_TYPE=postgres`，并配置 `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`（或 `DB_TYPE=memory` 使用内存存储）
2. 可选设置 `DB_TABLE`（默认 `app_records`），系统会在启动时自动创建 JSON 记录表
3. 如需启用 Redis，设置 `REDIS_ENABLED=true`（或配置 `REDIS_URL`），缓存会自动接管商品查询缓存
4. 如需启用队列，设置 `QUEUE_ENABLED=true`，订单事件与日志事件会发布到 `QUEUE_ORDER_KEY/QUEUE_LOG_KEY`
5. 应用启动时会自动执行数据库连接、Redis 连接、队列启动钩子

---

## 前端对接

在前端 `src/utils/request.js` 中将 `baseURL` 改为：

```js
baseURL: 'http://localhost:3001',
```

所有 API 请求路径格式为 `/api/v1/...`。
