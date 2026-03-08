import { Layout, Menu, Avatar, Dropdown, Space, Button, Badge, Popover, Tooltip, message, Switch, Select } from 'antd'
import {
  HomeOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  ApiOutlined,
  DisconnectOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  CloudOutlined,
  ReloadOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getUserInfo, clearAuth } from '../../utils/token'
import bluetoothManager from '../../utils/bluetooth'
import { useSensorDataAcquisition } from '../../hooks/useSensorDataAcquisition'
import './index.css'

const { Header, Sider, Content } = Layout

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const userInfo = getUserInfo()
  const { t, i18n } = useTranslation()

  const [btConnected, setBtConnected] = useState(bluetoothManager.isConnected)
  const [btDeviceName, setBtDeviceName] = useState(bluetoothManager.device?.name || null)
  const [btConnecting, setBtConnecting] = useState(false)
  const [btBattery, setBtBattery] = useState(null)

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
      console.log('[Layout] 广播气压数据:', info)
    },
    onHrmData: (info) => {
      console.log('[Layout] 广播心率数据:', info)
    },
    onAccelData: (info) => {
      console.log('[Layout] 广播加速度数据:', info)
    },
    t,
  })

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
    window.dispatchEvent(new Event('languageChange'))
    message.success(t('messages.languageChanged'))
  }

  useEffect(() => {
    const onConnected = async (device) => {
      setBtConnected(true)
      setBtDeviceName(device.name)
      try {
        const battery = await bluetoothManager.getBatteryLevel()
        if (battery !== null) setBtBattery(battery)
      } catch (e) {}
    }
    const onDisconnected = () => {
      setBtConnected(false)
      setBtDeviceName(null)
      setBtBattery(null)
    }

    // 监听页面请求当前数据的事件
    const onRequestCurrentData = () => {
      console.log('[Layout] 收到请求当前数据事件，重新广播')
      // 如果有数据，重新广播
      if (hrmRef.current) {
        console.log('[Layout] 重新广播心率数据:', hrmRef.current)
        bluetoothManager.emit('hrmData', hrmRef.current)
      }
      if (accelRef.current) {
        console.log('[Layout] 重新广播加速度数据:', accelRef.current)
        bluetoothManager.emit('accelData', accelRef.current)
      }
      if (pressureRef.current) {
        console.log('[Layout] 重新广播气压数据:', pressureRef.current)
        bluetoothManager.emit('barometerData', pressureRef.current)
      }
    }

    bluetoothManager.on('connected', onConnected)
    bluetoothManager.on('disconnected', onDisconnected)
    bluetoothManager.on('requestCurrentData', onRequestCurrentData)

    return () => {
      bluetoothManager.off('connected', onConnected)
      bluetoothManager.off('disconnected', onDisconnected)
      bluetoothManager.off('requestCurrentData', onRequestCurrentData)
    }
  }, [])

  const handleBtConnect = async () => {
    setBtConnecting(true)
    try {
      await bluetoothManager.requestDevice()
      await bluetoothManager.connect()
    } catch (error) {
      if (error.name !== 'NotFoundError' && error.name !== 'AbortError') {
        message.error(t('messages.connectFailed') + ': ' + error.message)
      }
    } finally {
      setBtConnecting(false)
    }
  }

  const handleBtDisconnect = () => {
    // 断开连接时也关闭数据获取
    if (dataEnabled) {
      toggleDataAcquisition()
    }
    bluetoothManager.disconnect()
    message.info(t('messages.disconnected'))
  }


  const menuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: t('nav.home')
    },
    {
      key: '/health',
      icon: <HeartOutlined />,
      label: t('nav.health')
    },
    {
      key: '/weather',
      icon: <CloudOutlined />,
      label: t('nav.weather')
    },
    {
      key: '/bluetooth',
      icon: <ApiOutlined />,
      label: t('nav.bluetooth')
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: t('nav.statistics')
    }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('nav.profile')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('nav.logout'),
      onClick: handleLogout
    }
  ]

  return (
    <Layout className="main-layout">
      <Header className="header">
        <div className="logo">{t('nav.title')}</div>
        <div className="user-info">
          <Space size={16}>
            {/* 语言切换 */}
            <Select
              value={i18n.language}
              onChange={handleLanguageChange}
              style={{ width: 100 }}
              suffixIcon={<GlobalOutlined />}
              options={[
                { value: 'zh', label: '中文' },
                { value: 'en', label: 'English' }
              ]}
            />

            {btConnected ? (
              <>
                {/* 数据获取开关 */}
                <Tooltip title={dataEnabled ? t('bluetooth.stopDataAcquisition') : t('bluetooth.startDataAcquisition')}>
                  <Switch
                    checked={dataEnabled}
                    onChange={toggleDataAcquisition}
                    loading={isStartingData}
                    checkedChildren={<ReloadOutlined />}
                    unCheckedChildren={<ReloadOutlined />}
                    style={{ marginRight: 8 }}
                  />
                </Tooltip>

                <Popover
                  content={
                    <Space direction="vertical" size="small" style={{ minWidth: 160 }}>
                      <div style={{ color: '#666' }}>{t('bluetooth.device')}：{btDeviceName}</div>
                      {btBattery !== null && (
                        <div style={{ color: '#666' }}>
                          <ThunderboltOutlined /> {t('bluetooth.battery')}：{btBattery}%
                        </div>
                      )}
                      <Button danger size="small" icon={<DisconnectOutlined />} onClick={handleBtDisconnect} block>
                        {t('bluetooth.disconnect')}
                      </Button>
                    </Space>
                  }
                  title={<Space><ApiOutlined style={{ color: '#52c41a' }} />{t('bluetooth.connected')}</Space>}
                  trigger="click"
                >
                  <Badge status="success" dot>
                    <Button
                      type="text"
                      icon={<ApiOutlined />}
                      style={{ color: '#52c41a' }}
                    >
                      {btDeviceName}
                      {btBattery !== null && <span style={{ marginLeft: 4, opacity: 0.8 }}>{btBattery}%</span>}
                    </Button>
                  </Badge>
                </Popover>
              </>
            ) : (
              <Tooltip title={t('bluetooth.connectDevice')}>
                <Button
                  type="text"
                  icon={<ApiOutlined />}
                  onClick={handleBtConnect}
                  loading={btConnecting}
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  {!btConnecting && t('bluetooth.connectWatch')}
                </Button>
              </Tooltip>
            )}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} src={userInfo?.avatar} />
                <span>{userInfo?.nickname || userInfo?.username}</span>
              </Space>
            </Dropdown>
          </Space>
        </div>
      </Header>
      <Layout>
        <Sider width={200} className="sider">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout className="content-layout">
          <Content className="content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default MainLayout
