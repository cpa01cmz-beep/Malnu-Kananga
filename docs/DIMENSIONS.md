# Dimension System Documentation

**Created**: 2026-01-13
**Version**: 1.0.0
**Status**: Active

## Overview

The dimension system provides centralized, type-safe dimension utilities for consistent spacing, sizing, and layout across the application. Similar to the gradient system, it eliminates hardcoded arbitrary values and makes dimensions maintainable.

## Configuration

Location: `src/config/dimensions.ts`

### Available Dimensions

#### MIN_HEIGHT
- `TOUCH_TARGET`: `min-h-[44px]` - WCAG recommended touch target size
- `SMALL`: `min-h-[100px]` - Small content containers
- `MEDIUM`: `min-h-[200px]` - Medium content containers
- `LARGE`: `min-h-[400px]` - Large tables, lists, and scrollable areas
- `VIEWPORT`: `min-h-[90vh]` - Full viewport sections

#### MAX_HEIGHT
- `SMALL`: `max-h-[50vh]` - Small modals/scrollable areas
- `MEDIUM`: `max-h-[60vh]` - Medium scrollable areas
- `LARGE`: `max-h-[70vh]` - Large scrollable areas
- `XL`: `max-h-[80vh]` - XL scrollable areas
- `XXL`: `max-h-[90vh]` - XXL modals
- `FIXED_LARGE`: `max-h-[600px]` - Fixed large content height

#### MIN_WIDTH
- `SMALL`: `min-w-[120px]` - Small minimum width
- `MEDIUM`: `min-w-[200px]` - Medium minimum width

#### MAX_WIDTH
- `RESPONSIVE_MD`: `max-w-[80%]` - Responsive max width
- `RESPONSIVE_LG`: `max-w-[85%]` - Responsive max width

## Usage

### Import

```typescript
import { getMinHeight, getMaxHeight, getMinWidth, getMaxWidth } from '../config/dimensions';
```

### Examples

```tsx
// Touch target height (WCAG compliant)
<button className={`${getMinHeight('TOUCH_TARGET')} px-4 py-2`}>
  Click Me
</button>

// Modal with scrollable content
<div className={`${getMaxHeight('LARGE')} overflow-y-auto`}>
  {/* Content */}
</div>

// Full viewport section
<section className={`${getMinHeight('VIEWPORT')} flex items-center`}>
  {/* Hero content */}
</section>

// Large data table
<div className={`bg-white rounded-lg p-4 ${getMinHeight('LARGE')}`}>
  <table>
    {/* Table content */}
  </table>
</div>
```

### With Template Literals

```tsx
<div className={`flex flex-col ${getMaxHeight('LARGE')} overflow-y-auto`}>
  {/* Content */}
</div>
```

## Refactoring Guide

When refactoring components to use the dimension system:

1. **Identify arbitrary dimension values**: Look for patterns like:
   - `min-h-[44px]` → `getMinHeight('TOUCH_TARGET')`
   - `min-h-[200px]` → `getMinHeight('MEDIUM')`
   - `min-h-[400px]` → `getMinHeight('LARGE')`
   - `max-h-[70vh]` → `getMaxHeight('LARGE')`
   - `max-h-[90vh]` → `getMaxHeight('XXL')`

2. **Add import**:
   ```typescript
   import { getMinHeight, getMaxHeight } from '../config/dimensions';
   ```

3. **Replace hardcoded values**:
   ```tsx
   // Before
   <div className="max-h-[70vh] overflow-y-auto">
   
   // After
   <div className={`${getMaxHeight('LARGE')} overflow-y-auto`}>
   ```

## Design Principles

### Touch Targets
- Minimum touch target: 44px (WCAG 2.1 AAA)
- Applied to buttons, inputs, interactive elements
- Ensures accessibility for touch users

### Viewport-based Heights
- Use viewport units (vh) for full-screen or large modal content
- Common values: 50vh, 60vh, 70vh, 80vh, 90vh
- Smaller values allow for context (header, footer)

### Content-based Heights
- Fixed pixel heights for tables, lists, data displays
- Ensures consistent layout across devices
- Combines well with overflow scrolling

### Minimum Widths
- Ensures content remains readable on small screens
- Prevents layout breaking on mobile devices
- Common for buttons, cards, interactive elements

## Migration Status

### Completed Refactors (2026-01-13)

1. **VoiceCommandsHelp.tsx**
   - Changed: `max-h-[50vh]` → `getMaxHeight('SMALL')`
   - Reason: Consistent modal scrollable height

2. **VoiceSettings.tsx**
   - Changed: `max-h-[70vh]` → `getMaxHeight('LARGE')`
   - Reason: Large modal with scrollable content

3. **LoadingOverlay.tsx**
   - Changed: `min-h-[200px]` → `getMinHeight('MEDIUM')`
   - Reason: Default loading overlay height

4. **PPDBManagement.tsx**
   - Changed: `min-h-[400px]` → `getMinHeight('LARGE')`
   - Reason: Large document preview area

5. **ChatWindow.tsx**
   - Changed: `min-h-[44px]` → `getMinHeight('TOUCH_TARGET')`
   - Reason: WCAG-compliant touch target for input

### Pending Refactors

Still using hardcoded dimensions (priority order):

High Priority:
- DocumentationPage.tsx: `max-h-[70vh]`
- NotificationHistory.tsx: `max-h-[90vh]`
- MaterialSharing.tsx: `max-h-[90vh]`
- LoginModal.tsx: `max-h-[90vh]`
- SiteEditor.tsx: `min-h-[44px]`, `h-[90vh]`
- MaterialUpload.tsx: `max-h-[600px]`
- ScheduleView.tsx: `min-h-[400px]`
- DataTable.tsx: `min-h-[400px]`
- ParentDashboard.tsx: `max-h-[80vh]`
- StudentInsights.tsx: `max-h-[80vh]`
- ParentScheduleView.tsx: `max-h-[80vh]`

Medium Priority:
- CalendarView.tsx: `min-h-[100px]`, `min-h-[60px]`
- GradingManagement.tsx: `max-h-[90vh]`
- ConflictResolutionModal.tsx: `max-h-[60vh]`
- PPDBRegistration.tsx: `max-h-[70vh]`
- MaterialSharing.tsx: `max-h-[90vh]`

Low Priority:
- App.tsx: `max-w-[85%]`, `max-w-[80%]`
- ChatWindow.tsx: `max-w-[85%]`, `max-w-[80%]`
- OfflineIndicator.tsx: `min-w-[120px]`, `min-w-[200px]`

## Benefits

1. **Consistency**: All components use same dimension values
2. **Maintainability**: Change in one place updates all components
3. **Type Safety**: TypeScript ensures correct dimension keys
4. **Accessibility**: Enforces WCAG touch target requirements
5. **Documentation**: Clear usage guidelines for developers

## Best Practices

1. **Always use dimension tokens** for common heights and widths
2. **Prefer viewport units** (vh) for modal/overlay content
3. **Use fixed units** (px) for touch targets and data displays
4. **Combine with overflow** for scrollable content
5. **Consider responsive behavior** with Tailwind breakpoints

## Accessibility Notes

- Touch targets minimum 44x44px (WCAG 2.1 AAA)
- Ensure adequate spacing between interactive elements
- Test touch targets on actual devices
- Consider reduced motion preferences

## Future Enhancements

- [ ] Add dark mode dimension variants
- [ ] Add breakpoint-specific dimensions
- [ ] Add animation duration tokens
- [ ] Add border radius tokens
- [ ] Add spacing (padding/margin) tokens

## Related Documentation

- [Gradient System](./GRADIENTS.md)
- [UI Components](../src/components/ui/README.md)
- [Blueprint](./BLUEPRINT.md)
