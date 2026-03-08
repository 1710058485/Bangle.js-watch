# MenuVertical Component Integration Guide

## ✅ Completed Work

### 1. Component Adaptation
Converted TypeScript + Next.js component to JSX + React Router version:
- ✅ Removed TypeScript type definitions
- ✅ Replaced Next.js `Link` with `react-router-dom` `Link`
- ✅ Changed `href` attribute to `to` attribute
- ✅ Maintained all animation and style functionality

### 2. Project Configuration
- ✅ Created `/src/components/ui/` directory
- ✅ Configured Vite path alias `@/` pointing to `./src`
- ✅ Verified all dependencies are installed (framer-motion, lucide-react)

### 3. File Structure
```
src/
├── components/
│   └── ui/
│       ├── menu-vertical.jsx          # Main component
│       └── menu-vertical-demo.jsx     # Usage example
```

## 📦 Dependency Check

All required dependencies exist in the project:
- ✅ `framer-motion` (v12.33.0) - Animation library
- ✅ `lucide-react` (v0.563.0) - Icon library
- ✅ `react-router-dom` (v6.20.0) - Routing
- ✅ `tailwindcss` (v3.4.19) - Styling
- ✅ `clsx` & `tailwind-merge` - Class name utilities

## 🎨 Component API

### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `menuItems` | `Array<{label: string, href: string}>` | `[]` | Menu items array |
| `color` | `string` | `'#ff6900'` | Hover color |
| `skew` | `number` | `0` | Hover skew angle |

### Usage Example

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

## 🔧 Integration into Existing Sidebar

### Option 1: Replace Existing Menu (Recommended for new design)

In `src/pages/Layout/index.jsx`:

```jsx
import { MenuVertical } from '@/components/ui/menu-vertical'

// Replace Menu in Sider component
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

### Option 2: Create New Demo Page (Recommended for testing)

1. Add new page to routes:

```jsx
// src/router/index.jsx
import MenuVerticalDemo from '../components/ui/menu-vertical-demo'

{
  path: '/menu-demo',
  element: <MenuVerticalDemo />
}
```

2. Visit `http://localhost:5173/menu-demo` to see the effect

## 🎯 Best Practices

### 1. Responsive Design
Component uses `w-fit` by default, recommend hiding or adjusting on mobile:

```jsx
<div className="hidden md:block">
  <MenuVertical menuItems={items} />
</div>
```

### 2. Internationalization Support
Use i18n to translate menu labels:

```jsx
const { t } = useTranslation()

const menuItems = [
  { label: t('nav.home'), href: '/home' },
  { label: t('nav.about'), href: '/about' },
]
```

### 3. Theme Adaptation
Component supports dark mode (via Tailwind's `dark:` prefix):
- Light mode: `text-zinc-900`
- Dark mode: `text-zinc-50`

### 4. Custom Colors
Match Ant Design theme colors:

```jsx
<MenuVertical
  menuItems={items}
  color="#1890ff"  // Ant Design primary color
  skew={-3}        // Slight skew effect
/>
```

## 🚀 Next Steps

1. **Test Component**: Visit demo page to see the effect
2. **Adjust Styles**: Modify colors and animations based on design requirements
3. **Integrate into Layout**: Decide whether to replace existing menu
4. **Add Features**: Can add active state, badges, etc.

## ⚠️ Important Notes

1. **Path Alias**: Ensure using `@/` import path
2. **Route Matching**: `href` must match route configuration
3. **Performance**: Consider virtual scrolling for large number of menu items
4. **Accessibility**: Consider adding ARIA labels and keyboard navigation

## 🐛 Troubleshooting

### Issue: Import path error
```bash
Error: Cannot find module '@/components/ui/menu-vertical'
```
**Solution**: Ensure Vite is configured with path alias (already done)

### Issue: Animations not working
**Solution**: Check framer-motion version, ensure >= 12.0.0

### Issue: Styles not applied
**Solution**: Ensure Tailwind config includes component path:
```js
content: ["./src/**/*.{js,jsx}"]
```

## 📚 Related Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Lucide React Icons](https://lucide.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
