# ProgressBar Component

## Overview

The ProgressBar component is a reusable UI component for displaying progress indicators across the application. It eliminates inline style duplication and provides consistent styling, accessibility, and theming support.

## Features

- **Multiple Sizes**: sm (1.5rem), md (2rem), lg (2.5rem), xl (6rem)
- **12 Color Options**: primary, secondary, success, error, warning, info, purple, indigo, orange, red, blue, green
- **3 Variants**: default, striped, animated
- **Full Dark Mode Support**: Automatic theme-aware coloring
- **Accessibility**: Full ARIA support (role="progressbar", aria-label, aria-valuenow, aria-valuemin, aria-valuemax)
- **Flexible Width**: Full width or preset widths based on size
- **Label Display**: Optional text overlay for xl size
- **Percentage Clamping**: Automatically clamps values between 0-100%

## Usage

### Basic Usage

```tsx
import ProgressBar from './ui/ProgressBar';

<ProgressBar value={50} />
```

### With Custom Colors

```tsx
<ProgressBar value={75} color="success" />
<ProgressBar value={25} color="error" />
<ProgressBar value={60} color="warning" />
```

### Different Sizes

```tsx
<ProgressBar value={50} size="sm" />
<ProgressBar value={50} size="md" />
<ProgressBar value={50} size="lg" />
<ProgressBar value={50} size="xl" />
```

### With Label (xl size only)

```tsx
<ProgressBar
  value={75}
  size="xl"
  showLabel={true}
  label="75% Complete"
/>
```

### Striped and Animated Variants

```tsx
<ProgressBar value={50} variant="striped" />
<ProgressBar value={50} variant="animated" />
```

### Fixed Width (not full width)

```tsx
<ProgressBar value={50} fullWidth={false} size="md" />
```

### Custom Max Value

```tsx
<ProgressBar value={5} max={10} />
```

### Accessibility

```tsx
<ProgressBar
  value={50}
  aria-label="Upload progress"
  aria-valuenow={50}
  aria-valuemin={0}
  aria-valuemax={100}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| `value` | `number` | **required** | Current progress value |
| `max` | `number` | `100` | Maximum value for percentage calculation |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Height and width of the progress bar |
| `color` | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'purple' \| 'indigo' \| 'orange' \| 'red' \| 'blue' \| 'green'` | `'primary'` | Fill color of the progress bar |
| `variant` | `'default' \| 'striped' \| 'animated'` | `'default'` | Visual style variant |
| `showLabel` | `boolean` | `false` | Whether to show label overlay (only for xl size) |
| `label` | `string` | `undefined` | Custom label text to display |
| `fullWidth` | `boolean` | `true` | Whether the progress bar should use full width |
| `className` | `string` | `''` | Additional CSS classes to apply to container |
| `aria-label` | `string` | `undefined` | Accessibility label for screen readers |
| `aria-valuenow` | `number` | `undefined` (uses value) | Current ARIA value |
| `aria-valuemin` | `number` | `0` | Minimum ARIA value |
| `aria-valuemax` | `number` | `100` | Maximum ARIA value |

## Size Dimensions

| Size | Height | Default Width (fullWidth=false) |
|-------|--------|-------------------------------|
| `sm` | 1.5rem (24px) | 4rem (64px) |
| `md` | 2rem (32px) | 5rem (80px) |
| `lg` | 2.5rem (40px) | 6rem (96px) |
| `xl` | 6rem (96px) | full width |

## Color Options

All colors support dark mode automatically:
- **primary**: Theme primary color (green by default)
- **secondary**: Neutral gray
- **success**: Green for completed/success states
- **error**: Red for error/failure states
- **warning**: Yellow/orange for warning states
- **info**: Blue for informational states
- **purple**: Purple accent color
- **indigo**: Indigo accent color
- **orange**: Orange accent color
- **red**: Red accent color
- **blue**: Blue accent color (no dark mode variant)
- **green**: Green accent color (no dark mode variant)

## Accessibility

The ProgressBar component is WCAG 2.1 AA compliant:

- **Role**: Uses `role="progressbar"` for proper screen reader announcement
- **Labels**: Supports `aria-label` or uses `label` prop as fallback
- **Values**: Properly sets `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- **Keyboard**: No keyboard interaction required (read-only)
- **Contrast**: All color combinations meet WCAG AA contrast requirements
- **Focus**: No focus indicators needed (non-interactive)

## Examples

### File Upload Progress

```tsx
<ProgressBar
  value={uploadProgress}
  size="lg"
  color="success"
  aria-label="Upload progress"
/>
```

### Grade Distribution

```tsx
<ProgressBar
  value={percentage}
  max={100}
  size="xl"
  color={gradeColor}
  showLabel={true}
  label={`${count} students (${percentage.toFixed(1)}%)`}
  aria-label={`Grade ${grade}: ${count} students`}
/>
```

### OCR Processing

```tsx
<ProgressBar
  value={ocrProgress}
  size="sm"
  color="blue"
  aria-label="OCR processing progress"
/>
```

### Analytics Bar

```tsx
<ProgressBar
  value={stat.downloads}
  max={Math.max(...allStats.map(s => s.downloads))}
  size="sm"
  color="blue"
  fullWidth={false}
  aria-label={`Daily downloads: ${stat.downloads}`}
/>
```

## Migration Guide

If you're currently using inline progress bars:

**Before:**
```tsx
<div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
  <div
    className="bg-green-600 h-2 rounded-full transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

**After:**
```tsx
<ProgressBar
  value={progress}
  size="md"
  color="success"
/>
```

## Files Updated

This component refactored 15+ progress bar instances across 7 files:

1. `FileUpload.tsx` - Upload progress indicator
2. `NotificationAnalytics.tsx` - Role breakdown bars
3. `ProgressAnalytics.tsx` - Goal progress bars
4. `MaterialAnalytics.tsx` - Download/user stats bars (3 instances)
5. `ELibrary.tsx` - Reading progress and OCR progress (2 instances)
6. `GradingManagement.tsx` - Grade distribution and OCR progress (2 instances)
7. `OsisEvents.tsx` - Upload progress indicator

## Testing

Full test coverage in `src/components/ui/__tests__/ProgressBar.test.tsx`:
- Rendering tests
- Size variations
- Color options
- Width calculations
- Clamping behavior
- Accessibility attributes
- Variants (striped, animated)
- Label display
- Dark mode classes

## Browser Support

Works in all modern browsers that support:
- CSS custom properties (variables)
- CSS transitions
- CSS animations (for animated variant)
- ARIA attributes
