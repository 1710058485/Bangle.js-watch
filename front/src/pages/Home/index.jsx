import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Spin } from 'antd'
import { FieldTimeOutlined, HeartOutlined, UserOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { getUserInfo } from '../../utils/token'
import { getSensorRecords } from '../../api/sensor'
import bluetoothManager from '../../utils/bluetooth'
import './index.css'

const Home = () => {
  const { t } = useTranslation()
  const userInfo = getUserInfo()
  const [deviceCount, setDeviceCount] = useState(0)
  const [healthDataCount, setHealthDataCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取设备连接状态
        const isConnected = bluetoothManager.isConnected
        setDeviceCount(isConnected ? 1 : 0)

        // 获取健康数据总数
        const res = await getSensorRecords(1, 1)
        if (res.code === 200) {
          setHealthDataCount(res.data.total || 0)
        }
      } catch (error) {
        console.error('获取首页数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // 监听设备连接状态变化
    const onConnected = () => setDeviceCount(1)
    const onDisconnected = () => setDeviceCount(0)

    bluetoothManager.on('connected', onConnected)
    bluetoothManager.on('disconnected', onDisconnected)

    return () => {
      bluetoothManager.off('connected', onConnected)
      bluetoothManager.off('disconnected', onDisconnected)
    }
  }, [])

  return (
    <div className="home-container">
      <Card className="welcome-card">
        <h2>{t('home.welcome', { name: userInfo?.nickname || userInfo?.username })}</h2>
        <p>{t('home.description')}</p>
      </Card>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title={t('home.boundDevices')}
                value={deviceCount}
                prefix={<FieldTimeOutlined />}
                suffix={t('common.unit')}
                valueStyle={{ color: deviceCount > 0 ? '#3f8600' : undefined }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title={t('home.healthData')}
                value={healthDataCount}
                prefix={<HeartOutlined />}
                suffix={t('common.records')}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title={t('home.userRole')}
                value={userInfo?.role === 'ADMIN' ? t('home.admin') : t('home.normalUser')}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      <Card style={{ marginTop: 24 }} title={t('home.quickStart')}>
        <p>{t('home.step1')}</p>
        <p>{t('home.step2')}</p>
        <p>{t('home.step3')}</p>
      </Card>
    </div>
  )
}

export default Home
