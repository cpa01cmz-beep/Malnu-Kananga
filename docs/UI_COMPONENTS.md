# UI Components Documentation

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
