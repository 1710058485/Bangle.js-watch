import { useState, useRef, useEffect } from 'react'
import { message } from 'antd'
import { Mail, Eye, EyeOff, ArrowRight, Loader, Watch } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../../api/auth'
import { setToken, setUserInfo } from '../../utils/token'
import { cn } from '../../utils/cn'
import './index.css'

// 渐变背景组件
const GradientBackground = () => (
  <>
    <style>
      {`
        @keyframes float1 {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-10px, 10px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes float2 {
          0% { transform: translate(0, 0); }
          50% { transform: translate(10px, -10px); }
          100% { transform: translate(0, 0); }
        }
      `}
    </style>
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className="absolute top-0 left-0 w-full h-full"
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.6 }} />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 0.9 }} />
          <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.6 }} />
        </linearGradient>
        <radialGradient id="grad3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.4 }} />
        </radialGradient>
        <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="35" />
        </filter>
        <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="25" />
        </filter>
        <filter id="blur3" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="45" />
        </filter>
      </defs>
      <g style={{ animation: 'float1 20s ease-in-out infinite' }}>
        <ellipse
          cx="200"
          cy="500"
          rx="250"
          ry="180"
          fill="url(#grad1)"
          filter="url(#blur1)"
          transform="rotate(-30 200 500)"
        />
        <rect
          x="500"
          y="100"
          width="300"
          height="250"
          rx="80"
          fill="url(#grad2)"
          filter="url(#blur2)"
          transform="rotate(15 650 225)"
        />
      </g>
      <g style={{ animation: 'float2 25s ease-in-out infinite' }}>
        <circle cx="650" cy="450" r="150" fill="url(#grad3)" filter="url(#blur3)" opacity="0.7" />
        <ellipse
          cx="50"
          cy="150"
          rx="180"
          ry="120"
          fill="#3b82f6"
          filter="url(#blur2)"
          opacity="0.8"
        />
      </g>
    </svg>
  </>
)

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authStep, setAuthStep] = useState('email')
  const navigate = useNavigate()
  const passwordInputRef = useRef(null)

  const isEmailValid = /\S+@\S+\.\S+/.test(email) || email.length >= 3
  const isPasswordValid = password.length >= 6

  useEffect(() => {
    if (authStep === 'password') {
      setTimeout(() => passwordInputRef.current?.focus(), 300)
    }
  }, [authStep])

  const handleProgressStep = () => {
    if (authStep === 'email' && isEmailValid) {
      setAuthStep('password')
    }
  }

  const handleGoBack = () => {
    if (authStep === 'password') {
      setAuthStep('email')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && authStep === 'email' && isEmailValid) {
      e.preventDefault()
      handleProgressStep()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isPasswordValid) return

    setLoading(true)
    try {
      const response = await login({ username: email, password })
      const { token, userInfo } = response.data

      setToken(token)
      setUserInfo(userInfo)

      message.success('登录成功')
      navigate('/home')
    } catch (error) {
      message.error('登录失败，请检查用户名和密码')
      console.error('登录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Logo */}
      <div className="fixed top-4 left-4 z-20 flex items-center gap-2 md:left-1/2 md:-translate-x-1/2">
        <div className="bg-blue-500 text-white rounded-md p-1.5">
          <Watch className="h-4 w-4" />
        </div>
        <h1 className="text-base font-bold text-gray-900">手表数据管理系统</h1>
      </div>

      {/* Main Content */}
      <div className="flex w-full flex-1 h-full items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <GradientBackground />
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
          >
            <AnimatePresence mode="wait">
              {authStep === 'email' && (
                <motion.div
                  key="email-content"
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">欢迎回来</h2>
                    <p className="text-sm text-gray-600">请输入您的账号信息</p>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-gray-200 focus-within:border-blue-500 transition-all duration-300">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="用户名或邮箱"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
                      />
                      {isEmailValid && (
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          onClick={handleProgressStep}
                          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    还没有账号？
                    <Link to="/register" className="text-blue-500 hover:text-blue-600 ml-1 font-medium">
                      立即注册
                    </Link>
                  </div>
                </motion.div>
              )}

              {authStep === 'password' && (
                <motion.div
                  key="password-content"
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">输入密码</h2>
                    <p className="text-sm text-gray-600">密码至少6个字符</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <div className="flex items-center gap-3 px-4 py-3 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-gray-200 focus-within:border-blue-500 transition-all duration-300">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <input
                          ref={passwordInputRef}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="输入密码"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
                        />
                        {isPasswordValid && (
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            type="submit"
                            disabled={loading}
                            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            {loading ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <ArrowRight className="w-4 h-4" />
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      返回
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login
