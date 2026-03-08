import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import App from './App'
import './styles/global.css'
import './i18n'

// Dynamic locale provider with custom theme
const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = React.useState(
    localStorage.getItem('language') === 'en' ? enUS : zhCN
  )

  React.useEffect(() => {
    const handleLanguageChange = () => {
      const lang = localStorage.getItem('language')
      setLocale(lang === 'en' ? enUS : zhCN)
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        token: {
          colorPrimary: '#644a40',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#e54d2e',
          colorInfo: '#1890ff',
          borderRadius: 8,
          colorBgContainer: '#fcfcfc',
          colorBorder: '#d8d8d8',
          colorText: '#202020',
          colorTextSecondary: '#646464',
        },
        components: {
          Button: {
            colorPrimary: '#644a40',
            algorithm: true,
          },
          Menu: {
            colorPrimary: '#644a40',
            itemSelectedBg: '#ffdfb5',
            itemSelectedColor: '#582d1d',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </React.StrictMode>,
)
