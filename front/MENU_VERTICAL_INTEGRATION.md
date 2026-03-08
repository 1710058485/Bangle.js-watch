# MenuVertical 组件集成指南

## ✅ 已完成的工作

### 1. 组件适配
已将 TypeScript + Next.js 组件转换为 JSX + React Router 版本：
- ✅ 移除 TypeScript 类型定义
- ✅ 将 Next.js `Link` 替换为 `react-router-dom` 的 `Link`
- ✅ 将 `href` 属性改为 `to` 属性
- ✅ 保持所有动画和样式功能

### 2. 项目配置
- ✅ 创建 `/src/components/ui/` 目录
- ✅ 配置 Vite 路径别名 `@/` 指向 `./src`
- ✅ 验证所有依赖已安装（framer-motion, lucide-react）

### 3. 文件结构
```
src/
├── components/
│   └── ui/
│       ├── menu-vertical.jsx          # 主组件
│       └── menu-vertical-demo.jsx     # 使用示例
```

## 📦 依赖检查

所有必需的依赖已存在于项目中：
- ✅ `framer-motion` (v12.33.0) - 动画库
- ✅ `lucide-react` (v0.563.0) - 图标库
- ✅ `react-router-dom` (v6.20.0) - 路由
- ✅ `tailwindcss` (v3.4.19) - 样式
- ✅ `clsx` & `tailwind-merge` - 类名工具

## 🎨 组件 API

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `menuItems` | `Array<{label: string, href: string}>` | `[]` | 菜单项数组 |
| `color` | `string` | `'#ff6900'` | 悬停时的颜色 |
| `skew` | `number` | `0` | 悬停时的倾斜角度 |

### 使用示例

```jsx
import { MenuVertical } from '@/components/ui/menu-vertical'

function MyPage() {
  return (
    <MenuVertical
      menuItems={[
        { label: 'Home', href: '/home' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ]}
      color="#1890ff"
      skew={-5}
    />
  )
}
```

## 🔧 集成到现有侧边栏

### 选项 1: 替换现有菜单（推荐用于全新设计）

在 `src/pages/Layout/index.jsx` 中：

```jsx
import { MenuVertical } from '@/components/ui/menu-vertical'

// 在 Sider 组件中替换 Menu
<Sider width={200} style={{ background: colorBgContainer }}>
  <MenuVertical
    menuItems={[
      { label: t('nav.home'), href: '/home' },
      { label: t('nav.health'), href: '/health' },
      { label: t('nav.statistics'), href: '/statistics' },
      { label: t('nav.weather'), href: '/weather' },
      { label: t('nav.bluetooth'), href: '/bluetooth' },
    ]}
    color="#1890ff"
  />
</Sider>
```

### 选项 2: 创建新页面展示（推荐用于测试）

1. 在路由中添加新页面：

```jsx
// src/router/index.jsx
import MenuVerticalDemo from '../components/ui/menu-vertical-demo'

{
  path: '/menu-demo',
  element: <MenuVerticalDemo />
}
```

2. 访问 `http://localhost:5173/menu-demo` 查看效果

## 🎯 最佳实践

### 1. 响应式设计
组件默认使用 `w-fit`，建议在移动端隐藏或调整：

```jsx
<div className="hidden md:block">
  <MenuVertical menuItems={items} />
</div>
```

### 2. 国际化支持
使用 i18n 翻译菜单标签：

```jsx
const { t } = useTranslation()

const menuItems = [
  { label: t('nav.home'), href: '/home' },
  { label: t('nav.about'), href: '/about' },
]
```

### 3. 主题适配
组件支持深色模式（通过 Tailwind 的 `dark:` 前缀）：
- 浅色模式：`text-zinc-900`
- 深色模式：`text-zinc-50`

### 4. 自定义颜色
匹配 Ant Design 主题色：

```jsx
<MenuVertical
  menuItems={items}
  color="#1890ff"  // Ant Design 主色
  skew={-3}        // 轻微倾斜效果
/>
```

## 🚀 下一步

1. **测试组件**：访问 demo 页面查看效果
2. **调整样式**：根据设计需求修改颜色和动画
3. **集成到布局**：决定是否替换现有菜单
4. **添加功能**：可以添加活动状态、徽章等

## ⚠️ 注意事项

1. **路径别名**：确保使用 `@/` 导入路径
2. **路由匹配**：`href` 必须与路由配置匹配
3. **性能**：大量菜单项时考虑虚拟滚动
4. **可访问性**：考虑添加 ARIA 标签和键盘导航

## 🐛 故障排除

### 问题：导入路径错误
```bash
Error: Cannot find module '@/components/ui/menu-vertical'
```
**解决**：确保 Vite 配置了路径别名（已完成）

### 问题：动画不工作
**解决**：检查 framer-motion 版本，确保 >= 12.0.0

### 问题：样式不生效
**解决**：确保 Tailwind 配置包含组件路径：
```js
content: ["./src/**/*.{js,jsx}"]
```

## 📚 相关资源

- [Framer Motion 文档](https://www.framer.com/motion/)
- [Lucide React 图标](https://lucide.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
