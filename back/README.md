# Watch Data Management System - Backend

## Tech Stack

- Node.js 18+
- Express.js 4
- MySQL2
- JWT Authentication
- bcrypt Password Encryption

## Project Structure

```
back/
├── config/                    # Configuration files
│   └── database.js           # Database configuration
├── middleware/               # Middleware
│   └── auth.js              # JWT authentication middleware
├── routes/                   # API routes
│   ├── auth.js              # Authentication routes
│   ├── sensor.js            # Sensor data routes
│   └── recorder.js          # Track recorder routes
├── services/                 # Business logic
│   └── userService.js       # User service
├── server.js                # Entry point
├── start.sh                 # Startup script
├── package.json
└── .env.example             # Environment variables template
```

## Quick Start

### 1. Requirements

- Node.js 18+
- MySQL 8.0+

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy `.env.example` to `.env` and configure:

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

### 4. Initialize Database

Execute the database initialization script:

```bash
mysql -u root -p < ../database/init.sql
```

### 5. Start Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will start at http://localhost:8080

## API Endpoints

### Authentication

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
- **Response**:
```json
{
  "code": 200,
  "message": "Registration successful",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "Test User",
    "email": "test@example.com"
  }
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
- **Response**:
```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "username": "testuser",
      "nickname": "Test User",
      "email": "test@example.com"
    }
  }
}
```

### User

#### 3. Get Current User Info
- **URL**: `GET /api/user/info`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "Test User",
    "email": "test@example.com"
  }
}
```

### Sensor Data

#### 4. Save Sensor Record
- **URL**: `POST /api/sensor/record`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
```json
{
  "bpm": 75,
  "accel_x": 0.12,
  "accel_y": -0.05,
  "accel_z": 0.98,
  "pressure": 1013.25,
  "pressure_temp": 22.5,
  "pressure_alt": 100.0
}
```

#### 5. Get Sensor Records
- **URL**: `GET /api/sensor/records?page=1&pageSize=20`
- **Headers**: `Authorization: Bearer {token}`

#### 6. Clear All Sensor Records
- **URL**: `DELETE /api/sensor/records`
- **Headers**: `Authorization: Bearer {token}`

### Track Recorder

#### 7. Save GPS Track
- **URL**: `POST /api/recorder/save`
- **Headers**: `Authorization: Bearer {token}`

#### 8. Get Track List
- **URL**: `GET /api/recorder/list`
- **Headers**: `Authorization: Bearer {token}`

#### 9. Delete Track
- **URL**: `DELETE /api/recorder/:id`
- **Headers**: `Authorization: Bearer {token}`

## Testing

Test API endpoints using curl:

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","email":"test@example.com","nickname":"Test"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'

# Get user info (replace token)
curl -X GET http://localhost:8080/api/user/info \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Security Features

- Password encryption using bcrypt
- JWT Token authentication (7 days validity)
- Protected API endpoints with middleware
- Global error handling
- Input validation

## Important Notes

1. Change JWT secret to a more complex key in production
2. Configure CORS to allow specific domains in production
3. Adjust log level to INFO or WARN in production
4. Use environment variables for sensitive data
5. Enable HTTPS in production

## Database Schema

### users table
- id (INT, PRIMARY KEY)
- username (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- email (VARCHAR)
- phone (VARCHAR)
- nickname (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### sensor_records table
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- bpm (INT) - Heart rate
- accel_x, accel_y, accel_z (DECIMAL) - Accelerometer
- pressure (DECIMAL) - Barometer pressure
- pressure_temp (DECIMAL) - Temperature
- pressure_alt (DECIMAL) - Altitude
- created_at (TIMESTAMP)

### recorder_tracks table
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- track_data (JSON) - GPS track data
- created_at (TIMESTAMP)
