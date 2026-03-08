import { useState, useEffect } from 'react'
import { Card, Button, message, Descriptions, Space, Alert, Statistic, Row, Col, Switch, Result, Modal, Table, Popconfirm, Tag, Badge } from 'antd'
import {
  ApiOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  BulbFilled,
  PlayCircleOutlined,
  PauseCircleOutlined,
  LineChartOutlined,
  HeartOutlined,
  DatabaseOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import bluetoothManager from '../../utils/bluetooth'
import { getSensorRecords, clearSensorRecords } from '../../api/sensor'
import { useSensorDataAcquisition } from '../../hooks/useSensorDataAcquisition'
import './index.css'

const BluetoothDevice = () => {
  const { t } = useTranslation()
  const [isSupported, setIsSupported] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState(null)
  const [batteryLevel, setBatteryLevel] = useState(null)
  const [heartRate, setHeartRate] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState(t('bluetooth.notConnected'))
  const [autoReconnect, setAutoReconnect] = useState(false)

  const [ledStatus, setLedStatus] = useState(false)
  const [pressureData, setPressureData] = useState(null)
  const [hrmData, setHrmData] = useState(null)
  const [accelData, setAccelData] = useState(null)
  const [lastBarometerUpdate, setLastBarometerUpdate] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recentRecords, setRecentRecords] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(false)

  // 传感器数据记录
  const [showRecordsModal, setShowRecordsModal] = useState(false)
  const [sensorRecords, setSensorRecords] = useState([])
  const [sensorTotal, setSensorTotal] = useState(0)
  const [sensorPage, setSensorPage] = useState(1)
  const [sensorLoading, setSensorLoading] = useState(false)

  // 使用传感器数据采集 hook
  const {
    dataEnabled,
    isStartingData,
    hrmRef,
    accelRef,
    pressureRef,
    toggleDataAcquisition,
  } = useSensorDataAcquisition({
    onPressureData: (info) => {
      const now = Date.now()
      setLastBarometerUpdate(prev => {
        if (now - prev >= 10000) {
          setPressureData(info)
          return now
        }
        return prev
      })
    },
    onHrmData: (info) => {
      setHrmData(info)
    },
    onAccelData: (info) => {
      setAccelData(info)
    },
    t,
  })

  useEffect(() => {
    // 检查浏览器支持
    setIsSupported(bluetoothManager.constructor.isSupported())

    const initDeviceState = async () => {
      try {
        const info = await bluetoothManager.getDeviceInfo()
        setDeviceInfo(info)
      } catch (e) {}
      try {
        const battery = await bluetoothManager.getBatteryLevel()
        if (battery !== null) setBatteryLevel(battery)
      } catch (e) {}
      try {
        await bluetoothManager.startNotifications('heart_rate', 'heart_rate_measurement', (value) => {
          const rate = value.getUint8(1)
          setHeartRate(rate)
        })
      } catch (e) {}
    }

    // 定义事件处理函数
    const onConnected = async (device) => {
      setIsConnected(true)
      setConnectionStatus(t('bluetooth.connected'))
      message.success(t('messages.connectSuccess') + ': ' + device.name)
      await initDeviceState()
    }

    const onDisconnected = () => {
      setIsConnected(false)
      setConnectionStatus(t('bluetooth.disconnected'))
      setDeviceInfo(null)
      setBatteryLevel(null)
      setHeartRate(null)
      setSupportedServices([])
      setDataEnabled(false)
      setHrmData(null)
      setAccelData(null)
      setPressureData(null)
      message.warning(t('messages.deviceDisconnected'))
    }

    // 监听实时数据事件（从导航栏的数据获取功能广播）
    const onHrmData = (data) => {
      console.log('[BluetoothDevice] 收到心率数据:', data)
      console.log('[BluetoothDevice] 当前 hrmData 状态:', hrmData)
      setHrmData(data)
      console.log('[BluetoothDevice] 已调用 setHrmData')
    }

    const onAccelData = (data) => {
      console.log('[BluetoothDevice] 收到加速度数据:', data)
      setAccelData(data)
    }

    const onBarometerData = (data) => {
      console.log('[BluetoothDevice] 收到气压数据:', data)
      setPressureData(data)
    }

    // 监听连接事件
    bluetoothManager.on('connected', onConnected)
    bluetoothManager.on('disconnected', onDisconnected)
    bluetoothManager.on('hrmData', onHrmData)
    bluetoothManager.on('accelData', onAccelData)
    bluetoothManager.on('barometerData', onBarometerData)

    // 如果已经连接（从其他页面切换过来），恢复状态
    if (bluetoothManager.isConnected) {
      setIsConnected(true)
      setConnectionStatus(t('bluetooth.connected'))
      initDeviceState()
    }

    // 请求当前的传感器数据状态（如果数据获取已经在其他页面开启）
    // 通过触发一个特殊事件来请求 Layout 重新广播当前数据
    setTimeout(() => {
      bluetoothManager.emit('requestCurrentData')
    }, 100)

    // 加载最近的传感器记录
    loadRecentRecords()

    return () => {
      // 仅移除事件监听，不断开连接（连接由导航栏全局管理）
      bluetoothManager.off('connected', onConnected)
      bluetoothManager.off('disconnected', onDisconnected)
      bluetoothManager.off('hrmData', onHrmData)
      bluetoothManager.off('accelData', onAccelData)
      bluetoothManager.off('barometerData', onBarometerData)
    }
  }, [])

  // 监听语言变化，更新连接状态文本
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus(t('bluetooth.connected'))
    } else {
      setConnectionStatus(t('bluetooth.notConnected'))
    }
  }, [t, isConnected])

  const handleRefreshBattery = async () => {
    try {
      const battery = await bluetoothManager.getBatteryLevel()
      setBatteryLevel(battery)
      message.success(t('messages.batteryUpdated'))
    } catch (error) {
      message.error(t('messages.batteryFailed'))
    }
  }

  const handleAutoReconnectChange = (checked) => {
    setAutoReconnect(checked)
    bluetoothManager.setAutoReconnect(checked, 3)
    message.info(checked ? t('messages.autoReconnectEnabled') : t('messages.autoReconnectDisabled'))
  }

  const handleLedToggle = async () => {
    try {
      const newStatus = !ledStatus
      const command = newStatus ? 'LED1.set()' : 'LED1.reset()'

      await bluetoothManager.sendUARTCommand(command)
      setLedStatus(newStatus)
      message.success(newStatus ? t('messages.lightOn') : t('messages.lightOff'))
    } catch (error) {
      message.error(t('messages.lightFailed') + ': ' + error.message)
      console.error('LED 控制失败:', error)
    }
  }

  const loadRecentRecords = async () => {
    setLoadingRecent(true)
    try {
      const res = await getSensorRecords(1, 5)
      if (res.code === 200) {
        setRecentRecords(res.data.list || [])
      }
    } catch (e) {
      console.error('加载最近记录失败:', e)
    } finally {
      setLoadingRecent(false)
    }
  }

  const handleStartRecording = async () => {
    try {
      message.loading(t('messages.startingRecording'), 0)

      await bluetoothManager.sendUARTCommand(
        `require("recorder").setRecording(true, {force:"new"})`
      )

      message.destroy()
      setIsRecording(true)
      message.success(t('messages.recordingStarted'))
    } catch (error) {
      message.destroy()
      message.error(t('messages.recordingStartFailed') + ': ' + error.message)
      console.error('启动记录失败:', error)
    }
  }

  const handleStopRecording = async () => {
    try {
      message.loading(t('messages.stoppingRecording'), 0)

      await bluetoothManager.sendUARTCommand('require("recorder").setRecording(false)')

      message.destroy()
      setIsRecording(false)
      message.success(t('messages.recordingStopped'))
    } catch (error) {
      message.destroy()
      message.error(t('messages.recordingStopFailed') + ': ' + error.message)
      console.error('停止记录失败:', error)
    }
  }

  const handleViewSensorRecords = async (page = 1) => {
    setSensorLoading(true)
    setShowRecordsModal(true)
    try {
      const res = await getSensorRecords(page, 20)
      if (res.code === 200) {
        setSensorRecords(res.data.list)
        setSensorTotal(res.data.total)
        setSensorPage(page)
      }
    } catch (e) {
      message.error(t('messages.fetchFailed'))
    } finally {
      setSensorLoading(false)
    }
  }

  const handleClearSensorRecords = async () => {
    try {
      await clearSensorRecords()
      message.success(t('messages.dataCleared'))
      setSensorRecords([])
      setSensorTotal(0)
    } catch (e) {
      message.error(t('messages.clearFailed'))
    }
  }

  if (!isSupported) {
    return (
      <div className="bluetooth-device-page">
        <Alert
          message={t('bluetooth.browserNotSupported')}
          description={
            <div>
              <p>{t('bluetooth.browserNotSupportedDesc')}</p>
              <p>{t('bluetooth.supportedBrowsers')}</p>
              <ul>
                <li>Chrome 56+</li>
                <li>Edge 79+</li>
                <li>Opera 43+</li>
              </ul>
              <p>{t('bluetooth.httpsRequired')}</p>
            </div>
          }
          type="error"
          showIcon
        />
      </div>
    )
  }

  return (
    <div className="bluetooth-device-page">
      <Card
        title={
          <Space>
            <ApiOutlined />
            {t('bluetooth.title')}
          </Space>
        }
        extra={
          <Badge status={isConnected ? 'success' : 'default'} text={connectionStatus} />
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 未连接时的提示 */}
          {!isConnected && (
            <Result
              icon={<ApiOutlined style={{ color: '#d9d9d9' }} />}
              title={t('bluetooth.notConnectedTitle')}
              subTitle={
                <Space direction="vertical" size={4}>
                  <span>{t('bluetooth.connectTip')}</span>
                  <span style={{ color: '#bfbfbf', fontSize: 12 }}>{t('bluetooth.connectSuccess')}</span>
                </Space>
              }
              extra={
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space>
                    <span style={{ color: '#999', fontSize: 13 }}>{t('bluetooth.autoReconnect')}:</span>
                    <Switch
                      checked={autoReconnect}
                      onChange={handleAutoReconnectChange}
                      checkedChildren={t('bluetooth.on')}
                      unCheckedChildren={t('bluetooth.off')}
                      size="small"
                    />
                    <span style={{ color: '#bfbfbf', fontSize: 12 }}>{t('bluetooth.autoReconnectTip')}</span>
                  </Space>
                </Space>
              }
            />
          )}

          {/* 已连接时的设置条 */}
          {isConnected && (
            <Card size="small">
              <Space>
                <span style={{ color: '#999', fontSize: 13 }}>{t('bluetooth.autoReconnect')}:</span>
                <Switch
                  checked={autoReconnect}
                  onChange={handleAutoReconnectChange}
                  checkedChildren={t('bluetooth.on')}
                  unCheckedChildren={t('bluetooth.off')}
                  size="small"
                />
                <span style={{ color: '#bfbfbf', fontSize: 12 }}>{t('bluetooth.autoReconnectTip')}</span>
              </Space>
            </Card>
          )}

          {/* 设备信息 */}
          {isConnected && deviceInfo && (
            <Card
              title={
                <Space>
                  <InfoCircleOutlined />
                  {t('bluetooth.deviceInfo')}
                </Space>
              }
              size="small"
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t('bluetooth.deviceName')}>{deviceInfo.name}</Descriptions.Item>
                <Descriptions.Item label={t('bluetooth.deviceId')}>{deviceInfo.id}</Descriptions.Item>
                {deviceInfo.manufacturer && (
                  <Descriptions.Item label="Manufacturer">{deviceInfo.manufacturer}</Descriptions.Item>
                )}
                {deviceInfo.model && (
                  <Descriptions.Item label="Model">{deviceInfo.model}</Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}

          {/* 实时数据 */}
          {isConnected && (
            <Card title={t('bluetooth.realTimeData')} size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title={t('bluetooth.batteryLevel')}
                      value={batteryLevel !== null ? batteryLevel : '--'}
                      suffix="%"
                      prefix={<ThunderboltOutlined />}
                    />
                    <Button
                      type="link"
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={handleRefreshBattery}
                      style={{ marginTop: 8 }}
                    >
                      {t('weather.refresh')}
                    </Button>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title={t('bluetooth.heartRate')}
                      value={hrmData ? hrmData.bpm : (heartRate !== null ? heartRate : '--')}
                      suffix="bpm"
                      valueStyle={{ color: '#cf1322' }}
                      prefix={<HeartOutlined />}
                    />
                    {hrmData && (
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {t('bluetooth.confidence')}: {hrmData.confidence}% · {hrmData.src || '--'}
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Card>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{t('bluetooth.acceleration')} (g)</div>
                    <Row gutter={8}>
                      <Col span={8}><Statistic title="X" value={accelData ? accelData.x : '--'} valueStyle={{ fontSize: 16, color: '#13c2c2' }} /></Col>
                      <Col span={8}><Statistic title="Y" value={accelData ? accelData.y : '--'} valueStyle={{ fontSize: 16, color: '#13c2c2' }} /></Col>
                      <Col span={8}><Statistic title="Z" value={accelData ? accelData.z : '--'} valueStyle={{ fontSize: 16, color: '#13c2c2' }} /></Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Card>
          )}

          {/* 气压计数据 */}
          {isConnected && dataEnabled && pressureData && (
            <Card
              title={
                <Space>
                  <ThunderboltOutlined />
                  {t('statistics.barometerData')}
                </Space>
              }
              size="small"
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title={t('bluetooth.temperature')}
                      value={pressureData.temperature ? pressureData.temperature.toFixed(2) : '--'}
                      suffix="°C"
                      valueStyle={{ color: '#644a40' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title={t('bluetooth.pressure')}
                      value={pressureData.pressure ? pressureData.pressure.toFixed(2) : '--'}
                      suffix="hPa"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title={t('bluetooth.altitude')}
                      value={pressureData.altitude ? pressureData.altitude.toFixed(1) : '--'}
                      suffix="m"
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
              </Row>
            </Card>
          )}

          {/* 设备控制 */}
          {isConnected && (
            <Card title={t('bluetooth.deviceControl')} size="small">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* 手表灯控制 */}
                <Card size="small" style={{ background: '#fafafa' }}>
                  <Row align="middle" justify="space-between">
                    <Col>
                      <Space>
                        {ledStatus ? <BulbFilled style={{ fontSize: 24, color: '#faad14' }} /> : <BulbOutlined style={{ fontSize: 24 }} />}
                        <div>
                          <div style={{ fontWeight: 500 }}>{t('bluetooth.watchLight')}</div>
                          <div style={{ fontSize: 12, color: '#999' }}>{ledStatus ? t('bluetooth.on') : t('bluetooth.off')}</div>
                        </div>
                      </Space>
                    </Col>
                    <Col>
                      <Button
                        type={ledStatus ? 'default' : 'primary'}
                        size="large"
                        onClick={handleLedToggle}
                        icon={ledStatus ? <BulbFilled /> : <BulbOutlined />}
                      >
                        {ledStatus ? t('bluetooth.turnOff') : t('bluetooth.turnOn')}
                      </Button>
                    </Col>
                  </Row>
                </Card>

                {/* 历史手表记录数据 */}
                <Card
                  size="small"
                  title={
                    <Space>
                      <DatabaseOutlined />
                      <span>{t('bluetooth.recentRecords')}</span>
                    </Space>
                  }
                  extra={
                    <Button
                      type="text"
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={loadRecentRecords}
                      loading={loadingRecent}
                    >
                      {t('weather.refresh')}
                    </Button>
                  }
                  style={{ background: '#fafafa' }}
                >
                  {loadingRecent ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      {t('statistics.waitingForData')}
                    </div>
                  ) : recentRecords.length > 0 ? (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {recentRecords.map((record, index) => (
                        <Card key={record.id} size="small" style={{ background: '#fff' }}>
                          <Row gutter={8}>
                            <Col span={24} style={{ marginBottom: 4, fontSize: 12, color: '#999' }}>
                              {record.created_at ? new Date(record.created_at).toLocaleString('zh-CN') : '--'}
                            </Col>
                            <Col span={8}>
                              <div style={{ fontSize: 12, color: '#666' }}>{t('bluetooth.heartRate')}</div>
                              <div style={{ fontSize: 16, fontWeight: 500, color: '#cf1322' }}>
                                {record.bpm != null ? `${record.bpm} bpm` : '--'}
                              </div>
                            </Col>
                            <Col span={8}>
                              <div style={{ fontSize: 12, color: '#666' }}>{t('bluetooth.temperature')}</div>
                              <div style={{ fontSize: 16, fontWeight: 500, color: '#644a40' }}>
                                {record.pressure_temp != null ? `${Number(record.pressure_temp).toFixed(1)}°C` : '--'}
                              </div>
                            </Col>
                            <Col span={8}>
                              <div style={{ fontSize: 12, color: '#666' }}>{t('bluetooth.pressure')}</div>
                              <div style={{ fontSize: 16, fontWeight: 500, color: '#52c41a' }}>
                                {record.pressure != null ? `${Number(record.pressure).toFixed(0)} hPa` : '--'}
                              </div>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Button
                        type="dashed"
                        icon={<DatabaseOutlined />}
                        onClick={() => handleViewSensorRecords(1)}
                        block
                        style={{ marginTop: 8 }}
                      >
                        {t('bluetooth.viewAllRecords')}
                      </Button>
                    </Space>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      {t('bluetooth.noRecords')}
                    </div>
                  )}
                </Card>

                {/* 查看传感器数据库记录 */}
                {dataEnabled && false && (
                  <Button
                    type="dashed"
                    icon={<DatabaseOutlined />}
                    onClick={() => handleViewSensorRecords(1)}
                    block
                  >
                    {t('bluetooth.viewRecords')}
                  </Button>
                )}
              </Space>
            </Card>
          )}

          {/* 数据记录器 */}
          {isConnected && (
            <Card
              title={
                <Space>
                  <LineChartOutlined />
                  {t('bluetooth.dataRecorder')}
                </Space>
              }
              extra={
                <Badge
                  status={isRecording ? 'processing' : 'default'}
                  text={isRecording ? t('bluetooth.recording') : t('bluetooth.notRecording')}
                />
              }
              size="small"
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* 记录控制 */}
                <Card size="small" style={{ background: '#fafafa' }}>
                  <Row align="middle" justify="space-between">
                    <Col flex="auto">
                      <Space>
                        <LineChartOutlined style={{ fontSize: 24, color: isRecording ? '#52c41a' : '#999' }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{t('bluetooth.backgroundRecording')}</div>
                          <div style={{ fontSize: 12, color: '#999' }}>
                            {isRecording ? t('bluetooth.recordingDesc') : t('bluetooth.startRecordingDesc')}
                          </div>
                        </div>
                      </Space>
                    </Col>
                    <Col>
                      {!isRecording ? (
                        <Button
                          type="primary"
                          size="large"
                          icon={<PlayCircleOutlined />}
                          onClick={handleStartRecording}
                        >
                          {t('bluetooth.startRecording')}
                        </Button>
                      ) : (
                        <Button
                          danger
                          size="large"
                          icon={<PauseCircleOutlined />}
                          onClick={handleStopRecording}
                        >
                          {t('bluetooth.stopRecording')}
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Card>

                {/* 记录说明 */}
                <Alert
                  message={t('bluetooth.recordingInstructions')}
                  description={
                    <ul style={{ marginBottom: 0, paddingLeft: 20, fontSize: 12 }}>
                      <li>{t('bluetooth.recordingInstruction1')}</li>
                      <li>{t('bluetooth.recordingInstruction2')}</li>
                      <li>{t('bluetooth.recordingInstruction3')}</li>
                      <li>{t('bluetooth.recordingInstruction4')}</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                  style={{ fontSize: 12 }}
                />

              </Space>
            </Card>
          )}

          {/* 使用说明 */}
          <Alert
            message={t('bluetooth.usageInstructions')}
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>{t('bluetooth.instruction1')}</li>
                <li>{t('bluetooth.instruction2')}</li>
                <li>{t('bluetooth.instruction3')}</li>
                <li>{t('bluetooth.instruction4')}</li>
                <li>{t('bluetooth.instruction5')}</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </Space>
      </Card>

      {/* 传感器数据记录弹窗 */}
      <Modal
        title={
          <Space>
            <DatabaseOutlined />
            {t('bluetooth.sensorDataRecords')}
            <Tag color="blue">{sensorTotal} {t('bluetooth.records')}</Tag>
          </Space>
        }
        open={showRecordsModal}
        onCancel={() => setShowRecordsModal(false)}
        footer={
          <Space>
            <Popconfirm
              title={t('bluetooth.confirmClear')}
              onConfirm={handleClearSensorRecords}
              okText={t('bluetooth.confirm')}
              cancelText={t('bluetooth.cancel')}
            >
              <Button danger icon={<DeleteOutlined />}>{t('bluetooth.clearData')}</Button>
            </Popconfirm>
            <Button onClick={() => setShowRecordsModal(false)}>{t('bluetooth.close')}</Button>
          </Space>
        }
        width={900}
      >
        <Table
          loading={sensorLoading}
          dataSource={sensorRecords}
          rowKey="id"
          size="small"
          scroll={{ x: 800 }}
          pagination={{
            current: sensorPage,
            total: sensorTotal,
            pageSize: 20,
            showTotal: (total) => t('bluetooth.total', { count: total }),
            onChange: (page) => handleViewSensorRecords(page),
          }}
          columns={[
            {
              title: t('bluetooth.time'),
              dataIndex: 'created_at',
              width: 170,
              render: (v) => v ? new Date(v).toLocaleString('zh-CN') : '--',
            },
            {
              title: t('bluetooth.heartRateBpm'),
              dataIndex: 'bpm',
              width: 100,
              render: (v) => v != null ? <Tag color="red">{v}</Tag> : '--',
            },
            {
              title: t('bluetooth.accelX'),
              dataIndex: 'accel_x',
              width: 90,
              render: (v) => v != null ? Number(v).toFixed(2) : '--',
            },
            {
              title: t('bluetooth.accelY'),
              dataIndex: 'accel_y',
              width: 90,
              render: (v) => v != null ? Number(v).toFixed(2) : '--',
            },
            {
              title: t('bluetooth.accelZ'),
              dataIndex: 'accel_z',
              width: 90,
              render: (v) => v != null ? Number(v).toFixed(2) : '--',
            },
            {
              title: t('bluetooth.temperatureC'),
              dataIndex: 'pressure_temp',
              width: 90,
              render: (v) => v != null ? Number(v).toFixed(2) : '--',
            },
            {
              title: t('bluetooth.pressureHpa'),
              dataIndex: 'pressure',
              width: 100,
              render: (v) => v != null ? Number(v).toFixed(2) : '--',
            },
            {
              title: t('bluetooth.altitudeM'),
              dataIndex: 'pressure_alt',
              width: 90,
              render: (v) => v != null ? Number(v).toFixed(1) : '--',
            },
          ]}
        />
      </Modal>
    </div>
  )
}

export default BluetoothDevice
