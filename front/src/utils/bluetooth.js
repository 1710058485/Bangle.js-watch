/**
 * Web Bluetooth API 工具类
 * 用于连接和管理蓝牙设备（如智能手表）
 */

class BluetoothManager {
  constructor() {
    this.device = null
    this.server = null
    this.characteristics = new Map()
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 3
    this.listeners = new Map()
    this.autoReconnect = false // 默认禁用自动重连
    this.isManualDisconnect = false // 标记是否为主动断开
  }

  /**
   * 检查浏览器是否支持 Web Bluetooth API
   */
  static isSupported() {
    return 'bluetooth' in navigator
  }

  /**
   * 请求连接蓝牙设备
   * @param {Object} options - 连接选项
   * @param {Array} options.filters - 设备过滤器
   * @param {Array} options.optionalServices - 可选服务列表
   */
  async requestDevice(options = {}) {
    if (!BluetoothManager.isSupported()) {
      throw new Error('当前浏览器不支持 Web Bluetooth API')
    }

    try {
      const defaultOptions = {
        filters: [
          { namePrefix: 'Bangle' },
        ],
        optionalServices: [
          // 标准服务
          'battery_service',
          'heart_rate',
          'device_information',
          '0000180a-0000-1000-8000-00805f9b34fb', // Device Information
          '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
          '0000180d-0000-1000-8000-00805f9b34fb', // Heart Rate
          // Nordic UART Service (Bangle.js 使用)
          '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service
          // Espruino/Bangle.js 可能使用的其他服务
          '0000fee0-0000-1000-8000-00805f9b34fb', // Espruino Service
          '0000feaa-0000-1000-8000-00805f9b34fb', // Eddystone Configuration Service
        ],
      }

      const requestOptions = { ...defaultOptions, ...options }
      
      this.device = await navigator.bluetooth.requestDevice(requestOptions)
      
      // 监听设备断开事件
      this.device.addEventListener('gattserverdisconnected', () => {
        this.handleDisconnect()
      })

      return this.device
    } catch (error) {
      console.error('请求设备失败:', error)
      throw error
    }
  }

  /**
   * 连接到 GATT 服务器
   */
  async connect() {
    if (!this.device) {
      throw new Error('请先请求设备')
    }

    try {
      console.log('正在连接到设备:', this.device.name)
      this.server = await this.device.gatt.connect()
      this.isConnected = true
      this.reconnectAttempts = 0
      console.log('设备连接成功')
      
      this.emit('connected', this.device)
      return this.server
    } catch (error) {
      console.error('连接失败:', error)
      this.isConnected = false
      throw error
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.isManualDisconnect = true // 标记为主动断开
      this.device.gatt.disconnect()
      this.isConnected = false
      console.log('设备已断开连接')
    }
  }

  /**
   * 处理设备断开事件
   */
  handleDisconnect() {
    this.isConnected = false
    console.log('设备已断开连接')
    this.emit('disconnected')

    // 如果是主动断开，不尝试重连
    if (this.isManualDisconnect) {
      this.isManualDisconnect = false
      this.reconnectAttempts = 0
      console.log('主动断开连接，不会自动重连')
      return
    }

    // 只有启用自动重连时才尝试重连
    if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`尝试自动重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => this.connect(), 2000)
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('已达到最大重连次数，停止重连')
      this.reconnectAttempts = 0
    }
  }

  /**
   * 获取服务
   * @param {string} serviceUuid - 服务 UUID
   */
  async getService(serviceUuid) {
    if (!this.server) {
      throw new Error('请先连接设备')
    }

    try {
      return await this.server.getPrimaryService(serviceUuid)
    } catch (error) {
      throw error
    }
  }

  /**
   * 获取特征值
   * @param {string} serviceUuid - 服务 UUID
   * @param {string} characteristicUuid - 特征值 UUID
   */
  async getCharacteristic(serviceUuid, characteristicUuid) {
    const cacheKey = `${serviceUuid}-${characteristicUuid}`

    if (this.characteristics.has(cacheKey)) {
      return this.characteristics.get(cacheKey)
    }

    try {
      const service = await this.getService(serviceUuid)
      const characteristic = await service.getCharacteristic(characteristicUuid)
      this.characteristics.set(cacheKey, characteristic)
      return characteristic
    } catch (error) {
      throw error
    }
  }

  /**
   * 读取特征值
   * @param {string} serviceUuid - 服务 UUID
   * @param {string} characteristicUuid - 特征值 UUID
   */
  async readValue(serviceUuid, characteristicUuid) {
    try {
      const characteristic = await this.getCharacteristic(serviceUuid, characteristicUuid)
      const value = await characteristic.readValue()
      return value
    } catch (error) {
      throw error
    }
  }

  /**
   * 写入特征值
   * @param {string} serviceUuid - 服务 UUID
   * @param {string} characteristicUuid - 特征值 UUID
   * @param {ArrayBuffer|TypedArray} value - 要写入的值
   */
  async writeValue(serviceUuid, characteristicUuid, value) {
    try {
      const characteristic = await this.getCharacteristic(serviceUuid, characteristicUuid)
      await characteristic.writeValue(value)
      console.log('数据写入成功')
    } catch (error) {
      console.error('写入数据失败:', error)
      throw error
    }
  }

  /**
   * 订阅特征值通知
   * @param {string} serviceUuid - 服务 UUID
   * @param {string} characteristicUuid - 特征值 UUID
   * @param {Function} callback - 回调函数
   */
  async startNotifications(serviceUuid, characteristicUuid, callback) {
    try {
      // 先检查是否支持该服务
      const hasService = await this.hasService(serviceUuid)
      if (!hasService) {
        console.log(`设备不支持服务: ${serviceUuid}`)
        throw new Error(`Service not supported: ${serviceUuid}`)
      }

      const key = `${serviceUuid}-${characteristicUuid}`

      // 如果已经有监听器，先移除旧的
      const existingListener = this.listeners.get(key)
      if (existingListener) {
        console.log('移除旧的监听器')
        const { characteristic: oldChar, listener: oldListener } = existingListener
        try {
          oldChar.removeEventListener('characteristicvaluechanged', oldListener)
        } catch (e) {
          console.log('移除旧监听器失败:', e)
        }
      }

      const characteristic = await this.getCharacteristic(serviceUuid, characteristicUuid)

      // 只有在未启动通知时才启动
      if (!characteristic.properties.notify || !existingListener) {
        await characteristic.startNotifications()
      }

      const listener = (event) => {
        const value = event.target.value
        callback(value)
      }

      characteristic.addEventListener('characteristicvaluechanged', listener)

      // 保存监听器以便后续移除
      this.listeners.set(key, { characteristic, listener })

      console.log('开始监听通知')
    } catch (error) {
      console.log('订阅通知失败')
      throw error
    }
  }

  /**
   * 停止订阅特征值通知
   * @param {string} serviceUuid - 服务 UUID
   * @param {string} characteristicUuid - 特征值 UUID
   */
  async stopNotifications(serviceUuid, characteristicUuid) {
    const key = `${serviceUuid}-${characteristicUuid}`
    const listenerData = this.listeners.get(key)
    
    if (listenerData) {
      const { characteristic, listener } = listenerData
      characteristic.removeEventListener('characteristicvaluechanged', listener)
      await characteristic.stopNotifications()
      this.listeners.delete(key)
      console.log('停止监听通知')
    }
  }

  /**
   * 检查设备是否支持指定服务
   * @param {string} serviceUuid - 服务 UUID
   */
  async hasService(serviceUuid) {
    if (!this.server) {
      return false
    }

    try {
      await this.server.getPrimaryService(serviceUuid)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 获取设备支持的所有服务
   */
  async getSupportedServices() {
    if (!this.device) {
      return []
    }

    const commonServices = [
      { uuid: 'battery_service', name: '电池服务' },
      { uuid: 'device_information', name: '设备信息' },
      { uuid: 'heart_rate', name: '心率服务' },
      { uuid: '0000180a-0000-1000-8000-00805f9b34fb', name: '设备信息(UUID)' },
      { uuid: '0000180f-0000-1000-8000-00805f9b34fb', name: '电池服务(UUID)' },
      { uuid: '0000180d-0000-1000-8000-00805f9b34fb', name: '心率服务(UUID)' },
    ]

    const supported = []
    for (const service of commonServices) {
      if (await this.hasService(service.uuid)) {
        supported.push(service)
      }
    }

    return supported
  }

  /**
   * 扫描设备的所有实际服务（用于调试）
   * 这会返回设备实际支持的所有服务，而不仅仅是常见服务
   */
  async scanAllServices() {
    if (!this.server) {
      throw new Error('请先连接设备')
    }

    try {
      const services = await this.server.getPrimaryServices()
      const serviceList = []

      for (const service of services) {
        const serviceInfo = {
          uuid: service.uuid,
          isPrimary: service.isPrimary,
          characteristics: []
        }

        try {
          // 获取该服务的所有特征值
          const characteristics = await service.getCharacteristics()
          for (const char of characteristics) {
            const charInfo = {
              uuid: char.uuid,
              properties: char.properties
            }
            serviceInfo.characteristics.push(charInfo)
          }
        } catch (error) {
          console.log('无法获取服务特征值:', error)
        }

        serviceList.push(serviceInfo)
      }

      return serviceList
    } catch (error) {
      console.error('扫描服务失败:', error)
      throw error
    }
  }

  /**
   * 获取电池电量
   */
  async getBatteryLevel() {
    try {
      // 先尝试标准的电池服务
      const hasBatteryService = await this.hasService('battery_service')
      if (hasBatteryService) {
        console.log('使用标准电池服务')
        const value = await this.readValue('battery_service', 'battery_level')
        return value.getUint8(0)
      }

      // 如果不支持标准服务，尝试通过 Nordic UART 获取（Bangle.js）
      console.log('尝试通过 Nordic UART 获取电池电量')
      const battery = await this.getBangleBattery()
      return battery
    } catch (error) {
      console.log('获取电池电量失败')
      return null
    }
  }

  /**
   * 通过 Nordic UART Service 发送命令（用于 Bangle.js）
   */
  async sendUARTCommand(command) {
    const serviceUuid = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
    const txCharUuid = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'

    const characteristic = await this.getCharacteristic(serviceUuid, txCharUuid)
    const encoder = new TextEncoder()
    const data = encoder.encode(command + '\n')

    // BLE MTU 通常为 20 字节，分块发送以支持长命令
    const CHUNK_SIZE = 20
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE)
      if (characteristic.properties.writeWithoutResponse) {
        await characteristic.writeValueWithoutResponse(chunk)
      } else {
        await characteristic.writeValue(chunk)
      }
    }
  }

  /**
   * 监听 Nordic UART 响应（用于 Bangle.js）
   */
  async listenUARTResponse(callback) {
    const serviceUuid = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
    const rxCharUuid = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'

    await this.startNotifications(serviceUuid, rxCharUuid, (value) => {
      const decoder = new TextDecoder()
      const response = decoder.decode(value)
      callback(response)
    })
  }

  /**
   * 获取 Bangle.js 电池电量
   */
  async getBangleBattery() {
    return new Promise(async (resolve, reject) => {
      let responseBuffer = ''
      let timeoutId

      try {
        // 检查是否支持 Nordic UART Service
        const hasUART = await this.hasService('6e400001-b5a3-f393-e0a9-e50e24dcca9e')
        if (!hasUART) {
          reject(new Error('设备不支持 Nordic UART Service'))
          return
        }

        // 监听响应
        await this.listenUARTResponse((response) => {
          responseBuffer += response

          // 检查是否收到完整响应（数字后跟换行符）
          const match = responseBuffer.match(/(\d+\.?\d*)\s*\n/)
          if (match) {
            clearTimeout(timeoutId)
            const battery = parseFloat(match[1])
            if (!isNaN(battery)) {
              resolve(Math.round(battery))
            } else {
              reject(new Error('无法解析电池数据'))
            }
          }
        })

        // 发送命令
        await this.sendUARTCommand('E.getBattery()')

        // 超时处理
        timeoutId = setTimeout(() => {
          reject(new Error('获取电池超时'))
        }, 5000)
      } catch (error) {
        clearTimeout(timeoutId)
        reject(error)
      }
    })
  }

  /**
   * 获取设备信息
   */
  async getDeviceInfo() {
    const info = {
      name: this.device?.name || 'Unknown',
      id: this.device?.id || 'Unknown',
    }

    // 先检查是否支持设备信息服务
    const hasDeviceInfo = await this.hasService('device_information')
    if (!hasDeviceInfo) {
      console.log('设备不支持设备信息服务')
      return info
    }

    try {
      // 尝试获取制造商名称
      const manufacturerValue = await this.readValue(
        'device_information',
        'manufacturer_name_string'
      )
      info.manufacturer = new TextDecoder().decode(manufacturerValue)
    } catch (error) {
      // 静默失败，不打印错误
    }

    try {
      // 尝试获取型号
      const modelValue = await this.readValue('device_information', 'model_number_string')
      info.model = new TextDecoder().decode(modelValue)
    } catch (error) {
      // 静默失败，不打印错误
    }

    return info
  }

  /**
   * 事件监听
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }

    const callbacks = this.listeners.get(event)

    // 避免重复添加相同的回调
    if (!callbacks.includes(callback)) {
      callbacks.push(callback)
    }
  }

  /**
   * 移除事件监听
   */
  off(event, callback) {
    if (!this.listeners.has(event)) {
      return
    }

    if (callback) {
      // 移除特定的回调
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    } else {
      // 移除该事件的所有回调
      this.listeners.delete(event)
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      device: this.device
        ? {
            name: this.device.name,
            id: this.device.id,
          }
        : null,
    }
  }

  /**
   * 启用自动重连
   * @param {boolean} enabled - 是否启用
   * @param {number} maxAttempts - 最大重连次数（可选）
   */
  setAutoReconnect(enabled, maxAttempts = 3) {
    this.autoReconnect = enabled
    this.maxReconnectAttempts = maxAttempts
    console.log(`自动重连已${enabled ? '启用' : '禁用'}，最大重连次数: ${maxAttempts}`)
  }

  /**
   * 重置重连计数器
   */
  resetReconnectAttempts() {
    this.reconnectAttempts = 0
  }
}

// 创建单例实例
const bluetoothManager = new BluetoothManager()

export default bluetoothManager
export { BluetoothManager }
