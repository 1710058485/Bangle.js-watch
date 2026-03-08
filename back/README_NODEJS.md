# Watch Data Management System - Node.js Backend

## Tech Stack

- Node.js 18+
- Express.js 4
- MySQL2
- JWT (jsonwebtoken)
- bcrypt (password encryption)
- CORS

## Project Structure

```
back/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   └── user.js              # User routes
├── services/
│   └── userService.js       # User service
├── .env.example             # Environment variables example
├── package.json
└── server.js                # Main server file
```

## Quick Start

### 1. Install Dependencies

```bash
cd back
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and modify the configuration:

```bash
cp .env.example .env
```

Edit the `.env` file and set database connection information:

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

### 3. Initialize Database

Execute the `/database/init.sql` script to create the database and tables.

### 4. Start Server

```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

After successful startup, visit http://localhost:8080

## API Endpoints

### Authentication Endpoints

#### 1. User Registration
- **URL**: `POST /api/auth/register`
- **Request Body**:
```json
{
  "username": "testuser",
  "password": "123456",
  "email": "test@example.com",
  "phone": "13800138000",
  "nickname": "Test User"
}
```

#### 2. User Login
- **URL**: `POST /api/auth/login`
- **Request Body**:
```json
{
  "username": "testuser",
  "password": "123456"
}
```

### User Endpoints

#### 3. Get Current User Information
- **URL**: `GET /api/user/info`
- **Headers**: `Authorization: Bearer {token}`

## Differences from Java Version

1. **More Lightweight**: No JVM required, faster startup
2. **More Concise**: Less code, clearer structure
3. **Bluetooth Support**: Can directly use Web Bluetooth API
4. **Same API**: Maintains the same interface as the original Java version, no frontend changes needed

## Security Features

- Passwords encrypted with bcrypt
- JWT Token authentication, default validity 7 days
- CORS cross-origin support
- Global error handling

## Important Notes

1. JWT secret should use a more complex key in production
2. CORS configuration should restrict specific domains in production
3. Ensure MySQL service is running
