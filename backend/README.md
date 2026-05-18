# 电商平台后端服务

后端采用模块化设计（控制层、服务层、数据访问层）。
当前仓库实现为 Node.js + Express，提供 RESTful API；可按相同分层方式迁移到 Spring Boot 或 Go + Gin，GraphQL 作为可选扩展方向。

---

## 技术栈（当前实现 + 可迁移方向）

| 层次 | 技术 |
|---|---|
| 运行时/框架 | 当前：Node.js + Express；可迁移：Spring Boot / Go + Gin |
| API 风格 | RESTful API 或 GraphQL |
| 认证 | JWT（当前实现：jsonwebtoken + bcryptjs） |
| 参数校验 | 请求参数校验（当前实现：express-validator） |
| 安全 | 安全头/CORS（当前实现：helmet, cors） |
| 日志 | 请求日志（当前实现：morgan） |
| 数据库（默认）| 内存存储（可替换为 MySQL / MongoDB） |

---

## 项目结构

```
backend/
├── src/
│   ├── config/              # 配置（端口、JWT、数据库）
│   │   ├── index.js
│   │   └── database.js      # DB 连接占位，替换为真实适配器
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
│   │   └── article.repository.js
│   ├── services/            # 业务逻辑层
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── product.service.js
│   │   ├── category.service.js
│   │   ├── order.service.js
│   │   ├── cart.service.js
│   │   ├── coupon.service.js
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

## 接入真实数据库

1. 在 `.env` 中设置 `DB_TYPE=mysql`（或 `mongodb`）及连接参数
2. 在 `src/config/database.js` 中实现 `connect()` 函数
3. 在对应的 `src/repositories/*.repository.js` 中替换内存数组操作为真实 SQL/ORM 查询
4. 业务逻辑层（services）和控制层（controllers）**无需修改**

---

## 前端对接

在前端 `src/utils/request.js` 中将 `baseURL` 改为：

```js
baseURL: 'http://localhost:3001',
```

所有 API 请求路径格式为 `/api/v1/...`。
