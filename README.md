# 手表数据管理系统

一个基于 React + Node.js 的全栈手表数据管理系统，支持蓝牙连接手表设备。

## 技术栈

### 前端
- React 18
- Vite 5
- Ant Design 5
- Tailwind CSS
- React Router 6
- Axios

### 后端
- Node.js 18+
- Express.js 4
- MySQL2
- JWT 认证
- bcrypt 密码加密

## 快速开始

### 1. 安装所有依赖

在项目根目录运行：

```bash
npm run install:all
```

这会自动安装根目录、前端和后端的所有依赖。

### 2. 配置后端环境变量

```bash
cd back
cp .env.example .env
```

编辑 `back/.env` 文件，配置数据库连接：

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

执行数据库初始化脚本：

```bash
mysql -u root -p < database/init.sql
```

### 4. 启动项目

在项目根目录运行：

```bash
npm run dev
```

这会同时启动：
- 前端开发服务器：http://localhost:5173
- 后端 API 服务器：http://localhost:8080

## 项目结构

```
.
├── front/              # 前端项目
│   ├── src/
│   ├── public/
│   └── package.json
├── back/               # 后端项目
│   ├── config/         # 配置文件
│   ├── middleware/     # 中间件
│   ├── routes/         # 路由
│   ├── services/       # 业务逻辑
│   ├── server.js       # 入口文件
│   └── package.json
├── database/           # 数据库脚本
│   └── init.sql
└── package.json        # 根项目配置
```

## 可用命令

```bash
# 安装所有依赖
npm run install:all

# 同时启动前后端（开发模式）
npm run dev

# 只启动前端
npm run dev:front

# 只启动后端
npm run dev:back

# 构建前端生产版本
npm run build

# 启动后端生产模式
npm run start:back
```

## API 接口

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户接口

- `GET /api/user/info` - 获取当前用户信息（需要 JWT Token）

## 功能特性

- ✅ 用户注册和登录
- ✅ JWT Token 认证
- ✅ 密码加密存储
- ✅ 响应式界面设计
- 🔄 蓝牙设备连接（开发中）
- 🔄 健康数据记录（开发中）
- 🔄 数据统计和图表（开发中）

## 开发说明

### 前端开发

前端使用 Vite 开发服务器，支持热更新。修改代码后会自动刷新浏览器。

### 后端开发

后端使用 nodemon 自动重启，修改代码后会自动重启服务器。

### 数据库

使用 MySQL 8.0+，确保 MySQL 服务已启动。

## 注意事项

1. 确保 Node.js 版本 >= 18
2. 确保 MySQL 服务已启动
3. 首次运行前必须配置 `.env` 文件
4. 首次运行前必须初始化数据库

## 故障排除

### 端口被占用

如果 8080 或 5173 端口被占用，可以修改：
- 后端端口：修改 `back/.env` 中的 `PORT`
- 前端端口：修改 `front/vite.config.js` 中的 `server.port`

### 数据库连接失败

检查：
1. MySQL 服务是否启动
2. `.env` 中的数据库配置是否正确
3. 数据库是否已创建

### 前端无法连接后端

检查：
1. 后端服务是否正常启动
2. `front/vite.config.js` 中的代理配置是否正确
