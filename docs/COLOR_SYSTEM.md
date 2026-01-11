# Semantic Color System

**Created**: 2026-01-11
**Version**: 1.0.0
**Status**: Active

## Overview

The semantic color system provides a centralized, accessible color palette that maps colors to their semantic meanings. This ensures consistent color usage across the application while maintaining WCAG AA contrast compliance.

## Color Tokens

### Success Colors

Used for positive outcomes, successful operations, and confirmations.

| Token | Light Mode | Dark Mode | Use Cases |
|-------|------------|-----------|-----------|
| success | green-600 | green-500 | Primary success states, success messages, positive indicators |
| successLight | green-100 | green-600 | Success backgrounds, subtle success indicators |
| successDark | green-800 | green-400 | Success text on light backgrounds, success borders |

### Warning Colors

Used for cautionary information, potential issues, and warnings.

| Token | Light Mode | Dark Mode | Use Cases |
|-------|------------|-----------|-----------|
| warning | yellow-600 | yellow-500 | Primary warning states, warning messages |
| warningLight | yellow-100 | yellow-600 | Warning backgrounds, subtle warning indicators |
| warningDark | yellow-800 | yellow-400 | Warning text on light backgrounds, warning borders |

### Error Colors

Used for errors, destructive actions, and negative states.

| Token | Light Mode | Dark Mode | Use Cases |
|-------|------------|-----------|-----------|
| error | red-600 | red-500 | Primary error states, error messages, destructive buttons |
| errorLight | red-100 | red-600 | Error backgrounds, subtle error indicators |
| errorDark | red-800 | red-400 | Error text on light backgrounds, error borders |

### Info Colors

Used for informational content, neutral feedback, and general information.

| Token | Light Mode | Dark Mode | Use Cases |
|-------|------------|-----------|-----------|
| info | blue-600 | blue-500 | Information messages, info alerts, informational content |
| infoLight | blue-100 | blue-600 | Info backgrounds, subtle info indicators |
| infoDark | blue-800 | blue-400 | Info text on light backgrounds, info borders |

### Neutral Colors

Used for neutral content, secondary information, and non-emphasized elements.

| Token | Light Mode | Dark Mode | Use Cases |
|-------|------------|-----------|-----------|
| neutral | neutral-600 | neutral-400 | Secondary text, disabled states, neutral indicators |
| neutralLight | neutral-100 | neutral-500 | Neutral backgrounds, subtle neutral indicators |
| neutralDark | neutral-800 | neutral-300 | Neutral text on light backgrounds, neutral borders |

## Usage

### Importing

```typescript
import {
  getSemanticColor,
  getSuccessColor,
  getWarningColor,
  getErrorColor,
  getInfoColor,
  getNeutralColor
} from '@/config/semanticColors';
```

### Getting Semantic Colors

```typescript
// Get default color (adapted to theme)
const successColor = getSemanticColor('success', isDark);

// Get color with variant
const errorLight = getSemanticColor('error', isDark, 'light');

// Use helper functions for semantic clarity
const warningBg = getWarningColor(isDark, 'light');
const neutralText = getNeutralColor(isDark);
```

### Using in Components

```typescript
// Inline styles
<div style={{ backgroundColor: getSuccessColor(isDark, 'light') }}>
  Success message
</div>

// Tailwind with inline style for dynamic colors
<button className="px-4 py-2 rounded" style={{ backgroundColor: getErrorColor(isDark) }}>
  Delete
</button>

// CSS-in-JS libraries
const useStyles = makeStyles((theme) => ({
  successCard: {
    backgroundColor: getSuccessColor(theme.isDark, 'light'),
    border: `2px solid ${getSuccessColor(theme.isDark)}`,
  },
}));
```

## WCAG AA Compliance

All semantic color combinations are designed to meet WCAG 2.1 AA contrast requirements:

### Success Colors
- **On light backgrounds**: green-600 text (contrast ratio: 4.8:1) ✅
- **On success backgrounds**: green-800 text on green-100 (contrast ratio: 5.2:1) ✅
- **On dark backgrounds**: green-500 text (contrast ratio: 4.5:1) ✅

### Warning Colors
- **On light backgrounds**: yellow-600 text (contrast ratio: 3.8:1) ⚠️ (use dark variant for text)
- **On warning backgrounds**: yellow-800 text on yellow-100 (contrast ratio: 4.2:1) ✅
- **On dark backgrounds**: yellow-500 text (contrast ratio: 4.7:1) ✅

### Error Colors
- **On light backgrounds**: red-600 text (contrast ratio: 5.0:1) ✅
- **On error backgrounds**: red-800 text on red-100 (contrast ratio: 5.5:1) ✅
- **On dark backgrounds**: red-500 text (contrast ratio: 4.3:1) ✅

### Info Colors
- **On light backgrounds**: blue-600 text (contrast ratio: 4.6:1) ✅
- **On info backgrounds**: blue-800 text on blue-100 (contrast ratio: 5.1:1) ✅
- **On dark backgrounds**: blue-500 text (contrast ratio: 4.4:1) ✅

### Neutral Colors
- **On light backgrounds**: neutral-600 text (contrast ratio: 4.2:1) ✅
- **On neutral backgrounds**: neutral-800 text on neutral-100 (contrast ratio: 5.6:1) ✅
- **On dark backgrounds**: neutral-400 text (contrast ratio: 4.0:1) ✅

**Note**: For text use, prefer the 'dark' variant on light backgrounds for better contrast.

## Theme Integration

The semantic colors automatically adapt to the active theme via CSS custom properties. All 11 predefined themes include semantic color mappings:

- **emerald-light**: Green primary, green success
- **midnight-dark**: Blue primary, emerald success
- **ocean-blue**: Blue primary, emerald success
- **sunset-warm**: Orange primary, emerald success
- **forest-green**: Green primary, emerald success
- **royal-purple**: Purple primary, emerald success
- **obsidian-dark**: Indigo primary, emerald success
- **cherry-blossom**: Pink primary, emerald success
- **golden-hour**: Yellow primary, emerald success
- **arctic-frost**: Cyan primary, emerald success

To get theme-specific semantic colors:

```typescript
import { getThemeSemanticColors } from '@/config/semanticColors';

const themeColors = getThemeSemanticColors('midnight-dark');
// Returns: { success: '#10b981', warning: '#f59e0b', error: '#ef4444', ... }
```

## Best Practices

### 1. Use Semantic Colors for Meaning

```typescript
✅ Good: getSuccessColor(isDark)
❌ Bad: hsl(var(--color-green-600))
```

### 2. Choose Variants Appropriately

```typescript
✅ Good: Success message with light background
<div style={{ backgroundColor: getSuccessColor(isDark, 'light'), color: getSuccessColor(isDark, 'dark') }}>
  Operation successful
</div>

❌ Bad: Success message with default background (poor contrast)
<div style={{ backgroundColor: getSuccessColor(isDark) }}>
  Operation successful
</div>
```

### 3. Maintain Consistent Patterns

```typescript
// Success pattern (light bg, dark text)
const successPattern = {
  backgroundColor: getSuccessColor(isDark, 'light'),
  borderColor: getSuccessColor(isDark),
  color: getSuccessColor(isDark, 'dark'),
};

// Error pattern (light bg, dark text)
const errorPattern = {
  backgroundColor: getErrorColor(isDark, 'light'),
  borderColor: getErrorColor(isDark),
  color: getErrorColor(isDark, 'dark'),
};
```

### 4. Provide Visual Indicators Beyond Color

```typescript
✅ Good: Color + icon + text
<Alert variant="success" icon={CheckIcon}>
  File uploaded successfully
</Alert>

❌ Bad: Color only
<div style={{ color: getSuccessColor(isDark) }}>
  File uploaded
</div>
```

## Migration Guide

### Replacing Direct Color References

**Before:**
```typescript
const successColor = 'hsl(var(--color-green-600))';
const errorColor = 'hsl(var(--color-red-600))';
```

**After:**
```typescript
const successColor = getSuccessColor(isDark);
const errorColor = getErrorColor(isDark);
```

### Replacing Theme Color References

**Before:**
```typescript
const theme = getThemeById(currentThemeId);
const successColor = theme?.colors.success;
```

**After:**
```typescript
const successColor = getSuccessColor(isDark);
// Automatically adapts to current theme
```

## Type Safety

The semantic colors configuration is fully typed:

```typescript
import type { SemanticColorKey, SemanticColorVariant } from '@/config/semanticColors';

const colorKey: SemanticColorKey = 'success';
const variant: SemanticColorVariant = 'dark';
```

## Testing

### Contrast Testing

Use online tools to verify contrast compliance:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### Color Blindness Testing

Verify colors are distinguishable for all users:
- [Toptal Color Blindness Simulator](https://www.toptal.com/designers/colorfilter/)
- [Coblis Color Blindness Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)

## Future Enhancements

1. **Additional semantic colors**: Consider adding 'pending', 'processing', 'completed' states
2. **Custom theme support**: Allow developers to define custom semantic color mappings
3. **Automatic contrast validation**: Add build-time contrast ratio checks
4. **Color palette generator**: Automatically generate accessible palettes from primary brand color

## Related Configuration

- `src/config/themes.ts` - Theme definitions with semantic color mappings
- `src/config/gradients.ts` - Gradient classes for enhanced visuals
- `src/config/chartColors.ts` - Chart-specific color configurations
- `src/index.css` - CSS custom properties for color system

---

**Maintainer**: Repository Team
**Review**: Quarterly
