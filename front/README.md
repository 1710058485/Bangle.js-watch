# Watch Data Management System - Frontend

## Tech Stack

- React 18
- Vite 5
- React Router 6
- Ant Design 5
- Axios
- i18next (Internationalization)
- Framer Motion
- Recharts
- Tailwind CSS

## Project Structure

```
front/
├── public/
│   └── bluetooth-test.html      # Bluetooth testing page
├── src/
│   ├── api/                     # API services
│   │   ├── request.js           # Axios wrapper
│   │   ├── auth.js              # Authentication API
│   │   ├── sensor.js            # Sensor data API
│   │   └── recorder.js          # Track recorder API
│   ├── components/              # Shared components
│   │   ├── PrivateRoute.jsx     # Route guard
│   │   └── ui/                  # UI components
│   │       ├── menu-vertical.jsx
│   │       └── menu-vertical-demo.jsx
│   ├── hooks/                   # Custom hooks
│   │   └── useSensorDataAcquisition.js
│   ├── i18n/                    # Internationalization
│   │   └── index.js             # i18n configuration
│   ├── pages/                   # Page components
│   │   ├── Login/               # Login page
│   │   ├── Register/            # Register page
│   │   ├── Home/                # Home page
│   │   ├── Layout/              # Layout component
│   │   ├── BluetoothDevice/     # Bluetooth device page
│   │   ├── HealthDashboard/     # Health dashboard
│   │   ├── Statistics/          # Statistics page
│   │   └── WeatherForecast/     # Weather forecast
│   ├── router/                  # Route configuration
│   │   └── index.jsx
│   ├── styles/                  # Global styles
│   │   └── global.css           # Theme variables
│   ├── utils/                   # Utility functions
│   │   ├── token.js             # Token management
│   │   ├── constants.js         # Constants
│   │   ├── bluetooth.js         # Bluetooth manager
│   │   └── cn.js                # Class name utility
│   ├── App.jsx                  # Root component
│   └── main.jsx                 # Entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Visit http://localhost:5173

### 3. Build for Production

```bash
npm run build
```

## Features

### Implemented Features

1. **User Registration**
   - Username, password, email, phone, nickname
   - Form validation
   - Password confirmation

2. **User Login**
   - Username/password authentication
   - Token storage
   - Auto redirect

3. **Home Page**
   - Welcome message
   - Statistics cards
   - Quick start guide

4. **Bluetooth Device**
   - Web Bluetooth API integration
   - Device connection and auto-reconnect
   - Real-time sensor data acquisition
   - Sensor data recording
   - Historical data query with pagination
   - Device control (LED light)

5. **Health Dashboard**
   - Health score display
   - Data visualization
   - Charts and graphs

6. **Statistics**
   - Real-time heart rate chart
   - Temperature chart
   - Pressure chart
   - Data analysis

7. **Weather Forecast**
   - Weather information display
   - Pressure trend analysis

8. **Route Guard**
   - Auto redirect to login if not authenticated
   - Token validation

9. **Layout System**
   - Top navigation bar
   - Sidebar menu
   - User info display
   - Logout functionality

10. **Internationalization**
    - Chinese/English language switching
    - Persistent language preference

11. **Theme System**
    - Brown/Beige color scheme
    - Light mode
    - Dark mode support
    - CSS variable system

## Page Routes

- `/login` - Login page
- `/register` - Register page
- `/home` - Home page (requires auth)
- `/bluetooth` - Bluetooth device (requires auth)
- `/health` - Health dashboard (requires auth)
- `/statistics` - Statistics (requires auth)
- `/weather` - Weather forecast (requires auth)
- `/menu-demo` - Menu component demo (requires auth)

## API Configuration

API requests are proxied to backend server via Vite:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

## Authentication Flow

1. User logs in successfully, token and user info stored in localStorage
2. Token automatically added to request headers
3. Token expiration or invalid token triggers auto logout and redirect
4. Route guard protects authenticated pages

## Bluetooth Features

### Web Bluetooth API
- Device scanning and pairing
- Auto-reconnect (up to 3 attempts)
- Real-time data streaming

### Supported Sensors
- Heart Rate Monitor (HRM)
- Accelerometer (3-axis)
- Barometer (Temperature, Pressure, Altitude)

### Data Management
- Automatic data saving every 5 seconds
- Historical data query with pagination
- Data export functionality
- Clear all records

## Theme Customization

### Color Scheme
- Primary: `#644a40` (Dark Brown)
- Secondary: `#ffdfb5` (Beige)
- Background: `#f9f9f9`

### Customization
Edit `src/styles/global.css` to customize theme colors.

## Styling

- Ant Design component library
- Tailwind CSS utility classes
- Custom CSS styles
- Responsive layout
- Gradient backgrounds

## Browser Compatibility

### Web Bluetooth API Support
- Chrome 56+
- Edge 79+
- Opera 43+

**Note:** HTTPS is required for Web Bluetooth API.

## Important Notes

1. Ensure backend service is running (http://localhost:8080)
2. Token stored in localStorage persists after browser close
3. Configure correct API address for production
4. Use HTTPS in production for Web Bluetooth API
5. Bluetooth features require supported browser

## Development

### Hot Module Replacement
Vite provides fast HMR for instant feedback during development.

### Code Structure
- Follow React best practices
- Use functional components and hooks
- Implement proper error handling
- Add loading states for async operations

## Documentation

- [Theme Update Guide](THEME_UPDATE.md)
- [MenuVertical Component Integration](MENU_VERTICAL_INTEGRATION.md)
