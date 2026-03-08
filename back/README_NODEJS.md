# 手表数据管理系统 - Node.js 后端

## 技术栈

- Node.js 18+
- Express.js 4
- MySQL2
- JWT (jsonwebtoken)
- bcrypt (密码加密)
- CORS

## 项目结构

```
back/
├── config/
│   └── database.js          # 数据库配置
├── middleware/
│   └── auth.js              # JWT 认证中间件
├── routes/
│   ├── auth.js              # 认证路由
│   └── user.js              # 用户路由
├── services/
│   └── userService.js       # 用户服务
├── .env.example             # 环境变量示例
├── package.json
└── server.js                # 主服务器文件
```

## 快速开始

### 1. 安装依赖

```bash
cd back
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置:

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置数据库连接信息:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=watch_management

JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

PORT=8080
NODE_ENV=development
```

### 3. 初始化数据库

执行 `/database/init.sql` 脚本创建数据库和表。

### 4. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

启动成功后，访问 http://localhost:8080

## API 接口

### 认证接口

#### 1. 用户注册
- **URL**: `POST /api/auth/register`
- **请求体**:
```json
{
  "username": "testuser",
  "password": "123456",
  "email": "test@example.com",
  "phone": "13800138000",
  "nickname": "测试用户"
}
```

#### 2. 用户登录
- **URL**: `POST /api/auth/login`
- **请求体**:
```json
{
  "username": "testuser",
  "password": "123456"
}
```

### 用户接口

#### 3. 获取当前用户信息
- **URL**: `GET /api/user/info`
- **请求头**: `Authorization: Bearer {token}`

## 与 Java 版本的区别

1. **更轻量**: 无需 JVM，启动更快
2. **更简洁**: 代码量更少，结构更清晰
3. **蓝牙支持**: 可以直接使用 Web Bluetooth API
4. **相同 API**: 保持与原 Java 版本相同的接口，前端无需修改

## 安全特性

- 密码使用 bcrypt 加密存储
- JWT Token 认证，默认有效期 7 天
- CORS 跨域支持
- 全局错误处理

## 注意事项

1. JWT secret 在生产环境应该使用更复杂的密钥
2. CORS 配置在生产环境应该限制具体域名
3. 确保 MySQL 服务已启动
