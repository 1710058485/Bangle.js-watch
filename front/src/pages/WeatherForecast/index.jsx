import { useState, useEffect } from 'react'
import { Card, Empty, Alert, Statistic, Row, Col, Tag, Space, Badge, Button } from 'antd'
import {
  CloudOutlined,
  ThunderboltOutlined,
  SunOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { getSensorRecords } from '../../api/sensor'
import './index.css'

const SAMPLE_INTERVAL_MS = 2 * 60 * 1000 // 2分钟采样间隔
const WINDOW_MINUTES = 20 // 20分钟窗口
const ALERT_THRESHOLD = -2.0 // 斜率阈值 hPa/h（类似卡西欧的"显著变化"）
const STATIONARY_THRESHOLD = 0.15 // 加速度方差阈值，判断用户是否静止

const WeatherForecast = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [pressureData, setPressureData] = useState([])
  const [alert, setAlert] = useState(null)
  const [stats, setStats] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    fetchAndAnalyze()
    // 每2分钟自动刷新一次（模拟卡西欧的后台采样）
    const interval = setInterval(fetchAndAnalyze, SAMPLE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  const fetchAndAnalyze = async () => {
    try {
      setLoading(true)

      // 获取最近30分钟的数据（留一些余量）
      const res = await getSensorRecords(1, 500)
      if (res.code !== 200 || !res.data.list.length) {
        setLoading(false)
        return
      }

      const now = Date.now()
      const windowStart = now - WINDOW_MINUTES * 60 * 1000

      // 过滤出最近20分钟的数据
      const recentData = res.data.list
        .filter(record => {
          const recordTime = new Date(record.created_at).getTime()
          return recordTime >= windowStart && record.pressure_alt != null
        })
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      if (recentData.length < 3) {
        setLoading(false)
        return
      }

      // 按2分钟间隔采样（取最接近的数据点）
      const sampledData = sampleData(recentData, SAMPLE_INTERVAL_MS)

      // 分析数据
      const analysis = analyzeData(sampledData, recentData)

      setPressureData(sampledData)
      setStats(analysis.stats)
      setAlert(analysis.alert)
      setLastUpdate(new Date())

    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 按指定间隔采样数据
  const sampleData = (data, intervalMs) => {
    if (data.length === 0) return []

    const sampled = []
    const startTime = new Date(data[0].created_at).getTime()

    // 计算需要多少个采样点
    const numSamples = Math.floor(WINDOW_MINUTES * 60 * 1000 / intervalMs) + 1

    for (let i = 0; i < numSamples; i++) {
      const targetTime = startTime + i * intervalMs

      // 找到最接近目标时间的数据点
      let closestPoint = null
      let minDiff = Infinity

      for (const point of data) {
        const pointTime = new Date(point.created_at).getTime()
        const diff = Math.abs(pointTime - targetTime)

        if (diff < minDiff && diff < intervalMs / 2) {
          minDiff = diff
          closestPoint = point
        }
      }

      if (closestPoint) {
        sampled.push({
          time: new Date(closestPoint.created_at).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          pressure: closestPoint.pressure ? parseFloat(parseFloat(closestPoint.pressure).toFixed(2)) : 0,
          altitude: closestPoint.pressure_alt ? parseFloat(parseFloat(closestPoint.pressure_alt).toFixed(1)) : 0,
          temperature: closestPoint.pressure_temp ? parseFloat(parseFloat(closestPoint.pressure_temp).toFixed(1)) : 0,
          accel_x: closestPoint.accel_x ? parseFloat(closestPoint.accel_x) : null,
          accel_y: closestPoint.accel_y ? parseFloat(closestPoint.accel_y) : null,
          accel_z: closestPoint.accel_z ? parseFloat(closestPoint.accel_z) : null,
          timestamp: new Date(closestPoint.created_at).getTime(),
        })
      }
    }

    return sampled
  }

  // 检查用户是否静止（基于加速度数据）
  const isUserStationary = (data) => {
    const validData = data.filter(d =>
      d.accel_x != null && d.accel_y != null && d.accel_z != null
    )

    if (validData.length < 5) return true // 没有加速度数据，假设静止

    // 计算加速度幅值
    const magnitudes = validData.map(d =>
      Math.sqrt(d.accel_x * d.accel_x + d.accel_y * d.accel_y + d.accel_z * d.accel_z)
    )

    // 计算方差
    const avg = magnitudes.reduce((sum, m) => sum + m, 0) / magnitudes.length
    const variance = magnitudes.reduce((sum, m) => sum + Math.pow(m - avg, 2), 0) / magnitudes.length

    return variance < STATIONARY_THRESHOLD
  }

  // 计算线性回归斜率
  const calculateSlope = (data) => {
    if (data.length < 2) return 0

    const n = data.length
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0

    data.forEach((point, index) => {
      const x = index
      const y = point.pressure
      sumX += x
      sumY += y
      sumXY += x * y
      sumX2 += x * x
    })

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

    // 转换为 hPa/h（假设采样间隔是2分钟）
    const slopePerHour = slope * (60 / 2)

    return slopePerHour
  }

  // 分析数据
  const analyzeData = (sampledData, allData) => {
    if (sampledData.length < 3) {
      return { stats: null, alert: null }
    }

    const firstPressure = sampledData[0].pressure
    const lastPressure = sampledData[sampledData.length - 1].pressure
    const pressureChange = lastPressure - firstPressure
    const slope = calculateSlope(sampledData)
    const isStationary = isUserStationary(allData)

    // 计算平均气压和海拔
    const avgPressure = sampledData.reduce((sum, d) => sum + d.pressure, 0) / sampledData.length
    const avgAltitude = sampledData.reduce((sum, d) => sum + d.altitude, 0) / sampledData.length

    // 检测是否持续下降
    let decreasingCount = 0
    for (let i = 1; i < sampledData.length; i++) {
      if (sampledData[i].pressure <= sampledData[i - 1].pressure + 0.1) {
        decreasingCount++
      }
    }
    const isContinuouslyDecreasing = decreasingCount / (sampledData.length - 1) >= 0.7

    const stats = {
      pressureChange: pressureChange.toFixed(2),
      slope: slope.toFixed(2),
      avgPressure: avgPressure.toFixed(2),
      avgAltitude: avgAltitude.toFixed(1),
      isStationary,
      isContinuouslyDecreasing,
      dataPoints: sampledData.length,
    }

    // 卡西欧式预警判断
    let alertResult = null

    // 条件1：斜率 <= -2.0 hPa/h 且用户静止
    if (slope <= ALERT_THRESHOLD && isStationary) {
      alertResult = {
        type: 'storm',
        title: t('weather.pressureAlert'),
        description: t('weather.stormAlert', { slope: slope.toFixed(2) }),
        icon: <ThunderboltOutlined />,
        color: '#ff4d4f',
        arrow: '↓↓',
        reason: t('weather.fastDrop'),
      }
    }
    // 条件2：20分钟变化 <= -0.8 hPa 且持续下降
    else if (pressureChange <= -0.8 && isContinuouslyDecreasing) {
      alertResult = {
        type: 'pressure_drop',
        title: t('weather.pressureDrop'),
        description: t('weather.dropAlert', { change: Math.abs(pressureChange).toFixed(2) }),
        icon: <CloudOutlined />,
        color: '#faad14',
        arrow: '↓',
        reason: t('weather.continuousDrop'),
      }
    }
    // 气压上升
    else if (slope >= 2.0) {
      alertResult = {
        type: 'pressure_rise',
        title: t('weather.pressureRise'),
        description: t('weather.riseAlert', { slope: slope.toFixed(2) }),
        icon: <SunOutlined />,
        color: '#52c41a',
        arrow: '↑',
        reason: t('weather.rising'),
      }
    }
    // 稳定
    else {
      alertResult = {
        type: 'stable',
        title: t('weather.pressureStable'),
        description: t('weather.stableAlert', { slope: slope.toFixed(2) }),
        icon: <CloudOutlined />,
        color: '#644a40',
        arrow: '—',
        reason: t('weather.stable'),
      }
    }

    return { stats, alert: alertResult }
  }

  // 获取柱状图颜色
  const getBarColor = (value, index, data) => {
    if (index === 0) return '#d9d9d9'

    const prevValue = data[index - 1].pressure
    const diff = value - prevValue

    if (diff < -0.1) return '#ff4d4f' // 下降
    if (diff > 0.1) return '#52c41a' // 上升
    return '#644a40' // 稳定
  }

  if (loading && !pressureData.length) {
    return (
      <Card>
        <Empty description={t('weather.loading')} style={{ padding: '60px 0' }} />
      </Card>
    )
  }

  if (!pressureData.length) {
    return (
      <Card>
        <Empty
          description={t('weather.noData')}
          style={{ padding: '60px 0' }}
        />
      </Card>
    )
  }

  return (
    <div className="weather-forecast">
      <Card
        title={
          <Space>
            <CloudOutlined />
            {t('weather.title')}
            <Badge status="processing" />
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAndAnalyze}
              loading={loading}
              size="small"
            >
              {t('weather.refresh')}
            </Button>
            {lastUpdate && (
              <Tag color="blue">
                {lastUpdate.toLocaleTimeString('zh-CN')}
              </Tag>
            )}
          </Space>
        }
      >
        <Alert
          message={t('weather.algorithm')}
          description={
            <div>
              <p>{t('weather.samplingInterval')}</p>
              <p>{t('weather.monitorWindow')}</p>
              <p>{t('weather.triggerCondition')}</p>
              <p>{t('weather.dataSourceDesc')}</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* 预警状态 */}
        {alert && (
          <Card
            style={{
              marginBottom: 24,
              borderColor: alert.color,
              background: alert.type === 'storm' ? '#fff1f0' : undefined,
            }}
          >
            <Row align="middle" gutter={24}>
              <Col span={4}>
                <div style={{
                  fontSize: 72,
                  color: alert.color,
                  textAlign: 'center',
                }}>
                  {alert.icon}
                </div>
              </Col>
              <Col span={16}>
                <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                  {alert.title}
                </div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                  {alert.description}
                </div>
                <Tag color={alert.color}>{alert.reason}</Tag>
              </Col>
              <Col span={4}>
                <div style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: alert.color,
                  textAlign: 'center',
                }}>
                  {alert.arrow}
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* 气压趋势图（类似卡西欧的柱状图） */}
        <Card
          title={t('weather.pressureTrend')}
          size="small"
          style={{ marginBottom: 24 }}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pressureData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#999' }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[
                  (dataMin) => Math.floor(dataMin - 0.5),
                  (dataMax) => Math.ceil(dataMax + 0.5),
                ]}
                tick={{ fontSize: 11, fill: '#999' }}
                width={60}
                unit=" hPa"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const data = payload[0].payload
                  return (
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #f0f0f0',
                        borderRadius: 6,
                        padding: '8px 12px',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{data.pressure} hPa</div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {t('weather.altitude')}: {data.altitude} m
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {t('weather.temperature')}: {data.temperature}°C
                      </div>
                      <div style={{ fontSize: 11, color: '#999' }}>{data.time}</div>
                    </div>
                  )
                }}
              />
              {pressureData.length > 0 && (
                <ReferenceLine
                  y={pressureData[0].pressure}
                  stroke="#999"
                  strokeDasharray="4 4"
                  label={{ value: t('weather.startPoint'), position: 'right', fontSize: 11 }}
                />
              )}
              <Bar dataKey="pressure" radius={[4, 4, 0, 0]}>
                {pressureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.pressure, index, pressureData)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 8, fontSize: 11, color: '#bfbfbf', textAlign: 'right' }}>
            {t('weather.latestData')} · {pressureData.length} {t('weather.samplingPoints')}
          </div>
        </Card>

        {/* 统计数据 */}
        {stats && (
          <Row gutter={16}>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title={t('weather.change20min')}
                  value={stats.pressureChange}
                  suffix="hPa"
                  prefix={parseFloat(stats.pressureChange) > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  valueStyle={{
                    fontSize: 18,
                    color: parseFloat(stats.pressureChange) > 0 ? '#52c41a' : '#ff4d4f',
                  }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title={t('weather.changeRate')}
                  value={Math.abs(parseFloat(stats.slope))}
                  suffix="hPa/h"
                  prefix={parseFloat(stats.slope) > 0 ? '+' : '-'}
                  valueStyle={{ fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title={t('weather.avgPressure')}
                  value={stats.avgPressure}
                  suffix="hPa"
                  valueStyle={{ fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title={t('weather.userStatus')}
                  value={stats.isStationary ? t('weather.stationary') : t('weather.moving')}
                  valueStyle={{
                    fontSize: 18,
                    color: stats.isStationary ? '#52c41a' : '#faad14',
                  }}
                />
              </Card>
            </Col>
          </Row>
        )}
      </Card>
    </div>
  )
}

export default WeatherForecast
