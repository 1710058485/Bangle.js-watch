import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Progress, Tag, Alert, Empty, Spin, DatePicker } from 'antd'
import {
  HeartOutlined,
  FireOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  WarningOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { getSensorRecords } from '../../api/sensor'
import bluetoothManager from '../../utils/bluetooth'
import dayjs from 'dayjs'
import './index.css'

const HealthDashboard = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [dayData, setDayData] = useState([])
  const [allData, setAllData] = useState([])
  const [healthScore, setHealthScore] = useState(0)
  const [activeMinutes, setActiveMinutes] = useState(0)
  const [heartRateZones, setHeartRateZones] = useState({
    rest: 0,      // 静息 <100
    light: 0,     // 轻度 100-120
    moderate: 0,  // 中度 120-140
    intense: 0,   // 高强度 140-160
    extreme: 0,   // 极限 >160
  })
  const [warnings, setWarnings] = useState([])
  const [isConnected, setIsConnected] = useState(bluetoothManager.isConnected)

  useEffect(() => {
    fetchAllData()

    const onConnected = () => setIsConnected(true)
    const onDisconnected = () => setIsConnected(false)
    bluetoothManager.on('connected', onConnected)
    bluetoothManager.on('disconnected', onDisconnected)

    return () => {
      bluetoothManager.off('connected', onConnected)
      bluetoothManager.off('disconnected', onDisconnected)
    }
  }, [])

  useEffect(() => {
    if (allData.length > 0) {
      filterDataByDate(selectedDate)
    }
  }, [selectedDate, allData])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      // 获取所有历史数据（分页获取）
      let allRecords = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const res = await getSensorRecords(page, 100)
        if (res.code === 200 && res.data.list.length > 0) {
          allRecords = [...allRecords, ...res.data.list]
          hasMore = res.data.list.length === 100
          page++
        } else {
          hasMore = false
        }
      }

      setAllData(allRecords)
      filterDataByDate(selectedDate, allRecords)
    } catch (error) {
      console.error('获取健康数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDataByDate = (date, data = allData) => {
    const targetDate = date.format('YYYY-MM-DD')
    const filtered = data.filter(record => {
      const recordDate = dayjs(record.created_at).format('YYYY-MM-DD')
      return recordDate === targetDate
    })

    setDayData(filtered)
    analyzeHealthData(filtered)
  }

  const analyzeHealthData = (records) => {
    if (records.length === 0) return

    // 分析心率区间
    const zones = { rest: 0, light: 0, moderate: 0, intense: 0, extreme: 0 }
    let activeCount = 0
    const warningList = []

    records.forEach(record => {
      const bpm = record.bpm
      if (bpm) {
        if (bpm < 100) zones.rest++
        else if (bpm < 120) { zones.light++; activeCount++ }
        else if (bpm < 140) { zones.moderate++; activeCount++ }
        else if (bpm < 160) { zones.intense++; activeCount++ }
        else { zones.extreme++; activeCount++ }

        // 异常预警
        if (bpm > 180) {
          warningList.push({
            type: 'danger',
            message: t('health.heartRateTooHigh', { bpm }),
            time: new Date(record.created_at).toLocaleTimeString()
          })
        } else if (bpm < 40 && bpm > 0) {
          warningList.push({
            type: 'warning',
            message: t('health.heartRateTooLow', { bpm }),
            time: new Date(record.created_at).toLocaleTimeString()
          })
        }
      }
    })

    setHeartRateZones(zones)
    setActiveMinutes(Math.floor(activeCount * 5 / 60)) // 每5秒一条记录
    setWarnings(warningList.slice(-5)) // 只保留最近5条预警

    // 计算健康评分
    const score = calculateHealthScore(records, activeCount)
    setHealthScore(score)
  }

  const calculateHealthScore = (records, activeCount) => {
    let score = 60 // 基础分

    // 活动时长加分（最多+30分）
    const activeMinutes = activeCount * 5 / 60
    score += Math.min(30, activeMinutes / 2)

    // 心率稳定性加分（最多+10分）
    const bpmValues = records.filter(r => r.bpm).map(r => r.bpm)
    if (bpmValues.length > 10) {
      const avg = bpmValues.reduce((a, b) => a + b, 0) / bpmValues.length
      const variance = bpmValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / bpmValues.length
      const stability = Math.max(0, 10 - variance / 100)
      score += stability
    }

    return Math.min(100, Math.round(score))
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a'
    if (score >= 60) return '#faad14'
    return '#ff4d4f'
  }

  const getScoreStatus = (score) => {
    if (score >= 80) return t('health.excellent')
    if (score >= 60) return t('health.good')
    return t('health.needsImprovement')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip={t('health.loadingData')} />
      </div>
    )
  }

  if (!isConnected && dayData.length === 0) {
    return (
      <Card>
        <Empty
          description={t('health.noData')}
          style={{ padding: '60px 0' }}
        />
      </Card>
    )
  }

  const totalZones = Object.values(heartRateZones).reduce((a, b) => a + b, 0)

  return (
    <div className="health-dashboard">
      {/* 日期选择器 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <span style={{ fontSize: 16, fontWeight: 500 }}>{t('health.selectDate')}：</span>
            <DatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date || dayjs())}
              format="YYYY-MM-DD"
              style={{ marginLeft: 12 }}
              allowClear={false}
            />
          </Col>
          <Col>
            <Tag color="blue">{t('health.dataSource')}</Tag>
            <Tag color="green">{dayData.length} {t('common.records')}</Tag>
          </Col>
        </Row>
      </Card>

      {/* 健康评分 */}
      <Card className="score-card">
        <Row gutter={24} align="middle">
          <Col span={12}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={healthScore}
                strokeColor={getScoreColor(healthScore)}
                width={180}
                format={(percent) => (
                  <div>
                    <div style={{ fontSize: 48, fontWeight: 'bold', color: getScoreColor(percent) }}>
                      {percent}
                    </div>
                    <div style={{ fontSize: 14, color: '#999' }}>{t('health.healthScore')}</div>
                  </div>
                )}
              />
              <Tag
                color={getScoreColor(healthScore)}
                style={{ marginTop: 16, fontSize: 16, padding: '4px 16px' }}
              >
                {getScoreStatus(healthScore)}
              </Tag>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ fontSize: 14, color: '#666', lineHeight: 2 }}>
              <p>{t('health.scoringDimensions')}</p>
              <p>• {t('health.activityDuration')}</p>
              <p>• {t('health.heartRateStability')}</p>
              <p>• {t('health.exerciseRegularity')}</p>
              <p style={{ marginTop: 16, fontSize: 12, color: '#999' }}>
                {t('health.dataSourceInfo', { date: selectedDate.format('YYYY-MM-DD'), count: dayData.length })}
              </p>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 核心指标 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('health.activityTime')}
              value={activeMinutes}
              suffix={t('common.minutes')}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#644a40' }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              {t('health.recommendedDaily')}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title={t('health.dataRecords')}
              value={dayData.length}
              suffix={t('common.records')}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              {t('health.autoRecord')}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title={t('health.achievement')}
              value={healthScore >= 80 ? '🏆' : healthScore >= 60 ? '⭐' : '💪'}
              prefix={<TrophyOutlined />}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              {healthScore >= 80 ? t('health.performanceExcellent') : healthScore >= 60 ? t('health.keepGoing') : t('health.keepTrying')}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 运动强度分析 */}
      <Card
        title={
          <span>
            <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            {t('health.intensityAnalysis')}
          </span>
        }
        style={{ marginTop: 16 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{t('health.rest')}</span>
                <span style={{ color: '#999' }}>{heartRateZones.rest} {t('common.times')}</span>
              </div>
              <Progress
                percent={totalZones ? (heartRateZones.rest / totalZones * 100) : 0}
                strokeColor="#95de64"
                showInfo={false}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{t('health.lightExercise')}</span>
                <span style={{ color: '#999' }}>{heartRateZones.light} {t('common.times')}</span>
              </div>
              <Progress
                percent={totalZones ? (heartRateZones.light / totalZones * 100) : 0}
                strokeColor="#52c41a"
                showInfo={false}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{t('health.moderateExercise')}</span>
                <span style={{ color: '#999' }}>{heartRateZones.moderate} {t('common.times')}</span>
              </div>
              <Progress
                percent={totalZones ? (heartRateZones.moderate / totalZones * 100) : 0}
                strokeColor="#faad14"
                showInfo={false}
              />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{t('health.intenseExercise')}</span>
                <span style={{ color: '#999' }}>{heartRateZones.intense} {t('common.times')}</span>
              </div>
              <Progress
                percent={totalZones ? (heartRateZones.intense / totalZones * 100) : 0}
                strokeColor="#ff7a45"
                showInfo={false}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{t('health.extremeExercise')}</span>
                <span style={{ color: '#999' }}>{heartRateZones.extreme} {t('common.times')}</span>
              </div>
              <Progress
                percent={totalZones ? (heartRateZones.extreme / totalZones * 100) : 0}
                strokeColor="#ff4d4f"
                showInfo={false}
              />
            </div>
            <Alert
              message={t('health.exerciseSuggestion')}
              description={t('health.exerciseRecommendation')}
              type="info"
              showIcon
              style={{ marginTop: 8 }}
            />
          </Col>
        </Row>
      </Card>

      {/* 异常预警 */}
      {warnings.length > 0 && (
        <Card
          title={
            <span>
              <WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
              {t('health.healthWarning')}
            </span>
          }
          style={{ marginTop: 16 }}
        >
          {warnings.map((warning, index) => (
            <Alert
              key={index}
              message={warning.message}
              description={`${t('common.time')}: ${warning.time}`}
              type={warning.type}
              showIcon
              style={{ marginBottom: index < warnings.length - 1 ? 12 : 0 }}
            />
          ))}
        </Card>
      )}
    </div>
  )
}

export default HealthDashboard
