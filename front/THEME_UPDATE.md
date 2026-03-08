# 🎨 项目主题色更新说明

## ✅ 已完成的更新

### 1. 全局 CSS 变量 (`/src/styles/global.css`)
已更新为棕色/米色系主题，包含：
- ✅ 浅色模式（Light Mode）
- ✅ 深色模式（Dark Mode）
- ✅ 完整的颜色变量系统

### 2. Tailwind 配置 (`tailwind.config.js`)
- ✅ 添加 `darkMode: 'class'` 支持深色模式
- ✅ 更新颜色映射以使用新的 CSS 变量
- ✅ 添加 sidebar 和 chart 颜色支持
- ✅ 移除 HSL 包装，直接使用十六进制颜色值

## 🎨 新主题配色方案

### 浅色模式（Light Mode）
| 用途 | 颜色 | 说明 |
|------|------|------|
| **主色** | `#644a40` | 深棕色 - 按钮、链接 |
| **次要色** | `#ffdfb5` | 米黄色 - 次要元素 |
| **背景** | `#f9f9f9` | 浅灰色 - 页面背景 |
| **卡片** | `#fcfcfc` | 近白色 - 卡片背景 |
| **边框** | `#d8d8d8` | 浅灰色 - 边框线 |
| **文字** | `#202020` | 深灰色 - 主要文字 |
| **危险色** | `#e54d2e` | 红色 - 删除、错误 |

### 深色模式（Dark Mode）
| 用途 | 颜色 | 说明 |
|------|------|------|
| **主色** | `#ffe0c2` | 浅米色 - 按钮、链接 |
| **次要色** | `#393028` | 深棕色 - 次要元素 |
| **背景** | `#111111` | 深黑色 - 页面背景 |
| **卡片** | `#191919` | 深灰色 - 卡片背景 |
| **边框** | `#201e18` | 深棕灰 - 边框线 |
| **文字** | `#eeeeee` | 浅灰色 - 主要文字 |

### 图表颜色
- Chart 1: `#644a40` / `#ffe0c2` (主棕色)
- Chart 2: `#ffdfb5` / `#393028` (米黄/深棕)
- Chart 3: `#e8e8e8` / `#2a2a2a` (浅灰/深灰)
- Chart 4: `#ffe6c4` / `#42382e` (浅米/深棕)
- Chart 5: `#66493e` / `#ffe0c1` (中棕/浅米)

## 🔧 如何使用新主题

### 在 Tailwind 类中使用
```jsx
// 背景色
<div className="bg-background">
<div className="bg-card">
<div className="bg-primary">

// 文字颜色
<p className="text-foreground">
<p className="text-muted-foreground">
<p className="text-primary">

// 边框
<div className="border border-border">

// 按钮
<button className="bg-primary text-primary-foreground">
<button className="bg-secondary text-secondary-foreground">
```

### 在 CSS 中使用
```css
.my-element {
  background-color: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}

.my-button {
  background-color: var(--primary);
  color: var(--primary-foreground);
}
```

### 启用深色模式
在根元素添加 `dark` 类：
```jsx
<html className="dark">
  {/* 内容 */}
</html>
```

或使用 JavaScript 切换：
```javascript
document.documentElement.classList.toggle('dark')
```

## 📊 图表组件使用
```jsx
import { LineChart } from 'recharts'

<LineChart>
  <Line stroke="var(--chart-1)" />
  <Line stroke="var(--chart-2)" />
  <Line stroke="var(--chart-3)" />
</LineChart>
```

## 🎯 主题特点

### 1. 温暖舒适
- 棕色系给人温暖、自然的感觉
- 适合健康管理类应用
- 减少视觉疲劳

### 2. 专业稳重
- 深棕色主色调显得专业可靠
- 米黄色次要色增添亲和力
- 整体配色平衡协调

### 3. 完整的深色模式
- 自动反转颜色以适应深色环境
- 保持良好的对比度和可读性
- 减少夜间使用时的眼睛疲劳

### 4. 灵活扩展
- 完整的颜色变量系统
- 支持 sidebar、chart 等特殊组件
- 易于自定义和扩展

## 🔄 与现有组件的兼容性

### Ant Design 组件
Ant Design 组件会继续使用其自身的主题系统，但可以通过以下方式协调：

```jsx
import { ConfigProvider } from 'antd'

<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#644a40',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#e54d2e',
      borderRadius: 8,
    },
  }}
>
  {/* 应用内容 */}
</ConfigProvider>
```

### 自定义组件
所有使用 Tailwind 类的自定义组件会自动应用新主题。

## 🚀 下一步建议

1. **测试深色模式**：实现深色模式切换功能
2. **统一 Ant Design**：配置 Ant Design 主题以匹配新配色
3. **更新图表**：使用新的 chart 颜色变量
4. **优化对比度**：确保所有文字在新背景上清晰可读

## 📝 注意事项

1. **颜色格式**：新主题使用十六进制颜色值，不是 HSL
2. **深色模式**：需要手动添加 `dark` 类才能启用
3. **Ant Design**：需要单独配置以匹配新主题
4. **渐变背景**：首页和注册页的淡蓝色渐变保持不变

构建已成功，可以运行 `npm run dev` 查看新主题效果！
