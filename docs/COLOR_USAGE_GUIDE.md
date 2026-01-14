# Color System Quick Start Guide

**Created**: 2026-01-13
**Version**: 1.0.0
**Status**: Active

## 🚀 Quick Start

The color system has been **consolidated from 13 scales to 7 semantic scales** for better maintainability and consistency.

## 📊 Color Scales (7 Total)

| # | Scale | Purpose | Usage |
|---|-------|---------|--------|
| 1 | **Primary** (green-teal) | Brand CTAs | `bg-primary-600` |
| 2 | **Success** (green) | Success states | `bg-green-600` |
| 3 | **Error** (red) | Errors, delete | `bg-red-600` |
| 4 | **Warning** (yellow/orange) | Warnings | `bg-yellow-600` |
| 5 | **Info** (blue) | Information | `bg-blue-600` |
| 6 | **Secondary** (purple) | AI, decorative | `bg-purple-600` |
| 7 | **Neutral** (gray) | Default states | `bg-neutral-*` |

## ✨ Quick Usage

### Import Color Utilities

```typescript
import { getColorClasses } from '@/config/colors';
```

### Button Component

```tsx
<button className={getColorClasses('success', 'button')}>
  Save Changes
</button>
```

### Alert Component

```tsx
<div className={`p-4 rounded-lg ${getColorClasses('error', 'alert')}`}>
  Error message
</div>
```

### Badge Component

```tsx
<span className={`px-2 py-1 rounded-full ${getColorClasses('warning', 'badge')}`}>
  Pending
</span>
```

## 🎨 Semantic Color Mapping

| Component | Success | Error | Warning | Info | Neutral |
|-----------|----------|--------|---------|-------|---------|
| **Button** | `bg-green-600` | `bg-red-600` | `bg-orange-600` | `bg-blue-600` | `border-neutral-200` |
| **Alert** | `bg-green-50` | `bg-red-50` | `bg-yellow-50` | `bg-blue-50` | `bg-neutral-50` |
| **Badge** | `bg-green-700` | `bg-red-700` | `bg-yellow-600` | `bg-blue-700` | `bg-neutral-700` |
| **Input** | `border-green-300` | `border-red-300` | `border-yellow-300` | `border-blue-300` | `border-neutral-300` |

## 🔄 Deprecated Colors → New Colors

### Replace These Colors:

| ❌ Deprecated | ✅ Use Instead | Why |
|--------------|----------------|-----|
| `sky-*` | `blue-*` | Redundant blue scale |
| `indigo-*` | `blue-*` or `purple-*` | Redundant, use based on context |
| `emerald-*` | `green-*` | Use success (green) instead |
| `teal-*` | `green-*` or `primary-*` | Merged with success/primary |
| `amber-*` | `yellow-*` or `orange-*` | Merged with warning |
| `rose-*` | `red-*` | Use error (red) instead |
| `pink-*` | `purple-*` | Use secondary (purple) |
| `cyan-*` | `blue-*` | Use info (blue) instead |

## 📝 Migration Examples

### Example 1: Button

**Before:**
```tsx
<button className="bg-emerald-600 text-white hover:bg-emerald-700">
  Submit
</button>
```

**After:**
```tsx
<button className={getColorClasses('success', 'button')}>
  Submit
</button>
```

### Example 2: Alert

**Before:**
```tsx
<div className="bg-rose-50 border-rose-200 text-rose-700">
  Error message
</div>
```

**After:**
```tsx
<div className={getColorClasses('error', 'alert')}>
  Error message
</div>
```

### Example 3: Badge

**Before:**
```tsx
<span className="bg-cyan-600 text-white px-2 py-1 rounded">
  New
</span>
```

**After:**
```tsx
<span className={`px-2 py-1 rounded-full ${getColorClasses('info', 'badge')}`}>
  New
</span>
```

## 🛠️ Available Utilities

```typescript
import {
  getColorClasses,           // Get pre-defined Tailwind classes
  getColorScale,            // Get color scale name
  getTextColorForBackground, // Auto text color based on bg
  isDarkColor,             // Check if color is dark
  migrateColorScale         // Migrate deprecated colors
} from '@/config/colors';
```

### `getColorClasses(purpose, usage)`

Get pre-defined Tailwind classes for semantic colors.

```tsx
// Usage
const classes = getColorClasses('success', 'button');
// Returns: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/50'
```

**Available Purposes:**
- `'primary'` - Main actions
- `'success'` - Success states
- `'error'` - Errors
- `'warning'` - Warnings
- `'info'` - Information
- `'neutral'` - Neutral/default
- `'secondary'` - Secondary/AI features

**Available Usages:**
- `'background'` - Background colors
- `'text'` - Text colors
- `'border'` - Border colors
- `'button'` - Button styles with hover/focus
- `'badge'` - Badge backgrounds
- `'alert'` - Alert styles with borders

## ✅ Best Practices

### DO:

```tsx
// ✅ Use semantic colors
<button className={getColorClasses('success', 'button')}>
  Save
</button>

// ✅ Use semantic variants
<Alert variant="success">Success message</Alert>

// ✅ Provide visual indicators beyond color
<div className="flex items-center gap-2 text-green-600">
  <CheckIcon />
  <span>Success</span>
</div>
```

### DON'T:

```tsx
// ❌ Use deprecated colors
<button className="bg-emerald-600">
  Save
</button>

// ❌ Use colors that don't match meaning
<Alert variant="success" title="Error">...</Alert>

// ❌ Rely on color alone
<div className="text-green-600">
  Success
</div>
```

## 📦 Component Examples

### Button Component

```tsx
interface ButtonProps {
  variant: 'primary' | 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant, children }) => {
  return (
    <button className={`px-4 py-2 rounded-lg ${getColorClasses(variant, 'button')}`}>
      {children}
    </button>
  );
};
```

### Alert Component

```tsx
interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ variant, title, children }) => {
  const alertClasses = getColorClasses(variant, 'alert');
  const iconBg = getColorClasses(variant, 'background');

  return (
    <div className={`p-4 rounded-lg ${alertClasses}`} role="alert">
      <div className={`flex items-start gap-3`}>
        <div className={`w-6 h-6 rounded-lg ${iconBg}`}>
          {variant === 'success' && '✓'}
          {variant === 'error' && '✕'}
          {variant === 'warning' && '⚠'}
          {variant === 'info' && 'ℹ'}
        </div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm">{children}</p>
        </div>
      </div>
    </div>
  );
};
```

### Status Badge Component

```tsx
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusToColor = {
    active: 'success',
    inactive: 'neutral',
    pending: 'warning',
    error: 'error',
    success: 'success',
  } as const;

  const variant = statusToColor[status] as 'success' | 'error' | 'warning' | 'neutral';
  const badgeClasses = getColorClasses(variant, 'badge');

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${badgeClasses}`}>
      {status}
    </span>
  );
};
```

## 🎯 Color Usage Guidelines

### When to Use Each Color:

| Color | Use Cases |
|-------|-----------|
| **Primary** (green-teal) | Main CTAs, branding, primary actions |
| **Success** (green) | Success messages, completion states, positive feedback |
| **Error** (red) | Errors, delete actions, failure states, destructive actions |
| **Warning** (yellow/orange) | Warnings, cautions, pending states, important info |
| **Info** (blue) | Informational messages, guidance, help text, links |
| **Secondary** (purple) | AI features, decorative elements, secondary branding |
| **Neutral** (gray) | Default states, text, borders, backgrounds |

## 🌓 Dark Mode Support

All colors automatically support dark mode:

```tsx
// Light mode: bg-green-50, Dark mode: bg-green-900/20
<div className={getColorClasses('success', 'background')}>
  Success message
</div>

// Light mode: text-green-700, Dark mode: text-green-300
<div className={getColorClasses('success', 'text')}>
  Success text
</div>
```

## ♿ Accessibility

- ✅ WCAG 2.1 AA compliance for all color combinations
- ✅ High contrast mode support
- ✅ Never rely on color alone for information
- ✅ Always pair colors with icons and text
- ✅ Ensure sufficient contrast ratios (4.5:1 minimum)

## 📚 Documentation

- **Complete Color Palette**: [docs/COLOR_PALETTE.md](./COLOR_PALETTE.md)
- **Configuration**: [src/config/colors.ts](../src/config/colors.ts)

## 🤝 Support

For questions or issues:
1. Check [COLOR_PALETTE.md](./COLOR_PALETTE.md) for complete color reference
2. Ensure you're using semantic colors (see mapping above)
3. Verify dark mode support with `dark:` prefixes

---

**Last Updated**: 2026-01-13
**Version**: 1.0.0
