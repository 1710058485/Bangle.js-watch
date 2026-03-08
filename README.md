# Bangle.js Watch Data Management System

A full-stack watch data management system built with React + Node.js, supporting Bluetooth connectivity for Bangle.js smartwatches.

## Tech Stack

### Frontend
- React 18
- Vite 5
- Ant Design 5
- Tailwind CSS
- React Router 6
- Axios
- i18next (Internationalization)
- Framer Motion
- Recharts

### Backend
- Node.js 18+
- Express.js 4
- MySQL2
- JWT Authentication
- bcrypt Password Encryption

## Features

### ✅ Completed Features
- User registration and login
- JWT Token authentication
- Password encryption
- Responsive UI design
- Bluetooth device connection (Web Bluetooth API)
- Real-time sensor data acquisition (Heart rate, Accelerometer, Barometer)
- Sensor data recording and storage
- Historical data query with pagination
- Health dashboard with data visualization
- Weather forecast display
- Statistics with charts
- Device control (LED light)
- Chinese/English language switching
- Brown/Beige theme system
- Dark mode support

### 🎨 Theme System
- Complete CSS variable system
- Light mode: Warm brown/beige color scheme
- Dark mode: Full dark theme support
- Ant Design theme customization
- Chart color schemes

## Quick Start

### 1. Install Dependencies

Run in the project root directory:

```bash
npm run install:all
```

This will automatically install all dependencies for root, frontend, and backend.

### 2. Configure Backend Environment

```bash
cd back
cp .env.example .env
```

Edit `back/.env` file to configure database connection:

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

Execute the database initialization script:

```bash
mysql -u root -p < database/init.sql
```

### 4. Start the Project

Run in the project root directory:

```bash
npm run dev
```

This will start both:
- Frontend dev server: http://localhost:5173
- Backend API server: http://localhost:8080

## Project Structure

```
.
├── front/              # Frontend project
│   ├── src/
│   │   ├── api/        # API services
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   ├── i18n/       # Internationalization
│   │   ├── pages/      # Page components
│   │   ├── router/     # Route configuration
│   │   ├── styles/     # Global styles
│   │   └── utils/      # Utility functions
│   ├── public/
│   └── package.json
├── back/               # Backend project
│   ├── config/         # Configuration files
│   ├── middleware/     # Middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── server.js       # Entry point
│   └── package.json
├── database/           # Database scripts
│   └── init.sql
└── package.json        # Root project config
```

## Available Commands

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend (dev mode)
npm run dev

# Start frontend only
npm run dev:front

# Start backend only
npm run dev:back

# Build frontend for production
npm run build

# Start backend in production mode
npm run start:back
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User
- `GET /api/user/info` - Get current user info (requires JWT Token)

### Sensor Data
- `POST /api/sensor/record` - Save sensor data
- `GET /api/sensor/records` - Query sensor records (with pagination)
- `DELETE /api/sensor/records` - Clear all sensor records

### Recorder
- `POST /api/recorder/save` - Save GPS track
- `GET /api/recorder/list` - Get track list
- `DELETE /api/recorder/:id` - Delete track

## Bluetooth Features

### Web Bluetooth API Integration
- Device scanning and connection
- Auto-reconnect mechanism (up to 3 attempts)
- Real-time sensor data streaming
- Device control (LED light)

### Supported Sensors
- Heart Rate Monitor (HRM)
- Accelerometer (3-axis)
- Barometer (Temperature, Pressure, Altitude)

### Data Management
- Automatic data saving every 5 seconds
- Historical data query with pagination
- Data export functionality
- Clear all records

## Development Guide

### Frontend Development

The frontend uses Vite dev server with hot module replacement. Changes will automatically refresh the browser.

**Key Technologies:**
- React Hooks for state management
- Ant Design for UI components
- Tailwind CSS for styling
- i18next for internationalization
- Framer Motion for animations
- Recharts for data visualization

### Backend Development

The backend uses nodemon for auto-restart. Changes will automatically restart the server.

**Key Technologies:**
- Express.js for REST API
- MySQL2 for database operations
- JWT for authentication
- bcrypt for password hashing

### Database

Uses MySQL 8.0+. Ensure MySQL service is running.

**Tables:**
- `users` - User accounts
- `sensor_records` - Sensor data records
- `recorder_tracks` - GPS track records

## Browser Compatibility

### Web Bluetooth API Support
- Chrome 56+
- Edge 79+
- Opera 43+

**Note:** HTTPS is required for Web Bluetooth API.

## Theme Customization

### Color Scheme
The project uses a warm brown/beige color scheme:

**Light Mode:**
- Primary: `#644a40` (Dark Brown)
- Secondary: `#ffdfb5` (Beige)
- Background: `#f9f9f9`

**Dark Mode:**
- Primary: `#ffe0c2` (Light Beige)
- Secondary: `#393028` (Dark Brown)
- Background: `#111111`

### Customization
Edit `front/src/styles/global.css` to customize theme colors.

## Important Notes

1. Ensure Node.js version >= 18
2. Ensure MySQL service is running
3. Configure `.env` file before first run
4. Initialize database before first run
5. Use HTTPS for Web Bluetooth API in production

## Troubleshooting

### Port Already in Use

If port 8080 or 5173 is occupied, you can modify:
- Backend port: Change `PORT` in `back/.env`
- Frontend port: Change `server.port` in `front/vite.config.js`

### Database Connection Failed

Check:
1. Is MySQL service running?
2. Are database credentials in `.env` correct?
3. Has the database been created?

### Frontend Cannot Connect to Backend

Check:
1. Is backend service running properly?
2. Is proxy configuration in `front/vite.config.js` correct?

### Bluetooth Connection Issues

Check:
1. Is your browser supported? (Chrome/Edge/Opera)
2. Are you using HTTPS? (required for Web Bluetooth)
3. Is Bluetooth enabled on your device?
4. Is the watch in pairing mode?

## Documentation

- [Theme Update Guide](front/THEME_UPDATE.md)
- [MenuVertical Component Integration](front/MENU_VERTICAL_INTEGRATION.md)
- [Backend API Documentation](back/README.md)


