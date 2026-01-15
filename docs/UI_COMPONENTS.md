# UI Components Documentation

**Status**: 🔄 IN PROGRESS (21 of 41 components documented)
**Last Updated**: 2026-01-15

> **NOTE**: Documenting all exported UI components from `src/components/ui/index.ts` with comprehensive usage examples, accessibility guidelines, and real-world implementation patterns.

## Overview

This document provides usage examples and guidelines for reusable UI components in MA Malnu Kananga application.
## FileInput Component

**Location**: `src/components/ui/FileInput.tsx`

A reusable file input component with consistent styling, accessibility support, and state management.

### Features

- **3 Sizes**: `sm`, `md`, `lg`
- **3 States**: `default`, `error`, `success`
- **Accessibility**: Full ARIA support, keyboard navigation, focus management
- **Dark Mode**: Consistent styling across light and dark themes
- **Label Support**: Optional label with required indicator
- **Helper Text**: Contextual guidance for users
- **Error Handling**: Built-in error state with role="alert"
- **File Button**: Stylized file button with proper focus states and hover effects

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label text displayed above the input |
| `helperText` | `string` | `undefined` | Helper text displayed below the input |
| `errorText` | `string` | `undefined` | Error message displayed below the input (sets state to error) |
| `size` | `FileInputSize` | `'md'` | Input size (affects padding, text size, and file button size) |
| `state` | `FileInputState` | `'default'` | Visual state variant (defaults to 'error' if errorText provided) |
| `fullWidth` | `boolean` | `false` | Whether the input should take full width |
| `accept` | `string` | `undefined` | File types to accept (e.g., ".pdf,.docx") |
| `multiple` | `boolean` | `false` | Whether multiple files can be selected |
| `disabled` | `boolean` | `false` | Whether the input is disabled |
| `required` | `boolean` | `false` | Whether the input is required (shows * indicator) |
| `onChange` | `(e: ChangeEvent) => void` | `undefined` | Change handler function |
| `id` | `string` | Auto-generated | Unique identifier for the input |
| `className` | `string` | `''` | Additional CSS classes |
| All standard input attributes | - | - | Passes through all standard HTML input props |

### Sizes

#### Small (sm)

Compact size for dense interfaces.

```tsx
import FileInput from './ui/FileInput';

<FileInput
  label="Upload File"
  size="sm"
  accept=".pdf"
/>
```

**Dimensions**:
- Input padding: `px-3 py-2`
- Input text: `text-sm`
- File button: `file:py-1.5 file:px-4 file:text-xs`

#### Medium (md)

Standard size for most use cases (default).

```tsx
<FileInput
  label="Upload File"
  size="md"
  accept=".pdf"
/>
```

**Dimensions**:
- Input padding: `px-4 py-3`
- Input text: `text-sm sm:text-base`
- File button: `file:py-2 file:px-4 file:text-sm`

#### Large (lg)

Larger size for better accessibility and touch targets.

```tsx
<FileInput
  label="Upload File"
  size="lg"
  accept=".pdf"
/>
```

**Dimensions**:
- Input padding: `px-5 py-4`
- Input text: `text-base sm:text-lg`
- File button: `file:py-2.5 file:px-5 file:text-base`

### States

#### Default State

Standard styling for normal file input.

```tsx
<FileInput
  label="Upload Document"
  accept=".pdf,.docx"
/>
```

**Styling**:
- Border: `border-neutral-300` / `dark:border-neutral-600`
- File button: `file:bg-blue-50 file:text-blue-700` / `dark:file:bg-blue-900/50 dark:file:text-blue-300`
- Focus: `focus:ring-primary-500/50 focus:border-primary-500`

#### Error State

Red styling when validation fails.

```tsx
<FileInput
  label="Upload Document"
  errorText="File size exceeds 10MB limit"
  accept=".pdf,.docx"
/>
```

**Styling**:
- Border: `border-red-300` / `dark:border-red-700`
- File button: `file:bg-red-50 file:text-red-700` / `dark:file:bg-red-900/50 dark:file:text-red-300`
- Focus: `focus:ring-red-500/50 focus:border-red-500`
- Error text: `text-red-600 dark:text-red-400` with `role="alert"`
- `aria-invalid`: `true`

#### Success State

Green styling for successful validation.

```tsx
<FileInput
  label="Upload Document"
  state="success"
  helperText="Document ready for upload"
  accept=".pdf,.docx"
/>
```

**Styling**:
- Border: `border-green-300` / `dark:border-green-700`
- File button: `file:bg-green-50 file:text-green-700` / `dark:file:bg-green-900/50 dark:file:text-green-300`
- Focus: `focus:ring-green-500/50 focus:border-green-500`

### Full Width

Make input take full width of container.

```tsx
<FileInput
  label="Upload File"
  fullWidth
  accept=".pdf"
/>
```

### Required Field

Show required indicator (*).

```tsx
<FileInput
  label="Required Document"
  required
  accept=".pdf"
/>
```

**Display**:
- Label shows `*` indicator with `aria-label="required"` for screen readers

### Helper Text

Provide contextual guidance below the input.

```tsx
<FileInput
  label="Upload Document"
  helperText="Accepted formats: PDF, DOCX (Max 10MB)"
  accept=".pdf,.docx"
/>
```

### Error Text

Display validation error below the input.

```tsx
<FileInput
  label="Upload Document"
  errorText="File size exceeds the maximum limit of 10MB"
  accept=".pdf,.docx"
/>
```

**Automatic State**: When `errorText` is provided, `state` automatically defaults to `'error'`.

### File Types

Control accepted file types.

```tsx
<FileInput
  label="Upload Document"
  accept=".pdf,.doc,.docx,.ppt,.pptx"
/>
```

### Multiple Files

Allow multiple file selection.

```tsx
<FileInput
  label="Upload Documents"
  multiple
  accept=".pdf"
  onChange={(e) => {
    const files = Array.from(e.target.files || []);
    handleMultipleFiles(files);
  }}
/>
```

### Accessibility Features

The FileInput component includes comprehensive accessibility support:

1. **ARIA Labels**: Generated unique IDs for label association
2. **ARIA DescribedBy**: Associates helper text and error text with input
3. **ARIA Invalid**: Automatically set when `state === 'error'`
4. **Error Role**: Error text has `role="alert"` for screen readers
5. **Focus Management**: `focus:ring-2` with `focus:ring-offset-2` for clear focus indication
6. **Required Indicator**: Visual `*` with `aria-label="required"` for screen readers
7. **File Button Focus**: File button has proper focus ring with offset in dark mode
8. **Keyboard Navigation**: Full keyboard support with visible focus states

```tsx
<FileInput
  label="Upload Document"
  helperText="PDF or DOCX files only, max 10MB"
  errorText="File too large"
  accept=".pdf,.docx"
  required
  aria-label="Upload your document file"
/>
```

### Dark Mode

All FileInput states automatically support dark mode:

- **Background**: `bg-white` → `dark:bg-neutral-700`
- **Borders**: `border-neutral-300` → `dark:border-neutral-600`
- **Text**: `text-neutral-900` → `dark:text-white`
- **File button**: `file:bg-blue-50` → `dark:file:bg-blue-900/50`
- **Focus ring offset**: `focus:ring-offset-2` → `dark:focus:ring-offset-neutral-800`

### Real-World Examples

#### Version File Upload

```tsx
function VersionControl() {
  const [newFile, setNewFile] = useState<File | null>(null);
  
  return (
    <FileInput
      label="File Baru"
      onChange={(e) => setNewFile(e.target.files?.[0] || null)}
      accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.jpg,.jpeg,.png"
      helperText={newFile ? `${newFile.name} • ${formatFileSize(newFile.size)}` : undefined}
    />
  );
}
```

#### Template File Upload

```tsx
function MaterialTemplatesLibrary() {
  return (
    <FileInput
      label="File Template"
      accept=".doc,.docx,.ppt,.pptx,.pdf"
      helperText="Supported formats: DOC, DOCX, PPT, PPTX, PDF"
    />
  );
}
```

#### With Validation

```tsx
function DocumentUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit');
        return;
      }
      
      setError(null);
      setFile(selectedFile);
    }
  };
  
  return (
    <FileInput
      label="Upload Document"
      onChange={handleFileChange}
      errorText={error || undefined}
      accept=".pdf,.docx"
      helperText="Max file size: 10MB"
      required
    />
  );
}
```

#### Disabled State

```tsx
<FileInput
  label="Upload Document"
  disabled={isUploading}
  accept=".pdf"
  helperText={isUploading ? "Please wait..." : "Upload PDF document"}
/>
```

### Styling Customization

Add custom classes while preserving default input styling:

```tsx
<FileInput
  label="Custom File Input"
  className="custom-class"
  accept=".pdf"
/>
```

### File Button Styling

The file input uses Tailwind's file modifier classes to style the file button:

- **Spacing**: `file:mr-4` - Margin between button and file name
- **Rounded**: `file:rounded-full` - Fully rounded corners
- **Border**: `file:border-0` - No border on button
- **Font**: `file:text-sm file:font-semibold` - Medium bold text
- **Background**: `file:bg-blue-50` / `dark:file:bg-blue-900/50` - Theme-aware
- **Hover**: `hover:file:bg-blue-100` / `dark:hover:file:bg-blue-900/70` - Hover effect
- **Scale**: `file:hover:scale-[1.02] file:active:scale-95` - Interactive feedback
- **Transition**: `file:transition-all file:duration-200 file:ease-out` - Smooth animations
- **Focus**: `file:focus:outline-none file:focus:ring-2 file:focus:ring-offset-2` - Focus ring
- **Focus Ring**: `focus:file:ring-blue-500/50` / `dark:focus:file:ring-blue-500/50 dark:focus:file:ring-offset-neutral-800`

### Performance Considerations

The FileInput component is optimized using:
- `forwardRef` for ref forwarding
- Proper TypeScript typing
- No unnecessary re-renders
- CSS-only transitions and transforms
- Efficient class string concatenation with whitespace normalization

### Migration Guide

To migrate existing file input implementations:

**Before:**
```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
    File Template
  </label>
  <input
    type="file"
    accept=".doc,.docx,.ppt,.pptx,.pdf"
    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
  />
</div>
```

**After:**
```tsx
import FileInput from './ui/FileInput';

<FileInput
  label="File Template"
  accept=".doc,.docx,.ppt,.pptx,.pdf"
/>
```

**Benefits:**
- ✅ Consistent styling across application
- ✅ Improved accessibility with proper ARIA support
- ✅ Built-in error and success states
- ✅ Helper text support
- ✅ Size variants for flexible layouts
- ✅ Dark mode support
- ✅ Focus management
- ✅ Reduced code duplication
- ✅ Type-safe props

### Test Coverage

The FileInput component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/FileInput.test.tsx
```

Test scenarios include:
- Rendering with default props
- Rendering with label
- Rendering with helper text
- Rendering with error text
- Automatic error state when errorText provided
- All size variants (sm, md, lg)
- All state variants (default, error, success)
- Full width variant
- Disabled state behavior
- Required field indicator
- File selection handling
- ARIA attributes (aria-label, aria-describedby, aria-invalid)
- Unique ID generation
- Custom className application
- Custom file types (accept)
- Multiple file selection
- Dark mode styling
- Focus ring visibility
- File button styling
- File button hover effects
- File button scale interactions
- Ref forwarding

### Usage in Application

Currently integrated in:
- `src/components/VersionControl.tsx` - Version file upload
- `src/components/MaterialTemplatesLibrary.tsx` - Template file upload

**Common Patterns:**

```tsx
// Document upload with validation
<FileInput
  label="Upload Document"
  errorText={validationError || undefined}
  accept=".pdf,.docx"
  onChange={validateAndHandleFile}
/>

// Media file upload
<FileInput
  label="Upload Media"
  helperText="Images and videos only (Max 50MB)"
  accept=".jpg,.jpeg,.png,.mp4"
/>

// Simple file upload
<FileInput
  label="Select File"
  accept=".pdf"
/>

// Full width file input
<FileInput
  label="Upload File"
  fullWidth
  accept=".pdf,.docx"
  helperText="Drag and drop or click to browse"
/>
```

### Future Enhancements

Potential improvements to consider:
- Drag and drop support
- File preview for images
- Multiple file upload with file list display
- Progress bar for upload status
- File size indicator in helper text
- Custom file icon in file button
- Clear file button
- File type icons in selected file display

---

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

## IconButton Component

**Location**: `src/components/ui/IconButton.tsx`

A reusable icon-only button component for consistent icon button patterns across the application.

### Features

- **8 Variants**: `default`, `primary`, `secondary`, `danger`, `success`, `info`, `warning`, `ghost`
- **3 Sizes**: `sm`, `md`, `lg`
- **Accessibility**: Full ARIA support, keyboard navigation, focus management
- **Dark Mode**: Consistent styling across light and dark themes
- **Animations**: Smooth hover and active scale animations
- **Tooltip Support**: Optional tooltip attribute for enhanced UX

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | Required | Icon to display (wrapped in span with aria-hidden) |
| `ariaLabel` | `string` | Required | Accessibility label for screen readers |
| `variant` | `IconButtonVariant` | `'default'` | Visual style variant |
| `size` | `IconButtonSize` | `'md'` | Button size |
| `tooltip` | `string` | `ariaLabel` | Optional tooltip text (defaults to ariaLabel) |
| `className` | `string` | `''` | Additional CSS classes |
| `onClick` | `() => void` | `undefined` | Click handler function |
| `disabled` | `boolean` | `false` | Disable button interaction |
| All standard button attributes | - | - | Passes through all standard HTML button props |

### Variants

#### 1. Default Variant

Standard icon button with neutral colors, ideal for generic actions.

```tsx
import IconButton from './ui/IconButton';
import { CloseIcon } from './icons/CloseIcon';

<IconButton
  icon={<CloseIcon />}
  ariaLabel="Close dialog"
  onClick={handleClose}
/>
```

#### 2. Primary Variant

Icon button with primary color scheme for main actions.

```tsx
<IconButton
  icon={<PlusIcon />}
  ariaLabel="Add new item"
  variant="primary"
  onClick={handleAdd}
/>
```

#### 3. Secondary Variant

Icon button with secondary styling for alternative actions.

```tsx
<IconButton
  icon={<EditIcon />}
  ariaLabel="Edit item"
  variant="secondary"
  onClick={handleEdit}
/>
```

#### 4. Danger Variant

Icon button with red styling for destructive actions.

```tsx
<IconButton
  icon={<TrashIcon />}
  ariaLabel="Delete item"
  variant="danger"
  onClick={handleDelete}
/>
```

#### 5. Success Variant

Icon button with green styling for success-related actions.

```tsx
<IconButton
  icon={<CheckIcon />}
  ariaLabel="Confirm action"
  variant="success"
  onClick={handleConfirm}
/>
```

#### 6. Info Variant

Icon button with blue styling for informational actions.

```tsx
<IconButton
  icon={<InfoIcon />}
  ariaLabel="View details"
  variant="info"
  onClick={handleView}
/>
```

#### 7. Warning Variant

Icon button with orange styling for warning-related actions.

```tsx
<IconButton
  icon={<WarningIcon />}
  ariaLabel="Proceed with caution"
  variant="warning"
  onClick={handleProceed}
/>
```

#### 8. Ghost Variant

Icon button with transparent background for minimal visual impact.

```tsx
<IconButton
  icon={<MenuIcon />}
  ariaLabel="Open menu"
  variant="ghost"
  onClick={handleMenu}
/>
```

### Sizes

Icon buttons come in three sizes to fit different contexts:

#### Small (sm)

Compact size for dense interfaces.

```tsx
<IconButton
  icon={<CloseIcon />}
  ariaLabel="Close"
  size="sm"
  onClick={handleClose}
/>
```

#### Medium (md)

Standard size for most use cases (default).

```tsx
<IconButton
  icon={<CloseIcon />}
  ariaLabel="Close"
  size="md"
  onClick={handleClose}
/>
```

#### Large (lg)

Larger size for important actions or mobile-friendly touch targets.

```tsx
<IconButton
  icon={<CloseIcon />}
  ariaLabel="Close"
  size="lg"
  onClick={handleClose}
/>
```

### Tooltip Support

Add tooltips for enhanced user experience:

```tsx
<IconButton
  icon={<SettingsIcon />}
  ariaLabel="Open settings"
  tooltip="Open application settings"
  onClick={openSettings}
/>
```

### Styling Customization

Add custom classes while preserving default button styling:

```tsx
<IconButton
  icon={<CloseIcon />}
  ariaLabel="Close"
  className="absolute top-4 right-4"
  onClick={handleClose}
/>
```

### Disabled State

Disable the button when needed:

```tsx
<IconButton
  icon={<UploadIcon />}
  ariaLabel="Upload file"
  disabled={isUploading}
  onClick={handleUpload}
/>
```

### Accessibility Features

1. **ARIA Labels**: Required `ariaLabel` prop ensures screen reader support
2. **Icon Hiding**: Icon is wrapped in span with `aria-hidden="true"`
3. **Focus Management**: `focus:ring-2` with `focus:ring-offset-2` for clear focus indication
4. **Keyboard Navigation**: Full keyboard support with Enter and Space activation
5. **Disabled State**: Proper `disabled` attribute and visual feedback

```tsx
<IconButton
  icon={<CloseIcon />}
  ariaLabel="Close dialog and return to dashboard"
  tooltip="Close dialog"
  size="md"
  variant="default"
  onClick={handleClose}
/>
```

### Real-World Examples

#### Modal Close Button

```tsx
<div className="flex justify-between items-center p-5">
  <h2>Dialog Title</h2>
  <IconButton
    icon={<CloseIcon />}
    ariaLabel="Close dialog"
    onClick={handleClose}
  />
</div>
```

#### Theme Toggle Button

```tsx
<IconButton
  icon={isDark ? <SunIcon /> : <MoonIcon />}
  ariaLabel={isDark ? "Switch to light mode" : "Switch to dark mode"}
  tooltip={isDark ? "Light mode" : "Dark mode"}
  size="lg"
  onClick={toggleTheme}
/>
```

#### Mobile Menu Toggle

```tsx
<IconButton
  icon={isMenuOpen ? <CloseIcon /> : <MenuIcon />}
  ariaLabel={isMenuOpen ? "Close menu" : "Open menu"}
  aria-expanded={isMenuOpen}
  size="lg"
  onClick={toggleMenu}
/>
```

#### Delete Action

```tsx
<IconButton
  icon={<TrashIcon />}
  ariaLabel={`Delete ${item.name}`}
  variant="danger"
  onClick={() => confirmDelete(item.id)}
/>
```

#### Toast Dismiss Button

```tsx
<div className="flex items-center gap-3">
  <span>{message}</span>
  <IconButton
    icon={<CloseIcon />}
    ariaLabel="Dismiss notification"
    size="sm"
    onClick={dismiss}
  />
</div>
```

### Dark Mode

All variants automatically support dark mode with dedicated color classes:

- **Default**: `text-neutral-600` → `dark:text-neutral-400`
- **Primary**: `bg-primary-600` → maintains primary color in dark mode
- **Colored variants**: Maintain visual hierarchy in dark mode
- **Hover states**: Adapt to dark theme background colors

### Animations

IconButton includes smooth transitions:

- **Hover Scale**: `hover:scale-110` (default) or `hover:scale-[1.02]` (colored variants)
- **Active Scale**: `active:scale-95` for press feedback
- **Duration**: `duration-200` for responsive feel
- **Easing**: `ease-out` for natural motion

### Performance Considerations

The IconButton component is optimized using:
- Functional component with hooks
- Proper TypeScript typing with generics
- CSS-only animations and transitions
- No unnecessary re-renders
- ARIA attributes for accessibility without JavaScript

### Migration Guide

To migrate existing icon button implementations:

**Before:**
```tsx
<button
  onClick={handleClose}
  className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
  aria-label="Close modal"
>
  <CloseIcon />
</button>
```

**After:**
```tsx
import IconButton from './ui/IconButton';

<IconButton
  icon={<CloseIcon />}
  ariaLabel="Close modal"
  onClick={handleClose}
/>
```

**Benefits:**
- ✅ Consistent styling across application
- ✅ Improved accessibility with proper ARIA support
- ✅ Reduced code duplication
- ✅ Built-in variants and sizes
- ✅ Dark mode support
- ✅ Smooth animations
- ✅ Keyboard navigation

### Test Coverage

The IconButton component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/IconButton.test.tsx
```

Test scenarios include:
- Rendering with all variants
- Rendering with all sizes
- Icon wrapper with proper attributes
- ARIA label generation
- Tooltip functionality
- Custom className application
- Click handler invocation
- Disabled state behavior
- Focus ring visibility
- Keyboard accessibility
- Dark mode styling
- Animation classes
- Props passthrough

### Usage in Application

Currently integrated in:
- `src/components/Toast.tsx` (dismiss button)
- `src/components/ThemeSelector.tsx` (close button and trigger)
- `src/components/LoginModal.tsx` (close button)
- `src/components/Header.tsx` (theme toggle and mobile menu)
- `src/components/UserManagement.tsx` (modal close button)

**Common Patterns:**

```tsx
// Modal close buttons
<IconButton icon={<CloseIcon />} ariaLabel="Close modal" onClick={handleClose} />

// Theme toggle
<IconButton
  icon={isDark ? <SunIcon /> : <MoonIcon />}
  ariaLabel="Toggle theme"
  size="lg"
  onClick={toggleTheme}
/>

// Dismissible notifications
<IconButton icon={<CloseIcon />} ariaLabel="Dismiss" size="sm" onClick={dismiss} />

// Action buttons
<IconButton icon={<EditIcon />} ariaLabel="Edit" variant="secondary" onClick={edit} />
<IconButton icon={<TrashIcon />} ariaLabel="Delete" variant="danger" onClick={delete} />
```

### Future Enhancements

Potential improvements to consider:
- Loading state with spinner icon
- Badge overlay for notification counts
- Keyboard shortcut support
- Ripple effect for enhanced feedback
- Size-aware icon scaling

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

## LoadingState Component

**Location**: `src/components/ui/LoadingState.tsx`

A comprehensive loading state component that handles loading, error, and empty states with consistent UI patterns.

### Features

- **5 Types**: `page`, `section`, `inline`, `table`, `list`
- **3 Variants**: `card`, `list`, `table`, `custom` (for section type)
- **3 Sizes**: `sm`, `md`, `lg`
- **Accessibility**: Full ARIA support with proper live regions and busy states
- **Dark Mode**: Consistent styling across light and dark themes
- **Error Handling**: Built-in error state with retry functionality
- **Empty States**: Empty state with custom messages and icons
- **Skeleton Loading**: Integrated skeleton screens for perceived performance

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | `boolean` | `false` | Whether the component is in a loading state |
| `error` | `string \| null` | `null` | Error message to display (takes precedence over loading) |
| `empty` | `boolean` | `false` | Whether to display empty state |
| `emptyMessage` | `string` | `'Tidak ada data'` | Message to display in empty state |
| `emptyIcon` | `ReactNode` | `undefined` | Custom icon for empty state |
| `onRetry` | `() => void` | `undefined` | Retry callback for error state |
| `type` | `LoadingStateType` | `'section'` | Type of loading state to display |
| `variant` | `LoadingStateVariant` | `'card'` | Variant for section-type loading |
| `size` | `LoadingStateSize` | `'md'` | Size of the loading/empty/error state |
| `rows` | `number` | `5` | Number of skeleton rows (for table type) |
| `cols` | `number` | `4` | Number of skeleton columns (for table type) |
| `count` | `number` | `3` | Number of skeleton items (for list, card, table types) |
| `children` | `ReactNode` | Required | Content to display when not loading/error/empty |
| `className` | `string` | `''` | Additional CSS classes |

### Types

- **LoadingStateType**: `'page' \| 'section' \| 'inline' \| 'table' \| 'list'`
- **LoadingStateVariant**: `'card' \| 'list' \| 'table' \| 'custom'`
- **LoadingStateSize**: `'sm' \| 'md' \| 'lg'`

### Basic Usage

#### Loading State

```tsx
import LoadingState from './ui/LoadingState';

<LoadingState isLoading={true}>
  <div>Your content here</div>
</LoadingState>
```

#### Error State

```tsx
<LoadingState
  isLoading={false}
  error="Failed to load data"
  onRetry={() => fetchData()}
>
  <div>Your content here</div>
</LoadingState>
```

#### Empty State

```tsx
<LoadingState
  isLoading={false}
  empty={true}
  emptyMessage="No records found"
  emptyIcon={<InboxIcon />}
>
  <div>Your content here</div>
</LoadingState>
```

### Loading Types

#### 1. Page Loading Type

Full-page loading with header skeletons and card grid.

```tsx
<LoadingState
  isLoading={true}
  type="page"
  variant="card"
  count={3}
>
  <div>Content</div>
</LoadingState>
```

**Use case**: Initial page load when entire page content is loading.

#### 2. Section Loading Type

Section-level loading with configurable variant.

```tsx
<LoadingState
  isLoading={true}
  type="section"
  variant="card"
  count={6}
>
  <div>Content</div>
</LoadingState>
```

**Variants**:
- `card`: Grid of card skeletons (default)
- `list`: List of item skeletons
- `table`: Table skeleton with configurable rows/columns

**Use case**: Loading data in specific sections like dashboards, grids, or lists.

#### 3. Inline Loading Type

Inline loading with spinner and text.

```tsx
<LoadingState
  isLoading={true}
  type="inline"
  size="md"
>
  <div>Content</div>
</LoadingState>
```

**Sizes**:
- `sm`: Small spinner (h-4 w-4), small text
- `md`: Medium spinner (h-5 w-5), medium text (default)
- `lg`: Large spinner (h-8 w-8), large text

**Use case**: Loading within specific components, modals, or small sections.

#### 4. Table Loading Type

Table skeleton with configurable rows and columns.

```tsx
<LoadingState
  isLoading={true}
  type="table"
  rows={10}
  cols={6}
>
  <table><tbody><tr><td>Data</td></tr></tbody></table>
</LoadingState>
```

**Use case**: Loading table data in data tables, reports, or grids.

#### 5. List Loading Type

List of item skeletons.

```tsx
<LoadingState
  isLoading={true}
  type="list"
  count={5}
>
  <ul><li>Item 1</li></ul>
</LoadingState>
```

**Use case**: Loading list data, notifications, feed items, etc.

### Error Handling

#### Basic Error State

```tsx
<LoadingState
  isLoading={false}
  error="Gagal memuat data"
>
  <div>Content</div>
</LoadingState>
```

#### Error with Retry

```tsx
<LoadingState
  isLoading={false}
  error="Network error occurred"
  onRetry={() => fetchData()}
  size="lg"
>
  <div>Content</div>
</LoadingState>
```

### Empty States

#### Default Empty State

```tsx
<LoadingState
  isLoading={false}
  empty={true}
>
  <div>Content</div>
</LoadingState>
```

#### Custom Empty Message

```tsx
<LoadingState
  isLoading={false}
  empty={true}
  emptyMessage="Tidak ada pesan baru"
>
  <div>Content</div>
</LoadingState>
```

#### Empty State with Custom Icon

```tsx
import { InboxIcon } from './icons/InboxIcon';

<LoadingState
  isLoading={false}
  empty={true}
  emptyMessage="Kotak masuk kosong"
  emptyIcon={<InboxIcon />}
  size="lg"
>
  <div>Content</div>
</LoadingState>
```

### State Priority

The component follows this priority order:
1. **Error** (highest priority) - displays error state if `error` prop is provided
2. **Loading** - displays loading state if `isLoading` is true
3. **Empty** - displays empty state if `empty` is true
4. **Children** - displays children content if none of the above states are active

### Real-World Examples

#### Dashboard Loading

```tsx
function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentsAPI.getAll();
        setStudents(data);
      } catch (err) {
        setError('Gagal memuat data siswa');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <LoadingState
      isLoading={loading}
      error={error}
      type="page"
      variant="card"
      count={6}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {students.map(student => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </LoadingState>
  );
}
```

#### Data Table with Loading

```tsx
function GradingTable() {
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gradesAPI.getAll();
      setGrades(data);
    } catch (err) {
      setError('Gagal memuat nilai');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Button onClick={handleRefresh}>Refresh</Button>
      </div>

      <LoadingState
        isLoading={loading}
        error={error}
        empty={grades.length === 0}
        emptyMessage="Belum ada nilai"
        type="table"
        rows={10}
        cols={6}
      >
        <table className="w-full">
          {/* Table content */}
        </table>
      </LoadingState>
    </div>
  );
}
```

#### List with Empty State

```tsx
function NotificationList() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  return (
    <LoadingState
      isLoading={loading}
      empty={notifications.length === 0}
      emptyMessage="Tidak ada notifikasi"
      type="list"
      count={5}
    >
      <ul className="space-y-3">
        {notifications.map(notif => (
          <NotificationItem key={notif.id} notification={notif} />
        ))}
      </ul>
    </LoadingState>
  );
}
```

### Accessibility Features

1. **ARIA Live Regions**:
   - Loading states: `role="status"`, `aria-live="polite"`, `aria-busy="true"`
   - Error states: `role="alert"`, `aria-live="polite"`

2. **Screen Reader Support**:
   - Skeleton elements have `aria-hidden="true"`
   - Loading spinner has `aria-hidden="true"` (text provides context)
   - Error and empty states use proper semantic HTML

3. **Keyboard Navigation**:
   - Retry buttons are keyboard accessible
   - Full focus management with visible focus rings

4. **Text Alternatives**:
   - "Memuat..." text provides context for screen readers
   - Error messages are clearly announced
   - Empty state messages are descriptive

### Dark Mode Support

All LoadingState variants automatically support dark mode:
- Loading spinners: `text-primary-600` maintains primary color in dark mode
- Skeleton backgrounds: `bg-neutral-200` → `dark:bg-neutral-700`
- Error icons: `text-red-400` → `dark:text-red-500`
- Text colors: Adapted for both light and dark themes

### Performance Considerations

The LoadingState component is optimized using:
- Functional components with hooks
- Skeleton screens reduce perceived loading time
- No unnecessary re-renders
- CSS-only animations
- Proper TypeScript typing

### Migration Guide

**Before:**
```tsx
{loading ? (
  <div className="animate-pulse">
    <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
  </div>
) : error ? (
  <div className="text-red-600">
    {error}
    <button onClick={retry}>Coba Lagi</button>
  </div>
) : empty ? (
  <div>Tidak ada data</div>
) : (
  <div>{content}</div>
)}
```

**After:**
```tsx
import LoadingState from './ui/LoadingState';

<LoadingState
  isLoading={loading}
  error={error}
  empty={empty}
  onRetry={retry}
  type="section"
>
  {content}
</LoadingState>
```

**Benefits:**
- ✅ Consistent loading/error/empty patterns across app
- ✅ Improved accessibility with proper ARIA support
- ✅ Built-in skeleton screens for better UX
- ✅ Reduced code duplication
- ✅ Dark mode support
- ✅ Comprehensive error handling
- ✅ Empty state management

### Test Coverage

The LoadingState component has comprehensive test coverage:
- Loading state rendering for all types (page, section, inline, table, list)
- Error state rendering with and without retry
- Empty state rendering with custom messages and icons
- State priority (error > loading > empty > children)
- Accessibility tests (ARIA attributes, keyboard navigation)
- Dark mode tests
- Size variants (sm, md, lg)
- Custom className application
- Button interaction (retry, action)

Run tests with:
```bash
npm test src/components/ui/__tests__/LoadingState.test.tsx
```

### Future Enhancements

Potential improvements to consider:
- Loading progress bar for slow operations
- Skeleton variants for different content types
- Animated empty states
- Custom loading messages
- Transition animations between states

---

## SuspenseLoading Component

**Location**: `src/components/ui/SuspenseLoading.tsx`

A reusable loading component designed specifically for React Suspense fallbacks with consistent styling and accessibility support.

### Features

- **3 Sizes**: `sm`, `md`, `lg` for flexible layouts
- **Customizable Messages**: Supports custom loading text for different contexts
- **Accessibility**: Full ARIA support with proper live regions and busy states
- **Dark Mode**: Consistent styling across light and dark themes
- **Skeleton Loading**: Integrated skeleton screens for perceived performance
- **Pulse Animation**: Smooth animate-pulse effect for visual feedback

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | `'Memuat...'` | Loading message text to display |
| `size` | `SuspenseLoadingSize` | `'md'` | Component size (affects height, skeleton size, text size) |
| `className` | `string` | `''` | Additional CSS classes |

### Sizes

#### Small (sm)

Compact size for small loading areas.

```tsx
import SuspenseLoading from './ui/SuspenseLoading';

<SuspenseLoading
  size="sm"
  message="Loading..."
/>
```

**Dimensions**:
- Container height: `h-48`
- Skeleton: `w-12 h-12 rounded-xl`
- Text: `text-sm`

#### Medium (md)

Standard size for most use cases (default).

```tsx
<SuspenseLoading
  size="md"
  message="Memuat dashboard..."
/>
```

**Dimensions**:
- Container height: `h-64`
- Skeleton: `w-16 h-16 rounded-2xl`
- Text: `text-base`

#### Large (lg)

Larger size for important loading areas.

```tsx
<SuspenseLoading
  size="lg"
  message="Loading resources..."
/>
```

**Dimensions**:
- Container height: `h-80`
- Skeleton: `w-20 h-20 rounded-2xl`
- Text: `text-lg`

### Custom Messages

Provide context-specific loading messages:

```tsx
<SuspenseLoading message="Memuat dashboard admin..." />
<SuspenseLoading message="Memuat formulir pendaftaran..." />
<SuspenseLoading message="Memuat dokumentasi..." />
<SuspenseLoading message="Loading data..." />
```

### Integration with Suspense

Primary use case: React Suspense fallback for lazy-loaded components.

```tsx
import { lazy, Suspense } from 'react';
import SuspenseLoading from './ui/SuspenseLoading';

const AdminDashboard = lazy(() => import('./AdminDashboard'));

function App() {
  return (
    <Suspense fallback={<SuspenseLoading message="Memuat dashboard admin..." />}>
      <AdminDashboard />
    </Suspense>
  );
}
```

### Custom Styling

Add custom classes while preserving default loading state styling:

```tsx
<SuspenseLoading
  message="Loading..."
  className="absolute top-0 left-0 w-full h-full"
/>
```

### Accessibility Features

The SuspenseLoading component includes comprehensive accessibility support:

1. **ARIA Role**: `role="status"` indicates loading state
2. **ARIA Live Region**: `aria-live="polite"` announces loading changes
3. **ARIA Busy**: `aria-busy="true"` indicates content is being loaded
4. **Skeleton Hiding**: Skeleton element has `aria-hidden="true"` for screen readers
5. **Keyboard Support**: No keyboard interaction needed (passive loading state)
6. **Focus Management**: Not applicable (loading states are non-interactive)

```tsx
<SuspenseLoading
  message="Memuat data..."
  size="md"
  aria-label="Memuat data aplikasi"
/>
```

### Dark Mode

All SuspenseLoading sizes automatically support dark mode:

- **Container**: Inherits parent background colors
- **Skeleton**: `bg-neutral-200` → `dark:bg-neutral-700`
- **Text**: `text-neutral-500` → `dark:text-neutral-400`

### Real-World Examples

#### Dashboard Loading

```tsx
<Suspense fallback={<SuspenseLoading message="Memuat dashboard admin..." />}>
  <AdminDashboard onShowToast={showToast} />
</Suspense>
```

#### Form Loading

```tsx
<Suspense fallback={<SuspenseLoading message="Memuat formulir pendaftaran..." />}>
  <PPDBRegistration isOpen={isOpen} onClose={handleClose} />
</Suspense>
```

#### Page Loading

```tsx
<Suspense fallback={<SuspenseLoading message="Memuat dokumentasi..." />}>
  <DocumentationPage isOpen={isOpen} onClose={handleClose} />
</Suspense>
```

#### Component Loading

```tsx
<Suspense fallback={<SuspenseLoading message="Memuat editor..." />}>
  <SiteEditor
    isOpen={isOpen}
    onClose={handleClose}
    onUpdateContent={handleUpdate}
  />
</Suspense>
```

#### Custom Context Loading

```tsx
<Suspense fallback={<SuspenseLoading message="Memuat pengaturan..." />}>
  <SettingsPanel />
</Suspense>
```

#### Full-Screen Loading

```tsx
<Suspense fallback={
  <SuspenseLoading
    message="Memuat aplikasi..."
    size="lg"
    className="absolute top-0 left-0 w-full h-screen"
  />
}>
  <MainApp />
</Suspense>
```

### Styling Details

The component uses these Tailwind CSS classes:

**Container**:
- Flex layout: `flex flex-col justify-center items-center`
- Animation: `animate-pulse`
- Spacing: `space-y-3`

**Skeleton**:
- Responsive sizes: `w-12 h-12` (sm) / `w-16 h-16` (md) / `w-20 h-20` (lg)
- Border radius: `rounded-xl` (sm) / `rounded-2xl` (md, lg)
- Dark mode: `bg-neutral-200 dark:bg-neutral-700`

**Text**:
- Responsive sizes: `text-sm` (sm) / `text-base` (md) / `text-lg` (lg)
- Dark mode: `text-neutral-500 dark:text-neutral-400`
- Weight: `font-medium`

### Performance Considerations

The SuspenseLoading component is optimized using:
- Functional component with hooks (no unnecessary re-renders)
- CSS-only animations (animate-pulse)
- Minimal DOM structure (single container, skeleton + text)
- No JavaScript dependencies
- Proper TypeScript typing

### Migration Guide

To migrate existing inline Suspense fallbacks:

**Before:**
```tsx
<Suspense fallback={
  <div className="flex flex-col justify-center items-center h-64 space-y-3 animate-pulse">
    <div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-700"></div>
    <p className="text-neutral-500 dark:text-neutral-400 font-medium">
      Memuat dashboard admin...
    </p>
  </div>
}>
  <AdminDashboard />
</Suspense>
```

**After:**
```tsx
import SuspenseLoading from './ui/SuspenseLoading';

<Suspense fallback={<SuspenseLoading message="Memuat dashboard admin..." />}>
  <AdminDashboard />
</Suspense>
```

**Benefits:**
- ✅ Consistent styling across application
- ✅ Improved accessibility with proper ARIA support
- ✅ Reduced code duplication (eliminates 7+ inline patterns)
- ✅ Built-in size variants
- ✅ Customizable messages
- ✅ Dark mode support
- ✅ Type-safe props

### Test Coverage

The SuspenseLoading component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/SuspenseLoading.test.tsx
```

Test scenarios include:
- Rendering with default props
- Rendering with custom messages
- Rendering with all size variants (sm, md, lg)
- Accessibility tests (ARIA role, aria-live, aria-busy)
- Skeleton element rendering with aria-hidden
- Dark mode styling
- Layout structure (flex, justify-center, items-center)
- Spacing classes (space-y-3)
- Animation class (animate-pulse)
- Custom className application
- Props integration (message, size, className)
- TypeScript type exports
- Integration with React Suspense

### Usage in Application

Currently integrated in:
- `src/App.tsx` - All 7 Suspense fallbacks replaced

**Replaced Patterns:**

1. Admin Dashboard: `Memuat dashboard admin...`
2. Teacher Dashboard: `Memuat dashboard guru...`
3. Parent Dashboard: `Memuat dashboard wali murid...`
4. Student Portal: `Memuat portal siswa...`
5. PPDB Registration: `Memuat formulir pendaftaran...`
6. Documentation Page: `Memuat dokumentasi...`
7. Site Editor: `Memuat editor...`

**Total Code Reduction:**
- Eliminated 7 duplicate inline fallback implementations (~210 lines)
- Replaced with 7 simple component usages (~7 lines)
- **Net reduction: ~200 lines of duplicate code**

### Future Enhancements

Potential improvements to consider:
- Progress bar integration for long-loading resources
- Skeleton variants for different content types (list, card, table)
- Animated icons instead of simple skeleton blocks
- Loading percentage display
- Multiple skeleton elements (e.g., title + subtitle + content)

---

**Last Updated**: 2026-01-10
**Component Version**: 1.0.0

## Textarea Component

**Location**: `src/components/ui/Textarea.tsx`

A reusable textarea component with auto-resize, validation, and comprehensive accessibility support.

### Features

- **3 Sizes**: `sm`, `md`, `lg` for flexible layouts
- **3 States**: `default`, `error`, `success`
- **Auto-Resize**: Configurable automatic height adjustment based on content
- **Validation**: Built-in validation rules with error announcement
- **Accessibility**: Full ARIA support, character count, keyboard navigation, focus management
- **Dark Mode**: Consistent styling across light and dark themes
- **Label Support**: Optional label with required indicator
- **Helper Text**: Contextual guidance for users
- **Error Handling**: Built-in error state with role="alert"
- **Character Count**: Automatic character count when maxLength is set

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label text displayed above the textarea |
| `helperText` | `string` | `undefined` | Helper text displayed below the textarea |
| `errorText` | `string` | `undefined` | Error message displayed below the textarea (sets state to error) |
| `size` | `TextareaSize` | `'md'` | Textarea size (affects padding and text size) |
| `state` | `TextareaState` | `'default'` | Visual state variant (defaults to 'error' if errorText provided) |
| `fullWidth` | `boolean` | `false` | Whether the textarea should take full width |
| `autoResize` | `boolean` | `true` | Enable automatic height adjustment based on content |
| `maxRows` | `number` | `8` | Maximum number of rows for auto-resize |
| `minRows` | `number` | `1` | Minimum number of rows for auto-resize |
| `validationRules` | `Array<ValidationRule>` | `[]` | Array of validation rules with validate function and error message |
| `validateOnChange` | `boolean` | `true` | Validate on every change event |
| `validateOnBlur` | `boolean` | `true` | Validate on blur event |
| `accessibility.announceErrors` | `boolean` | `true` | Announce validation errors via ARIA |
| `accessibility.describedBy` | `string` | `undefined` | Additional ARIA describedby IDs |
| `id` | `string` | Auto-generated | Unique identifier for the textarea |
| `className` | `string` | `''` | Additional CSS classes |
| All standard textarea attributes | - | - | Passes through all standard HTML textarea props |

### Sizes

#### Small (sm)

Compact size for dense interfaces.

```tsx
import Textarea from './ui/Textarea';

<Textarea
  label="Description"
  size="sm"
  placeholder="Enter description..."
/>
```

**Dimensions**:
- Padding: `px-3 py-2`
- Text: `text-sm`
- Label: `text-xs`
- Helper/Error text: `text-xs`

#### Medium (md)

Standard size for most use cases (default).

```tsx
<Textarea
  label="Description"
  size="md"
  placeholder="Enter description..."
/>
```

**Dimensions**:
- Padding: `px-4 py-3`
- Text: `text-sm sm:text-base`
- Label: `text-sm`
- Helper/Error text: `text-xs`

#### Large (lg)

Larger size for better accessibility and touch targets.

```tsx
<Textarea
  label="Description"
  size="lg"
  placeholder="Enter description..."
/>
```

**Dimensions**:
- Padding: `px-5 py-4`
- Text: `text-base sm:text-lg`
- Label: `text-base`
- Helper/Error text: `text-sm`

### States

#### Default State

Standard styling for normal textarea.

```tsx
<Textarea
  label="Description"
  placeholder="Enter description..."
/>
```

**Styling**:
- Border: `border-neutral-300` / `dark:border-neutral-600`
- Background: `bg-white` / `dark:bg-neutral-700`
- Text: `text-neutral-900` / `dark:text-white`
- Focus: `focus:ring-primary-500/50 focus:border-primary-500`

#### Error State

Red styling when validation fails.

```tsx
<Textarea
  label="Description"
  errorText="Description must be at least 10 characters"
  placeholder="Enter description..."
/>
```

**Styling**:
- Border: `border-red-300` / `dark:border-red-700`
- Background: `bg-red-50` / `dark:bg-red-900/20`
- Focus: `focus:ring-red-500/50 focus:border-red-500`
- Error text: `text-red-600 dark:text-red-400` with `role="alert"`
- `aria-invalid`: `true`

#### Success State

Green styling for successful validation.

```tsx
<Textarea
  label="Description"
  state="success"
  helperText="Description looks good!"
  placeholder="Enter description..."
/>
```

**Styling**:
- Border: `border-green-300` / `dark:border-green-700`
- Background: `bg-green-50` / `dark:bg-green-900/20`
- Focus: `focus:ring-green-500/50 focus:border-green-500`

### Auto-Resize

Enable automatic height adjustment based on content.

```tsx
<Textarea
  label="Description"
  autoResize={true}
  minRows={3}
  maxRows={10}
  placeholder="Type here and textarea will auto-resize..."
/>
```

**Features**:
- Automatically adjusts height as content grows
- Respects `minRows` and `maxRows` limits
- Disabled with `autoResize={false}` for fixed height

**Disabled Auto-Resize**:

```tsx
<Textarea
  label="Description"
  autoResize={false}
  minRows={5}
  placeholder="Fixed height textarea with 5 rows..."
/>
```

### Validation

Built-in validation with custom rules and error announcement.

```tsx
<Textarea
  label="Description"
  validationRules={[
    {
      validate: (value) => value.length >= 10,
      message: 'Description must be at least 10 characters'
    },
    {
      validate: (value) => value.length <= 500,
      message: 'Description must not exceed 500 characters'
    }
  ]}
  validateOnChange={true}
  validateOnBlur={true}
  placeholder="Enter description..."
/>
```

**Features**:
- Validate on change and/or blur
- Automatic error announcement with `role="alert"`
- Visual loading indicator during validation
- Auto-focus on error after touch
- Error messages displayed below textarea

### Character Count

Automatic character count when `maxLength` is set.

```tsx
<Textarea
  label="Bio"
  maxLength={150}
  helperText="Tell us about yourself"
  placeholder="Enter your bio..."
/>
```

**Features**:
- Displays `current/maxLength` count below textarea
- Right-aligned for clean layout
- Announced via `aria-live="polite"` for screen readers

### Accessibility Features

The Textarea component includes comprehensive accessibility support:

1. **ARIA Labels**: Generated unique IDs for label association
2. **ARIA DescribedBy**: Associates helper text and error text with textarea
3. **ARIA Invalid**: Automatically set when `state === 'error'`
4. **Error Role**: Error text has `role="alert"` for screen readers
5. **Required Indicator**: Visual `*` with `aria-label="wajib diisi"` for screen readers
6. **Error Announcement**: `aria-live="polite"` on error messages
7. **Validation State**: `aria-busy` during validation
8. **Focus Management**: `focus:ring-2` with `focus:ring-offset-2` for clear focus indication
9. **Keyboard Navigation**: Full keyboard support with visible focus states

```tsx
<Textarea
  label="Description"
  helperText="Provide a detailed description"
  errorText="Description is required"
  required
  maxLength={500}
  validationRules={[
    { validate: (value) => value.length >= 10, message: 'Too short' }
  ]}
  aria-label="Enter item description"
/>
```

### Real-World Examples

#### Description Field with Validation

```tsx
function ProductForm() {
  const [description, setDescription] = useState('');

  return (
    <Textarea
      label="Product Description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      helperText="Describe your product in detail"
      validationRules={[
        {
          validate: (value) => value.length >= 50,
          message: 'Description must be at least 50 characters'
        }
      ]}
      maxLength={1000}
      size="lg"
    />
  );
}
```

#### Comment Field with Auto-Resize

```tsx
function CommentSection() {
  const [comment, setComment] = useState('');

  return (
    <Textarea
      label="Add a Comment"
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      autoResize={true}
      minRows={3}
      maxRows={8}
      placeholder="Share your thoughts..."
      helperText="Be respectful and constructive"
      size="md"
    />
  );
}
```

#### Notes Field with Character Count

```tsx
function NotesEditor() {
  const [notes, setNotes] = useState('');

  return (
    <Textarea
      label="Meeting Notes"
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      maxLength={500}
      helperText="Record key discussion points"
      placeholder="Enter meeting notes..."
      size="lg"
      fullWidth
    />
  );
}
```

#### Multi-Field Form with Validation

```tsx
function FeedbackForm() {
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    if (feedback.length < 10) {
      setErrors({ feedback: 'Too short' });
      return;
    }
    submitFeedback(feedback);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Textarea
        label="Your Feedback"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        errorText={errors.feedback}
        validationRules={[
          { validate: (v) => v.length >= 10, message: 'Minimum 10 characters' }
        ]}
        helperText="Help us improve our service"
        placeholder="What did you like or dislike?"
        size="lg"
        fullWidth
      />
      <Button type="submit">Submit Feedback</Button>
    </form>
  );
}
```

### Dark Mode

All Textarea states automatically support dark mode:

- Background: `bg-white` → `dark:bg-neutral-700`
- Borders: `border-neutral-300` → `dark:border-neutral-600`
- Text: `text-neutral-900` → `dark:text-white`
- Error background: `bg-red-50` → `dark:bg-red-900/20`
- Success background: `bg-green-50` → `dark:bg-green-900/20`

### Performance Considerations

The Textarea component is optimized using:
- `forwardRef` for ref forwarding
- Proper TypeScript typing
- Debounced auto-resize calculations
- No unnecessary re-renders
- Efficient validation state management
- CSS-only transitions and animations

### Migration Guide

To migrate existing textarea implementations:

**Before:**
```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
    Description
  </label>
  <textarea
    placeholder="Enter description..."
    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none resize-none"
    maxLength={500}
  />
  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
    Max 500 characters
  </p>
</div>
```

**After:**
```tsx
import Textarea from './ui/Textarea';

<Textarea
  label="Description"
  maxLength={500}
  helperText="Max 500 characters"
  placeholder="Enter description..."
/>
```

**Benefits:**
- ✅ Consistent styling across application
- ✅ Improved accessibility with proper ARIA support
- ✅ Built-in auto-resize functionality
- ✅ Character count display
- ✅ Built-in validation rules
- ✅ Error and success states
- ✅ Helper text support
- ✅ Dark mode support
- ✅ Reduced code duplication

### Test Coverage

The Textarea component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/Textarea.test.tsx
```

Test scenarios include:
- Rendering with default props
- Rendering with label
- Rendering with helper text
- Rendering with error text
- All size variants (sm, md, lg)
- All state variants (default, error, success)
- Full width variant
- Auto-resize functionality
- Disabled state behavior
- Required field indicator
- Character count display
- Validation rules
- Error announcement
- ARIA attributes
- Unique ID generation
- Custom className application
- Dark mode styling

### Usage in Application

Currently integrated in:
- `src/components/BatchManagement.tsx` - Batch description textarea
- `src/components/PPDBRegistration.tsx` - Multiple textarea fields

**Common Patterns:**

```tsx
// Simple textarea with label
<Textarea label="Description" placeholder="Enter..." />

// With validation and character count
<Textarea
  label="Notes"
  maxLength={500}
  validationRules={[{ validate: (v) => v.length >= 10, message: 'Too short' }]}
/>

// Auto-resize with min/max rows
<Textarea
  label="Comments"
  autoResize
  minRows={3}
  maxRows={10}
/>

// With error state
<Textarea
  label="Description"
  errorText="This field is required"
  state="error"
/>
```

### Future Enhancements

Potential improvements to consider:
- Markdown preview mode
- Syntax highlighting for code
- Rich text editor variant
- Word count display
- Undo/redo history
- Paste from rich text format handling

---

## Toggle Component

**Location**: `src/components/ui/Toggle.tsx`

A reusable toggle/switch component for boolean values with multiple sizes, colors, and comprehensive accessibility support.

### Features

- **3 Sizes**: `sm`, `md`, `lg` for flexible layouts
- **6 Colors**: `primary`, `blue`, `green`, `red`, `purple`, `orange`
- **Label Support**: Optional label with description
- **Label Position**: Configurable label position (left or right)
- **Accessibility**: Full ARIA support, keyboard navigation, screen reader support
- **Dark Mode**: Consistent styling across light and dark themes
- **Smooth Transitions**: Animated toggle with color transitions
- **Disabled State**: Proper visual and keyboard disabled handling

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label text for the toggle |
| `description` | `string` | `undefined` | Description text displayed below label |
| `toggleSize` | `'sm' \| 'md' \| 'lg'` | `'md'` | Toggle size (affects switch and dot dimensions) |
| `color` | `ToggleColor` | `'primary'` | Color theme when checked |
| `labelPosition` | `'left' \| 'right'` | `'right'` | Label position relative to toggle |
| `disabled` | `boolean` | `false` | Disable toggle interaction |
| `checked` | `boolean` | `undefined` | Controlled checked state |
| `defaultChecked` | `boolean` | `undefined` | Uncontrolled initial checked state |
| `onChange` | `(e: ChangeEvent) => void` | `undefined` | Change handler function |
| `aria-label` | `string` | `undefined` | Accessibility label for screen readers |
| `aria-labelledby` | `string` | `undefined` | ID of element labeling the toggle |
| `aria-describedby` | `string` | `undefined` | ID of element describing the toggle |
| `className` | `string` | `''` | Additional CSS classes |
| All standard input attributes | - | - | Passes through all standard HTML input props |

### Sizes

#### Small (sm)

Compact size for dense interfaces.

```tsx
import { Toggle } from './ui/Toggle';

<Toggle
  label="Dark Mode"
  toggleSize="sm"
  checked={isDark}
  onChange={(e) => setDark(e.target.checked)}
/>
```

**Dimensions**:
- Switch: `w-9 h-5` (36px × 20px)
- Dot: `w-4 h-4` (16px × 16px)
- Label text: `text-sm`

#### Medium (md)

Standard size for most use cases (default).

```tsx
<Toggle
  label="Notifications"
  toggleSize="md"
  checked={notifications}
  onChange={(e) => setNotifications(e.target.checked)}
/>
```

**Dimensions**:
- Switch: `w-11 h-6` (44px × 24px)
- Dot: `w-5 h-5` (20px × 20px)
- Label text: `text-base`

#### Large (lg)

Larger size for better accessibility and touch targets.

```tsx
<Toggle
  label="Auto-save"
  toggleSize="lg"
  checked={autoSave}
  onChange={(e) => setAutoSave(e.target.checked)}
/>
```

**Dimensions**:
- Switch: `w-14 h-8` (56px × 32px)
- Dot: `w-6 h-6` (24px × 24px)
- Label text: `text-lg`

### Colors

Toggle colors when checked (unchecked state is always neutral):

```tsx
// Primary (default)
<Toggle label="Primary" color="primary" checked={true} />

// Blue
<Toggle label="Blue" color="blue" checked={true} />

// Green
<Toggle label="Green" color="green" checked={true} />

// Red
<Toggle label="Red" color="red" checked={true} />

// Purple
<Toggle label="Purple" color="purple" checked={true} />

// Orange
<Toggle label="Orange" color="orange" checked={true} />
```

**Color Classes**:
- Primary: `peer-checked:bg-primary-600`
- Blue: `peer-checked:bg-blue-600`
- Green: `peer-checked:bg-green-600`
- Red: `peer-checked:bg-red-600`
- Purple: `peer-checked:bg-purple-600`
- Orange: `peer-checked:bg-orange-600`

### Label Position

#### Right Label (Default)

Label positioned to the right of the toggle.

```tsx
<Toggle
  label="Enable notifications"
  labelPosition="right"
  checked={notifications}
  onChange={(e) => setNotifications(e.target.checked)}
/>
```

#### Left Label

Label positioned to the left of the toggle.

```tsx
<Toggle
  label="Enable notifications"
  labelPosition="left"
  checked={notifications}
  onChange={(e) => setNotifications(e.target.checked)}
/>
```

### Description

Add description text below the label.

```tsx
<Toggle
  label="Email Notifications"
  description="Receive email updates about new features"
  checked={emailNotifications}
  onChange={(e) => setEmailNotifications(e.target.checked)}
  labelPosition="right"
/>
```

**Styling**:
- Label text: `font-medium` with size-based font size
- Description text: `text-sm text-neutral-600 dark:text-neutral-400`

### Disabled State

Disable toggle interaction.

```tsx
<Toggle
  label="Restricted Feature"
  disabled={true}
  checked={false}
  onChange={() => {}}
/>
```

**Styling**:
- Opacity: `opacity-50`
- Cursor: `cursor-not-allowed`
- Prevents click/keyboard interaction
- Maintains visual styling

### Controlled Component

Use `checked` prop for controlled toggle.

```tsx
function SettingsPanel() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-4">
      <Toggle
        label="Dark Mode"
        checked={darkMode}
        onChange={(e) => setDarkMode(e.target.checked)}
      />
      <Toggle
        label="Notifications"
        checked={notifications}
        onChange={(e) => setNotifications(e.target.checked)}
      />
    </div>
  );
}
```

### Uncontrolled Component

Use `defaultChecked` prop for uncontrolled toggle.

```tsx
<form>
  <Toggle
    label="Remember me"
    name="remember"
    defaultChecked={true}
  />
  <button type="submit">Submit</button>
</form>
```

### Accessibility Features

The Toggle component includes comprehensive accessibility support:

1. **ARIA Roles**:
   - `role="switch"` - Indicates toggle switch component
   - `aria-checked` - Reflects checked state
   - `aria-label` - Descriptive label for screen readers
   - `aria-labelledby` - Associates with external label element
   - `aria-describedby` - Associates with description element

2. **Keyboard Navigation**:
   - Full keyboard support with Enter and Space keys
   - Visible focus ring with `peer-focus:ring-4`
   - Focus color matches toggle color

3. **Screen Reader Support**:
   - Label text announced when toggle has focus
   - State change announced (checked/unchecked)
   - Description text announced when provided

4. **Visual Accessibility**:
   - High contrast colors
   - Large touch targets (especially in lg size)
   - Clear visual indication of state (dot position)

```tsx
<Toggle
  label="Dark Mode"
  description="Switch to dark theme for better visibility in low light"
  checked={isDark}
  onChange={(e) => setDark(e.target.checked)}
  aria-label="Toggle dark mode theme"
  aria-describedby="dark-mode-desc"
/>
```

### Dark Mode

All Toggle colors automatically support dark mode:

- Unchecked background: `bg-neutral-200` → `dark:bg-neutral-700`
- Dot border: `after:border-neutral-300` (light) → `after:border-neutral-500` (dark)
- Checked dot border: `peer-checked:after:border-white` (consistent)
- Focus ring: Adapts to dark theme background
- Text colors: Adapted for both themes

### Real-World Examples

#### Settings Panel

```tsx
function SettingsPanel() {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoSave: true,
    soundEffects: false,
  });

  const handleSettingChange = (key: string) => (e: ChangeEvent) => {
    setSettings(prev => ({ ...prev, [key]: e.target.checked }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <Toggle
        label="Dark Mode"
        checked={settings.darkMode}
        onChange={handleSettingChange('darkMode')}
        toggleSize="lg"
        color="primary"
      />
      
      <Toggle
        label="Notifications"
        description="Receive push notifications for important updates"
        checked={settings.notifications}
        onChange={handleSettingChange('notifications')}
        toggleSize="md"
        color="blue"
      />
      
      <Toggle
        label="Auto-save"
        description="Automatically save your work every 30 seconds"
        checked={settings.autoSave}
        onChange={handleSettingChange('autoSave')}
        toggleSize="md"
        color="green"
      />
      
      <Toggle
        label="Sound Effects"
        description="Play sound effects for UI interactions"
        checked={settings.soundEffects}
        onChange={handleSettingChange('soundEffects')}
        toggleSize="md"
        color="orange"
      />
    </div>
  );
}
```

#### Preference Form

```tsx
function UserPreferences() {
  return (
    <form className="space-y-4">
      <Toggle
        label="Email Marketing"
        description="Receive promotional emails and product updates"
        name="emailMarketing"
        defaultChecked={false}
      />
      
      <Toggle
        label="Public Profile"
        description="Make your profile visible to other users"
        name="publicProfile"
        defaultChecked={true}
      />
      
      <Toggle
        label="Two-Factor Authentication"
        description="Add an extra layer of security to your account"
        name="twoFactor"
        defaultChecked={false}
        color="primary"
        toggleSize="lg"
      />
      
      <Button type="submit">Save Preferences</Button>
    </form>
  );
}
```

#### Compact Toggle List

```tsx
function QuickSettings() {
  return (
    <div className="flex flex-wrap gap-4">
      <Toggle
        label="A"
        aria-label="Option A"
        toggleSize="sm"
        color="blue"
      />
      <Toggle
        label="B"
        aria-label="Option B"
        toggleSize="sm"
        color="green"
      />
      <Toggle
        label="C"
        aria-label="Option C"
        toggleSize="sm"
        color="orange"
      />
      <Toggle
        label="D"
        aria-label="Option D"
        toggleSize="sm"
        color="purple"
      />
    </div>
  );
}
```

### Performance Considerations

The Toggle component is optimized using:
- Functional component with `forwardRef`
- Proper TypeScript typing
- CSS-only animations and transitions
- No unnecessary re-renders
- Peer class based state management
- Efficient class string concatenation

### Migration Guide

To migrate existing toggle implementations:

**Before:**
```tsx
<label className="flex items-center gap-3">
  <span className="font-medium text-base text-neutral-900 dark:text-white">
    Notifications
  </span>
  <input
    type="checkbox"
    checked={notifications}
    onChange={(e) => setNotifications(e.target.checked)}
    className="sr-only peer"
  />
  <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-700 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:bg-white after:rounded-full after:h-5 after:w-5 after:top-[2px] after:left-[2px] after:border after:border-neutral-300 peer-checked:after:border-white peer-checked:after:translate-x-full after:transition-all transition-colors duration-200 ease-in-out cursor-pointer" />
</label>
```

**After:**
```tsx
import { Toggle } from './ui/Toggle';

<Toggle
  label="Notifications"
  checked={notifications}
  onChange={(e) => setNotifications(e.target.checked)}
/>
```

**Benefits:**
- ✅ Consistent styling across application
- ✅ Improved accessibility with proper ARIA support
- ✅ Multiple size and color variants
- ✅ Label and description support
- ✅ Dark mode support
- ✅ Smooth animations
- ✅ Reduced code duplication
- ✅ Type-safe props

### Test Coverage

The Toggle component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/Toggle.test.tsx
```

Test scenarios include:
- Rendering with default props
- Rendering with label
- Rendering with description
- All size variants (sm, md, lg)
- All color variants (primary, blue, green, red, purple, orange)
- Label position (left, right)
- Controlled component (checked prop)
- Uncontrolled component (defaultChecked prop)
- Disabled state behavior
- Change handler invocation
- Focus management
- Keyboard accessibility
- Dark mode styling
- ARIA attributes (role, aria-checked, aria-label, aria-labelledby, aria-describedby)
- Peer class application
- Dot positioning

### Usage in Application

Currently integrated in various settings and preference panels.

**Common Patterns:**

```tsx
// Basic toggle
<Toggle
  label="Dark Mode"
  checked={darkMode}
  onChange={(e) => setDarkMode(e.target.checked)}
/>

// Toggle with description
<Toggle
  label="Notifications"
  description="Receive push notifications"
  checked={notifications}
  onChange={(e) => setNotifications(e.target.checked)}
/>

// Toggle with custom color
<Toggle
  label="Danger Zone"
  color="red"
  checked={dangerZone}
  onChange={(e) => setDangerZone(e.target.checked)}
/>

// Large toggle for accessibility
<Toggle
  label="Critical Setting"
  toggleSize="lg"
  checked={critical}
  onChange={(e) => setCritical(e.target.checked)}
/>
```

### Future Enhancements

Potential improvements to consider:
- Loading state variant
- Intermediate state (three-way toggle)
- Custom toggle animations
- Icon support in label
- Toggle group component
- Tooltip integration for additional context

---

## Heading Component

**Location**: `src/components/ui/Heading.tsx`

A semantic heading component with flexible size, weight, tracking, and level control.

### Features

- **6 Levels**: `h1` through `h6` for proper HTML semantics
- **12 Sizes**: `xs` through `8xl` for flexible typography
- **4 Weights**: `normal`, `medium`, `semibold`, `bold`
- **3 Tracking Options**: `tight`, `normal`, `wide` for letter spacing
- **Accessibility**: Semantic HTML elements with proper ARIA roles
- **Dark Mode**: Consistent styling across light and dark themes
- **Custom Leading**: Configurable line-height via `leading` prop

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | HTML heading element (h1-h6) |
| `size` | `HeadingSize` | `'2xl'` | Text size variant |
| `weight` | `HeadingWeight` | `'bold'` | Font weight |
| `tracking` | `HeadingTracking` | `'normal'` | Letter spacing |
| `leading` | `string` | `undefined` | Custom line-height (Tailwind class) |
| `id` | `string` | `undefined` | Unique identifier for anchor links |
| `className` | `string` | `''` | Additional CSS classes |
| `children` | `ReactNode` | Required | Heading content |
| All standard HTML heading attributes | - | - | Passes through all standard HTML heading props |

### Levels

Semantic heading levels map to proper HTML elements.

```tsx
import Heading from './ui/Heading';

// H1 - Main page title
<Heading level={1} size="4xl">Welcome to Our Application</Heading>

// H2 - Section titles (default)
<Heading level={2} size="2xl">User Profile</Heading>

// H3 - Subsection titles
<Heading level={3} size="xl">Account Settings</Heading>

// H4 - Component titles
<Heading level={4} size="lg">Notifications</Heading>

// H5 - Small titles
<Heading level={5} size="base">Filter Options</Heading>

// H6 - Tiny titles
<Heading level={6} size="sm">Legend</Heading>
```

**HTML Element Mapping**:
- `level={1}` → `<h1>`
- `level={2}` → `<h2>`
- `level={3}` → `<h3>`
- `level={4}` → `<h4>`
- `level={5}` → `<h5>`
- `level={6}` → `<h6>`

### Sizes

Available size options from smallest to largest.

```tsx
<Heading size="xs">Extra Small</Heading>
<Heading size="sm">Small</Heading>
<Heading size="base">Base</Heading>
<Heading size="lg">Large</Heading>
<Heading size="xl">Extra Large</Heading>
<Heading size="2xl">2X Large</Heading>
<Heading size="3xl">3X Large</Heading>
<Heading size="4xl">4X Large</Heading>
<Heading size="5xl">5X Large</Heading>
<Heading size="6xl">6X Large</Heading>
<Heading size="7xl">7X Large</Heading>
<Heading size="8xl">8X Large</Heading>
```

**Tailwind Mapping**:
- `xs`: `text-xs`
- `sm`: `text-sm`
- `base`: `text-base`
- `lg`: `text-lg`
- `xl`: `text-xl`
- `2xl`: `text-2xl`
- `3xl`: `text-3xl`
- `4xl`: `text-4xl`
- `5xl`: `text-5xl`
- `6xl`: `text-6xl`
- `7xl`: `text-7xl`
- `8xl`: `text-8xl`

### Weights

Font weight options for visual hierarchy.

```tsx
<Heading weight="normal">Normal Weight</Heading>
<Heading weight="medium">Medium Weight</Heading>
<Heading weight="semibold">Semibold Weight</Heading>
<Heading weight="bold">Bold Weight</Heading>
```

**Tailwind Mapping**:
- `normal`: `font-normal`
- `medium`: `font-medium`
- `semibold`: `font-semibold`
- `bold`: `font-bold`

### Tracking

Letter spacing options for readability.

```tsx
<Heading tracking="tight">Tight Tracking</Heading>
<Heading tracking="normal">Normal Tracking</Heading>
<Heading tracking="wide">Wide Tracking</Heading>
```

**Tailwind Mapping**:
- `tight`: `tracking-tight`
- `normal`: `tracking-normal`
- `wide`: `tracking-wide`

### Custom Leading

Custom line-height for better typography.

```tsx
<Heading leading="leading-tight">Tight Line Height</Heading>
<Heading leading="leading-loose">Loose Line Height</Heading>
<Heading leading="leading-[2]">Custom 2rem Line Height</Heading>
```

### Accessibility Features

The Heading component includes comprehensive accessibility support:

1. **Semantic HTML**: Uses proper heading elements (h1-h6)
2. **Logical Hierarchy**: Enables proper document structure
3. **Screen Reader Support**: Heading levels announced by screen readers
4. **Anchor Support**: ID prop enables anchor links
5. **Focus Management**: Proper tab order through heading levels

```tsx
<Heading
  level={2}
  id="profile-section"
  size="2xl"
>
  User Profile
</Heading>

// Anchor link to heading
<a href="#profile-section">Jump to Profile</a>
```

### Dark Mode

All Heading sizes automatically support dark mode:

- Text color: `text-neutral-900` → `dark:text-white`
- Consistent across all sizes and weights

### Real-World Examples

#### Page Title

```tsx
function DashboardPage() {
  return (
    <div>
      <Heading level={1} size="4xl">
        Welcome to Your Dashboard
      </Heading>
      <p className="mt-4 text-neutral-600 dark:text-neutral-400">
        Here's an overview of your activity.
      </p>
    </div>
  );
}
```

#### Section Title

```tsx
function UserProfile() {
  return (
    <section>
      <Heading level={2} size="2xl">
        Account Settings
      </Heading>
      <form>
        {/* Form fields */}
      </form>
    </section>
  );
}
```

#### Card Title

```tsx
function UserCard({ user }) {
  return (
    <Card>
      <Heading level={3} size="xl" className="mb-4">
        {user.name}
      </Heading>
      <p className="text-neutral-600 dark:text-neutral-400">
        {user.email}
      </p>
    </Card>
  );
}
```

#### Typography Variants

```tsx
function TypographyShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <Heading level={1} size="4xl" weight="bold">
          Hero Title
        </Heading>
        <p>Use for main page titles</p>
      </div>
      
      <div>
        <Heading level={2} size="2xl" weight="semibold" tracking="tight">
          Section Title
        </Heading>
        <p>Use for major sections</p>
      </div>
      
      <div>
        <Heading level={3} size="xl" weight="medium">
          Subsection Title
        </Heading>
        <p>Use for subsections and components</p>
      </div>
      
      <div>
        <Heading level={4} size="lg" weight="normal">
          Small Title
        </Heading>
        <p>Use for card titles and small sections</p>
      </div>
    </div>
  );
}
```

#### Responsive Heading

```tsx
function ResponsiveHeader() {
  return (
    <Heading
      level={1}
      size="lg sm:xl md:2xl lg:3xl"
      weight="bold"
    >
      Responsive Title
    </Heading>
  );
}
```

#### With Anchor ID

```tsx
function DocumentationPage() {
  return (
    <div>
      <nav>
        <a href="#getting-started">Getting Started</a>
        <a href="#features">Features</a>
        <a href="#api">API Reference</a>
      </nav>
      
      <article>
        <Heading level={2} id="getting-started" size="2xl">
          Getting Started
        </Heading>
        {/* Content */}
        
        <Heading level={2} id="features" size="2xl">
          Features
        </Heading>
        {/* Content */}
        
        <Heading level={2} id="api" size="2xl">
          API Reference
        </Heading>
        {/* Content */}
      </article>
    </div>
  );
}
```

### Performance Considerations

The Heading component is optimized using:
- Functional component with `forwardRef`
- Proper TypeScript typing
- No unnecessary re-renders
- Efficient class string concatenation
- Semantic HTML without JavaScript overhead

### Migration Guide

To migrate existing heading implementations:

**Before:**
```tsx
<h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
  Section Title
</h2>
```

**After:**
```tsx
import Heading from './ui/Heading';

<Heading level={2} size="2xl" weight="bold">
  Section Title
</Heading>
```

**Benefits:**
- ✅ Consistent styling across application
- ✅ Semantic HTML with proper heading levels
- ✅ Multiple size and weight variants
- ✅ Tracking and leading control
- ✅ Dark mode support
- ✅ Type-safe props
- ✅ Improved accessibility

### Best Practices

1. **Use Correct Heading Levels**:
   ```tsx
   ✅ Good: Logical heading hierarchy
   <Heading level={1}>Page Title</Heading>
   <Heading level={2}>Section Title</Heading>
   <Heading level={3}>Subsection Title</Heading>

   ❌ Bad: Skipping levels
   <Heading level={1}>Title</Heading>
   <Heading level={3}>Subtitle</Heading>
   ```

2. **Match Size to Importance**:
   ```tsx
   ✅ Good: Size matches visual importance
   <Heading level={1} size="4xl">Main Title</Heading>

   ❌ Bad: Size mismatch
   <Heading level={1} size="xs">Main Title</Heading>
   ```

3. **Provide IDs for Anchor Links**:
   ```tsx
   ✅ Good: ID for anchor navigation
   <Heading level={2} id="section-title">Title</Heading>

   ❌ Bad: No ID for documentation
   <Heading level={2}>Title</Heading>
   ```

### Test Coverage

The Heading component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/Heading.test.tsx
```

Test scenarios include:
- Rendering with all levels (1-6)
- Rendering with all sizes (xs-8xl)
- Rendering with all weights (normal, medium, semibold, bold)
- Rendering with all tracking options (tight, normal, wide)
- Custom leading prop
- ID prop for anchor links
- Custom className application
- Props passthrough
- Semantic HTML element mapping
- Dark mode styling

### Usage in Application

**Common Patterns:**

```tsx
// Page title
<Heading level={1} size="4xl">Page Title</Heading>

// Section title
<Heading level={2} size="2xl">Section Title</Heading>

// Subsection title
<Heading level={3} size="xl">Subsection Title</Heading>

// Card title
<Heading level={4} size="lg">Card Title</Heading>

// Small title
<Heading level={5} size="base">Small Title</Heading>
```

### Future Enhancements

Potential improvements to consider:
- Gradient text support
- Gradient underline effect
- Decorative prefix/suffix components
- Animated entrance effects
- Truncate variant for long titles

---

## Label Component

**Location**: `src/components/ui/Label.tsx`

A reusable label component for form fields with accessibility support and customizable styling.

### Features

- **Accessibility**: Full ARIA support with proper label association
- **Required Indicator**: Visual `*` indicator for required fields
- **HTML For**: Automatic `htmlFor` association with form inputs
- **Custom Styling**: Flexible className prop for custom styling
- **Dark Mode**: Consistent styling across light and dark themes

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `htmlFor` | `string` | `undefined` | ID of the form element this label is associated with |
| `children` | `ReactNode` | Required | Label content |
| `required` | `boolean` | `false` | Show required indicator (*) |
| `className` | `string` | `''` | Additional CSS classes |
| All standard label attributes | - | - | Passes through all standard HTML label props |

### Basic Usage

```tsx
import Label from './ui/Label';

<Label htmlFor="username">Username</Label>
<input id="username" type="text" />
```

### Required Field

Show required indicator with visual `*`.

```tsx
<Label htmlFor="email" required>
  Email Address
</Label>
<input id="email" type="email" />
```

**Accessibility**: Required indicator includes `aria-label="required"` for screen readers.

### With Input Component

```tsx
import Input from './ui/Input';
import Label from './ui/Label';

<div>
  <Label htmlFor="firstName" required>
    First Name
  </Label>
  <Input
    id="firstName"
    type="text"
    placeholder="Enter your first name"
  />
</div>
```

### Custom Styling

Add custom classes while preserving default label styling.

```tsx
<Label
  htmlFor="password"
  className="text-primary-600 font-semibold block mb-2"
  required
>
  Password
</Label>
<input id="password" type="password" />
```

### Accessibility Features

The Label component includes comprehensive accessibility support:

1. **HTML For**: Proper association with form element via `htmlFor` prop
2. **Required Indicator**: Visual `*` with `aria-label="required"` for screen readers
3. **Semantic HTML**: Uses native `<label>` element
4. **Keyboard Navigation**: Clicking label focuses associated form element

```tsx
<Label
  htmlFor="address"
  required
  aria-label="Street address (required)"
>
  Street Address
</Label>
<input id="address" type="text" />
```

### Dark Mode

All Label styling automatically supports dark mode:

- Text color: Adapts to dark theme
- Required indicator: `text-red-500` maintains visibility

### Real-World Examples

#### Form with Labels

```tsx
function ContactForm() {
  return (
    <form className="space-y-6">
      <div>
        <Label htmlFor="name" required className="block mb-2">
          Full Name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          fullWidth
        />
      </div>
      
      <div>
        <Label htmlFor="email" required className="block mb-2">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          fullWidth
        />
      </div>
      
      <div>
        <Label htmlFor="message" className="block mb-2">
          Message
        </Label>
        <Textarea
          id="message"
          placeholder="Your message..."
          autoResize
          fullWidth
        />
      </div>
      
      <Button type="submit">Send Message</Button>
    </form>
  );
}
```

#### Label with Description

```tsx
function LabeledField() {
  return (
    <div>
      <Label
        htmlFor="bio"
        className="block mb-2"
      >
        Bio
      </Label>
      <Textarea
        id="bio"
        placeholder="Tell us about yourself..."
        helperText="Max 500 characters"
        maxLength={500}
        fullWidth
      />
    </div>
  );
}
```

#### Grouped Labels

```tsx
function AddressForm() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="city" className="block mb-2">
          City
        </Label>
        <Input id="city" type="text" fullWidth />
      </div>
      
      <div>
        <Label htmlFor="state" className="block mb-2">
          State
        </Label>
        <Select id="state" fullWidth>
          <option value="">Select State</option>
          <option value="CA">California</option>
          <option value="NY">New York</option>
        </Select>
      </div>
    </div>
  );
}
```

### Performance Considerations

The Label component is optimized using:
- Functional component with proper typing
- No unnecessary re-renders
- Semantic HTML without JavaScript overhead
- Efficient class string concatenation

### Migration Guide

To migrate existing label implementations:

**Before:**
```tsx
<label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
  Username
</label>
<input type="text" />
```

**After:**
```tsx
import Label from './ui/Label';

<Label htmlFor="username" className="block mb-2">
  Username
</Label>
<input id="username" type="text" />
```

**Benefits:**
- ✅ Consistent styling across application
- ✅ Improved accessibility with proper `htmlFor` association
- ✅ Built-in required indicator
- ✅ ARIA labels for screen readers
- ✅ Dark mode support
- ✅ Type-safe props

### Test Coverage

The Label component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/Label.test.tsx
```

Test scenarios include:
- Rendering with default props
- Rendering with `htmlFor` prop
- Rendering with `required` prop
- Required indicator display
- ARIA label on required indicator
- Custom className application
- Props passthrough

### Usage in Application

**Common Patterns:**

```tsx
// Simple label
<Label htmlFor="field">Field Label</Label>

// Required label
<Label htmlFor="required" required>Required Field</Label>

// Custom styled label
<Label htmlFor="custom" className="text-primary-600 font-bold">
  Custom Label
</Label>

// Label with helper text
<div>
  <Label htmlFor="password" required>Password</Label>
  <Input id="password" type="password" helperText="Min 8 characters" />
</div>
```

### Future Enhancements

Potential improvements to consider:
- Tooltip support for additional context
- Help icon integration
- Custom required indicator component
- Label positioning (top, left, inline)

---

## Alert Component

**Location**: `src/components/ui/Alert.tsx`

A comprehensive alert component for notifications, warnings, errors, and informational messages with multiple variants, sizes, and border styles.

### Features

- **5 Variants**: `info`, `success`, `warning`, `error`, `neutral`
- **3 Sizes**: `sm`, `md`, `lg`
- **3 Border Styles**: `left`, `full`, `none`
- **Built-in Icons**: Default icons for each variant
- **Custom Icons**: Support for custom icon components
- **Close Button**: Optional dismiss functionality
- **Accessibility**: Full ARIA support with proper live regions
- **Dark Mode**: Consistent styling across light and dark themes
- **Centered Content**: Optional text centering
- **Full Width**: Configurable width behavior

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Alert content |
| `variant` | `AlertVariant` | `'info'` | Visual color variant |
| `size` | `AlertSize` | `'md'` | Alert size |
| `border` | `AlertBorder` | `'full'` | Border style |
| `title` | `string` | `undefined` | Alert title text |
| `icon` | `ReactNode` | `undefined` | Custom icon component |
| `showCloseButton` | `boolean` | `false` | Show close button |
| `onClose` | `() => void` | `undefined` | Close handler function |
| `fullWidth` | `boolean` | `true` | Alert takes full width of container |
| `centered` | `boolean` | `false` | Center text content |
| `className` | `string` | `''` | Additional CSS classes |

### Variants

#### Info Variant

Blue alert for informational messages.

```tsx
import Alert from './ui/Alert';

<Alert variant="info">
  Your account has been created successfully.
</Alert>
```

**Styling**:
- Background: `bg-blue-50` / `dark:bg-blue-900/20`
- Border: `border-blue-200` / `dark:border-blue-800`
- Title: `text-blue-900` / `dark:text-blue-100`
- Text: `text-blue-700` / `dark:text-blue-300`
- Icon background: `bg-blue-100` / `dark:bg-blue-900/50`

#### Success Variant

Green alert for success messages.

```tsx
<Alert variant="success">
  Changes saved successfully!
</Alert>
```

**Styling**:
- Background: `bg-green-50` / `dark:bg-green-900/20`
- Border: `border-green-200` / `dark:border-green-800`
- Title: `text-green-900` / `dark:text-green-100`
- Text: `text-green-700` / `dark:text-green-300`
- Icon background: `bg-green-100` / `dark:bg-green-900/50`

#### Warning Variant

Yellow alert for cautionary messages.

```tsx
<Alert variant="warning">
  Your session will expire in 5 minutes.
</Alert>
```

**Styling**:
- Background: `bg-yellow-50` / `dark:bg-yellow-900/20`
- Border: `border-yellow-200` / `dark:border-yellow-800`
- Title: `text-yellow-900` / `dark:text-yellow-100`
- Text: `text-yellow-700` / `dark:text-yellow-300`
- Icon background: `bg-yellow-100` / `dark:bg-yellow-900/50`

#### Error Variant

Red alert for error messages.

```tsx
<Alert variant="error">
  Failed to save changes. Please try again.
</Alert>
```

**Styling**:
- Background: `bg-red-50` / `dark:bg-red-900/20`
- Border: `border-red-200` / `dark:border-red-800`
- Title: `text-red-900` / `dark:text-red-100`
- Text: `text-red-700` / `dark:text-red-300`
- Icon background: `bg-red-100` / `dark:bg-red-900/50`

#### Neutral Variant

Gray alert for neutral messages.

```tsx
<Alert variant="neutral">
  This is a neutral notification.
</Alert>
```

**Styling**:
- Background: `bg-neutral-50` / `dark:bg-neutral-900/50`
- Border: `border-neutral-200` / `dark:border-neutral-700`
- Title: `text-neutral-900` / `dark:text-neutral-100`
- Text: `text-neutral-700` / `dark:text-neutral-300`
- Icon background: `bg-neutral-100` / `dark:bg-neutral-700`

### Sizes

#### Small (sm)

Compact size for inline alerts.

```tsx
<Alert variant="info" size="sm">
  Small info message
</Alert>
```

**Dimensions**:
- Padding: `p-3`
- Text: `text-xs`
- Icon: `w-5 h-5`
- Title: `text-sm`

#### Medium (md)

Standard size for most use cases (default).

```tsx
<Alert variant="success" size="md">
  Medium success message
</Alert>
```

**Dimensions**:
- Padding: `p-4`
- Text: `text-sm`
- Icon: `w-6 h-6`
- Title: `text-base`

#### Large (lg)

Larger size for important alerts.

```tsx
<Alert variant="warning" size="lg">
  Large warning message
</Alert>
```

**Dimensions**:
- Padding: `p-6`
- Text: `text-base`
- Icon: `w-8 h-8`
- Title: `text-lg`

### Border Styles

#### Left Border

Accent border on left side only.

```tsx
<Alert variant="error" border="left">
  Error with left border accent
</Alert>
```

**Styling**:
- Left border: `border-l-4 border-l-red-500`
- No other borders

#### Full Border

Border around entire alert (default).

```tsx
<Alert variant="info" border="full">
  Info with full border
</Alert>
```

**Styling**:
- Full border: `border border-blue-200` / `dark:border-blue-800`

#### No Border

No border styling.

```tsx
<Alert variant="success" border="none">
  Success with no border
</Alert>
```

**Styling**:
- No border classes applied

### With Title

Add a title to the alert.

```tsx
<Alert variant="warning" title="Attention Required">
  Your account needs verification before you can continue.
</Alert>
```

### Custom Icon

Use a custom icon instead of the default.

```tsx
<Alert
  variant="info"
  icon={<BellIcon />}
>
  You have a new notification!
</Alert>
```

### Close Button

Add a dismissible close button.

```tsx
function DismissibleAlert() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <Alert
      variant="success"
      showCloseButton
      onClose={() => setVisible(false)}
    >
      Changes saved successfully!
    </Alert>
  );
}
```

### Centered Content

Center the alert text.

```tsx
<Alert variant="info" centered>
  This alert content is centered
</Alert>
```

### Real-World Examples

#### Success Notification

```tsx
function SaveNotification({ visible, onClose }) {
  if (!visible) return null;

  return (
    <Alert
      variant="success"
      title="Success"
      showCloseButton
      onClose={onClose}
    >
      Your changes have been saved successfully.
    </Alert>
  );
}
```

#### Error Alert

```tsx
function FormError({ error }) {
  if (!error) return null;

  return (
    <Alert variant="error" border="left">
      <strong>Error:</strong> {error.message}
    </Alert>
  );
}
```

#### Warning Banner

```tsx
function WarningBanner() {
  return (
    <Alert variant="warning" size="lg" centered>
      <p>
        <strong>Warning:</strong> This feature is currently in beta.
        Some functionality may be unstable.
      </p>
    </Alert>
  );
}
```

#### Info Alert with Action

```tsx
function InfoAlert() {
  return (
    <Alert variant="info" title="New Feature Available">
      <p className="mb-4">
        We've added a new dashboard with advanced analytics.
      </p>
      <Button size="sm">Explore Dashboard</Button>
    </Alert>
  );
}
```

#### Multi-Alert Stack

```tsx
function AlertStack({ alerts, onDismiss }) {
  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant}
          title={alert.title}
          showCloseButton
          onClose={() => onDismiss(alert.id)}
        >
          {alert.message}
        </Alert>
      ))}
    </div>
  );
}
```

### Accessibility Features

The Alert component includes comprehensive accessibility support:

1. **ARIA Role**: `role="alert"` indicates important message
2. **ARIA Live Region**: `aria-live="polite"` announces changes to screen readers
3. **ARIA Labelled By**: Associates title with alert content
4. **Icon Hiding**: Icon has `aria-hidden="true"` for screen readers
5. **Keyboard Navigation**: Close button is keyboard accessible
6. **Focus Management**: Close button has proper focus handling

```tsx
<Alert
  variant="info"
  title="System Update"
  role="alert"
  aria-live="polite"
>
  A new update is available. Please refresh to continue.
</Alert>
```

### Dark Mode

All Alert variants automatically support dark mode:

- Backgrounds: Darker versions in dark mode (e.g., `bg-blue-50` → `dark:bg-blue-900/20`)
- Borders: Adapted to dark theme colors
- Text colors: Lighter colors in dark mode for contrast
- Icon backgrounds: Semi-transparent in dark mode

### Performance Considerations

The Alert component is optimized using:
- Functional component with proper typing
- No unnecessary re-renders
- CSS-only transitions
- Efficient class string concatenation
- Reusable default icons

### Migration Guide

To migrate existing alert implementations:

**Before:**
```tsx
<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
  <div className="flex items-start gap-3">
    <InformationCircleIcon className="w-6 h-6 text-blue-600" />
    <div>
      <h3 className="text-base text-blue-900 dark:text-blue-100 font-semibold mb-1.5">
        Info
      </h3>
      <p className="text-sm text-blue-700 dark:text-blue-300">
        Your message here
      </p>
    </div>
  </div>
</div>
```

**After:**
```tsx
import Alert from './ui/Alert';

<Alert variant="info" title="Info">
  Your message here
</Alert>
```

**Benefits:**
- ✅ Consistent styling across application
- ✅ Multiple variants for different message types
- ✅ Built-in icons for each variant
- ✅ Close button support
- ✅ Improved accessibility with proper ARIA support
- ✅ Dark mode support
- ✅ Reduced code duplication

### Test Coverage

The Alert component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/Alert.test.tsx
```

Test scenarios include:
- Rendering with all variants (info, success, warning, error, neutral)
- Rendering with all sizes (sm, md, lg)
- Rendering with all border styles (left, full, none)
- Title rendering
- Default icon rendering
- Custom icon rendering
- Close button display
- Close button interaction
- Centered content
- Full width variant
- ARIA attributes (role, aria-live, aria-labelledby)
- Dark mode styling
- Icon hiding (aria-hidden)

### Usage in Application

**Common Patterns:**

```tsx
// Success message
<Alert variant="success" showCloseButton onClose={dismiss}>
  Changes saved successfully!
</Alert>

// Error message
<Alert variant="error" title="Error">
  Failed to complete action. Please try again.
</Alert>

// Warning message
<Alert variant="warning">
  Your session will expire soon.
</Alert>

// Info message
<Alert variant="info" border="left">
  New feature available for testing.
</Alert>
```

### Future Enhancements

Potential improvements to consider:
- Auto-dismiss timer
- Progress bar variant
- Action buttons integrated
- Icon animation variants
- Collapsible alert content

---
## LinkCard Component

**Location**: `src/components/ui/LinkCard.tsx`

A reusable link card component for displaying external links with icons, colors, and consistent styling.

### Features

- **Custom Color Support**: Accepts color class strings for flexible theming
- **Accessibility**: Full ARIA support, keyboard navigation, focus management
- **Dark Mode**: Consistent styling across light and dark themes
- **External Link**: Automatically includes `target="_blank"` and `rel="noopener noreferrer"`
- **Responsive Design**: Adaptive padding and icon sizes for different screen sizes
- **Interactive Effects**: Hover lift, scale, and shadow transitions

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | Required | Link name/description text |
| `href` | `string` | Required | Link URL |
| `icon` | `ReactNode` | Required | Icon component to display |
| `colorClass` | `string` | Required | CSS class string for icon container color |
| `ariaLabel` | `string` | `name` | Accessibility label for screen readers |

### Basic Usage

```tsx
import LinkCard from './ui/LinkCard';

<ul role="list">
  <LinkCard
    name="Portal RDM"
    href="https://rdm.ma-malnukananga.sch.id"
    icon={<DocumentTextIcon />}
    colorClass="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
    ariaLabel="Buka Portal RDM di tab baru"
  />
</ul>
```

### Custom Color Classes

The component accepts any color class string for maximum flexibility:

```tsx
// Using COLOR_ICONS helper
import { getColorIconClass } from '../config/colorIcons';

<LinkCard
  name="Kemenag RI"
  colorClass={getColorIconClass('emerald')}
  href="https://kemenag.go.id"
  icon={<BuildingLibraryIcon />}
/>

// Custom color class
<LinkCard
  name="Custom Link"
  colorClass="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
  href="https://example.com"
  icon={<CustomIcon />}
/>
```

### Accessibility Features

1. **ARIA Labels**: Supports custom `ariaLabel` for screen reader descriptions
2. **External Link Safety**: Automatically adds `target="_blank"` and `rel="noopener noreferrer"`
3. **Focus Management**: Clear focus ring with `focus:ring-2 focus:ring-primary-500/50`
4. **Focus Offset**: Proper offset for dark mode (`dark:focus:ring-offset-neutral-800`)
5. **Icon ARIA**: Icon container has `aria-hidden="true"` to prevent duplication
6. **List Role**: Component is wrapped in `<li role="listitem">` for proper list semantics

### Responsive Design

The component automatically adapts to different screen sizes:

- **Padding**: `p-7` → `sm:p-8` → `lg:p-10`
- **Icon Container**: `h-14 w-14` → `sm:h-16 sm:w-16` → `lg:h-20 lg:w-20`
- **Text Size**: `text-sm` → `sm:text-base`

### Hover Effects

The component includes smooth interactive effects:

- **Card Lift**: `hover:-translate-y-1` for depth perception
- **Scale**: `hover:scale-[1.02]` for interactive feedback
- **Shadow**: `hover:shadow-card-hover` for elevation change
- **Background**: Maintains light/dark theme on hover
- **Icon Scale**: Icon container scales to `group-hover:scale-110` for emphasis

### Dark Mode

All styling automatically supports dark mode:

- **Card Background**: `bg-white` → `dark:bg-neutral-800`
- **Card Border**: `border-neutral-200` → `dark:border-neutral-700`
- **Text Color**: `text-neutral-700` → `dark:text-neutral-200`
- **Hover Background**: `hover:bg-white` → `dark:hover:bg-neutral-700`
- **Focus Offset**: `focus:ring-offset-2` → `dark:focus:ring-offset-neutral-800`

### Performance Considerations

The LinkCard component is optimized using:

- Functional component with proper TypeScript typing
- CSS-only transitions and transforms (no JavaScript animations)
- Efficient class string concatenation
- No unnecessary re-renders
- Semantic HTML with `<ul>` and `<li>` structure

### Real-World Examples

#### Related Links Section

```tsx
import { getRelatedLinks } from '../data/defaults';
import { getColorIconClass } from '../config/colorIcons';

const RelatedLinksSection = () => {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    getRelatedLinks().then(setLinks);
  }, []);

  return (
    <section>
      <nav aria-label="Tautan terkait eksternal">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 lg:gap-6" role="list">
          {links.map((link) => (
            <LinkCard
              key={link.name}
              name={link.name}
              href={link.href}
              icon={link.icon}
              colorClass={link.colorClass}
              ariaLabel={`${link.name} (membuka di tab baru)`}
            />
          ))}
        </ul>
      </nav>
    </section>
  );
};
```

#### Quick Access Links

```tsx
const QuickLinks = () => {
  const quickLinks = [
    {
      name: 'LMS',
      href: '/lms',
      icon: <AcademicCapIcon />,
      colorClass: getColorIconClass('blue'),
    },
    {
      name: 'E-Library',
      href: '/library',
      icon: <BookOpenIcon />,
      colorClass: getColorIconClass('purple'),
    },
    {
      name: 'Schedule',
      href: '/schedule',
      icon: <CalendarIcon />,
      colorClass: getColorIconClass('green'),
    },
  ];

  return (
    <ul className="grid grid-cols-3 gap-4" role="list">
      {quickLinks.map(link => (
        <LinkCard
          key={link.name}
          {...link}
          ariaLabel={`Buka ${link.name}`}
        />
      ))}
    </ul>
  );
};
```

### Integration with COLOR_ICONS

The component works seamlessly with the existing `COLOR_ICONS` configuration:

```tsx
import { COLOR_ICONS, getColorIconClass } from '../config/colorIcons';

// Available colors: sky, emerald, amber, indigo, blue, red, green, purple, orange, pink, teal, cyan

<LinkCard
  name="Portal Pendidikan"
  href="https://dikbud.kemdikbud.go.id"
  icon={<GraduationCapIcon />}
  colorClass={getColorIconClass('indigo')}
/>
```

### Migration Guide

To migrate existing link card implementations:

**Before:**
```tsx
<a
  href="https://example.com"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Open Example in new tab"
  className="group flex flex-col items-center p-7 sm:p-8 lg:p-10 bg-white dark:bg-neutral-800 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 ease-out transform hover:-translate-y-1 hover:bg-white dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 active:scale-95 hover:scale-[1.02]"
>
  <div 
    className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 transition-transform duration-300 group-hover:scale-110 shadow-sm hover:shadow-md"
    aria-hidden="true"
  >
    <DocumentTextIcon />
  </div>
  <span className="mt-4 sm:mt-5 lg:mt-6 font-semibold text-center text-sm sm:text-base text-neutral-700 dark:text-neutral-200">
    Portal Pendidikan
  </span>
</a>
```

**After:**
```tsx
import LinkCard from './ui/LinkCard';

<LinkCard
  name="Portal Pendidikan"
  href="https://example.com"
  icon={<DocumentTextIcon />}
  colorClass="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
  ariaLabel="Open Example in new tab"
/>
```

**Benefits:**
- ✅ Consistent styling across application
- ✅ Improved accessibility with proper ARIA support
- ✅ Reduced code duplication
- ✅ Built-in responsive design
- ✅ Dark mode support
- ✅ Interactive hover effects
- ✅ External link safety attributes
- ✅ Type-safe props
- ✅ Semantic HTML structure

### Test Coverage

The LinkCard component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/LinkCard.test.tsx
```

Test scenarios include:
- Rendering with default props
- Correct href attribute
- External link attributes (target, rel)
- Custom aria-label support
- Name text rendering
- Role="listitem" on li element
- Color class application to icon container
- Focus styles for accessibility
- Hover effects
- Keyboard navigation support
- Responsive padding classes
- Responsive icon sizes
- Icon aria-hidden attribute
- Dark mode support
- Transition effects
- Scale animation on icon hover
- Ring offset for dark mode focus

### Usage in Application

Currently integrated in:
- `src/components/sections/RelatedLinksSection.tsx` - External links section with 4 links

**Common Patterns:**

```tsx
// External service links
<LinkCard
  name="Service Name"
  href="https://service.example.com"
  icon={<ServiceIcon />}
  colorClass={getColorIconClass('blue')}
/>

// Social media links
<LinkCard
  name="Instagram"
  href="https://instagram.com/account"
  icon={<InstagramIcon />}
  colorClass="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
/>

// Documentation links
<LinkCard
  name="Documentation"
  href="/docs"
  icon={<DocumentIcon />}
  colorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
/>
```

### Future Enhancements

Potential improvements to consider:
- Loading state variant for slow links
- Badge overlay for link counts
- Tooltip integration for additional context
- Skeleton loading variant
- Disabled state for unavailable links
- Keyboard shortcut hints

---

## Button Component

**Location**: `src/components/ui/Button.tsx`

A comprehensive button component with 14 variants, 3 sizes, loading states, and full accessibility support.

### Features

- **14 Variants**: `primary`, `secondary`, `ghost`, `danger`, `success`, `info`, `warning`, `indigo`, `green-solid`, `blue-solid`, `purple-solid`, `red-solid`, `orange-solid`, `teal-solid`, `outline`
- **3 Sizes**: `sm`, `md`, `lg`
- **Loading State**: Built-in spinner with `aria-busy` support
- **Icon Support**: Left/right icon positioning and icon-only variant
- **Accessibility**: Full ARIA support, keyboard navigation, focus management
- **Dark Mode**: Consistent styling across light and dark themes
- **Animations**: Smooth hover, active, and focus transitions

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `ButtonVariant` | `'primary'` | Visual style variant |
| `size` | `ButtonSize` | `'md'` | Button size |
| `isLoading` | `boolean` | `false` | Show loading state (disables button, shows spinner) |
| `fullWidth` | `boolean` | `false` | Button takes full width of container |
| `icon` | `ReactNode` | `undefined` | Icon element to display |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position relative to text |
| `iconOnly` | `boolean` | `false` | Render icon-only button (requires `ariaLabel`) |
| `ariaLabel` | `string` | `undefined` | Accessibility label (required for icon-only) |
| `children` | `ReactNode` | `undefined` | Button text/content |
| `className` | `string` | `''` | Additional CSS classes |
| All standard button attributes | - | - | Passes through all standard HTML button props |

### Variants

#### 1. Primary Variant

Default primary action button with primary color scheme.

```tsx
import Button from './ui/Button';

<Button>Submit Form</Button>
```

**Styling**:
- Background: `bg-primary-600`
- Text: `text-white`
- Hover: `hover:bg-primary-700`
- Focus ring: `focus:ring-primary-500/50`
- Shadow: `shadow-sm hover:shadow-md`

**Use case**: Main actions like "Submit", "Save", "Create"

#### 2. Secondary Variant

Secondary action button with neutral styling.

```tsx
<Button variant="secondary">Cancel</Button>
```

**Styling**:
- Background: `bg-white dark:bg-neutral-800`
- Text: `text-neutral-700 dark:text-neutral-200`
- Border: `border-2 border-neutral-200 dark:border-neutral-600`
- Hover: `hover:bg-neutral-50 dark:hover:bg-neutral-700`

**Use case**: Secondary actions like "Cancel", "Back", "Close"

#### 3. Ghost Variant

Minimal button with transparent background.

```tsx
<Button variant="ghost">Dismiss</Button>
```

**Styling**:
- Background: `bg-transparent`
- Text: `text-neutral-600 dark:text-neutral-400`
- Hover: `hover:bg-neutral-100 dark:hover:bg-neutral-700`
- Scale: `hover:scale-[1.05]`

**Use case**: Low-importance actions like "Dismiss", "Clear", "Reset"

#### 4. Danger Variant

Red button for destructive actions.

```tsx
<Button variant="danger">Delete</Button>
```

**Styling**:
- Background: `bg-red-700 dark:bg-red-600`
- Text: `text-white`
- Hover: `hover:bg-red-800 dark:hover:bg-red-700`
- Focus ring: `focus:ring-red-500/50`

**Use case**: Destructive actions like "Delete", "Remove", "Archive"

#### 5. Success Variant

Green button for successful operations.

```tsx
<Button variant="success">Confirm</Button>
```

**Styling**:
- Background: `bg-green-700 dark:bg-green-600`
- Text: `text-white`
- Hover: `hover:bg-green-800 dark:hover:bg-green-700`
- Focus ring: `focus:ring-green-500/50`

**Use case**: Confirmation actions like "Confirm", "Approve", "Accept"

#### 6. Info Variant

Blue button for informational actions.

```tsx
<Button variant="info">Learn More</Button>
```

**Styling**:
- Background: `bg-blue-700 dark:bg-blue-600`
- Text: `text-white`
- Hover: `hover:bg-blue-800 dark:hover:bg-blue-700`
- Focus ring: `focus:ring-blue-500/50`

**Use case**: Informational actions like "Learn More", "View Details", "Info"

#### 7. Warning Variant

Orange button for cautionary actions.

```tsx
<Button variant="warning">Proceed</Button>
```

**Styling**:
- Background: `bg-orange-600 dark:bg-orange-500`
- Text: `text-white`
- Hover: `hover:bg-orange-700 dark:hover:bg-orange-600`
- Focus ring: `focus:ring-orange-500/50`

**Use case**: Cautionary actions like "Proceed", "Continue", "Retry"

#### 8. Indigo Variant

Indigo button for alternative primary actions.

```tsx
<Button variant="indigo">Connect</Button>
```

**Styling**:
- Background: `bg-indigo-700 dark:bg-indigo-600`
- Text: `text-white`
- Hover: `hover:bg-indigo-800 dark:hover:bg-indigo-700`
- Focus ring: `focus:ring-indigo-500/50`

**Use case**: Alternative primary actions with distinct visual identity

#### 9. Solid Color Variants

Predefined solid color variants for consistent theming:

- **green-solid**: `bg-green-600` with green hover states
- **blue-solid**: `bg-blue-600` with blue hover states
- **purple-solid**: `bg-purple-600` with purple hover states
- **red-solid**: `bg-red-600` with red hover states
- **orange-solid**: `bg-orange-600` with orange hover states
- **teal-solid**: `bg-teal-600` with teal hover states

```tsx
<Button variant="green-solid">Save</Button>
<Button variant="blue-solid">Send</Button>
<Button variant="purple-solid">Upload</Button>
```

**Use case**: Themed actions requiring specific colors

#### 10. Outline Variant

Button with outline styling.

```tsx
<Button variant="outline">Action</Button>
```

**Styling**:
- Background: `bg-transparent`
- Border: `border-2 border-neutral-300 dark:border-neutral-600`
- Text: `text-neutral-600 dark:text-neutral-400`
- Hover: `hover:bg-neutral-50 dark:hover:bg-neutral-700`

**Use case**: Outline-styled buttons for visual hierarchy

### Sizes

#### Small (sm)

Compact size for dense interfaces.

```tsx
<Button size="sm">Small Button</Button>
```

**Dimensions**:
- Padding: `px-3 py-2`
- Text: `text-sm`
- Icon-only: `p-1.5`

#### Medium (md)

Standard size for most use cases (default).

```tsx
<Button size="md">Medium Button</Button>
```

**Dimensions**:
- Padding: `px-4 py-2.5`
- Text: `text-sm sm:text-base`
- Icon-only: `p-2`

#### Large (lg)

Larger size for important actions or mobile-friendly touch targets.

```tsx
<Button size="lg">Large Button</Button>
```

**Dimensions**:
- Padding: `px-6 py-3`
- Text: `text-base sm:text-lg`
- Icon-only: `p-2.5`

### Loading State

Display loading spinner and disable button during async operations.

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  await submitForm();
  setIsSubmitting(false);
};

<Button onClick={handleSubmit} isLoading={isSubmitting}>
  Submit Form
</Button>
```

**Features**:
- Spinner appears before text (or alone for icon-only)
- Button is disabled (`disabled={disabled || isLoading}`)
- Cursor changes to `cursor-wait`
- `aria-busy="true"` for screen readers
- Spinner has `role="status"` and `aria-hidden="true"`

**Icon-only Loading**:

```tsx
<Button iconOnly isLoading ariaLabel="Loading">
  <SaveIcon />
</Button>
```

Displays spinner instead of icon when loading.

### Icon Support

Add icons to buttons with configurable positioning.

#### Left Icon

```tsx
<Button icon={<UploadIcon />} iconPosition="left">
  Upload File
</Button>
```

Icon appears to the left of text with `mr-2` spacing.

#### Right Icon

```tsx
<Button icon={<ArrowRightIcon />} iconPosition="right">
  Continue
</Button>
```

Icon appears to the right of text with `ml-2` spacing.

#### Icon-Only Button

```tsx
<Button iconOnly icon={<CloseIcon />} ariaLabel="Close modal" />
```

**Requirements**:
- Must provide `iconOnly={true}`
- Must provide `ariaLabel` for accessibility
- Icon is centered in button

**Dimensions**: Uses icon-only sizes (p-1.5 / p-2 / p-2.5)

### Full Width

Make button take full width of container.

```tsx
<Button fullWidth>Full Width Button</Button>
```

**Classes**: Adds `w-full` to button

**Use case**: Mobile layouts, forms, or card actions

### Disabled State

Disable button interaction.

```tsx
<Button disabled>Disabled Button</Button>
```

**Styling**:
- `disabled:opacity-50`
- `disabled:cursor-not-allowed`
- Prevents click handlers from firing
- Maintains focus styles for visibility

### Accessibility Features

The Button component includes comprehensive accessibility support:

1. **ARIA Labels**:
   - Required for `iconOnly` variant
   - Automatically set to empty string when not provided for icon-only
   - Screen reader announces descriptive text

2. **ARIA Busy**:
   - Automatically set to `true` when `isLoading={true}`
   - Indicates to screen readers that operation is in progress
   - Reset to false when loading completes

3. **Keyboard Navigation**:
   - Full keyboard support with Enter and Space keys
   - Visible focus ring with `focus:ring-2`
   - Focus offset for dark mode (`dark:focus:ring-offset-neutral-900`)
   - Prevents outline with `focus:outline-none`

4. **Loading Spinner ARIA**:
   - Spinner has `role="status"`
   - Spinner is `aria-hidden="true"` (button text provides context)
   - Proper semantic markup for assistive technologies

5. **Focus Management**:
   - Focus ring color matches variant color
   - Example: `focus:ring-primary-500/50` for primary variant
   - Clear visual indication for keyboard users

```tsx
<Button
  onClick={handleClick}
  ariaLabel="Save changes to database"
  variant="primary"
  size="md"
>
  Save
</Button>

<Button
  iconOnly
  icon={<CloseIcon />}
  ariaLabel="Close dialog and return to home"
  isLoading={isClosing}
/>
```

### Real-World Examples

#### Form Submit Button

```tsx
function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitContactForm(formData);
      showSuccessToast('Message sent successfully!');
    } catch (error) {
      showErrorToast('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit" isLoading={isSubmitting} fullWidth size="lg">
        Send Message
      </Button>
    </form>
  );
}
```

#### Action Group

```tsx
function ActionButtons() {
  return (
    <div className="flex gap-3">
      <Button variant="secondary" onClick={handleCancel}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
}
```

#### Destructive Action

```tsx
function DeleteConfirmation() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteItem(item.id);
      showSuccessToast('Item deleted');
      onClose();
    } catch (error) {
      showErrorToast('Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
      Delete Permanently
    </Button>
  );
}
```

#### Icon Buttons

```tsx
function Toolbar() {
  return (
    <div className="flex gap-2">
      <Button
        iconOnly
        icon={<RefreshIcon />}
        ariaLabel="Refresh data"
        onClick={handleRefresh}
      />
      <Button
        iconOnly
        icon={<EditIcon />}
        ariaLabel="Edit selection"
        onClick={handleEdit}
      />
      <Button
        iconOnly
        icon={<TrashIcon />}
        ariaLabel="Delete selection"
        variant="danger"
        onClick={handleDelete}
      />
    </div>
  );
}
```

#### Button with Icon

```tsx
function FileUpload() {
  return (
    <Button
      icon={<UploadIcon />}
      iconPosition="left"
      variant="primary"
      onClick={handleUpload}
    >
      Upload File
    </Button>
  );
}
```

#### Loading Variants

```tsx
function AsyncActions() {
  const [loadingStates, setLoadingStates] = useState({
    saving: false,
    sending: false,
    uploading: false,
  });

  return (
    <div className="space-y-4">
      <Button
        variant="success"
        isLoading={loadingStates.saving}
        onClick={() => handleSave(setLoadingStates)}
      >
        Save Changes
      </Button>

      <Button
        variant="info"
        isLoading={loadingStates.sending}
        onClick={() => handleSend(setLoadingStates)}
      >
        Send Message
      </Button>

      <Button
        iconOnly
        isLoading={loadingStates.uploading}
        icon={<UploadIcon />}
        ariaLabel="Uploading file"
        onClick={() => handleUpload(setLoadingStates)}
      />
    </div>
  );
}
```

### Dark Mode

All Button variants automatically support dark mode:

- **Primary**: Maintains `bg-primary-600` in both themes
- **Secondary**: `bg-white` → `dark:bg-neutral-800`, `text-neutral-700` → `dark:text-neutral-200`
- **Ghost**: `text-neutral-600` → `dark:text-neutral-400`, hover adapts to dark theme
- **Solid variants**: Maintain their colors in both themes
- **Focus offset**: `focus:ring-offset-2` → `dark:focus:ring-offset-neutral-900`

### Animations

Button includes smooth interactive transitions:

- **Hover Scale**: `hover:scale-[1.02]` (most variants) or `hover:scale-[1.05]` (ghost)
- **Active Scale**: `active:scale-95` for press feedback
- **Shadow Transition**: `shadow-sm hover:shadow-md` for elevation change
- **Duration**: `duration-200` for responsive feel
- **Easing**: `ease-out` for natural motion

### Performance Considerations

The Button component is optimized using:
- Functional component with hooks
- Proper TypeScript typing with generics
- CSS-only animations and transitions
- No unnecessary re-renders
- Efficient class string concatenation
- `forwardRef` for ref forwarding
- Semantic HTML with proper ARIA attributes

### Migration Guide

To migrate existing button implementations:

**Before:**
```tsx
<button
  onClick={handleClick}
  className="inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50 shadow-sm hover:shadow-md hover:scale-[1.02] px-4 py-2.5 text-sm sm:text-base"
>
  Click Me
</button>
```

**After:**
```tsx
import Button from './ui/Button';

<Button onClick={handleClick}>
  Click Me
</Button>
```

**Benefits:**
- ✅ Consistent styling across application
- ✅ Improved accessibility with proper ARIA support
- ✅ Reduced code duplication
- ✅ Built-in loading states
- ✅ Icon support (left, right, icon-only)
- ✅ Multiple variants for different contexts
- ✅ Dark mode support
- ✅ Keyboard navigation
- ✅ Type-safe props
- ✅ Ref forwarding

### Test Coverage

The Button component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/Button.test.tsx
```

Test scenarios include:
- Rendering with default props
- Rendering with all 14 variants
- Rendering with all 3 sizes
- Icon rendering (left, right, icon-only)
- Loading state behavior (with and without text)
- Disabled state behavior
- Full width variant
- Click handler invocation
- Click prevention when disabled
- Click prevention when loading
- ARIA label for icon-only buttons
- Empty aria-label for icon-only when not provided
- aria-busy attribute when loading
- No aria-busy when not loading
- No aria-label for regular buttons with icon
- Proper focus visible states
- Focus ring color matching variant
- Loading spinner with proper ARIA attributes
- Keyboard accessibility

### Usage in Application

Currently integrated in 45+ locations across the codebase:

**Common Patterns:**

```tsx
// Primary actions
<Button variant="primary" onClick={handleSubmit}>Submit</Button>
<Button variant="success" onClick={handleConfirm}>Confirm</Button>

// Secondary actions
<Button variant="secondary" onClick={handleCancel}>Cancel</Button>
<Button variant="ghost" onClick={handleDismiss}>Dismiss</Button>

// Destructive actions
<Button variant="danger" onClick={handleDelete}>Delete</Button>

// Icon buttons
<Button iconOnly icon={<CloseIcon />} ariaLabel="Close" />
<Button icon={<SaveIcon />} iconPosition="left">Save</Button>

// Loading states
<Button isLoading={isSubmitting}>Submitting...</Button>
<Button iconOnly isLoading icon={<UploadIcon />} ariaLabel="Uploading" />
```

**Key Integration Points:**
- Form submissions (primary, success, danger variants)
- Modal actions (primary, secondary, ghost variants)
- Navigation buttons (secondary, ghost variants)
- Toolbar icons (icon-only, various variants)
- Data operations (loading states with all variants)

### Best Practices

1. **Choose Appropriate Variant**:
   - `primary`: Main actions, primary CTAs
   - `secondary`: Alternative actions, secondary CTAs
   - `ghost`: Low-importance actions, dismissals
   - `danger`: Destructive actions, delete/remove
   - `success`: Confirmation actions, approval
   - `info`: Informational actions, learn more
   - `warning`: Cautionary actions, proceed with caution

2. **Use Loading States**:
   ```tsx
   ✅ Good: Show loading spinner during async operations
   <Button isLoading={isSubmitting}>Submit</Button>

   ❌ Bad: No loading feedback
   <Button onClick={submit}>Submit</Button>
   ```

3. **Provide ARIA Labels for Icon-Only Buttons**:
   ```tsx
   ✅ Good: Descriptive aria-label
   <Button iconOnly icon={<CloseIcon />} ariaLabel="Close dialog and return to home" />

   ❌ Bad: No aria-label or unclear aria-label
   <Button iconOnly icon={<CloseIcon />} />
   ```

4. **Use Full Width Appropriately**:
   ```tsx
   ✅ Good: Full width in forms/cards
   <Button fullWidth>Submit</Button>

   ❌ Bad: Full width in toolbars/groups
   <div className="flex">
     <Button fullWidth>Action 1</Button>
     <Button fullWidth>Action 2</Button>
   </div>
   ```

5. **Group Related Actions**:
   ```tsx
   ✅ Good: Action group with spacing
   <div className="flex gap-3">
     <Button variant="secondary">Cancel</Button>
     <Button variant="primary">Submit</Button>
   </div>
   ```

6. **Match Button Purpose to Variant**:
   ```tsx
   ✅ Good: Destructive action uses danger variant
   <Button variant="danger" onClick={delete}>Delete</Button>

   ❌ Bad: Destructive action uses primary variant
   <Button variant="primary" onClick={delete}>Delete</Button>
   ```

### Future Enhancements

Potential improvements to consider:
- Ripple effect for enhanced feedback
- Button group component for aligned buttons
- Split button variant (button + dropdown)
- Loading progress bar variant
- Disabled state with custom message
- Custom icon sizing for icon-only buttons
- Badge overlay for notification counts
- Keyboard shortcut support (e.g., Cmd+S)
- Tooltip integration for additional context

---

## Modal Component

**Location**: `src/components/ui/Modal.tsx`

A reusable modal/dialog component with comprehensive accessibility support, animations, and focus management.

### Features

- **5 Sizes**: `sm`, `md`, `lg`, `xl`, `full`
- **3 Animations**: `fade-in`, `fade-in-up`, `scale-in`
- **Accessibility**: Full ARIA support, focus trap, keyboard navigation, screen reader support
- **Dark Mode**: Consistent styling across light and dark themes
- **Focus Management**: Automatic focus trap using `useFocusTrap` hook
- **Body Scroll Lock**: Prevents background scrolling when modal is open
- **Backdrop Interaction**: Optional close on backdrop click
- **Escape Key**: Optional close on Escape key press

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Whether the modal is visible |
| `onClose` | `() => void` | Required | Function to call when modal should close |
| `children` | `ReactNode` | Required | Content to display inside the modal |
| `title` | `string` | `undefined` | Modal title (displayed in header) |
| `description` | `string` | `undefined` | Screen reader description (hidden visually) |
| `size` | `ModalSize` | `'md'` | Modal size variant |
| `animation` | `ModalAnimation` | `'scale-in'` | Animation variant |
| `closeOnBackdropClick` | `boolean` | `true` | Allow closing by clicking the backdrop |
| `closeOnEscape` | `boolean` | `true` | Allow closing with the Escape key |
| `showCloseButton` | `boolean` | `true` | Show the close button in the header |
| `className` | `string` | `''` | Additional CSS classes |

### Sizes

#### Small (sm)

Compact modal for simple dialogs.

```tsx
import Modal from './ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  size="sm"
  title="Confirm Action"
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

**Dimensions**:
- Max width: `max-w-sm` (384px / 24rem)
- Padding: `p-4` (from default padding)

#### Medium (md)

Standard modal for most use cases (default).

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  size="md"
  title="Edit Profile"
>
  <form>...</form>
</Modal>
```

**Dimensions**:
- Max width: `max-w-md` (448px / 28rem)

#### Large (lg)

Larger modal for forms with multiple fields.

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  size="lg"
  title="Create New Assignment"
>
  <form>...</form>
</Modal>
```

**Dimensions**:
- Max width: `max-w-lg` (512px / 32rem)

#### Extra Large (xl)

Maximum width for complex modals.

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  size="xl"
  title="Advanced Settings"
>
  <form>...</form>
</Modal>
```

**Dimensions**:
- Max width: `max-w-xl` (576px / 36rem)

#### Full

Full-screen modal for immersive experiences.

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  size="full"
  title="Fullscreen View"
>
  <div>Content takes full viewport</div>
</Modal>
```

**Dimensions**:
- Width: `w-full`
- Height: `h-full`
- No margins or rounded corners

### Animations

#### Fade In

Simple opacity fade animation.

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  animation="fade-in"
  title="Notification"
>
  <p>Modal fades in</p>
</Modal>
```

#### Fade In Up

Fade with upward slide animation.

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  animation="fade-in-up"
  title="Alert"
>
  <p>Modal slides up while fading in</p>
</Modal>
```

#### Scale In

Scale up from center (default).

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  animation="scale-in"
  title="Dialog"
>
  <p>Modal scales up from center</p>
</Modal>
```

### Close Behavior

#### Close on Backdrop Click

Allow closing by clicking the overlay (default).

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  closeOnBackdropClick={true}
  title="Optional Dialog"
>
  <p>Click outside to close</p>
</Modal>
```

#### Prevent Backdrop Close

Require explicit action to close (e.g., for confirmation dialogs).

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  closeOnBackdropClick={false}
  title="Confirm Deletion"
>
  <p>You must click the confirm button</p>
</Modal>
```

#### Close on Escape

Allow closing with Escape key (default).

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  closeOnEscape={true}
  title="Dismissible Modal"
>
  <p>Press Escape to close</p>
</Modal>
```

#### Prevent Escape Close

Disable Escape key (e.g., for critical modals).

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  closeOnEscape={false}
  title="Critical Action"
>
  <p>Must use buttons to close</p>
</Modal>
```

### Header Configuration

#### With Title and Close Button

Standard modal with title and close button.

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Edit User"
  showCloseButton={true}
>
  <form>
    <input type="text" placeholder="Name" />
    <button type="submit">Save</button>
  </form>
</Modal>
```

#### Without Title

Modal for simple content without a header.

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  showCloseButton={true}
>
  <p>Simple modal with just close button</p>
</Modal>
```

#### Without Close Button

Modal that requires specific action to close.

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Terms of Service"
  showCloseButton={false}
>
  <p>Read the terms, then click "Accept" to continue.</p>
  <button onClick={handleClose}>Accept</button>
</Modal>
```

### Accessibility Features

The Modal component includes comprehensive accessibility support:

1. **ARIA Roles**:
   - `role="dialog"` - Indicates dialog element
   - `aria-modal="true"` - Identifies modal content
   - `aria-labelledby` - Associates title with modal
   - `aria-describedby` - Associates description with modal

2. **Focus Management**:
   - Automatic focus trap using `useFocusTrap` hook
   - Focus remains within modal when open
   - Returns focus to trigger element when closed

3. **Keyboard Navigation**:
   - Escape key closes modal (if `closeOnEscape={true}`)
   - Tab/Shift+Tab navigates through interactive elements
   - Focus trap prevents leaving modal with keyboard

4. **Body Scroll Lock**:
   - Prevents background scrolling when modal is open
   - Restores scroll state when closed
   - Uses `overflow: hidden` on body

5. **Screen Reader Support**:
   - Hidden description via `sr-only` class
   - Clear titles and labels
   - Proper ARIA attributes for assistive technology

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Account Settings"
  description="Configure your account preferences and security settings"
  closeOnEscape={true}
>
  <form>
    <label htmlFor="username">Username</label>
    <input id="username" type="text" />
  </form>
</Modal>
```

### Dark Mode

All Modal features automatically support dark mode:

- Background: `bg-white` → `dark:bg-neutral-800`
- Borders: `border-neutral-200` → `dark:border-neutral-700`
- Text: `text-neutral-900` → `dark:text-white`
- Backdrop: `bg-black/50` (consistent across themes)

### Real-World Examples

#### Confirmation Dialog

```tsx
function DeleteConfirmation({ isOpen, onClose, onConfirm }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Item"
      description="This action cannot be undone"
      size="sm"
      closeOnBackdropClick={false}
      closeOnEscape={false}
      animation="fade-in-up"
    >
      <div className="space-y-4">
        <p className="text-neutral-700 dark:text-neutral-300">
          Are you sure you want to delete this item? This action is permanent.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

#### Form Modal

```tsx
function EditUserModal({ isOpen, onClose, user }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User Profile"
      size="lg"
      animation="scale-in"
    >
      <form className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            defaultValue={user.name}
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            defaultValue={user.email}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

#### Information Modal

```tsx
function InfoModal({ isOpen, onClose }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome to New Features"
      size="md"
      animation="fade-in"
    >
      <div className="space-y-4">
        <p className="text-neutral-700 dark:text-neutral-300">
          We've added new features to help you manage your data more efficiently.
        </p>
        <ul className="list-disc list-inside space-y-2 text-neutral-700 dark:text-neutral-300">
          <li>Improved search functionality</li>
          <li>Faster data loading</li>
          <li>New analytics dashboard</li>
        </ul>
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Got It
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

#### Fullscreen Modal

```tsx
function ImageViewerModal({ isOpen, onClose, imageUrl }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      animation="fade-in"
      showCloseButton={true}
    >
      <div className="flex items-center justify-center h-full">
        <img
          src={imageUrl}
          alt="Fullscreen view"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </Modal>
  );
}
```

### Performance Considerations

The Modal component is optimized using:
- Proper `useEffect` cleanup for body scroll restoration
- Conditional rendering (`!isOpen` returns `null`)
- Focus trap ref management
- CSS-only animations and transitions
- Minimal re-renders

### Migration Guide

To migrate existing modal implementations:

**Before:**
```tsx
<div className={`fixed inset-0 bg-black/50 ${isOpen ? 'flex' : 'hidden'}`}>
  <div className="bg-white rounded-xl p-6 max-w-md">
    <div className="flex justify-between items-center mb-4">
      <h2>Title</h2>
      <button onClick={onClose}>✕</button>
    </div>
    <div>Content</div>
  </div>
</div>
```

**After:**
```tsx
import Modal from './ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Title"
>
  Content
</Modal>
```

**Benefits:**
- ✅ Consistent modal styling across application
- ✅ Improved accessibility with proper ARIA support
- ✅ Built-in focus trap and keyboard navigation
- ✅ Automatic body scroll lock
- ✅ Multiple size and animation variants
- ✅ Dark mode support
- ✅ Reduced code duplication

### Test Coverage

The Modal component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/Modal.test.tsx
```

Test scenarios include:
- Rendering with all sizes (sm, md, lg, xl, full)
- Rendering with all animations (fade-in, fade-in-up, scale-in)
- Title and description rendering
- Close button display/hide
- Backdrop click behavior
- Escape key behavior
- Body scroll lock on open/close
- ARIA attributes (role, aria-modal, aria-labelledby, aria-describedby)
- Focus trap functionality
- Keyboard navigation
- Dark mode styling

### Usage in Application

Currently integrated in:
- `src/components/LoginModal.tsx` - Authentication modal
- `src/components/UserManagement.tsx` - User edit modal
- `src/components/ConfirmationDialog.tsx` - Uses BaseModal

**Common Patterns:**

```tsx
// Form modal
<Modal isOpen={isOpen} onClose={handleClose} title="Edit Item" size="lg">
  <form onSubmit={handleSubmit}>...</form>
</Modal>

// Confirmation modal
<Modal isOpen={isOpen} onClose={handleClose} title="Confirm" size="sm" closeOnBackdropClick={false}>
  <div className="flex gap-3">
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button variant="danger" onClick={onConfirm}>Delete</Button>
  </div>
</Modal>

// Information modal
<Modal isOpen={isOpen} onClose={handleClose} title="Info" animation="fade-in">
  <p>Information content</p>
  <Button onClick={handleClose}>Close</Button>
</Modal>
```

### Future Enhancements

Potential improvements to consider:
- Nested modal support
- Draggable modal headers
- Multiple modal stacking
- Custom close button component
- Scrollable content area with custom scrollbar
- Modal transition groups for coordinated animations

---

## Badge Component

**Location**: `src/components/ui/Badge.tsx`

A reusable badge component for status indicators, labels, and notifications with multiple variants and styles.

### Features

- **7 Variants**: `success`, `error`, `warning`, `info`, `neutral`, `primary`, `secondary`
- **4 Sizes**: `sm`, `md`, `lg`, `xl`
- **2 Styles**: `solid` and `outline`
- **Corner Radius**: Rounded (`rounded-full` by default) or standard corners
- **Accessibility**: Proper semantic HTML, screen reader support
- **Dark Mode**: Consistent styling across light and dark themes
- **Smooth Transitions**: Color and style transitions
- **Semantic Colors**: Uses centralized `getColorClasses` from `src/config/colors.ts`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Content to display inside the badge |
| `variant` | `BadgeVariant` | `'neutral'` | Visual color variant |
| `size` | `BadgeSize` | `'md'` | Badge size |
| `styleType` | `BadgeStyle` | `'solid'` | Visual style (solid or outline) |
| `rounded` | `boolean` | `true` | Use fully rounded corners (pill shape) |
| `className` | `string` | `''` | Additional CSS classes |
| All standard HTML span attributes | - | - | Passes through all standard span props |

### Variants

#### Success Variant

Green badge for success states and positive feedback.

```tsx
import Badge from './ui/Badge';

<Badge variant="success">Active</Badge>
```

**Styling (Solid)**:
- Background: `bg-green-700 dark:bg-green-600` (from `getColorClasses('success', 'badge')`)
- Text: `text-white`

**Styling (Outline)**:
- Border: `border-2 border-green-600 dark:border-green-400`
- Text: `text-green-700 dark:text-green-300`

#### Error Variant

Red badge for error states and negative feedback.

```tsx
<Badge variant="error">Failed</Badge>
```

**Styling (Solid)**:
- Background: `bg-red-700 dark:bg-red-600`
- Text: `text-white`

**Styling (Outline)**:
- Border: `border-2 border-red-600 dark:border-red-400`
- Text: `text-red-700 dark:text-red-300`

#### Warning Variant

Yellow/orange badge for warning states and caution.

```tsx
<Badge variant="warning">Pending</Badge>
```

**Styling (Solid)**:
- Background: `bg-yellow-600 dark:bg-yellow-500`
- Text: `text-white`

**Styling (Outline)**:
- Border: `border-2 border-yellow-600 dark:border-yellow-400`
- Text: `text-yellow-700 dark:text-yellow-300`

#### Info Variant

Blue badge for informational messages and neutral status.

```tsx
<Badge variant="info">New</Badge>
```

**Styling (Solid)**:
- Background: `bg-blue-700 dark:bg-blue-600`
- Text: `text-white`

**Styling (Outline)**:
- Border: `border-2 border-blue-600 dark:border-blue-400`
- Text: `text-blue-700 dark:text-blue-300`

#### Neutral Variant

Gray badge for neutral or undefined states.

```tsx
<Badge variant="neutral">Draft</Badge>
```

**Styling (Solid)**:
- Background: `bg-neutral-700 dark:bg-neutral-600`
- Text: `text-white`

**Styling (Outline)**:
- Border: `border-2 border-neutral-500 dark:border-neutral-400`
- Text: `text-neutral-700 dark:text-neutral-300`

#### Primary Variant

Primary brand color badge.

```tsx
<Badge variant="primary">Featured</Badge>
```

**Styling (Solid)**:
- Background: `bg-primary-600 dark:bg-primary-500`
- Text: `text-white`

**Styling (Outline)**:
- Border: `border-2 border-primary-500 dark:border-primary-400`
- Text: `text-primary-700 dark:text-primary-300`

#### Secondary Variant

Purple/secondary brand color badge.

```tsx
<Badge variant="secondary">Premium</Badge>
```

**Styling (Solid)**:
- Background: `bg-purple-700 dark:bg-purple-600`
- Text: `text-white`

**Styling (Outline)**:
- Border: `border-2 border-purple-600 dark:border-purple-400`
- Text: `text-purple-700 dark:text-purple-300`

### Sizes

#### Small (sm)

Compact badge for dense interfaces and inline text.

```tsx
<Badge variant="success" size="sm">Active</Badge>
```

**Dimensions**:
- Padding: `px-1.5 py-0.5`
- Text: `text-xs`
- Border radius: `rounded-md` (standard) or `rounded-full` (pill)

#### Medium (md)

Standard size for most use cases (default).

```tsx
<Badge variant="info" size="md">New</Badge>
```

**Dimensions**:
- Padding: `px-2 py-1`
- Text: `text-xs`
- Border radius: `rounded-lg` (standard) or `rounded-full` (pill)

#### Large (lg)

Larger badge for better visibility.

```tsx
<Badge variant="warning" size="lg">Pending</Badge>
```

**Dimensions**:
- Padding: `px-2.5 py-1.5`
- Text: `text-sm`
- Border radius: `rounded-xl` (standard) or `rounded-full` (pill)

#### Extra Large (xl)

Maximum size for prominent badges.

```tsx
<Badge variant="error" size="xl">Critical</Badge>
```

**Dimensions**:
- Padding: `px-5 py-2.5`
- Text: `text-sm`
- Border radius: `rounded-2xl` (standard) or `rounded-full` (pill)

### Styles

#### Solid Style

Filled background badge (default).

```tsx
<Badge variant="success" styleType="solid">Active</Badge>
```

Uses semantic color classes from `getColorClasses('success', 'badge')`:
- Success: `bg-green-700 text-white dark:bg-green-600`
- Error: `bg-red-700 text-white dark:bg-red-600`
- Warning: `bg-yellow-600 text-white dark:bg-yellow-500`
- Info: `bg-blue-700 text-white dark:bg-blue-600`
- Neutral: `bg-neutral-700 text-white dark:bg-neutral-600`
- Primary: `bg-primary-600 text-white dark:bg-primary-500`
- Secondary: `bg-purple-700 text-white dark:bg-purple-600`

#### Outline Style

Border-only badge with text color.

```tsx
<Badge variant="success" styleType="outline">Active</Badge>
```

Styling:
- Success: `border-green-600 text-green-700 dark:border-green-400 dark:text-green-300`
- Error: `border-red-600 text-red-700 dark:border-red-400 dark:text-red-300`
- Warning: `border-yellow-600 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300`
- Info: `border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300`
- Neutral: `border-neutral-500 text-neutral-700 dark:border-neutral-400 dark:text-neutral-300`
- Primary: `border-primary-500 text-primary-700 dark:border-primary-400 dark:text-primary-300`
- Secondary: `border-purple-600 text-purple-700 dark:border-purple-400 dark:text-purple-300`

### Corner Radius

#### Fully Rounded (Pill)

Fully rounded corners (default).

```tsx
<Badge variant="success" rounded={true}>Active</Badge>
```

Rounded corners:
- `sm`: `rounded-full`
- `md`: `rounded-full`
- `lg`: `rounded-full`
- `xl`: `rounded-full`

#### Standard Corners

Less rounded corners for badge lists or tables.

```tsx
<Badge variant="success" rounded={false}>Active</Badge>
```

Rounded corners:
- `sm`: `rounded-md`
- `md`: `rounded-lg`
- `lg`: `rounded-xl`
- `xl`: `rounded-2xl`

### Dark Mode

All Badge variants automatically support dark mode:

- **Solid backgrounds**: Darker shades in dark mode (e.g., `bg-green-700` → `dark:bg-green-600`)
- **Outline borders**: Lighter border colors in dark mode (e.g., `border-green-600` → `dark:border-green-400`)
- **Text colors**: Lighter text in dark mode for outline variant
- Smooth transitions for theme changes

### Accessibility Features

The Badge component includes comprehensive accessibility support:

1. **Semantic HTML**: Uses native `<span>` element
2. **Screen Reader Support**: Text content is announced by screen readers
3. **Visual Feedback**: Clear color differentiation for different states
4. **WCAG Contrast**: All color combinations meet WCAG 2.1 AA standards
5. **Transition Effects**: Smooth color changes prevent visual jumps

```tsx
<Badge variant="success" aria-label="Status: Active">
  Active
</Badge>
```

### Real-World Examples

#### User Status Badge

```tsx
function UserStatusBadge({ status }: { status: 'active' | 'inactive' | 'pending' }) {
  const variant = {
    active: 'success' as const,
    inactive: 'neutral' as const,
    pending: 'warning' as const,
  }[status];

  return (
    <Badge variant={variant} size="sm">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
```

#### Notification Count Badge

```tsx
function NotificationBadge({ count }: { count: number }) {
  return (
    <Badge
      variant="error"
      size="sm"
      className="absolute -top-2 -right-2"
    >
      {count}
    </Badge>
  );
}

// Usage
<div className="relative">
  <BellIcon />
  {count > 0 && <NotificationBadge count={count} />}
</div>
```

#### Online/Offline Status

```tsx
function ConnectionStatus({ isOnline }: { isOnline: boolean }) {
  return (
    <Badge
      variant={isOnline ? 'success' : 'error'}
      size="md"
      rounded={false}
    >
      {isOnline ? 'Connected' : 'Disconnected'}
    </Badge>
  );
}
```

#### Role Badge

```tsx
function RoleBadge({ role }: { role: 'admin' | 'teacher' | 'student' }) {
  const variant = {
    admin: 'primary' as const,
    teacher: 'info' as const,
    student: 'neutral' as const,
  }[role];

  return (
    <Badge variant={variant} size="md">
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}
```

#### File Type Badge

```tsx
function FileTypeBadge({ type }: { type: 'pdf' | 'doc' | 'img' }) {
  const config = {
    pdf: { variant: 'error' as const, label: 'PDF' },
    doc: { variant: 'info' as const, label: 'DOC' },
    img: { variant: 'success' as const, label: 'IMG' },
  }[type];

  return (
    <Badge variant={config.variant} size="sm" styleType="outline">
      {config.label}
    </Badge>
  );
}
```

#### Multi-Badge List

```tsx
function MultiBadgeList({ items }: { items: Array<{ label: string; variant: BadgeVariant }> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <Badge
          key={index}
          variant={item.variant}
          size="sm"
          rounded={false}
        >
          {item.label}
        </Badge>
      ))}
    </div>
  );
}

// Usage
<MultiBadgeList
  items={[
    { label: 'React', variant: 'info' },
    { label: 'TypeScript', variant: 'success' },
    { label: 'Tailwind', variant: 'warning' },
  ]}
/>
```

### Migration Guide

To migrate existing badge implementations:

**Before:**
```tsx
<span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-green-700 text-white">
  Active
</span>
```

**After:**
```tsx
import Badge from './ui/Badge';

<Badge variant="success">Active</Badge>
```

**Benefits:**
- ✅ Consistent badge styling across application
- ✅ Multiple variants and sizes for flexibility
- ✅ Solid and outline styles for different contexts
- ✅ Dark mode support
- ✅ Semantic color system integration
- ✅ WCAG-compliant color contrast
- ✅ Reduced code duplication

### Test Coverage

The Badge component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/Badge.test.tsx
```

Test scenarios include:
- Rendering with all variants (success, error, warning, info, neutral, primary, secondary)
- Rendering with all sizes (sm, md, lg, xl)
- All style types (solid, outline)
- Rounded and non-rounded variants
- Custom className application
- Props passthrough to span element
- Dark mode styling
- Transition effects
- Semantic color integration

### Usage in Application

Currently integrated in:
- `src/components/admin/PermissionManager.tsx` - Permission badges
- `src/components/PPDBManagement.tsx` - Status badges
- `src/components/DashboardActionCard.tsx` - Status and role badges

**Common Patterns:**

```tsx
// Status indicator
<Badge variant={isActive ? 'success' : 'neutral'}>
  {isActive ? 'Active' : 'Inactive'}
</Badge>

// Notification count
<Badge variant="error" size="sm">
  {notificationCount}
</Badge>

// Category label
<Badge variant="info" size="md" styleType="outline" rounded={false}>
  {category}
</Badge>

// Feature tag
<Badge variant="primary" size="lg">
  New Feature
</Badge>
```

### Future Enhancements

Potential improvements to consider:
- Animated badges (pulse, bounce)
- Clickable badge variant (as button)
- Badge with icon + text
- Progress indicator badge
- Badge grouping/stacking
- Custom animations for badge appearance
- Removable badges with close button

---

## SearchInput Component

**Location**: `src/components/ui/SearchInput.tsx`

An advanced search input component with built-in validation, icon support, and accessibility features.

### Features

- **3 Sizes**: `sm`, `md`, `lg`
- **3 States**: `default`, `error`, `success`
- **Icon Support**: Built-in search icon with custom icon support
- **Icon Positioning**: Left or right icon placement
- **Validation**: Integrated field validation with custom rules
- **Clear on Escape**: Clears input value on Escape key press
- **Accessibility**: Full ARIA support with live regions for validation
- **Dark Mode**: Consistent styling across light and dark themes
- **Loading State**: Visual indicator during async validation
- **Label Support**: Optional label with required indicator
- **Helper Text**: Contextual guidance for users
- **Error Handling**: Built-in error state with role="alert"

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label text displayed above the input |
| `helperText` | `string` | `undefined` | Helper text displayed below the input |
| `errorText` | `string` | `undefined` | Error message displayed below the input (sets state to error) |
| `size` | `SearchInputSize` | `'md'` | Input size (affects padding, text size, and icon size) |
| `state` | `SearchInputState` | `'default'` | Visual state variant (defaults to 'error' if errorText provided) |
| `fullWidth` | `boolean` | `false` | Whether the input should take full width |
| `showIcon` | `boolean` | `true` | Whether to show the search icon |
| `placeholder` | `string` | `undefined` | Placeholder text for the input |
| `icon` | `ReactNode` | `undefined` | Custom icon component (defaults to MagnifyingGlassIcon) |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Position of the icon in the input |
| `validationRules` | `Array<{validate: (value: string) => boolean; message: string}>` | `[]` | Custom validation rules |
| `validateOnChange` | `boolean` | `true` | Whether to validate on each change |
| `validateOnBlur` | `boolean` | `true` | Whether to validate on blur |
| `accessibility.announceErrors` | `boolean` | `true` | Whether to announce errors via ARIA |
| `accessibility.describedBy` | `string` | `undefined` | Additional ARIA-describedby value |
| `id` | `string` | Auto-generated | Unique identifier for the input |
| `className` | `string` | `''` | Additional CSS classes |
| All standard input attributes | - | - | Passes through all standard HTML input props |

### Sizes

#### Small (sm)

Compact size for dense interfaces.

```tsx
import SearchInput from './ui/SearchInput';

<SearchInput
  label="Search"
  size="sm"
  placeholder="Search..."
/>
```

**Dimensions**:
- Input padding: `px-3 py-2`
- Input text: `text-sm`
- Icon: `w-4 h-4`

#### Medium (md)

Standard size for most use cases (default).

```tsx
<SearchInput
  label="Search"
  size="md"
  placeholder="Search..."
/>
```

**Dimensions**:
- Input padding: `px-4 py-3`
- Input text: `text-sm sm:text-base`
- Icon: `w-5 h-5`

#### Large (lg)

Larger size for better accessibility and touch targets.

```tsx
<SearchInput
  label="Search"
  size="lg"
  placeholder="Search..."
/>
```

**Dimensions**:
- Input padding: `px-5 py-4`
- Input text: `text-base sm:text-lg`
- Icon: `w-6 h-6`

### States

#### Default State

Standard appearance for normal input state.

```tsx
<SearchInput
  label="Search"
  state="default"
  placeholder="Search..."
/>
```

**Styling**:
- Border: `border-neutral-300 dark:border-neutral-600`
- Background: `bg-white dark:bg-neutral-700`
- Text: `text-neutral-900 dark:text-white`
- Focus ring: `focus:ring-primary-500/50`

#### Error State

Red-themed appearance for invalid input.

```tsx
<SearchInput
  label="Search"
  errorText="Search query too short"
  placeholder="Search..."
/>
```

**Styling**:
- Border: `border-red-300 dark:border-red-700`
- Background: `bg-red-50 dark:bg-red-900/20`
- Text: `text-neutral-900 dark:text-white`
- Focus ring: `focus:ring-red-500/50`

#### Success State

Green-themed appearance for valid input.

```tsx
<SearchInput
  label="Search"
  state="success"
  value="completed query"
  placeholder="Search..."
/>
```

**Styling**:
- Border: `border-green-300 dark:border-green-700`
- Background: `bg-green-50 dark:bg-green-900/20`
- Text: `text-neutral-900 dark:text-white`
- Focus ring: `focus:ring-green-500/50`

### Validation

SearchInput integrates with `useFieldValidation` hook for real-time validation.

```tsx
<SearchInput
  label="Search"
  placeholder="Enter at least 3 characters..."
  validationRules={[
    {
      validate: (value) => value.length >= 3,
      message: 'Search query must be at least 3 characters'
    },
    {
      validate: (value) => /^[a-zA-Z0-9\s]+$/.test(value),
      message: 'Only letters, numbers, and spaces allowed'
    }
  ]}
  validateOnChange={true}
  validateOnBlur={true}
  accessibility={{
    announceErrors: true
  }}
/>
```

**Validation Features**:
- Real-time validation with custom rules
- Error messages displayed below input
- ARIA live region for screen readers
- Loading spinner during async validation
- Touched state tracking
- Multi-error support (shows first error)

### Icon Positioning

```tsx
// Left icon (default)
<SearchInput
  placeholder="Search..."
  iconPosition="left"
  showIcon={true}
/>

// Right icon
<SearchInput
  placeholder="Search..."
  iconPosition="right"
  showIcon={true}
/>

// Custom icon
<SearchInput
  placeholder="Search..."
  icon={<FilterIcon />}
  iconPosition="left"
/>

// No icon
<SearchInput
  placeholder="Search..."
  showIcon={false}
/>
```

### Clear on Escape

SearchInput automatically clears value on Escape key press for quick reset.

```tsx
<SearchInput
  label="Search"
  placeholder="Press Escape to clear..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

**Behavior**:
- Pressing Escape clears input value
- Triggers onChange handler with empty string
- Preserves existing onKeyDown handler
- User-friendly quick reset functionality

### Accessibility Features

SearchInput has comprehensive accessibility support:

```tsx
<SearchInput
  label="Search"
  placeholder="Search items..."
  required
  accessibility={{
    announceErrors: true,
    describedBy: 'additional-help-text'
  }}
/>
```

**Accessibility Features**:
- `role="search"` on container for semantic meaning
- `role="searchbox"` on input for screen readers
- `aria-required` for required inputs
- `aria-invalid` for error state
- `aria-errormessage` linking to error text
- `aria-describedby` for helper and error text
- `aria-live="polite"` for validation announcements
- `aria-busy` during validation loading
- Keyboard navigation with Escape key support
- Focus management with visible focus rings
- Screen reader announcements for errors

### Usage in Application

**Common Patterns:**

```tsx
// Basic search
<SearchInput
  placeholder="Search..."
  onChange={(e) => setSearchQuery(e.target.value)}
/>

// With label and helper text
<SearchInput
  label="Search Users"
  placeholder="Enter name or email..."
  helperText="Search by name or email address"
  fullWidth
/>

// With validation
<SearchInput
  label="Search"
  placeholder="Min 3 characters..."
  validationRules={[
    {
      validate: (v) => v.length >= 3,
      message: 'Enter at least 3 characters'
    }
  ]}
/>

// With custom icon
<SearchInput
  label="Filter"
  placeholder="Filter results..."
  icon={<FilterIcon />}
  iconPosition="right"
/>

// Controlled search with debounce (custom hook)
const { value, onChange } = useDebouncedSearch((query) => {
  // Perform search operation
  console.log('Searching:', query);
}, 300);

<SearchInput
  label="Search"
  placeholder="Type to search..."
  value={value}
  onChange={onChange}
/>
```

### Test Coverage

The SearchInput component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/SearchInput.test.tsx
```

Test scenarios include:
- Rendering with default props
- Rendering with all sizes (sm, md, lg)
- Rendering with all states (default, error, success)
- Icon display and positioning
- Custom icon support
- Clear on Escape functionality
- Validation rules and error display
- ARIA attributes and accessibility
- Label and helper text rendering
- Required indicator display
- Full width variant
- Dark mode styling
- Focus states and keyboard navigation

### Benefits

- ✅ Consistent search input styling across application
- ✅ Built-in validation support with custom rules
- ✅ Clear on Escape for quick reset
- ✅ Full accessibility with ARIA support
- ✅ Dark mode support
- ✅ Flexible icon positioning
- ✅ Type-safe props
- ✅ Real-time validation feedback
- ✅ Loading state for async validation

### Future Enhancements

Potential improvements to consider:
- Debounced search handler (custom hook)
- Search history dropdown
- Auto-complete suggestions
- Advanced search filters (date range, categories)
- Voice search integration
- Clear button in addition to Escape key
- Search result count display

---

## GradientButton Component

**Location**: `src/components/ui/GradientButton.tsx`

A styled button component with gradient backgrounds for primary actions and clean secondary options.

### Features

- **2 Variants**: `primary` (gradient), `secondary` (glass effect)
- **3 Sizes**: `sm`, `md`, `lg`
- **Gradient Background**: Uses centralized `GRADIENT_CLASSES` configuration
- **Glass Effect**: Secondary variant with backdrop blur for modern look
- **Link Support**: Can render as anchor tag with href
- **Hover Effects**: Scale, shadow, and gradient shift on hover
- **Accessibility**: Full focus ring and keyboard navigation support
- **Dark Mode**: Consistent styling across light and dark themes
- **Shadow**: Pre-applied shadow with hover elevation
- **Active State**: Scale down on press for tactile feedback

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `GradientButtonVariant` | `'primary'` | Visual variant (primary/secondary) |
| `size` | `GradientButtonSize` | `'md'` | Button size |
| `fullWidth` | `boolean` | `false` | Whether the button takes full width |
| `href` | `string` | `undefined` | If provided, renders as anchor tag |
| `children` | `ReactNode` | Required | Button content |
| `className` | `string` | `''` | Additional CSS classes |
| All standard button/link attributes | - | - | Passes through all standard props |

### Sizes

#### Small (sm)

Compact size for dense interfaces or secondary actions.

```tsx
import GradientButton from './ui/GradientButton';

<GradientButton size="sm">
  Cancel
</GradientButton>
```

**Dimensions**:
- Padding: `px-6 py-2.5`
- Text: `text-sm`

#### Medium (md)

Standard size for most use cases (default).

```tsx
<GradientButton size="md">
  Submit
</GradientButton>
```

**Dimensions**:
- Padding: `px-8 sm:px-10 lg:px-12 py-4`
- Text: `text-sm sm:text-base`

#### Large (lg)

Larger size for prominent CTAs and important actions.

```tsx
<GradientButton size="lg">
  Get Started
</GradientButton>
```

**Dimensions**:
- Padding: `px-10 sm:px-12 lg:px-14 py-5`
- Text: `text-base sm:text-lg`

### Variants

#### Primary (default)

Gradient background with primary color theme.

```tsx
<GradientButton variant="primary">
  Primary Action
</GradientButton>
```

**Styling**:
- Gradient: `bg-gradient-to-r from-primary-600 to-primary-700`
- Text: `text-white`
- Hover: Darker gradient shift with slight scale
- Focus ring: `focus:ring-primary-500/50`
- Uses `GRADIENT_CLASSES.CHAT_HEADER` from centralized config

#### Secondary

Glass effect with border for less prominent actions.

```tsx
<GradientButton variant="secondary">
  Secondary Action
</GradientButton>
```

**Styling**:
- Background: Glass effect with backdrop blur
- Text: `text-neutral-700 dark:text-neutral-200`
- Border: `border-2 border-neutral-200 dark:border-neutral-600`
- Hover: Border and background color change with scale
- Focus ring: `focus:ring-primary-500/50`

### Button vs Link

GradientButton can render as either a button or an anchor tag.

```tsx
// As button (default)
<GradientButton onClick={handleClick}>
  Click Me
</GradientButton>

// As link
<GradientButton href="/path/to/page" target="_blank" rel="noopener noreferrer">
  Open Page
</GradientButton>
```

**Note**: When `href` is provided, the component renders as an `<a>` tag instead of `<button>`.

### Full Width

```tsx
<GradientButton fullWidth>
  Full Width Button
</GradientButton>
```

### Usage in Application

**Common Patterns:**

```tsx
// Primary CTA
<GradientButton variant="primary" size="lg">
  Get Started Today
</GradientButton>

// Secondary action
<GradientButton variant="secondary" size="md">
  Learn More
</GradientButton>

// Link to page
<GradientButton href="/contact" variant="primary">
  Contact Us
</GradientButton>

// Full width for mobile
<GradientButton fullWidth size="lg">
  Submit Application
</GradientButton>

// External link
<GradientButton
  href="https://example.com"
  target="_blank"
  rel="noopener noreferrer"
  variant="secondary"
>
  Visit Website
</GradientButton>
```

### Benefits

- ✅ Consistent button styling across application
- ✅ Gradient system integration (uses GRADIENT_CLASSES)
- ✅ Modern glass effect for secondary variant
- ✅ Built-in hover and active states
- ✅ Shadow and scale effects for visual feedback
- ✅ Works as both button and link
- ✅ Responsive sizing
- ✅ Dark mode support
- ✅ Accessible with keyboard navigation

### Future Enhancements

Potential improvements to consider:
- Loading state with spinner
- Disabled state styling
- Icon support with left/right positioning
- Success/error state variants
- Progress indicator variant
- Ripple effect on click
- Skeleton loading state

---

## SmallActionButton Component

**Location**: `src/components/ui/SmallActionButton.tsx`

A compact action button component with multiple color variants and loading state support.

### Features

- **7 Variants**: `primary`, `secondary`, `danger`, `success`, `info`, `warning`, `neutral`
- **Icon Support**: Optional icon with left or right positioning
- **Loading State**: Built-in loading spinner with `isLoading` prop
- **Compact Size**: Small footprint for action buttons in tables/lists
- **Hover Effects**: Color shifts on hover
- **Accessibility**: Full ARIA support with busy state
- **Dark Mode**: Consistent styling across light and dark themes
- **Disabled State**: Visual feedback for disabled buttons
- **Full Width**: Optional full width for mobile

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `SmallActionButtonVariant` | `'info'` | Color variant |
| `isLoading` | `boolean` | `false` | Whether button is in loading state |
| `fullWidth` | `boolean` | `false` | Whether button takes full width |
| `icon` | `ReactNode` | `undefined` | Optional icon component |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Position of icon relative to text |
| `children` | `ReactNode` | Required | Button content |
| `className` | `string` | `''` | Additional CSS classes |
| All standard button attributes | - | - | Passes through all standard HTML button props |

### Variants

#### Primary

Blue-themed primary action.

```tsx
import SmallActionButton from './ui/SmallActionButton';

<SmallActionButton variant="primary">
  Save
</SmallActionButton>
```

**Styling**:
- Background: `bg-primary-600`
- Text: `text-white`
- Hover: `hover:bg-primary-700`
- Focus ring: `focus:ring-primary-500/50`

#### Secondary

Neutral-themed secondary action.

```tsx
<SmallActionButton variant="secondary">
  Cancel
</SmallActionButton>
```

**Styling**:
- Background: `bg-white dark:bg-neutral-800`
- Text: `text-neutral-700 dark:text-neutral-300`
- Border: `border border-neutral-200 dark:border-neutral-600`
- Hover: `hover:bg-neutral-50 dark:hover:bg-neutral-700`

#### Danger

Red-themed destructive action.

```tsx
<SmallActionButton variant="danger">
  Delete
</SmallActionButton>
```

**Styling**:
- Background: `bg-red-100 dark:bg-red-900/30`
- Text: `text-red-700 dark:text-red-300`
- Hover: `hover:bg-red-200 dark:hover:bg-red-800/50`
- Focus ring: `focus:ring-red-500/50`

#### Success

Green-themed success action.

```tsx
<SmallActionButton variant="success">
  Approve
</SmallActionButton>
```

**Styling**:
- Background: `bg-green-100 dark:bg-green-900/30`
- Text: `text-green-700 dark:text-green-300`
- Hover: `hover:bg-green-200 dark:hover:bg-green-800/50`

#### Info

Blue-themed informational action (default).

```tsx
<SmallActionButton variant="info">
  Details
</SmallActionButton>
```

**Styling**:
- Background: `bg-blue-50 dark:bg-blue-900/20`
- Text: `text-blue-600 dark:text-blue-400`
- Hover: `hover:bg-blue-100 dark:hover:bg-blue-900/30`

#### Warning

Orange-themed warning action.

```tsx
<SmallActionButton variant="warning">
  Alert
</SmallActionButton>
```

**Styling**:
- Background: `bg-orange-100 dark:bg-orange-900/30`
- Text: `text-orange-700 dark:text-orange-300`
- Hover: `hover:bg-orange-200 dark:hover:bg-orange-800/50`

#### Neutral

Gray-themed neutral action.

```tsx
<SmallActionButton variant="neutral">
  Reset
</SmallActionButton>
```

**Styling**:
- Background: `bg-neutral-200 dark:bg-neutral-700`
- Text: `text-neutral-700 dark:text-neutral-300`
- Hover: `hover:bg-neutral-300 dark:hover:bg-neutral-600`

### Loading State

Built-in loading spinner with `isLoading` prop.

```tsx
<SmallActionButton isLoading onClick={handleSave}>
  {isLoading ? 'Saving...' : 'Save'}
</SmallActionButton>
```

**Loading Features**:
- Shows spinner animation
- Disables button during loading
- Sets cursor to `wait`
- Announces `aria-busy="true"` for screen readers
- Replaces icon and text with spinner

### Icon Support

Optional icon with flexible positioning.

```tsx
// Left icon (default)
<SmallActionButton icon={<SaveIcon />}>
  Save
</SmallActionButton>

// Right icon
<SmallActionButton icon={<ArrowRightIcon />} iconPosition="right">
  Continue
</SmallActionButton>
```

### Full Width

```tsx
<SmallActionButton fullWidth>
  Full Width Action
</SmallActionButton>
```

### Disabled State

```tsx
<SmallActionButton disabled>
  Disabled Action
</SmallActionButton>
```

### Usage in Application

**Common Patterns:**

```tsx
// Action buttons in table
<SmallActionButton variant="info" icon={<EyeIcon />}>
  View
</SmallActionButton>
<SmallActionButton variant="danger" icon={<TrashIcon />}>
  Delete
</SmallActionButton>

// Confirm dialog actions
<SmallActionButton variant="neutral" onClick={handleCancel}>
  Cancel
</SmallActionButton>
<SmallActionButton variant="danger" onClick={handleConfirm}>
  Confirm
</SmallActionButton>

// With loading state
<SmallActionButton
  variant="primary"
  isLoading={isSaving}
  icon={<SaveIcon />}
  onClick={handleSave}
>
  {isSaving ? 'Saving...' : 'Save'}
</SmallActionButton>

// Status actions
<SmallActionButton variant="success" icon={<CheckIcon />}>
  Approve
</SmallActionButton>
<SmallActionButton variant="warning" icon={<ExclamationIcon />}>
  Flag
</SmallActionButton>

// Navigation
<SmallActionButton variant="primary" icon={<ArrowRightIcon />} iconPosition="right">
  Next Step
</SmallActionButton>
```

### Benefits

- ✅ Consistent small button styling across application
- ✅ 7 color variants for semantic meaning
- ✅ Built-in loading state with spinner
- ✅ Icon support with flexible positioning
- ✅ Accessible with ARIA support
- ✅ Dark mode support
- ✅ Compact size for dense interfaces
- ✅ Type-safe props

### Future Enhancements

Potential improvements to consider:
- Progress indicator for partial completion
- Badge count support
- Tooltip integration
- Dropdown trigger variant
  - Multi-select toggle
  - Split button variant
  - Keyboard shortcut support

---

## Input Component

**Location**: `src/components/ui/Input.tsx`

A flexible and accessible input component with validation, masking, and comprehensive state management. Supports multiple input types, custom icons, and automatic formatting.

### Features

- **3 Sizes**: `sm`, `md`, `lg`
- **3 States**: `default`, `error`, `success`
- **Input Masks**: Built-in formatting for NISN, phone, date, year, class, and grade inputs
- **Validation**: Client-side validation with customizable rules
- **Accessibility**: Full ARIA support, keyboard navigation, screen reader announcements
- **Dark Mode**: Consistent styling across light and dark themes
- **Icons**: Optional left and right icon support with automatic spacing
- **Clear on Escape**: Optional quick-clear functionality
- **Auto-focus**: Automatically focuses on validation errors
- **Real-time Validation**: Change and blur validation triggers

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label text displayed above the input |
| `helperText` | `string` | `undefined` | Helper text displayed below the input |
| `errorText` | `string` | `undefined` | Error message displayed below the input (sets state to error) |
| `size` | `InputSize` | `'md'` | Input size (affects padding, text size, and icon size) |
| `state` | `InputState` | `'default'` | Visual state variant (defaults to 'error' if errorText provided) |
| `leftIcon` | `ReactNode` | `undefined` | Icon displayed on the left side of input |
| `rightIcon` | `ReactNode` | `undefined` | Icon displayed on the right side of input |
| `fullWidth` | `boolean` | `false` | Whether the input should take full width |
| `validationRules` | `Array<{validate, message}>` | `[]` | Custom validation rules with error messages |
| `validateOnChange` | `boolean` | `true` | Whether to validate on input change |
| `validateOnBlur` | `boolean` | `true` | Whether to validate on input blur |
| `accessibility?.announceErrors` | `boolean` | `true` | Whether to announce errors to screen readers |
| `accessibility?.describedBy` | `string` | `undefined` | Additional ARIA described-by ID |
| `inputMask` | `InputMaskType` | `undefined` | Input mask type (nisn, phone, date, year, class, grade) |
| `customType` | `InputType` | `'text'` | Input type (text, email, password, tel, number, nisn, phone, date, year, class, grade) |
| `clearOnEscape` | `boolean` | `false` | Whether pressing Escape clears the input |
| All standard input attributes | - | - | Passes through all standard HTML input props |

### Input Masks

The Input component includes built-in formatters for common Indonesian data types:

#### NISN Mask

Automatically formats Indonesian National Student ID (10 digits).

```tsx
<Input
  label="NISN"
  inputMask="nisn"
  placeholder="Masukkan NISN"
  customType="nisn"
/>
```

**Behavior**: Auto-formats to 10 digits, displays placeholder pattern `_____-____`, validates with pattern `[0-9]{10}`

#### Phone Mask

Automatically formats Indonesian phone numbers.

```tsx
<Input
  label="Nomor Telepon"
  inputMask="phone"
  placeholder="08XX-XXXX-XXXX"
  customType="phone"
/>
```

**Behavior**: Auto-formats to `08XX-XXXX-XXXX` pattern (10-13 digits), displays phone icon automatically

#### Date Mask

Formats date inputs.

```tsx
<Input
  label="Tanggal Lahir"
  inputMask="date"
  placeholder="DD-MM-YYYY"
  customType="date"
/>
```

**Behavior**: Auto-formats to `DD-MM-YYYY` pattern, validates day/month/year ranges

#### Year Mask

Formats year inputs (4 digits).

```tsx
<Input
  label="Tahun Masuk"
  inputMask="year"
  placeholder="YYYY"
  customType="year"
/>
```

**Behavior**: Auto-formats to 4 digits, validates year range

#### Class Mask

Formats class names (e.g., "10A", "11C").

```tsx
<Input
  label="Kelas"
  inputMask="class"
  placeholder="Contoh: 10A"
  customType="class"
/>
```

**Behavior**: Auto-formats to pattern `[X][X][A-Z]` (grade + letter)

#### Grade Mask

Formats numeric grades (1-100).

```tsx
<Input
  label="Nilai"
  inputMask="grade"
  placeholder="0-100"
  customType="grade"
/>
```

**Behavior**: Auto-formats to 1-3 digits, validates 0-100 range

### Sizes

#### Small (sm)

Compact size for dense interfaces.

```tsx
<Input
  label="Nama"
  size="sm"
  placeholder="Masukkan nama lengkap"
/>
```

**Dimensions**:
- Input padding: `px-3 py-2`
- Input text: `text-sm`
- Label text: `text-xs`
- Helper/error text: `text-xs`
- Icon size: `w-4 h-4`

#### Medium (md)

Standard size for most use cases (default).

```tsx
<Input
  label="Email"
  size="md"
  placeholder="nama@email.com"
  customType="email"
/>
```

**Dimensions**:
- Input padding: `px-4 py-3`
- Input text: `text-sm sm:text-base`
- Label text: `text-sm`
- Helper/error text: `text-xs`
- Icon size: `w-5 h-5`

#### Large (lg)

Larger size for better accessibility and touch targets.

```tsx
<Input
  label="Keterangan"
  size="lg"
  placeholder="Masukkan keterangan..."
/>
```

**Dimensions**:
- Input padding: `px-5 py-4`
- Input text: `text-base sm:text-lg`
- Label text: `text-base`
- Helper/error text: `text-sm`
- Icon size: `w-6 h-6`

### States

#### Default State

Standard appearance with neutral colors.

```tsx
<Input
  label="Nama"
  placeholder="Masukkan nama"
  state="default"
/>
```

**Styling**: Neutral border, white background, primary focus ring

#### Error State

Red-themed styling for validation errors.

```tsx
<Input
  label="Email"
  errorText="Format email tidak valid"
  customType="email"
/>
```

**Styling**: Red border, light red background, red focus ring, red error text

**Behavior**: Automatically sets `aria-invalid="true"` and announces errors to screen readers

#### Success State

Green-themed styling for valid inputs.

```tsx
<Input
  label="Password"
  state="success"
  helperText="Kata sandi yang kuat"
  customType="password"
/>
```

**Styling**: Green border, light green background, green focus ring

### Validation

#### Basic Validation with Rules

```tsx
<Input
  label="Email"
  customType="email"
  validationRules={[
    {
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Format email tidak valid'
    },
    {
      validate: (value) => value.length > 0,
      message: 'Email wajib diisi'
    }
  ]}
/>
```

#### Password Validation

```tsx
<Input
  label="Password"
  customType="password"
  validationRules={[
    {
      validate: (value) => value.length >= 8,
      message: 'Password minimal 8 karakter'
    },
    {
      validate: (value) => /[A-Z]/.test(value),
      message: 'Password harus mengandung huruf kapital'
    },
    {
      validate: (value) => /[0-9]/.test(value),
      message: 'Password harus mengandung angka'
    }
  ]}
/>
```

#### Validation Timing Control

```tsx
<Input
  label="Username"
  validateOnChange={false}  // Only validate on blur
  validateOnBlur={true}
  validationRules={[
    {
      validate: (value) => value.length >= 3,
      message: 'Username minimal 3 karakter'
    }
  ]}
/>
```

### Icons

#### Left Icon with Spacing

```tsx
<Input
  label="Cari..."
  placeholder="Ketik untuk mencari"
  leftIcon={
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  }
/>
```

#### Right Icon

```tsx
<Input
  label="Password"
  customType="password"
  rightIcon={
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  }
/>
```

### Advanced Features

#### Clear on Escape

```tsx
<Input
  label="Filter"
  placeholder="Ketik untuk memfilter..."
  clearOnEscape={true}
/>
```

**Behavior**: Pressing Escape key clears the input value

#### Full Width Input

```tsx
<Input
  label="Alamat Lengkap"
  placeholder="Masukkan alamat lengkap"
  fullWidth={true}
/>
```

#### Accessibility Configuration

```tsx
<Input
  label="Nama"
  accessibility={{
    announceErrors: true,
    describedBy: 'additional-info'
  }}
  helperText="Nama sesuai kartu identitas"
/>
```

#### Custom Input Types

```tsx
// Number input with min/max
<Input
  label="Usia"
  customType="number"
  min="0"
  max="120"
/>

// Date input
<Input
  label="Tanggal Pendaftaran"
  customType="date"
/>

// Tel input
<Input
  label="Nomor WhatsApp"
  customType="tel"
  placeholder="08XX-XXXX-XXXX"
/>
```

### Accessibility Features

- **ARIA Labels**: Automatic label association via `htmlFor`
- **Required Indicators**: Visual `*` with aria-label="wajib diisi"
- **Error Announcements**: Screen reader announcements for errors (`role="alert"`, `aria-live="polite"`)
- **Focus Management**: Auto-focus on validation errors
- **Keyboard Navigation**: Full keyboard support, Escape key to clear
- **Described By**: Automatic association with helper and error text
- **Validation States**: `aria-invalid` attribute reflects validation state
- **Live Regions**: `aria-live` and `aria-busy` for async validation

### Real-World Examples

#### Login Form

```tsx
<form onSubmit={handleSubmit}>
  <Input
    label="Email"
    customType="email"
    placeholder="nama@email.com"
    fullWidth={true}
    validationRules={[
      {
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Format email tidak valid'
      }
    ]}
  />

  <Input
    label="Password"
    customType="password"
    placeholder="Masukkan password"
    fullWidth={true}
    validationRules={[
      {
        validate: (value) => value.length >= 8,
        message: 'Password minimal 8 karakter'
      }
    ]}
  />

  <Button type="submit" fullWidth>
    Login
  </Button>
</form>
```

#### Student Registration Form

```tsx
<form onSubmit={handleRegister}>
  <Input
    label="NISN"
    inputMask="nisn"
    placeholder="10 digit NISN"
    customType="nisn"
    fullWidth={true}
    required
  />

  <Input
    label="Nama Lengkap"
    placeholder="Masukkan nama lengkap"
    fullWidth={true}
    required
  />

  <Input
    label="Nomor HP Orang Tua"
    inputMask="phone"
    placeholder="08XX-XXXX-XXXX"
    customType="phone"
    fullWidth={true}
    helperText="Akan digunakan untuk notifikasi"
  />
</form>
```

#### Search with Quick Clear

```tsx
<Input
  label="Cari Siswa"
  placeholder="Ketik nama atau NISN..."
  leftIcon={<SearchIcon />}
  clearOnEscape={true}
  fullWidth={true}
/>
```

### Benefits

- ✅ Comprehensive input masking for Indonesian data formats
- ✅ Client-side validation with customizable rules
- ✅ Automatic error handling and announcements
- ✅ Consistent styling across all states and sizes
- ✅ Full accessibility support (WCAG 2.1 AA)
- ✅ Built-in icon support with automatic spacing
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Type-safe props
- ✅ Auto-focus on validation errors
- ✅ Real-time validation feedback
- ✅ Quick-clear functionality

### Notes

- Input masks automatically add icons for phone and nisn types
- Validation rules execute in order, stopping at first failure
- Error state automatically sets state to error even if state prop is different
- clearOnEscape is false by default for backward compatibility
- Input refs are properly forwarded for external control

---

## Select Component

**Location**: `src/components/ui/Select.tsx`

A flexible and accessible select dropdown component with consistent styling, full accessibility support, and responsive design.

### Features

- **3 Sizes**: `sm`, `md`, `lg`
- **3 States**: `default`, `error`, `success`
- **Placeholder Support**: Optional placeholder option
- **Accessibility**: Full ARIA support, keyboard navigation, screen reader support
- **Dark Mode**: Consistent styling across light and dark themes
- **Disabled Options**: Support for disabled option items
- **Custom Styling**: Dropdown arrow icon with consistent sizing
- **Label Support**: Optional label with required indicator
- **Helper Text**: Contextual guidance for users
- **Error Handling**: Built-in error state with role="alert"

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label text displayed above the select |
| `helperText` | `string` | `undefined` | Helper text displayed below the select |
| `errorText` | `string` | `undefined` | Error message displayed below the select (sets state to error) |
| `size` | `SelectSize` | `'md'` | Select size (affects padding and text size) |
| `state` | `SelectState` | `'default'` | Visual state variant (defaults to 'error' if errorText provided) |
| `fullWidth` | `boolean` | `false` | Whether the select should take full width |
| `options` | `Array<{value, label, disabled}>` | **required** | Array of option objects |
| `placeholder` | `string` | `undefined` | Placeholder text for first option |
| All standard select attributes | - | - | Passes through all standard HTML select props |

### Sizes

#### Small (sm)

Compact size for dense interfaces.

```tsx
<Select
  label="Role"
  placeholder="Pilih role"
  size="sm"
  options={[
    { value: 'admin', label: 'Administrator' },
    { value: 'teacher', label: 'Guru' },
    { value: 'student', label: 'Siswa' },
  ]}
/>
```

**Dimensions**:
- Select padding: `px-3 py-2`
- Select text: `text-sm`
- Label text: `text-xs`
- Helper/error text: `text-xs`
- Arrow icon: `w-4 h-4`

#### Medium (md)

Standard size for most use cases (default).

```tsx
<Select
  label="Kelas"
  placeholder="Pilih kelas"
  size="md"
  options={[
    { value: '10A', label: 'Kelas 10A' },
    { value: '10B', label: 'Kelas 10B' },
    { value: '11A', label: 'Kelas 11A' },
  ]}
/>
```

**Dimensions**:
- Select padding: `px-4 py-3`
- Select text: `text-sm sm:text-base`
- Label text: `text-sm`
- Helper/error text: `text-xs`
- Arrow icon: `w-5 h-5`

#### Large (lg)

Larger size for better accessibility and touch targets.

```tsx
<Select
  label="Tahun Akademik"
  placeholder="Pilih tahun akademik"
  size="lg"
  options={[
    { value: '2023-2024', label: '2023-2024' },
    { value: '2024-2025', label: '2024-2025' },
    { value: '2025-2026', label: '2025-2026' },
  ]}
/>
```

**Dimensions**:
- Select padding: `px-5 py-4`
- Select text: `text-base sm:text-lg`
- Label text: `text-base`
- Helper/error text: `text-sm`
- Arrow icon: `w-5 h-5`

### States

#### Default State

Standard appearance with neutral colors.

```tsx
<Select
  label="Jurusan"
  placeholder="Pilih jurusan"
  state="default"
  options={[
    { value: 'ipa', label: 'IPA' },
    { value: 'ips', label: 'IPS' },
  ]}
/>
```

**Styling**: Neutral border, white background, primary focus ring

#### Error State

Red-themed styling for validation errors.

```tsx
<Select
  label="Kelas"
  errorText="Kelas wajib dipilih"
  options={[
    { value: '10A', label: 'Kelas 10A' },
    { value: '10B', label: 'Kelas 10B' },
  ]}
/>
```

**Styling**: Red border, white background, red focus ring, red error text

**Behavior**: Automatically sets `aria-invalid="true"` and error role

#### Success State

Green-themed styling for valid selections.

```tsx
<Select
  label="Semester"
  placeholder="Pilih semester"
  state="success"
  helperText="Semester aktif"
  options={[
    { value: 'ganjil', label: 'Semester Ganjil' },
    { value: 'genap', label: 'Semester Genap' },
  ]}
/>
```

**Styling**: Green border, white background, green focus ring

### Options

#### Basic Options

```tsx
<Select
  label="Mata Pelajaran"
  placeholder="Pilih mata pelajaran"
  options={[
    { value: 'matematika', label: 'Matematika' },
    { value: 'fisika', label: 'Fisika' },
    { value: 'kimia', label: 'Kimia' },
    { value: 'biologi', label: 'Biologi' },
  ]}
/>
```

#### Disabled Options

```tsx
<Select
  label="Kelas"
  placeholder="Pilih kelas"
  options={[
    { value: '10A', label: 'Kelas 10A' },
    { value: '10B', label: 'Kelas 10B', disabled: true },
    { value: '11A', label: 'Kelas 11A' },
    { value: '11B', label: 'Kelas 11B', disabled: true },
  ]}
/>
```

#### Dynamic Options from API

```tsx
const [classes, setClasses] = useState([]);

useEffect(() => {
  fetchClasses().then(data => setClasses(data));
}, []);

<Select
  label="Kelas"
  placeholder="Pilih kelas"
  options={classes.map(cls => ({
    value: cls.id,
    label: cls.name
  }))}
/>
```

### Advanced Features

#### Full Width Select

```tsx
<Select
  label="Jurusan"
  placeholder="Pilih jurusan"
  fullWidth={true}
  options={[
    { value: 'ipa', label: 'IPA' },
    { value: 'ips', label: 'IPS' },
    { value: 'bahasa', label: 'Bahasa' },
  ]}
/>
```

#### Required Field

```tsx
<Select
  label="Kelas"
  placeholder="Pilih kelas"
  required
  options={[
    { value: '10A', label: 'Kelas 10A' },
    { value: '10B', label: 'Kelas 10B' },
  ]}
/>
```

**Display**: Shows red `*` indicator next to label

#### Controlled Select

```tsx
const [selectedRole, setSelectedRole] = useState('');

<Select
  label="Role"
  placeholder="Pilih role"
  value={selectedRole}
  onChange={(e) => setSelectedRole(e.target.value)}
  options={[
    { value: 'admin', label: 'Administrator' },
    { value: 'teacher', label: 'Guru' },
    { value: 'student', label: 'Siswa' },
  ]}
/>
```

### Accessibility Features

- **ARIA Labels**: Automatic label association via `htmlFor`
- **Required Indicators**: Visual `*` with aria-label="wajib diisi"
- **Error Announcements**: `role="alert"` for error text
- **Focus Management**: Proper focus styles and keyboard navigation
- **Described By**: Automatic association with helper and error text
- **Invalid State**: `aria-invalid` attribute reflects error state
- **Disabled Options**: Properly disabled for keyboard and mouse users

### Real-World Examples

#### Student Form

```tsx
<form onSubmit={handleSubmit}>
  <Select
    label="Kelas"
    placeholder="Pilih kelas"
    required
    fullWidth={true}
    options={classes.map(cls => ({
      value: cls.id,
      label: cls.name
    }))}
  />

  <Select
    label="Jurusan"
    placeholder="Pilih jurusan"
    required
    fullWidth={true}
    options={[
      { value: 'ipa', label: 'IPA' },
      { value: 'ips', label: 'IPS' },
    ]}
  />

  <Select
    label="Tahun Masuk"
    placeholder="Pilih tahun masuk"
    fullWidth={true}
    options={[
      { value: '2023', label: '2023' },
      { value: '2024', label: '2024' },
      { value: '2025', label: '2025' },
    ]}
  />
</form>
```

#### Teacher Assignment Form

```tsx
<Select
  label="Mata Pelajaran"
  placeholder="Pilih mata pelajaran"
  helperText="Mata pelajaran yang akan diampu"
  options={subjects.map(sub => ({
    value: sub.id,
    label: `${sub.code} - ${sub.name}`
  }))}
/>

<Select
  label="Kelas yang Diampu"
  placeholder="Pilih kelas"
  helperText="Bisa memilih lebih dari satu"
  multiple
  options={availableClasses.map(cls => ({
    value: cls.id,
    label: cls.name
  }))}
/>
```

#### Filter Dropdown

```tsx
<Select
  label="Filter Status"
  placeholder="Semua status"
  size="sm"
  options={[
    { value: 'all', label: 'Semua' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' },
    { value: 'graduated', label: 'Lulus' },
  ]}
/>
```

### Benefits

- ✅ Consistent styling across all states and sizes
- ✅ Full accessibility support (WCAG 2.1 AA)
- ✅ Built-in error handling and announcements
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Type-safe props
- ✅ Disabled option support
- ✅ Placeholder support
- ✅ Custom styling support
- ✅ Keyboard navigation

### Notes

- Placeholder option is automatically disabled
- Error state automatically sets state to error even if state prop is different
- Arrow icon is automatically sized based on size prop
- All options are keyboard navigable
- Component uses forwardRef for ref forwarding

---

## Toast Component

**Location**: `src/components/Toast.tsx`

A notification toast component for displaying success, info, and error messages with automatic dismissal, keyboard support, and comprehensive accessibility features.

### Features

- **3 Types**: `success`, `info`, `error`
- **Auto-dismissal**: Configurable duration (default: 3000ms)
- **Pause on Hover**: Pauses auto-dismiss when user is reading
- **Keyboard Dismissal**: Press Escape to close
- **Accessibility**: Full ARIA support, screen reader announcements, focus management
- **Dark Mode**: Consistent styling across light and dark themes
- **Backdrop Blur**: Modern backdrop-blur effect
- **Smooth Animations**: Enter and exit animations
- **Focus Management**: Automatic focus restoration
- **Type-specific Roles**: `alert` for errors, `status` for success/info

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | **required** | Message text to display |
| `type` | `ToastType` | `'success'` | Toast type (success, info, error) |
| `isVisible` | `boolean` | **required** | Whether the toast is visible |
| `onClose` | `() => void` | **required** | Callback when toast is closed |
| `duration` | `number` | `3000` | Auto-dismiss duration in milliseconds |

### Types

#### Success Toast

Green-themed notification for successful operations.

```tsx
<Toast
  message="Data berhasil disimpan!"
  type="success"
  isVisible={showSuccessToast}
  onClose={() => setShowSuccessToast(false)}
/>
```

**Styling**: Primary green accent, checkmark icon, white/neutral background

**Accessibility**: `role="status"`, `aria-live="polite"` (non-critical announcement)

#### Info Toast

Blue-themed notification for informational messages.

```tsx
<Toast
  message="Fitur ini akan segera tersedia"
  type="info"
  isVisible={showInfoToast}
  onClose={() => setShowInfoToast(false)}
  duration={5000}
/>
```

**Styling**: Blue accent, info icon, white/neutral background

**Accessibility**: `role="status"`, `aria-live="polite"` (non-critical announcement)

#### Error Toast

Red-themed notification for errors and failures.

```tsx
<Toast
  message="Gagal mengambil data. Silakan coba lagi."
  type="error"
  isVisible={showErrorToast}
  onClose={() => setShowErrorToast(false)}
/>
```

**Styling**: Red accent, warning icon, white/neutral background

**Accessibility**: `role="alert"`, `aria-live="assertive"` (critical announcement)

### Advanced Features

#### Custom Duration

```tsx
<Toast
  message="Penggunaan storage: 85% penuh"
  type="info"
  isVisible={showWarningToast}
  onClose={() => setShowWarningToast(false)}
  duration={8000}
/>
```

**Behavior**: Toast stays visible for 8 seconds

#### Pause on Hover

Automatically enabled. When user hovers over toast, auto-dismissal pauses.

```tsx
<Toast
  message="Pesan panjang yang memerlukan waktu untuk dibaca oleh pengguna. User dapat hover untuk memperpanjang waktu baca."
  type="info"
  isVisible={showLongToast}
  onClose={() => setShowLongToast(false)}
  duration={4000}
/>
```

**Behavior**: Timer pauses when mouse enters toast, resumes when mouse leaves

#### Keyboard Dismissal

Press Escape key to close toast.

```tsx
<Toast
  message="Tekan Escape untuk menutup notifikasi ini"
  type="info"
  isVisible={showKeyboardToast}
  onClose={() => setShowKeyboardToast(false)}
/>
```

**Behavior**: Escape key triggers onClose callback

### Integration with App State

#### Global Toast Hook

```tsx
// hooks/useToast.ts
import { useState } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState({ message: '', type: 'success' as const, isVisible: false });

  const showToast = (message: string, type: 'success' | 'info' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return { toast, showToast, hideToast };
};

// Usage in component
function MyComponent() {
  const { toast, showToast, hideToast } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showToast('Data berhasil disimpan!', 'success');
    } catch (error) {
      showToast('Gagal menyimpan data', 'error');
    }
  };

  return (
    <>
      <Button onClick={handleSave}>Simpan</Button>
      <Toast {...toast} onClose={hideToast} />
    </>
  );
}
```

#### API Call Feedback

```tsx
const { toast, showToast, hideToast } = useToast();

const handleDelete = async (id: string) => {
  try {
    await apiService.delete(`/students/${id}`);
    showToast('Siswa berhasil dihapus', 'success');
    fetchStudents(); // Refresh list
  } catch (error) {
    showToast('Gagal menghapus siswa', 'error');
  }
};
```

#### Form Validation Feedback

```tsx
const { toast, showToast, hideToast } = useToast();

const handleSubmit = (e: FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    showToast('Mohon lengkapi semua field yang wajib diisi', 'error');
    return;
  }

  showToast('Formulir berhasil dikirim!', 'success');
  // Submit logic...
};
```

### Accessibility Features

- **Type-specific Roles**: `role="alert"` for errors, `role="status"` for success/info
- **Live Regions**: `aria-live="assertive"` for errors, `aria-live="polite"` for non-critical
- **Atomic Updates**: `aria-atomic="true"` ensures entire toast is announced
- **Focus Management**: Auto-focuses toast when visible, restores previous focus on close
- **Keyboard Support**: Escape key to dismiss
- **Screen Reader Announcements**: Proper ARIA attributes for screen readers
- **Pause on Hover**: Allows screen reader users to complete announcement
- **Visual Focus**: Toast receives focus for keyboard users

### Visual Features

- **Backdrop Blur**: `backdrop-blur-xl` for modern glass effect
- **Border Accents**: Left border color indicates toast type
- **Smooth Animations**: Slide-in from right with fade effect
- **Responsive Positioning**: Top-right on desktop, top on mobile
- **Max Width**: Constrained to `max-w-md` for readability
- **Shadow**: `shadow-float` for depth
- **Icons**: Type-specific icons (checkmark, info, warning)
- **Close Button**: IconButton with proper ARIA label

### Real-World Examples

#### Form Submission Success

```tsx
const { toast, showToast, hideToast } = useToast();

const handleRegister = async (formData: FormData) => {
  const loadingToast = useLoadingToast('Mendaftarkan siswa...');

  try {
    await apiService.post('/students', formData);
    hideToast();
    showToast('Siswa berhasil didaftarkan!', 'success');
    // Redirect to list...
  } catch (error) {
    hideToast();
    showToast('Gagal mendaftarkan siswa', 'error');
  }
};
```

#### API Error Handling

```tsx
const { toast, showToast, hideToast } = useToast();

const fetchStudents = async () => {
  try {
    const data = await apiService.get('/students');
    setStudents(data);
  } catch (error) {
    if (error.response?.status === 401) {
      showToast('Sesi telah berakhir. Silakan login ulang.', 'error');
      logout();
    } else if (error.response?.status === 429) {
      showToast('Terlalu banyak permintaan. Silakan tunggu sebentar.', 'info');
    } else {
      showToast('Gagal mengambil data siswa', 'error');
    }
  }
};
```

#### File Upload Progress

```tsx
const { toast, showToast, hideToast } = useToast();

const handleUpload = async (file: File) => {
  showToast(`Mengunggah ${file.name}...`, 'info');

  try {
    await uploadFile(file);
    showToast('File berhasil diunggah!', 'success');
  } catch (error) {
    showToast('Gagal mengunggah file', 'error');
  }
};
```

#### Multi-step Form Completion

```tsx
const { toast, showToast, hideToast } = useToast();

const steps = [
  { name: 'Informasi Pribadi', completed: false },
  { name: 'Informasi Akademik', completed: false },
  { name: 'Orang Tua', completed: false },
];

const handleStepComplete = (stepIndex: number) => {
  steps[stepIndex].completed = true;

  if (stepIndex === steps.length - 1) {
    showToast('Selamat! Semua langkah selesai.', 'success');
  } else {
    showToast(`${steps[stepIndex].name} selesai`, 'info');
  }
};
```

### Benefits

- ✅ Consistent notification system across application
- ✅ Type-specific styling and icons
- ✅ Automatic dismissal with configurable duration
- ✅ Pause on hover for longer messages
- ✅ Keyboard support (Escape to dismiss)
- ✅ Full accessibility support (WCAG 2.1 AA)
- ✅ Screen reader announcements with proper ARIA
- ✅ Focus management and restoration
- ✅ Dark mode support
- ✅ Modern glass-morphism design
- ✅ Smooth animations
- ✅ Responsive positioning
- ✅ Type-safe props

### Notes

- Toast auto-focuses when visible for keyboard users
- Previous focus is restored when toast is closed
- Error toasts use `aria-live="assertive"` for immediate announcement
- Success/info toasts use `aria-live="polite"` for non-interruptive announcement
- Pause on hover allows users to read longer messages
- Duration is in milliseconds (default: 3000ms)
- Toast appears at `top-20` (mobile) / `top-6` (desktop) right-aligned

---