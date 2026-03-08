import { useState, useEffect, useRef } from 'react'
import { Card, Badge, Empty, Tag, Row, Col } from 'antd'
import { HeartOutlined, DashboardOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import bluetoothManager from '../../utils/bluetooth'

const WINDOW_MS = 30 * 1000

const CustomTooltip = ({ active, payload, unit, color }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '6px 12px' }}>
      <span style={{ color, fontWeight: 600 }}>{payload[0].value} {unit}</span>
      <div style={{ fontSize: 11, color: '#999' }}>{payload[0].payload.label}</div>
    </div>
  )
}

const makeTooltip = (unit, color) => (props) => <CustomTooltip {...props} unit={unit} color={color} />

const useSlideWindow = () => {
  const [history, setHistory] = useState([])
  const ref = useRef([])

  const push = (point) => {
    const now = Date.now()
    const cutoff = now - WINDOW_MS
    ref.current = [
      ...ref.current.filter(p => p.ts > cutoff),
      { ts: now, ...point },
    ]
    setHistory(ref.current.map(p => ({
      ...p,
      label: new Date(p.ts).toLocaleTimeString('zh-CN'),
    })))
  }

  return [history, push]
}

const ChartCard = ({ title, icon, color, data, dataKey, unit, latest, extra }) => {
  const { t } = useTranslation()
  const values = data.map(p => p[dataKey])
  const yMin = values.length ? Math.min(...values) - (unit === 'hPa' ? 0.5 : unit === 'm' ? 5 : 1) : 0
  const yMax = values.length ? Math.max(...values) + (unit === 'hPa' ? 0.5 : unit === 'm' ? 5 : 1) : 100

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          {title}
        </div>
      }
      extra={
        latest != null && (
          <Tag color={extra} style={{ fontSize: 14, padding: '2px 10px' }}>
            {latest} {unit}
          </Tag>
        )
      }
      size="small"
    >
      {data.length === 0 ? (
        <Empty description={t('statistics.waitingForData')} style={{ padding: '24px 0' }} />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#999' }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fontSize: 11, fill: '#999' }}
              width={52}
              unit={` ${unit}`}
            />
            <Tooltip content={makeTooltip(unit, color)} />
            {latest != null && (
              <ReferenceLine y={latest} stroke={color} strokeDasharray="4 4" strokeOpacity={0.4} />
            )}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      <div style={{ marginTop: 4, fontSize: 11, color: '#bfbfbf', textAlign: 'right' }}>
        {t('statistics.last30Seconds')} · {data.length} {t('statistics.points')}
      </div>
    </Card>
  )
}

const Statistics = () => {
  const { t } = useTranslation()
  const [connected, setConnected] = useState(bluetoothManager.isConnected)
  const [hrmHistory, pushHrm] = useSlideWindow()
  const [tempHistory, pushTemp] = useSlideWindow()
  const [pressureHistory, pushPressure] = useSlideWindow()
  const [altHistory, pushAlt] = useSlideWindow()

  useEffect(() => {
    const onConnected = () => setConnected(true)
    const onDisconnected = () => setConnected(false)

    const onHrmData = (data) => {
      console.log('[Statistics] 收到心率数据:', data)
      pushHrm({ bpm: data.bpm })
    }

    const onBarometerData = (data) => {
      console.log('[Statistics] 收到气压数据:', data)
      if (data.temperature != null) pushTemp({ temperature: parseFloat(data.temperature.toFixed(2)) })
      if (data.pressure != null) pushPressure({ pressure: parseFloat(data.pressure.toFixed(2)) })
      if (data.altitude != null) pushAlt({ altitude: parseFloat(data.altitude.toFixed(1)) })
    }

    bluetoothManager.on('connected', onConnected)
    bluetoothManager.on('disconnected', onDisconnected)
    bluetoothManager.on('hrmData', onHrmData)
    bluetoothManager.on('barometerData', onBarometerData)

    return () => {
      bluetoothManager.off('connected', onConnected)
      bluetoothManager.off('disconnected', onDisconnected)
      bluetoothManager.off('hrmData', onHrmData)
      bluetoothManager.off('barometerData', onBarometerData)
    }
  }, [])

  const latestBpm = hrmHistory.at(-1)?.bpm ?? null
  const latestTemp = tempHistory.at(-1)?.temperature ?? null
  const latestPressure = pressureHistory.at(-1)?.pressure ?? null
  const latestAlt = altHistory.at(-1)?.altitude ?? null

  if (!connected) {
    return (
      <Card>
        <Empty description={t('statistics.connectFirst')} style={{ padding: '60px 0' }} />
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 心率 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HeartOutlined style={{ color: '#cf1322' }} />
            {t('statistics.realtimeHeartRate')}
            <Badge status="processing" />
          </div>
        }
        extra={
          latestBpm != null && (
            <Tag color="red" style={{ fontSize: 16, padding: '2px 12px' }}>{latestBpm} bpm</Tag>
          )
        }
      >
        {hrmHistory.length === 0 ? (
          <Empty description={t('statistics.waitingForHeartRate')} style={{ padding: '40px 0' }} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={hrmHistory} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#999' }} interval="preserveStartEnd" minTickGap={40} />
              <YAxis
                domain={[
                  hrmHistory.length ? Math.max(30, Math.min(...hrmHistory.map(p => p.bpm)) - 10) : 40,
                  hrmHistory.length ? Math.min(220, Math.max(...hrmHistory.map(p => p.bpm)) + 10) : 160,
                ]}
                tick={{ fontSize: 11, fill: '#999' }}
                width={52}
                unit=" bpm"
              />
              <Tooltip content={makeTooltip('bpm', '#cf1322')} />
              {latestBpm && <ReferenceLine y={latestBpm} stroke="#cf1322" strokeDasharray="4 4" strokeOpacity={0.4} />}
              <Line type="monotone" dataKey="bpm" stroke="#cf1322" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
        <div style={{ marginTop: 4, fontSize: 11, color: '#bfbfbf', textAlign: 'right' }}>
          {t('statistics.last30Seconds')} · {hrmHistory.length} {t('statistics.points')}
        </div>
      </Card>

      {/* 气压计三图 */}
      <Row gutter={16}>
        <Col span={8}>
          <ChartCard
            title={t('statistics.temperature')} icon={<span style={{ color: '#644a40' }}>🌡</span>}
            color="#644a40" data={tempHistory} dataKey="temperature"
            unit="°C" latest={latestTemp} extra="blue"
          />
        </Col>
        <Col span={8}>
          <ChartCard
            title={t('statistics.pressure')} icon={<DashboardOutlined style={{ color: '#52c41a' }} />}
            color="#52c41a" data={pressureHistory} dataKey="pressure"
            unit="hPa" latest={latestPressure} extra="green"
          />
        </Col>
        <Col span={8}>
          <ChartCard
            title={t('statistics.altitude')} icon={<span style={{ color: '#faad14' }}>⛰</span>}
            color="#faad14" data={altHistory} dataKey="altitude"
            unit="m" latest={latestAlt} extra="gold"
          />
        </Col>
      </Row>
    </div>
  )
}

export default Statistics
