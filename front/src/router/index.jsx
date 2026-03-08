import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import MainLayout from '../pages/Layout'
import Home from '../pages/Home'
import BluetoothDevice from '../pages/BluetoothDevice'
import Statistics from '../pages/Statistics'
import HealthDashboard from '../pages/HealthDashboard'
import WeatherForecast from '../pages/WeatherForecast'
import MenuVerticalDemo from '../components/ui/menu-vertical-demo'
import PrivateRoute from '../components/PrivateRoute'

const AppRouter = () => {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 受保护的路由 */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="health" element={<HealthDashboard />} />
        <Route path="bluetooth" element={<BluetoothDevice />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="weather" element={<WeatherForecast />} />
        <Route path="menu-demo" element={<MenuVerticalDemo />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default AppRouter
