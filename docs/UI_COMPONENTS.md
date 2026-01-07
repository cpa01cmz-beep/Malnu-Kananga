# UI Components Documentation

## Overview

This document provides usage examples and guidelines for reusable UI components in the MA Malnu Kananga application.

## Card Component

**Location**: `src/components/ui/Card.tsx`

A flexible, reusable card component with multiple variants and configurations.

### Features

- **4 Variants**: `default`, `hover`, `interactive`, `gradient`
- **Configurable Padding**: `none`, `sm`, `md`, `lg`
- **Accessibility**: Full ARIA support, keyboard navigation, focus management
- **Dark Mode**: Consistent styling across light and dark themes
- **Interactive Support**: Automatically renders as button when `onClick` is provided

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Content to display inside the card |
| `variant` | `CardVariant` | `'default'` | Visual style variant |
| `gradient` | `CardGradient \| undefined` | `undefined` | Gradient configuration (for `gradient` variant) |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding size |
| `className` | `string` | `''` | Additional CSS classes |
| `onClick` | `() => void` | `undefined` | Click handler (makes card interactive) |
| `aria-label` | `string` | `undefined` | Accessibility label |
| `aria-describedby` | `string` | `undefined` | ID of element describing the card |

### Variants

#### 1. Default Variant

Standard card with basic styling.

```tsx
import Card from './ui/Card';

<Card>
  <h2>Card Title</h2>
  <p>Card content goes here.</p>
</Card>
```

#### 2. Hover Variant

Card with hover effects (lift and scale).

```tsx
<Card variant="hover">
  <h2>Hover Me</h2>
  <p>I'll lift up when you hover!</p>
</Card>
```

#### 3. Interactive Variant

Clickable card with button behavior, focus states, and keyboard navigation.

```tsx
<Card 
  variant="interactive"
  onClick={() => handleClick()}
  aria-label="Open settings"
>
  <Icon />
  <h2>Settings</h2>
  <p>Manage your preferences</p>
</Card>
```

**Note**: When `onClick` prop is provided, card automatically becomes interactive even without explicit `variant="interactive"`.

#### 4. Gradient Variant

Card with gradient background.

```tsx
<Card
  variant="gradient"
  gradient={{
    from: 'from-blue-500',
    to: 'to-purple-600',
    text: 'light'
  }}
  padding="lg"
>
  <h2>Featured Card</h2>
  <p>I have a beautiful gradient background!</p>
</Card>
```

### Padding Options

```tsx
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding (p-4)</Card>
<Card padding="md">Medium padding (p-6)</Card>
<Card padding="lg">Large padding (p-6 sm:p-8)</Card>
```

### Custom Styling

Add custom classes while preserving default card styling:

```tsx
<Card className="w-full max-w-md bg-gradient-to-r from-blue-50 to-indigo-50">
  <h2>Custom Styled Card</h2>
</Card>
```

### Real-World Examples

#### Dashboard Action Card (Interactive)

```tsx
<Card
  variant="interactive"
  onClick={() => setCurrentView('settings')}
  aria-label="Open settings"
>
  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-xl w-fit mb-4">
    <CogIcon />
  </div>
  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
    Settings
  </h3>
  <p className="text-sm text-neutral-500 dark:text-neutral-400">
    Manage your application settings
  </p>
</Card>
```

#### Content Card with Image (Hover)

```tsx
<Card
  variant="hover"
  className="overflow-hidden h-full flex flex-col group"
  padding="none"
>
  <div className="relative aspect-video bg-neutral-100">
    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
  </div>
  <div className="p-6 flex flex-col flex-grow">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-neutral-600 dark:text-neutral-300 flex-grow">
      {description}
    </p>
  </div>
</Card>
```

#### Info Card (Default)

```tsx
<Card padding="lg" className="mb-8">
  <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
    Welcome Back
  </h1>
  <p className="text-neutral-600 dark:text-neutral-300">
    Here's what's happening today.
  </p>
</Card>
```

### Accessibility Guidelines

1. **Always provide `aria-label` for interactive cards without descriptive text**:
   ```tsx
   <Card onClick={handleClick} aria-label="Close modal">
     <CloseIcon />
   </Card>
   ```

2. **Use `aria-describedby` to associate with description text**:
   ```tsx
   <Card aria-describedby="card-desc">
     <h2>Card Title</h2>
     <p id="card-desc">Detailed description</p>
   </Card>
   ```

3. **Interactive cards automatically render as `<button>` elements** with:
   - `type="button"`
   - Proper keyboard navigation
   - Focus management (`focus:ring-2`, `focus:ring-offset-2`)
   - Hover states for visual feedback

### Dark Mode

All card variants automatically support dark mode:

- Light backgrounds (`bg-white`) → Dark backgrounds (`dark:bg-neutral-800`)
- Light borders (`border-neutral-200`) → Dark borders (`dark:border-neutral-700`)
- Proper text colors for both themes

### Performance Considerations

The Card component is optimized using:
- `forwardRef` for ref forwarding
- Proper TypeScript typing
- No unnecessary re-renders
- CSS-only transitions and transforms

### Migration Guide

To migrate existing card implementations:

**Before:**
```tsx
<div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
  Content
</div>
```

**After:**
```tsx
import Card from './ui/Card';

<Card variant="hover">
  Content
</Card>
```

### Test Coverage

The Card component has comprehensive test coverage:
- Rendering tests for all variants
- Padding configuration tests
- Interaction tests (click handlers)
- Accessibility tests (ARIA, keyboard navigation)
- Dark mode tests
- Edge cases (empty children, undefined gradients)

Run tests with:
```bash
npm test src/components/ui/__tests__/Card.test.tsx
```

### Future Enhancements

Potential improvements to consider:
- `disabled` state for interactive cards
- Loading state variant
- Skeleton loading variant
- Built-in footer/header slots
- Collapse/expand functionality

---

## BackButton Component

**Location**: `src/components/ui/BackButton.tsx`

A reusable back navigation button component with consistent styling and accessibility support.

### Features

- **3 Variants**: `primary`, `green`, `custom`
- **Customizable Labels**: Supports custom button text
- **Accessibility**: Full ARIA support, keyboard navigation, focus management
- **Icon Integration**: Includes chevron left icon for clear visual indicator
- **Hover Effects**: Smooth underline and left-slide animation on hover
- **Dark Mode**: Consistent styling across light and dark themes

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `'Kembali'` | Button text label |
| `onClick` | `() => void` | Required | Click handler function |
| `variant` | `BackButtonVariant` | `'primary'` | Color style variant |
| `className` | `string` | `''` | Additional CSS classes |
| `ariaLabel` | `string` | Auto-generated | Accessibility label |

### Variants

#### 1. Primary Variant

Default back button with primary color scheme (blue/indigo).

```tsx
import BackButton from './ui/BackButton';

<BackButton
  label="Kembali ke Beranda"
  onClick={() => setCurrentView('home')}
/>
```

#### 2. Green Variant

Back button with green color scheme for different visual contexts.

```tsx
<BackButton
  label="Kembali ke Beranda"
  onClick={() => setCurrentView('home')}
  variant="green"
/>
```

#### 3. Custom Variant

Base variant without preset colors, useful for custom styling.

```tsx
<BackButton
  label="Custom Label"
  onClick={() => handleBack()}
  variant="custom"
  className="text-purple-600"
/>
```

### Custom Label

Override the default "Kembali" label with custom text:

```tsx
<BackButton
  label="Back to Dashboard"
  onClick={() => navigate('/dashboard')}
/>

<BackButton
  label="← Kembali"
  onClick={() => setView('previous')}
/>
```

### Accessibility Features

The BackButton component includes comprehensive accessibility support:

1. **ARIA Labels**: Automatically generated `aria-label` with navigation context
2. **Keyboard Navigation**: Full keyboard support with visible focus ring
3. **Focus Management**: `focus:ring-2` with `focus:ring-offset-2` for clear focus indication
4. **Screen Reader Support**: Icon is hidden with `aria-hidden="true"`, label is announced

```tsx
<BackButton
  label="Settings"
  onClick={() => navigate('home')}
  ariaLabel="Navigate back to home screen"
/>
```

### Styling Customization

Add custom classes while preserving default button styling:

```tsx
<BackButton
  label="Kembali"
  onClick={() => goBack()}
  className="mt-4 mb-8 text-lg"
/>
```

### Hover Effects

The component includes smooth hover animations:

- **Underline**: Text underlines on hover
- **Left Slide**: Button slides slightly left (-4px) on hover
- **Color Darkening**: Primary color darkens on hover for visual feedback

### Real-World Examples

#### Dashboard Navigation

```tsx
{currentView === 'profile' && (
  <div className="bg-white dark:bg-neutral-800 rounded-xl p-6">
    <div className="mb-6">
      <BackButton
        label="Kembali ke Beranda"
        onClick={() => setCurrentView('home')}
      />
    </div>
    <h2 className="text-2xl font-semibold">Profil Pengguna</h2>
  </div>
)}
```

#### Section Navigation

```tsx
<div className="animate-fade-in-up">
  <div className="mb-6">
    <BackButton
      label="Kembali ke Beranda"
      onClick={() => setCurrentView('home')}
      variant="green"
    />
  </div>
  <ScheduleView />
</div>
```

#### Multi-Level Navigation

```tsx
const BreadcrumbBackButton = ({ level, onBack }: { level: number, onBack: () => void }) => (
  <BackButton
    label={level === 1 ? 'Kembali ke Beranda' : 'Kembali ke Daftar'}
    onClick={onBack}
    variant={level === 1 ? 'green' : 'primary'}
  />
);
```

### Accessibility Guidelines

1. **Provide descriptive labels** that indicate where navigation leads:
   ```tsx
   <BackButton
     label="Kembali ke Dashboard"
     onClick={() => navigate('/dashboard')}
   />
   ```

2. **Use appropriate variant for context**:
   - `primary`: Default navigation within main sections
   - `green`: Navigation from detailed views to main views
   - `custom`: Special cases requiring custom styling

3. **Wrap with spacing div** for proper layout:
   ```tsx
   <div className="mb-6">
     <BackButton label="Back" onClick={handleBack} />
   </div>
   ```

4. **Focus Management**: Component automatically handles:
   - Visible focus ring (`focus:ring-2 focus:ring-primary-500/50`)
   - Focus offset in dark mode (`dark:focus:ring-offset-neutral-900`)
   - Keyboard activation (Enter/Space keys)

### Dark Mode

All variants automatically support dark mode:

- Primary: `text-primary-600` → `dark:text-primary-400`
- Green: `text-green-600` → `dark:text-green-400`
- Hover states adapt to dark theme

### Performance Considerations

The BackButton component is optimized using:
- Functional component with hooks
- Proper TypeScript typing
- CSS-only animations and transitions
- No unnecessary re-renders

### Migration Guide

To migrate existing back button implementations:

**Before:**
```tsx
<button
  onClick={() => setCurrentView('home')}
  className="mb-6 text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-2"
>
  ← Kembali ke Beranda
</button>
```

**After:**
```tsx
import BackButton from './ui/BackButton';

<div className="mb-6">
  <BackButton
    label="Kembali ke Beranda"
    onClick={() => setCurrentView('home')}
  />
</div>
```

**Benefits:**
- ✅ Consistent styling across application
- ✅ Improved accessibility with proper ARIA labels
- ✅ Icon component instead of character `←`
- ✅ Keyboard navigation support
- ✅ Hover animations
- ✅ Reduced code duplication

### Test Coverage

The BackButton component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/BackButton.test.tsx
```

Test scenarios include:
- Rendering with default and custom labels
- All variant rendering (primary, green, custom)
- Custom className application
- Click handler invocation
- ARIA label generation
- Icon rendering with proper attributes
- Focus ring visibility
- Hover effects
- Keyboard accessibility

### Usage in Application

Currently integrated in:
- `src/components/ParentDashboard.tsx` (9 instances)
  - Profile view (primary variant)
  - Schedule, grades, attendance, library, events, reports, messaging, payments, meetings views (green variant)

**Usage Pattern:**

```tsx
// For main section navigation
<BackButton
  label="Kembali ke Beranda"
  onClick={() => setCurrentView('home')}
  variant="primary"
/>

// For detail view navigation
<BackButton
  label="Kembali ke Beranda"
  onClick={() => setCurrentView('home')}
  variant="green"
/>
```

### Future Enhancements

Potential improvements to consider:
- Loading state variant
- Disabled state support
- Icon-only variant for mobile layouts
- Animation variants (fade, slide)
- Tooltip integration for accessibility

---

**Last Updated**: 2026-01-07
**Component Version**: 1.0.0
