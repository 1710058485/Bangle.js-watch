import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/token'

/**
 * 路由守卫组件
 * 用于保护需要登录才能访问的路由
 */
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default PrivateRoute
