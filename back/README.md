# 手表数据管理系统 - 后端

## 技术栈

- Spring Boot 3.2.1
- Spring Security
- MyBatis Plus 3.5.5
- MySQL 8.0
- JWT (jjwt 0.12.3)
- Lombok

## 项目结构

```
back/
├── src/main/java/com/watch/
│   ├── WatchApplication.java          # 启动类
│   ├── config/                        # 配置类
│   │   ├── SecurityConfig.java        # Spring Security配置
│   │   └── CorsConfig.java            # 跨域配置
│   ├── controller/                    # 控制器
│   │   ├── AuthController.java        # 认证控制器
│   │   └── UserController.java        # 用户控制器
│   ├── service/                       # 服务层
│   │   ├── UserService.java
│   │   └── impl/
│   │       └── UserServiceImpl.java
│   ├── mapper/                        # 数据访问层
│   │   └── UserMapper.java
│   ├── entity/                        # 实体类
│   │   └── User.java
│   ├── dto/                           # 数据传输对象
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   └── LoginResponse.java
│   ├── common/                        # 公共类
│   │   ├── Result.java                # 统一响应结果
│   │   └── ResultCode.java            # 响应码枚举
│   ├── util/                          # 工具类
│   │   ├── JwtUtil.java               # JWT工具
│   │   └── PasswordUtil.java          # 密码加密工具
│   ├── filter/                        # 过滤器
│   │   └── JwtAuthenticationFilter.java
│   └── exception/                     # 异常处理
│       └── GlobalExceptionHandler.java
└── src/main/resources/
    └── application.yml                # 配置文件
```

## 快速开始

### 1. 环境要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0+

### 2. 配置数据库

修改 `src/main/resources/application.yml` 中的数据库配置:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/watch_management
    username: root
    password: your_password
```

### 3. 初始化数据库

执行 `/database/init.sql` 脚本创建数据库和表。

### 4. 启动项目

```bash
# 使用Maven启动
mvn spring-boot:run

# 或者先打包再运行
mvn clean package
java -jar target/watch-management-1.0.0.jar
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
- **响应**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "email": "test@example.com"
  }
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
- **响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "email": "test@example.com",
      "role": "USER"
    }
  }
}
```

### 用户接口

#### 3. 获取当前用户信息
- **URL**: `GET /api/user/info`
- **请求头**: `Authorization: Bearer {token}`
- **响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "email": "test@example.com",
    "role": "USER"
  }
}
```

## 测试

使用 curl 测试接口:

```bash
# 注册
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","email":"test@example.com","nickname":"测试"}'

# 登录
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'

# 获取用户信息（需要替换token）
curl -X GET http://localhost:8080/api/user/info \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 安全特性

- 密码使用 BCrypt 加密存储
- JWT Token 认证，有效期 7 天
- Spring Security 保护接口
- 全局异常处理
- 参数验证

## 注意事项

1. JWT secret 在生产环境应该使用更复杂的密钥
2. CORS 配置在生产环境应该限制具体域名
3. 日志级别在生产环境应该调整为 INFO 或 WARN
