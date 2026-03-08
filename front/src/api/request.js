import axios from 'axios'
import { message } from 'antd'
import { getToken, clearAuth } from '../utils/token'
import { API_BASE_URL, RESPONSE_CODE } from '../utils/constants'

// 创建axios实例
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加Token到请求头
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { code, message: msg, data } = response.data

    // 成功响应
    if (code === RESPONSE_CODE.SUCCESS) {
      return response.data
    }

    // Token相关错误，清除认证信息并跳转到登录页
    if (code === RESPONSE_CODE.UNAUTHORIZED ||
        code === RESPONSE_CODE.TOKEN_INVALID ||
        code === RESPONSE_CODE.TOKEN_EXPIRED) {
      message.error(msg || '登录已过期，请重新登录')
      clearAuth()
      window.location.href = '/login'
      return Promise.reject(new Error(msg))
    }

    // 其他错误
    message.error(msg || '请求失败')
    return Promise.reject(new Error(msg))
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误状态码
      const { status } = error.response
      if (status === 401) {
        message.error('未授权，请先登录')
        clearAuth()
        window.location.href = '/login'
      } else if (status === 403) {
        message.error('权限不足')
      } else if (status === 404) {
        message.error('请求的资源不存在')
      } else if (status === 500) {
        message.error('服务器错误')
      } else {
        message.error('请求失败')
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message.error('网络错误，请检查网络连接')
    } else {
      // 其他错误
      message.error(error.message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default request
