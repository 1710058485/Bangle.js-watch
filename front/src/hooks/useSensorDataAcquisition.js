import { useState, useRef } from 'react'
import { message } from 'antd'
import bluetoothManager from '../utils/bluetooth'
import { saveSensorRecord } from '../api/sensor'

/**
 * 传感器数据采集自定义 Hook
 * @param {Object} options - 配置选项
 * @param {Function} options.onPressureData - 气压数据回调
 * @param {Function} options.onHrmData - 心率数据回调
 * @param {Function} options.onAccelData - 加速度数据回调
 * @param {Function} options.t - i18n 翻译函数
 * @returns {Object} 返回状态和方法
 */
export const useSensorDataAcquisition = (options = {}) => {
  const { onPressureData, onHrmData, onAccelData, t } = options

  const [dataEnabled, setDataEnabled] = useState(false)
  const [isStartingData, setIsStartingData] = useState(false)

  // 用 ref 保存最新传感器值，避免闭包捕获旧值
  const hrmRef = useRef(null)
  const accelRef = useRef(null)
  const pressureRef = useRef(null)

  const startDataAcquisition = async () => {
    setIsStartingData(true)
    try {
      // 统一监听 UART 响应，根据字段分发数据
      await bluetoothManager.listenUARTResponse((response) => {
        try {
          const jsonMatch = response.match(/\{[^}]+\}/)
          if (!jsonMatch) return
          const info = JSON.parse(jsonMatch[0])

          if (info.pressure !== undefined) {
            pressureRef.current = info
            bluetoothManager.emit('barometerData', info)
            onPressureData?.(info)
          } else if (info.bpm !== undefined) {
            hrmRef.current = info
            bluetoothManager.emit('hrmData', info)
            onHrmData?.(info)
          } else if (info.x !== undefined) {
            accelRef.current = info
            bluetoothManager.emit('accelData', info)
            onAccelData?.(info)
          }
        } catch (e) {
          console.error('[传感器] 解析 UART 响应失败:', e, '原始数据:', response)
        }
      })

      // 每 5 秒将当前传感器快照存入数据库
      window._sensorSaveInterval = setInterval(async () => {
        const payload = {
          bpm: hrmRef.current?.bpm ?? null,
          accel_x: accelRef.current?.x ?? null,
          accel_y: accelRef.current?.y ?? null,
          accel_z: accelRef.current?.z ?? null,
          pressure: pressureRef.current?.pressure ?? null,
          pressure_temp: pressureRef.current?.temperature ?? null,
          pressure_alt: pressureRef.current?.altitude ?? null,
        }
        console.log('[传感器] 定时存库，数据快照:', payload)
        try {
          const res = await saveSensorRecord(payload)
          console.log('[传感器] 存库成功，id:', res.data?.id)
        } catch (err) {
          console.error('[传感器] 存库失败:', err)
        }
      }, 5000)

      // 开启传感器并注册事件
      await bluetoothManager.sendUARTCommand('Bangle.setBarometerPower(true)')
      await bluetoothManager.sendUARTCommand(
        `Bangle.on('pressure',function(d){print(JSON.stringify({temperature:d.temperature,pressure:d.pressure,altitude:d.altitude}));})`
      )
      await bluetoothManager.sendUARTCommand('Bangle.setHRMPower(1)')
      await bluetoothManager.sendUARTCommand(
        `Bangle.on('HRM',function(h){print(JSON.stringify({bpm:h.bpm,confidence:h.confidence,src:h.src}));})`
      )
      await bluetoothManager.sendUARTCommand(
        `Bangle.on('accel',function(a){print(JSON.stringify({x:a.x.toFixed(2),y:a.y.toFixed(2),z:a.z.toFixed(2)}));})`
      )

      setDataEnabled(true)
      message.success(t?.('messages.dataAcquisitionStarted') || '数据获取已开启')
    } catch (error) {
      message.error((t?.('messages.dataAcquisitionFailed') || '数据获取失败') + ': ' + error.message)
      throw error
    } finally {
      setIsStartingData(false)
    }
  }

  const stopDataAcquisition = async () => {
    try {
      await bluetoothManager.sendUARTCommand('Bangle.setBarometerPower(false)')
    } catch (e) {}
    try {
      await bluetoothManager.sendUARTCommand('Bangle.setHRMPower(0)')
    } catch (e) {}
    try {
      await bluetoothManager.sendUARTCommand("Bangle.removeAllListeners('accel')")
    } catch (e) {}

    clearInterval(window._sensorSaveInterval)
    hrmRef.current = null
    accelRef.current = null
    pressureRef.current = null
    setDataEnabled(false)
    message.success(t?.('messages.dataAcquisitionStopped') || '数据获取已关闭')
  }

  const toggleDataAcquisition = async () => {
    if (dataEnabled) {
      await stopDataAcquisition()
    } else {
      await startDataAcquisition()
    }
  }

  return {
    dataEnabled,
    isStartingData,
    hrmRef,
    accelRef,
    pressureRef,
    startDataAcquisition,
    stopDataAcquisition,
    toggleDataAcquisition,
  }
}

