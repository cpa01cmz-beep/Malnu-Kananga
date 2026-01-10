# Gradient Configuration System

**Created**: 2026-01-07
**Version**: 1.0.0
**Status**: Active

## Overview

The Gradient Configuration System provides a centralized, maintainable approach to gradient usage across the MA Malnu Kananga application. It eliminates code duplication and ensures visual consistency.

## Features

- **Centralized Configuration**: All gradient definitions in one location
- **Type Safety**: Full TypeScript support with proper interfaces
- **Reusable Patterns**: Common gradients available as named constants
- **Dark Mode Support**: Dedicated dark mode gradient classes
- **Card Integration**: Works seamlessly with Card component gradient variant

## File Structure

```
src/config/
└── gradients.ts          # Centralized gradient definitions
```

## Gradient Categories

### PRIMARY Gradients
- `PRIMARY` - Main brand gradient (500-600)
- `PRIMARY_LIGHT` - Light variant (100-200)
- `PRIMARY_SUBTLE` - Subtle background (50-100/50)

### NEUTRAL Gradients
- `NEUTRAL` - Light neutral background (50-100/80)
- `NEUTRAL_DARK` - Dark neutral background (800-800/80)

### BLUE Gradients
- `BLUE_MAIN` - Blue to indigo (500-indigo-600)
- `BLUE_LIGHT` - Light blue (100-200)
- `BLUE_SOFT` - Soft blue background (100-200/50)

### GREEN Gradients
- `GREEN_MAIN` - Green to emerald (500-emerald-600)
- `GREEN_LIGHT` - Light green (100-200)
- `GREEN_SOFT` - Soft green background (50-emerald-50)
- `GREEN_TEAL` - Green to teal (500-teal-600)

### PURPLE Gradients
- `PURPLE_MAIN` - Purple to pink (500-pink-600)
- `PURPLE_LIGHT` - Light purple (100-200)
- `PURPLE_SOFT` - Soft purple background (50-pink-50)

### ORANGE Gradients
- `ORANGE_MAIN` - Orange to red (500-red-600)
- `ORANGE_LIGHT` - Light orange (100-200)
- `ORANGE_SOFT` - Soft orange background (50-red-50)

### INDIGO Gradients
- `INDIGO_MAIN` - Indigo to purple (500-purple-600)
- `INDIGO_LIGHT` - Light indigo (100-200)

### BACKGROUND Gradients
- `HERO` - Hero section background with via colors
- `HERO_DECORATIVE` - Hero section radial gradient overlay (decorative)
- `SECTION` - Standard section background (white to neutral)
- `SECTION_ALT` - Alternate section background

## Usage

### Basic Class Import

```tsx
import { getGradientClass } from '../config/gradients';

// Direct usage in className
<div className={getGradientClass('PRIMARY')}>
  Content with primary gradient
</div>

// With dark mode support
<div className={`${getGradientClass('BLUE_SOFT')} ${DARK_GRADIENT_CLASSES.BLUE_SOFT}`}>
  Gradient with dark mode variant
</div>
```

### Card Component Integration

```tsx
import Card from './ui/Card';
import { GRADIENTS } from '../config/gradients';

// Using gradient config object
<Card
  variant="gradient"
  gradient={GRADIENTS.PRIMARY.main}
  padding="lg"
>
  <h2>Featured Card</h2>
  <p>Beautiful gradient background</p>
</Card>

// With custom gradient
<Card
  variant="gradient"
  gradient={{
    from: 'from-blue-500',
    to: 'to-purple-600',
    text: 'light'
  }}
  padding="md"
>
  Custom gradient card
</Card>
```

### Dark Mode Support

```tsx
import { getGradientClass, DARK_GRADIENT_CLASSES } from '../config/gradients';

// Light mode + dark mode gradient
<button className={`${getGradientClass('ORANGE_SOFT')} ${DARK_GRADIENT_CLASSES.ORANGE_SOFT}`}>
  Button with dark mode variant
</button>

// Background sections
<section className={`${getGradientClass('SECTION')} ${DARK_GRADIENT_CLASSES.SECTION}`}>
  <h2>Section Title</h2>
</section>
```

## Available Constants

### GRADIENT_CLASSES
```typescript
{
  PRIMARY: string,
  PRIMARY_LIGHT: string,
  PRIMARY_SUBTLE: string,
  NEUTRAL: string,
  NEUTRAL_DARK: string,
  BLUE_MAIN: string,
  BLUE_LIGHT: string,
  BLUE_SOFT: string,
  GREEN_MAIN: string,
  GREEN_LIGHT: string,
  GREEN_SOFT: string,
  GREEN_TEAL: string,
  PURPLE_MAIN: string,
  PURPLE_LIGHT: string,
  PURPLE_SOFT: string,
  ORANGE_MAIN: string,
  ORANGE_LIGHT: string,
  ORANGE_SOFT: string,
  INDIGO_MAIN: string,
  INDIGO_LIGHT: string,
  HERO: string,
  HERO_DECORATIVE: string,
  SECTION: string,
  SECTION_ALT: string
}
```

### DARK_GRADIENT_CLASSES
```typescript
{
  HERO: string,
  HERO_DECORATIVE: string,
  SECTION: string,
  SECTION_ALT: string,
  PRIMARY_LIGHT: string,
  NEUTRAL: string,
  BLUE_SOFT: string,
  GREEN_SOFT: string,
  PURPLE_SOFT: string,
  ORANGE_SOFT: string
}
```

### GRADIENTS (Config Objects)
```typescript
{
  PRIMARY: {
    main: GradientConfig,
    light: GradientConfig,
    subtle: GradientConfig
  },
  NEUTRAL: {
    main: GradientConfig,
    dark: GradientConfig
  },
  BLUE: {
    main: GradientConfig,
    light: GradientConfig,
    soft: GradientConfig
  },
  // ... other colors
  BACKGROUND: {
    hero: GradientConfig,
    section: GradientConfig,
    sectionAlt: GradientConfig
  }
}
```

## Helper Functions

### getGradientClass(key: string): string

Returns a gradient class string from GRADIENT_CLASSES.

```tsx
const gradientClass = getGradientClass('PRIMARY_MAIN');
// Returns: "bg-gradient-to-br from-green-500 to-emerald-600"
```

### getGradientConfig(config: GradientConfig): string

Builds a gradient class string from a GradientConfig object.

```tsx
const gradient = getGradientConfig({
  from: 'from-blue-500',
  to: 'to-purple-600',
  direction: 'to-br',
  text: 'light'
});
// Returns: "bg-gradient-to-br from-blue-500 to-purple-600"
```

## Migration Guide

### Before (Hardcoded Gradients)

```tsx
// ❌ Before: Hardcoded gradient
<div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6">
  Content
</div>

<div className="bg-gradient-to-br from-blue-100 to-blue-200/50 dark:from-blue-900/30 dark:to-blue-800/30">
  Soft background
</div>
```

### After (Gradient Configuration)

```tsx
// ✅ After: Centralized gradient
import { getGradientClass, DARK_GRADIENT_CLASSES } from '../config/gradients';

<div className={`${getGradientClass('PRIMARY')} rounded-xl p-6`}>
  Content
</div>

<div className={`${getGradientClass('BLUE_SOFT')} ${DARK_GRADIENT_CLASSES.BLUE_SOFT}`}>
  Soft background
</div>
```

## Best Practices

### 1. Use Named Constants
```tsx
// ✅ Good: Named constant
className={getGradientClass('PRIMARY')}

// ❌ Avoid: Hardcoded
className="bg-gradient-to-br from-primary-500 to-primary-600"
```

### 2. Always Include Dark Mode for Soft Gradients
```tsx
// ✅ Good: With dark mode
className={`${getGradientClass('BLUE_SOFT')} ${DARK_GRADIENT_CLASSES.BLUE_SOFT}`}

// ⚠️ Acceptable: Light mode only (if no dark variant needed)
className={getGradientClass('PRIMARY')}
```

### 3. Use Card Component for Interactive Elements
```tsx
// ✅ Good: Card with gradient variant
<Card
  variant="gradient"
  gradient={GRADIENTS.PRIMARY.main}
  onClick={handleClick}
>
  Interactive gradient card
</Card>

// ⚠️ Acceptable: Direct div for non-interactive
<div className={getGradientClass('PRIMARY')}>
  Static gradient background
</div>
```

### 4. Choose Appropriate Gradient Intensity
```tsx
// Hero/CTA: Main gradient (strongest)
getGradientClass('PRIMARY')

// Background cards: Light gradient
getGradientClass('PRIMARY_LIGHT')

// Section backgrounds: Subtle gradient
getGradientClass('PRIMARY_SUBTLE')

// Stats cards: Main gradients
getGradientClass('BLUE_MAIN')
getGradientClass('GREEN_MAIN')
getGradientClass('PURPLE_MAIN')
```

## Components Using Gradient System

- ✅ **Header** - Logo gradient (PRIMARY)
- ✅ **LoginModal** - Demo section gradient (NEUTRAL)
- ✅ **ProgressAnalytics** - Stats cards (GREEN_MAIN, BLUE_MAIN, PURPLE_MAIN, PURPLE_SOFT)
- ✅ **StudentPortal** - OSIS button gradient (ORANGE_SOFT)
- ✅ **AdminDashboard** - Action cards (INDIGO_MAIN, GREEN_TEAL, PURPLE_MAIN)
- ✅ **HeroSection** - Hero background (HERO) and decorative radial overlay (HERO_DECORATIVE)

## Future Enhancements

Potential improvements to consider:

1. **Animated Gradients**: Add CSS animation support
2. **Gradient Presets**: Additional themed gradient sets
3. **Custom Builder**: Helper function to create custom gradients
4. **CSS Variables**: Convert some gradients to CSS custom properties
5. **Gradient Overlays**: Add overlay gradient utilities for images

## Testing

Test gradient configurations with:

```bash
# Run linting
npm run lint

# Check TypeScript types
npm run typecheck

# Run component tests
npm test
```

## Contributing

When adding new gradients:

1. Update `GRADIENTS` config object with proper TypeScript types
2. Add to `GRADIENT_CLASSES` if commonly used
3. Add dark mode variant to `DARK_GRADIENT_CLASSES` if needed
4. Update this documentation
5. Test in both light and dark modes

---

**Last Updated**: 2026-01-10
**Version**: 1.1.0
**Status**: Active
