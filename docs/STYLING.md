# Styling System Documentation

**Created**: 2026-01-13
**Version**: 1.0.0

## Overview

The Styling System provides centralized, type-safe configuration for common UI styling patterns. This ensures consistency across the application and makes it easy to update styling globally.

## Usage

```typescript
import { getShadow, getRadius, getSurface, getBorder, getContainer } from '../config/styling';

// Use shadow tokens
<div className={getShadow('CARD')} />

// Use radius tokens
<div className={getRadius('XL')} />

// Use surface patterns
<div className={getSurface('CARD')} />

// Use border patterns
<div className={getBorder('DEFAULT')} />

// Use complete container patterns
<div className={getContainer('CARD')}>
```

## Configuration

### Shadows

| Key | Tailwind Class | Description |
|-----|---------------|-------------|
| NONE | shadow-none | No shadow |
| SM | shadow-sm | Small shadow |
| MD | shadow-md | Medium shadow |
| LG | shadow-lg | Large shadow |
| XL | shadow-xl | Extra large shadow |
| INNER | shadow-inner | Inner shadow |
| CARD | shadow-sm | Card shadow (same as SM) |
| CARD_HOVER | shadow-md | Card hover state |
| FLOAT | shadow-lg | Floating element shadow |

### Radius (Border Radius)

| Key | Tailwind Class | Description |
|-----|---------------|-------------|
| NONE | rounded-none | No radius |
| SM | rounded-sm | Small radius |
| MD | rounded-md | Medium radius |
| LG | rounded-lg | Large radius |
| XL | rounded-xl | Extra large radius |
| 2XL | rounded-2xl | 2x extra large radius |
| 3XL | rounded-3xl | 3x extra large radius |
| FULL | rounded-full | Full circle |
| TL | rounded-tl | Top-left only |
| TR | rounded-tr | Top-right only |
| BL | rounded-bl | Bottom-left only |
| BR | rounded-br | Bottom-right only |
| T | rounded-t | Top only |
| B | rounded-b | Bottom only |
| L | rounded-l | Left only |
| R | rounded-r | Right only |

### Surfaces (Background Colors)

| Key | Tailwind Class | Description |
|-----|---------------|-------------|
| DEFAULT | bg-white dark:bg-neutral-800 | Default surface |
| CARD | bg-white dark:bg-neutral-800 | Card background |
| MODAL | bg-white dark:bg-neutral-800 | Modal background |
| DROPDOWN | bg-white dark:bg-neutral-800 | Dropdown background |
| INPUT | bg-white dark:bg-neutral-800 | Input background |

### Borders

| Key | Tailwind Class | Description |
|-----|---------------|-------------|
| DEFAULT | border border-neutral-200 dark:border-neutral-700 | Default border |
| CARD | border border-neutral-200 dark:border-neutral-700 | Card border |
| MODAL | border border-neutral-200 dark:border-neutral-700 | Modal border |
| INPUT | border border-neutral-200 dark:border-neutral-700 | Input border |
| LIGHT | border-neutral-200 dark:border-neutral-700 | Light border (no default) |
| HEAVY | border-2 border-neutral-300 dark:border-neutral-600 | Heavy border (2px) |

### Containers (Complete Card Patterns)

| Key | Tailwind Class | Description |
|-----|---------------|-------------|
| CARD | bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 | Standard card |
| CARD_XL | bg-white dark:bg-neutral-800 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 | Extra large card |
| CARD_LG | bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 | Large card |
| CARD_MD | bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-700 | Medium card |
| CARD_SM | bg-white dark:bg-neutral-800 rounded-md shadow-sm border border-neutral-100 dark:border-neutral-700 | Small card |
| CARD_GRADIENT | rounded-2xl p-6 text-white shadow-lg | Gradient card (surface only) |
| CARD_GRADIENT_LG | rounded-xl p-6 text-white shadow-card transition-all duration-200 ease-out | Large gradient card (surface only) |

## TypeScript Types

All configuration keys are type-safe:

```typescript
import { ShadowKey, RadiusKey, SurfaceKey, BorderKey, ContainerKey } from '../config/styling';

const shadowKey: ShadowKey = 'CARD'; // Valid
const radiusKey: RadiusKey = 'XL'; // Valid
const surfaceKey: SurfaceKey = 'CARD'; // Valid
const borderKey: BorderKey = 'DEFAULT'; // Valid
const containerKey: ContainerKey = 'CARD'; // Valid

// TypeScript will error for invalid keys
const invalid: ShadowKey = 'INVALID'; // Error: Type '"INVALID"' is not assignable to type 'ShadowKey'
```

## Migration Guide

### Before (Hardcoded)

```typescript
<div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
  Content
</div>
```

### After (Centralized)

```typescript
<div className={getContainer('CARD')}>
  Content
</div>
```

Or with more control:

```typescript
<div className={`${getSurface('CARD')} ${getRadius('2XL')} ${getShadow('CARD')} ${getBorder('DEFAULT')}`}>
  Content
</div>
```

## Best Practices

1. **Use Container Patterns**: Prefer `getContainer('CARD')` over individual tokens for standard cards
2. **Consistent Naming**: Follow the same naming conventions as other design system tokens (e.g., `getShadow`, `getRadius`)
3. **Type Safety**: Always use the getter functions rather than accessing the object directly
4. **Dark Mode Support**: All surface and border patterns include dark mode variants
5. **Accessibility**: Ensure contrast ratios meet WCAG 2.1 AA standards when using colors

## Benefits

- **Consistency**: Standardized styling across all components
- **Maintainability**: Update styling globally by changing one configuration
- **Type Safety**: TypeScript prevents typos and invalid values
- **Developer Experience**: Auto-completion and IDE support
- **Dark Mode**: Built-in support for light/dark themes
- **Scalability**: Easy to add new styling tokens

## Related Systems

- **Dimensions**: `src/config/dimensions.ts` - Size and spacing tokens
- **Gradients**: `src/config/gradients.ts` - Gradient patterns
- **Colors**: `src/index.css` - Color system with ThemeManager

## Future Enhancements

- [ ] Add animation tokens
- [ ] Add spacing tokens (margin/padding)
- [ ] Add typography tokens (font sizes, weights, line heights)
- [ ] Add transition tokens (duration, easing)
- [ ] Create responsive variant helpers
- [ ] Add hover/focus state tokens
