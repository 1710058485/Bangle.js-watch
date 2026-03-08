import { MenuVertical } from '@/components/ui/menu-vertical'
import { useTranslation } from 'react-i18next'

const MenuVerticalDemo = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <MenuVertical
        menuItems={[
          {
            label: t('nav.home'),
            href: '/home',
          },
          {
            label: t('nav.health'),
            href: '/health',
          },
          {
            label: t('nav.statistics'),
            href: '/statistics',
          },
          {
            label: t('nav.weather'),
            href: '/weather',
          },
          {
            label: t('nav.bluetooth'),
            href: '/bluetooth',
          },
        ]}
        color="#1890ff" // Ant Design primary color
        skew={-5}
      />
    </div>
  )
}

export default MenuVerticalDemo
