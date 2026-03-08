# 手表数据管理系统 - 前端

## 技术栈

- React 18
- Vite 5
- React Router 6
- Ant Design 5
- Axios

## 项目结构

```
front/
├── public/
├── src/
│   ├── api/                    # API接口
│   │   ├── request.js          # Axios封装
│   │   └── auth.js             # 认证相关API
│   ├── components/             # 公共组件
│   │   └── PrivateRoute.jsx    # 路由守卫
│   ├── pages/                  # 页面组件
│   │   ├── Login/              # 登录页
│   │   ├── Register/           # 注册页
│   │   ├── Home/               # 首页
│   │   └── Layout/             # 布局组件
│   ├── router/                 # 路由配置
│   │   └── index.jsx
│   ├── utils/                  # 工具函数
│   │   ├── token.js            # Token管理
│   │   └── constants.js        # 常量定义
│   ├── styles/                 # 全局样式
│   │   └── global.css
│   ├── App.jsx                 # 根组件
│   └── main.jsx                # 入口文件
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 3. 构建生产版本

```bash
npm run build
```

## 功能说明

### 已实现功能

1. **用户注册**
   - 用户名、密码、邮箱、手机号、昵称
   - 表单验证
   - 密码确认

2. **用户登录**
   - 用户名密码登录
   - Token存储
   - 自动跳转

3. **首页**
   - 欢迎信息
   - 数据统计卡片
   - 快速开始指引

4. **路由守卫**
   - 未登录自动跳转到登录页
   - Token验证

5. **布局系统**
   - 顶部导航栏
   - 侧边菜单
   - 用户信息展示
   - 退出登录

### 待实现功能

- 设备管理
- 健康数据记录和查询
- 数据统计和图表
- 个人信息管理

## 页面路由

- `/login` - 登录页
- `/register` - 注册页
- `/home` - 首页（需要登录）
- `/devices` - 设备管理（需要登录）
- `/health` - 健康数据（需要登录）
- `/statistics` - 数据统计（需要登录）

## API 配置

API请求通过Vite代理转发到后端服务器:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

## 认证流程

1. 用户登录成功后，Token和用户信息存储在localStorage
2. 每次请求自动在请求头添加Token
3. Token过期或无效时，自动清除认证信息并跳转到登录页
4. 路由守卫保护需要登录的页面

## 样式说明

- 使用Ant Design组件库
- 自定义CSS样式
- 响应式布局
- 渐变色背景

## 注意事项

1. 确保后端服务已启动（http://localhost:8080）
2. Token存储在localStorage，关闭浏览器后仍然有效
3. 生产环境需要配置正确的API地址
