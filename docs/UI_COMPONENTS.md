# UI Components Documentation

**Status**: ✅ COMPLETE (42 of 42 components documented)
**Last Updated**: 2026-01-14

> **COMPLETED**: All 42 exported UI components from `src/components/ui/index.ts` are now documented.
>
> **Form Components (8)**: Input, Select, Textarea, Label, FileInput, Toggle, SearchInput, FormGrid
> **Button Components (5)**: Button, IconButton, GradientButton, BackButton, SmallActionButton
> **Layout Components (7)**: Card, Modal, BaseModal, ConfirmationDialog, Section, ErrorBoundary, SkipLink
> **Display Components (6)**: Heading, Badge, Alert, LinkCard, DashboardActionCard, SocialLink
> **Table Components (2)**: Table (Thead, Tbody, Tfoot, Tr, Th, Td), DataTable
> **Interactive Components (2)**: Tab, Toast
> **Navigation Components (1)**: Pagination
> **Loading Components (5)**: LoadingState, EmptyState, ErrorState, LoadingSpinner, LoadingOverlay, Skeleton, SuspenseLoading
> **Progress Components (1)**: ProgressBar
> **Utility Components (3)**: PageHeader, ErrorMessage, PDFExportButton
>
> See `src/components/ui/index.ts` for complete export list. Documentation updates are tracked in TASK.md (P1 priority).

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

## Input Component

**Location**: `src/components/ui/Input.tsx`

A reusable input component with validation, input masks, icons, and comprehensive accessibility support.

### Features

- **3 Sizes**: `sm`, `md`, `lg` for flexible layouts
- **3 States**: `default`, `error`, `success`
- **Input Masks**: Built-in formatters for NISN, phone, date, year, class, grade
- **Validation**: Built-in validation rules with error announcement
- **Icons**: Optional left and right icons
- **Clear on Escape**: Optional keyboard shortcut to clear input
- **Accessibility**: Full ARIA support, keyboard navigation, focus management, error announcement
- **Dark Mode**: Consistent styling across light and dark themes
- **Label Support**: Optional label with required indicator
- **Helper Text**: Contextual guidance for users
- **Error Handling**: Built-in error state with role="alert"
- **Auto-Focus**: Automatically focuses input on validation errors

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label text displayed above the input |
| `helperText` | `string` | `undefined` | Helper text displayed below the input |
| `errorText` | `string` | `undefined` | Error message displayed below the input (sets state to error) |
| `size` | `InputSize` | `'md'` | Input size (affects padding and text size) |
| `state` | `InputState` | `'default'` | Visual state variant (defaults to 'error' if errorText provided) |
| `leftIcon` | `ReactNode` | `undefined` | Icon displayed on the left side of input |
| `rightIcon` | `ReactNode` | `undefined` | Icon displayed on the right side of input |
| `fullWidth` | `boolean` | `false` | Whether the input should take full width |
| `validationRules` | `Array<{ validate: (value: string) => boolean; message: string }>` | `[]` | Array of validation rules with validate function and error message |
| `validateOnChange` | `boolean` | `true` | Validate on every change event |
| `validateOnBlur` | `boolean` | `true` | Validate on blur event |
| `accessibility.announceErrors` | `boolean` | `true` | Announce validation errors via ARIA |
| `accessibility.describedBy` | `string` | `undefined` | Additional ARIA describedby IDs |
| `inputMask` | `'nisn' \| 'phone' \| 'date' \| 'year' \| 'class' \| 'grade'` | `undefined` | Input mask formatter type |
| `customType` | `InputType` | `'text'` | Custom HTML input type |
| `clearOnEscape` | `boolean` | `false` | Clear input value when Escape key is pressed |
| `id` | `string` | Auto-generated | Unique identifier for the input |
| `className` | `string` | `''` | Additional CSS classes |
| All standard input attributes | - | - | Passes through all standard HTML input props |

### Sizes

#### Small (sm)

Compact size for dense interfaces.

```tsx
import Input from './ui/Input';

<Input
  label="Username"
  size="sm"
  placeholder="Enter username..."
/>
```

**Dimensions**:
- Input padding: `px-3 py-2`
- Input text: `text-sm`
- Label: `text-xs`
- Helper/Error text: `text-xs`

#### Medium (md)

Standard size for most use cases (default).

```tsx
<Input
  label="Email"
  size="md"
  placeholder="Enter email..."
/>
```

**Dimensions**:
- Input padding: `px-4 py-3`
- Input text: `text-sm sm:text-base`
- Label: `text-sm`
- Helper/Error text: `text-xs`

#### Large (lg)

Larger size for better accessibility and touch targets.

```tsx
<Input
  label="Password"
  size="lg"
  type="password"
/>
```

**Dimensions**:
- Input padding: `px-5 py-4`
- Input text: `text-base sm:text-lg`
- Label: `text-base`
- Helper/Error text: `text-sm`

### States

#### Default State

Standard styling for normal input.

```tsx
<Input
  label="Full Name"
  placeholder="Enter your full name..."
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
<Input
  label="Email"
  errorText="Invalid email address"
  placeholder="Enter email..."
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
<Input
  label="Password"
  state="success"
  helperText="Strong password"
  type="password"
/>
```

**Styling**:
- Border: `border-green-300` / `dark:border-green-700`
- Background: `bg-green-50` / `dark:bg-green-900/20`
- Focus: `focus:ring-green-500/50 focus:border-green-500`

### Input Masks

Built-in formatters for common input patterns.

#### NISN Mask

```tsx
<Input
  label="NISN"
  inputMask="nisn"
  placeholder="1234567890"
/>
```
Auto-formats as: `12345 67890`

#### Phone Mask

```tsx
<Input
  label="Phone Number"
  inputMask="phone"
  placeholder="08123456789"
/>
```
Auto-formats as: `0812 3456 789`

#### Date Mask

```tsx
<Input
  label="Birth Date"
  inputMask="date"
  placeholder="DD/MM/YYYY"
/>
```
Auto-formats as: `DD/MM/YYYY`

#### Year Mask

```tsx
<Input
  label="Academic Year"
  inputMask="year"
  placeholder="2024"
/>
```
Accepts 4-digit year only.

#### Class Mask

```tsx
<Input
  label="Class"
  inputMask="class"
  placeholder="X-1"
/>
```
Format: Letter-number (e.g., "A-1", "B-2")

#### Grade Mask

```tsx
<Input
  label="Grade"
  inputMask="grade"
  placeholder="00"
/>
```
Format: Two-digit number (00-99).

### Icons

Add icons to either side of the input.

```tsx
import { UserIcon } from './icons/UserIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';

<Input
  label="Username"
  leftIcon={<UserIcon />}
  placeholder="Enter username..."
/>

<Input
  label="Password"
  type="password"
  rightIcon={<LockClosedIcon />}
  placeholder="Enter password..."
/>
```

### Validation

Built-in validation with custom rules and error announcement.

```tsx
<Input
  label="Email"
  validationRules={[
    {
      validate: (value) => value.length >= 5,
      message: 'Email must be at least 5 characters'
    },
    {
      validate: (value) => /\S+@\S+\.\S+/.test(value),
      message: 'Invalid email address'
    }
  ]}
  validateOnChange={true}
  validateOnBlur={true}
  placeholder="Enter email..."
/>
```

**Features**:
- Validate on change and/or blur
- Automatic error announcement with `role="alert"`
- Visual loading indicator during validation
- Auto-focus on error after touch
- Error messages displayed below input
- Required field indicator with `*`

### Clear on Escape

Clear input value when Escape key is pressed.

```tsx
<Input
  label="Search"
  placeholder="Search..."
  clearOnEscape={true}
/>
```

### Full Width

Make input take full width of container.

```tsx
<Input
  label="Full Name"
  fullWidth
  placeholder="Enter your full name..."
/>
```

### Required Field

Show required indicator (*).

```tsx
<Input
  label="Email Address"
  required
  placeholder="Enter email..."
/>
```

**Display**:
- Label shows `*` indicator with `aria-label="required"` for screen readers

### Helper Text

Provide contextual guidance below the input.

```tsx
<Input
  label="Password"
  helperText="Must be at least 8 characters"
  type="password"
/>
```

### Error Text

Display validation error below the input.

```tsx
<Input
  label="Confirm Password"
  errorText="Passwords do not match"
  type="password"
/>
```

**Automatic State**: When `errorText` is provided, `state` automatically defaults to `'error'`.

### Accessibility Features

The Input component includes comprehensive accessibility support:

1. **ARIA Labels**: Generated unique IDs for label association
2. **ARIA DescribedBy**: Associates helper text and error text with input
3. **ARIA Invalid**: Automatically set when state === 'error' or validation fails
4. **Error Role**: Error text has `role="alert"` for screen readers
5. **Error Announcement**: Live region announces errors to screen readers
6. **Focus Management**: `focus:ring-2` with `focus:ring-offset-2` for clear focus indication
7. **Auto-Focus on Error**: Automatically focuses input when validation errors occur
8. **Required Indicator**: Visual `*` with `aria-label="required"` for screen readers
9. **Keyboard Navigation**: Full keyboard support with Escape key to clear
10. **Validating State**: `aria-live="polite"` and `aria-busy="true"` during validation

```tsx
<Input
  label="Email"
  helperText="We'll send verification link"
  errorText="Invalid email format"
  accessibility={{
    announceErrors: true,
    describedBy: 'email-help-text'
  }}
  inputMask="email"
  required
  aria-label="Enter your email address"
/>
```

### Dark Mode

All Input states automatically support dark mode:

- **Background**: `bg-white` → `dark:bg-neutral-700`
- **Borders**: `border-neutral-300` → `dark:border-neutral-600`
- **Text**: `text-neutral-900` → `dark:text-white`
- **Placeholder**: `placeholder-neutral-400` → `dark:placeholder-neutral-500`
- **Focus ring offset**: `focus:ring-offset-2` → `dark:focus:ring-offset-neutral-800`

### Real-World Examples

#### Student Registration Form

```tsx
function StudentRegistrationForm() {
  return (
    <div className="space-y-4">
      <Input
        label="Full Name"
        required
        fullWidth
      />
      
      <Input
        label="NISN"
        inputMask="nisn"
        required
        fullWidth
      />
      
      <Input
        label="Email"
        type="email"
        customType="email"
        validationRules={[
          {
            validate: (value) => /\S+@\S+\.\S+/.test(value),
            message: 'Invalid email address'
          }
        ]}
        required
        fullWidth
      />
      
      <Input
        label="Phone Number"
        inputMask="phone"
        helperText="Format: 0812 3456 789"
        required
        fullWidth
      />
    </div>
  );
}
```

#### Search Input with Clear

```tsx
function SearchBar() {
  const [query, setQuery] = useState('');
  
  return (
    <Input
      label="Search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search students, teachers..."
      clearOnEscape={true}
      fullWidth
    />
  );
}
```

#### Password with Validation

```tsx
function PasswordField() {
  return (
    <Input
      label="Password"
      type="password"
      helperText="Must be at least 8 characters"
      validationRules={[
        {
          validate: (value) => value.length >= 8,
          message: 'Password must be at least 8 characters'
        }
      ]}
      required
    />
  );
}
```

### Performance Considerations

The Input component is optimized using:
- `forwardRef` for ref forwarding
- Proper TypeScript typing
- Input masking with efficient formatting
- `useFieldValidation` hook for reusable validation logic
- No unnecessary re-renders
- CSS-only transitions and animations

### Migration Guide

To migrate existing input implementations:

**Before:**
```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
    Email
  </label>
  <input
    type="email"
    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none"
    placeholder="Enter email..."
  />
</div>
```

**After:**
```tsx
import Input from './ui/Input';

<Input
  label="Email"
  type="email"
  customType="email"
  placeholder="Enter email..."
/>
```

**Benefits:**
- ✅ Consistent styling across application
- ✅ Improved accessibility with proper ARIA support
- ✅ Built-in validation and error handling
- ✅ Input masks for common formats
- ✅ Helper text and error text support
- ✅ Size variants for flexible layouts
- ✅ Dark mode support
- ✅ Clear on Escape functionality
- ✅ Reduced code duplication
- ✅ Type-safe props

### Test Coverage

The Input component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/Input.test.tsx
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
- Required field indicator
- Left and right icons
- Input mask formatting (nisn, phone, date, year, class, grade)
- Validation rules (onChange, onBlur)
- Error announcement (ARIA live regions)
- Auto-focus on validation errors
- Clear on Escape functionality
- ARIA attributes (aria-label, aria-describedby, aria-invalid)
- Unique ID generation
- Custom className application
- Dark mode styling
- Focus ring visibility

### Usage in Application

Currently integrated throughout the application for all form inputs.

**Common Patterns:**

```tsx
// Basic text input
<Input label="Name" placeholder="Enter name" />

// Email input
<Input label="Email" type="email" customType="email" placeholder="Enter email" />

// Password input
<Input label="Password" type="password" />

// NISN input with mask
<Input label="NISN" inputMask="nisn" placeholder="1234567890" />

// Phone input with mask
<Input label="Phone" inputMask="phone" placeholder="08123456789" />

// Date input with mask
<Input label="Date of Birth" inputMask="date" placeholder="DD/MM/YYYY" />

// With validation
<Input
  label="Email"
  validationRules={[{
    validate: (value) => /\S+@\S+\.\S+/.test(value),
    message: 'Invalid email'
  }]}
/>

// With icons
<Input label="Search" leftIcon={<SearchIcon />} placeholder="Search..." />

// Required field
<Input label="Email" required />

// Full width
<Input label="Full Name" fullWidth />
```

### Future Enhancements

Potential improvements to consider:
- Character count with maxLength
- Password visibility toggle
- Debounced validation
- Custom input masks
- Multiple input validation
 - Input prefix/suffix
 
---

## Select Component

**Location**: `src/components/ui/Select.tsx`

A reusable select dropdown component with consistent styling, accessibility support, and state management.

### Features

- **3 Sizes**: `sm`, `md`, `lg`
- **3 States**: `default`, `error`, `success`
- **Accessibility**: Full ARIA support, keyboard navigation, focus management
- **Dark Mode**: Consistent styling across light and dark themes
- **Label Support**: Optional label with required indicator
- **Helper Text**: Contextual guidance for users
- **Error Handling**: Built-in error state with role="alert"
- **Options**: Array-based options with disabled support
- **Placeholder**: Optional placeholder option
- **Custom Icon**: Built-in chevron-down icon

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label text displayed above the select |
| `helperText` | `string` | `undefined` | Helper text displayed below the select |
| `errorText` | `string` | `undefined` | Error message displayed below the select (sets state to error) |
| `size` | `SelectSize` | `'md'` | Select size (affects padding, text size, and icon size) |
| `state` | `SelectState` | `'default'` | Visual state variant (defaults to 'error' if errorText provided) |
| `fullWidth` | `boolean` | `false` | Whether the select should take full width |
| `options` | `Array<{ value: string; label: string; disabled?: boolean }>` | **Required** | Array of option objects |
| `placeholder` | `string` | `undefined` | Placeholder text for default disabled option |
| `id` | `string` | Auto-generated | Unique identifier for the select |
| `className` | `string` | `''` | Additional CSS classes |
| All standard select attributes | - | - | Passes through all standard HTML select props |

### Sizes

#### Small (sm)

Compact size for dense interfaces.

```tsx
import Select from './ui/Select';

<Select
  label="Category"
  size="sm"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
/>
```

**Dimensions**:
- Select padding: `px-3 py-2`
- Select text: `text-sm`
- Icon: `w-4 h-4`
- Label: `text-xs`
- Helper/Error text: `text-xs`

#### Medium (md)

Standard size for most use cases (default).

```tsx
<Select
  label="Category"
  size="md"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
/>
```

**Dimensions**:
- Select padding: `px-4 py-3`
- Select text: `text-sm sm:text-base`
- Icon: `w-5 h-5`
- Label: `text-sm`
- Helper/Error text: `text-xs`

#### Large (lg)

Larger size for better accessibility and touch targets.

```tsx
<Select
  label="Category"
  size="lg"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
/>
```

**Dimensions**:
- Select padding: `px-5 py-4`
- Select text: `text-base sm:text-lg`
- Icon: `w-5 h-5`
- Label: `text-base`
- Helper/Error text: `text-sm`

### States

#### Default State

Standard styling for normal select.

```tsx
<Select
  label="Category"
  placeholder="Select a category..."
  options={categories}
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
<Select
  label="Category"
  errorText="Please select a category"
  placeholder="Select a category..."
  options={categories}
/>
```

**Styling**:
- Border: `border-red-300` / `dark:border-red-700`
- Focus: `focus:ring-red-500/50 focus:border-red-500`
- Error text: `text-red-600 dark:text-red-400` with `role="alert"`
- `aria-invalid`: `true`

#### Success State

Green styling for successful validation.

```tsx
<Select
  label="Category"
  state="success"
  helperText="Category selected"
  placeholder="Select a category..."
  options={categories}
/>
```

**Styling**:
- Border: `border-green-300` / `dark:border-green-700`
- Focus: `focus:ring-green-500/50 focus:border-green-500`

### Options

Array-based options with optional disabled state.

```tsx
const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'teacher', label: 'Guru' },
  { value: 'student', label: 'Siswa' },
  { value: 'parent', label: 'Wali Murid' },
  { value: 'staff', label: 'Staff', disabled: true }
];

<Select
  label="Role"
  options={roleOptions}
/>
```

### Placeholder

Optional placeholder option (disabled).

```tsx
<Select
  label="City"
  placeholder="Select city..."
  options={cityOptions}
/>
```

### Full Width

Make select take full width of container.

```tsx
<Select
  label="Category"
  fullWidth
  options={categories}
/>
```

### Required Field

Show required indicator (*).

```tsx
<Select
  label="Role"
  required
  options={roleOptions}
/>
```

**Display**:
- Label shows `*` indicator with `aria-label="required"` for screen readers

### Helper Text

Provide contextual guidance below the select.

```tsx
<Select
  label="Grade"
  helperText="Select student's current grade level"
  placeholder="Select grade..."
  options={gradeOptions}
/>
```

### Error Text

Display validation error below the select.

```tsx
<Select
  label="Role"
  errorText="Role is required"
  options={roleOptions}
/>
```

**Automatic State**: When `errorText` is provided, `state` automatically defaults to `'error'`.

### Disabled Options

Disable specific options.

```tsx
const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2 (Unavailable)', disabled: true },
  { value: '3', label: 'Option 3' }
];

<Select
  label="Selection"
  options={options}
/>
```

### Accessibility Features

The Select component includes comprehensive accessibility support:

1. **ARIA Labels**: Generated unique IDs for label association
2. **ARIA DescribedBy**: Associates helper text and error text with select
3. **ARIA Invalid**: Automatically set when `state === 'error'`
4. **Error Role**: Error text has `role="alert"` for screen readers
5. **Focus Management**: `focus:ring-2` with `focus:ring-offset-2` for clear focus indication
6. **Required Indicator**: Visual `*` with `aria-label="required"` for screen readers
7. **Icon Hiding**: Chevron icon has `aria-hidden="true"` for screen readers
8. **Keyboard Navigation**: Full keyboard support with visible focus states
9. **Semantic HTML**: Uses native `<select>` element for maximum accessibility

```tsx
<Select
  label="Role"
  helperText="Select user role for access control"
  errorText="Role is required"
  placeholder="Select role..."
  options={roleOptions}
  required
  aria-label="Select user role"
/>
```

### Dark Mode

All Select states automatically support dark mode:

- **Background**: `bg-white` → `dark:bg-neutral-700`
- **Borders**: `border-neutral-300` → `dark:border-neutral-600`
- **Text**: `text-neutral-900` → `dark:text-white`
- **Icon**: `text-neutral-400` → `dark:text-neutral-500`

### Real-World Examples

#### User Role Selection

```tsx
function UserRoleForm() {
  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'teacher', label: 'Guru' },
    { value: 'student', label: 'Siswa' },
    { value: 'parent', label: 'Wali Murid' }
  ];
  
  return (
    <Select
      label="Role"
      placeholder="Select role..."
      options={roles}
      required
    />
  );
}
```

#### Class Selection

```tsx
function ClassSelector() {
  const classes = [
    { value: '10-1', label: 'Kelas X-1' },
    { value: '10-2', label: 'Kelas X-2', disabled: true },
    { value: '10-3', label: 'Kelas X-3' }
  ];
  
  return (
    <Select
      label="Kelas"
      placeholder="Pilih kelas..."
      options={classes}
      helperText="Pilih kelas untuk melihat jadwal"
      fullWidth
    />
  );
}
```

#### With Validation

```tsx
function FormSelect() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
    
    if (!e.target.value) {
      setError('Selection is required');
    } else {
      setError('');
    }
  };
  
  return (
    <Select
      label="Category"
      errorText={error || undefined}
      placeholder="Select category..."
      options={categoryOptions}
      onChange={handleChange}
      required
    />
  );
}
```

### Performance Considerations

The Select component is optimized using:
- `forwardRef` for ref forwarding
- Proper TypeScript typing
- No unnecessary re-renders
- CSS-only transitions and animations
- Efficient class string concatenation with whitespace normalization
- Native HTML select element for best performance

### Migration Guide

To migrate existing select implementations:

**Before:**
```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
    Role
  </label>
  <div className="relative">
    <select className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none appearance-none">
      <option value="">Select role...</option>
      <option value="admin">Administrator</option>
      <option value="teacher">Guru</option>
    </select>
  </div>
</div>
```

**After:**
```tsx
import Select from './ui/Select';

<Select
  label="Role"
  placeholder="Select role..."
  options={[
    { value: 'admin', label: 'Administrator' },
    { value: 'teacher', label: 'Guru' }
  ]}
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
- ✅ Required field indicator
- ✅ Reduced code duplication
- ✅ Type-safe props

### Test Coverage

The Select component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/Select.test.tsx
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
- Options array rendering
- Placeholder option
- Disabled options
- Required field indicator
- ARIA attributes (aria-label, aria-describedby, aria-invalid)
- Unique ID generation
- Custom className application
- Custom props passthrough
- Dark mode styling
- Focus ring visibility
- Keyboard navigation
- Icon rendering with aria-hidden

### Usage in Application

Currently integrated throughout the application for all form select inputs.

**Common Patterns:**

```tsx
// Basic select
<Select label="Category" placeholder="Select..." options={options} />

// With placeholder
<Select label="City" placeholder="Select city..." options={cities} />

// Required field
<Select label="Role" required options={roles} />

// With validation
<Select
  label="Grade"
  errorText={error || undefined}
  placeholder="Select grade..."
  options={grades}
/>

// Full width
<Select label="Class" fullWidth options={classes} />

// Disabled options
<Select
  label="Section"
  options={[
    { value: 'A', label: 'Section A' },
    { value: 'B', label: 'Section B', disabled: true }
  ]}
/>
```

### Future Enhancements

Potential improvements to consider:
- Multi-select support
- Search/filter within options
- Option groups (optgroup)
- Custom option rendering
- Async options loading
- Option descriptions

---

## FormGrid Component

**Location**: `src/components/ui/FormGrid.tsx`

A responsive grid layout component for form fields with configurable columns and spacing.

### Features

- **4 Column Options**: 1, 2, 3, or 4 columns
- **3 Gap Options**: `sm`, `md`, `lg` for flexible spacing
- **Responsive**: 1 column on mobile, configurable on desktop
- **Accessibility**: Semantic grid layout
- **Flexible**: Works with any form components

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **Required** | Form field components to display in grid |
| `cols` | `1 \| 2 \| 3 \| 4` | `2` | Number of columns on desktop |
| `gap` | `'sm' \| 'md' \| 'lg'` | `'md'` | Spacing between grid items |
| `className` | `string` | `''` | Additional CSS classes |
| All standard div attributes | - | - | Passes through all standard HTML div props |

### Column Options

#### 1 Column

Full-width single column layout (stacked vertically).

```tsx
import FormGrid from './ui/FormGrid';

<FormGrid cols={1}>
  <Input label="Full Name" />
  <Input label="Email" />
  <Input label="Phone" />
</FormGrid>
```

**Layout**: `grid-cols-1 md:grid-cols-1`

#### 2 Columns

Two-column grid layout (default).

```tsx
<FormGrid cols={2}>
  <Input label="First Name" />
  <Input label="Last Name" />
  <Input label="Email" />
  <Input label="Phone" />
</FormGrid>
```

**Layout**: `grid-cols-1 md:grid-cols-2`

#### 3 Columns

Three-column grid layout.

```tsx
<FormGrid cols={3}>
  <Input label="Day" />
  <Input label="Month" />
  <Input label="Year" />
</FormGrid>
```

**Layout**: `grid-cols-1 md:grid-cols-3`

#### 4 Columns

Four-column grid layout.

```tsx
<FormGrid cols={4}>
  <Input label="Field 1" />
  <Input label="Field 2" />
  <Input label="Field 3" />
  <Input label="Field 4" />
</FormGrid>
```

**Layout**: `grid-cols-1 md:grid-cols-4`

### Gap Options

#### Small Gap (sm)

Compact spacing between grid items.

```tsx
<FormGrid gap="sm">
  <Input label="Field 1" />
  <Input label="Field 2" />
</FormGrid>
```

**Spacing**: `gap-2` (0.5rem)

#### Medium Gap (md)

Standard spacing (default).

```tsx
<FormGrid gap="md">
  <Input label="Field 1" />
  <Input label="Field 2" />
</FormGrid>
```

**Spacing**: `gap-4` (1rem)

#### Large Gap (lg)

Generous spacing.

```tsx
<FormGrid gap="lg">
  <Input label="Field 1" />
  <Input label="Field 2" />
</FormGrid>
```

**Spacing**: `gap-6` (1.5rem)

### Real-World Examples

#### Contact Form

```tsx
function ContactForm() {
  return (
    <FormGrid cols={2}>
      <Input label="First Name" />
      <Input label="Last Name" />
      <Input label="Email" />
      <Input label="Phone" />
      <Textarea label="Message" />
    </FormGrid>
  );
}
```

#### Registration Form

```tsx
function RegistrationForm() {
  return (
    <FormGrid cols={2} gap="lg">
      <Input label="Full Name" />
      <Input label="NISN" />
      <Input label="Email" />
      <Select label="Role" options={roleOptions} />
      <Input label="Phone" />
      <Input label="Class" />
    </FormGrid>
  );
}
```

#### Date Selection

```tsx
function DateForm() {
  return (
    <FormGrid cols={3}>
      <Input label="Day" placeholder="DD" />
      <Input label="Month" placeholder="MM" />
      <Input label="Year" placeholder="YYYY" />
    </FormGrid>
  );
}
```

#### Mixed Form

```tsx
function StudentInfoForm() {
  return (
    <div className="space-y-6">
      <FormGrid cols={2} gap="md">
        <Input label="Full Name" />
        <Input label="NISN" />
      </FormGrid>
      
      <FormGrid cols={4} gap="sm">
        <Input label="Province" />
        <Input label="City" />
        <Input label="District" />
        <Input label="Village" />
      </FormGrid>
      
      <FormGrid cols={1}>
        <Textarea label="Address" />
      </FormGrid>
    </div>
  );
}
```

### Accessibility

The FormGrid component includes accessibility support:

1. **Semantic Layout**: Uses CSS Grid for proper screen reader support
2. **Responsive**: Single column on mobile for better accessibility
3. **Logical Grouping**: Maintains logical tab order
4. **Keyboard Navigation**: Preserves natural keyboard flow

### Styling Customization

Add custom classes while preserving default grid styling:

```tsx
<FormGrid
  cols={2}
  gap="lg"
  className="p-6 bg-white dark:bg-neutral-800 rounded-xl"
>
  <Input label="Field 1" />
  <Input label="Field 2" />
</FormGrid>
```

### Performance Considerations

The FormGrid component is optimized using:
- CSS Grid for efficient layout
- Responsive breakpoints (mobile: 1 column, desktop: configurable)
- No unnecessary re-renders
- Proper TypeScript typing
- Minimal component overhead

### Migration Guide

To migrate existing form layouts:

**Before:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Input label="First Name" />
  <Input label="Last Name" />
</div>
```

**After:**
```tsx
import FormGrid from './ui/FormGrid';

<FormGrid cols={2}>
  <Input label="First Name" />
  <Input label="Last Name" />
</FormGrid>
```

**Benefits:**
- ✅ Consistent grid spacing across application
- ✅ Easier to read and maintain
- ✅ Type-safe props
- ✅ Responsive by default
- ✅ Reduced code duplication
- ✅ Standardized gap options

### Usage in Application

Currently integrated for multi-column form layouts throughout the application.

**Common Patterns:**

```tsx
// Two-column form (most common)
<FormGrid cols={2}>
  <Input label="Field 1" />
  <Input label="Field 2" />
</FormGrid>

// Three-column form
<FormGrid cols={3}>
  <Input label="Field 1" />
  <Input label="Field 2" />
  <Input label="Field 3" />
</FormGrid>

// Compact spacing
<FormGrid cols={2} gap="sm">
  <Input label="Field 1" />
  <Input label="Field 2" />
</FormGrid>

// Generous spacing
<FormGrid cols={2} gap="lg">
  <Input label="Field 1" />
  <Input label="Field 2" />
</FormGrid>

// With custom styling
<FormGrid className="p-6 bg-white rounded-xl">
  <Input label="Field 1" />
  <Input label="Field 2" />
</FormGrid>
```

### Future Enhancements

Potential improvements to consider:
- Breakpoint options (sm, md, lg, xl)
- Auto-fit/ auto-fill column options
- Custom responsive column configurations
- Order property support
- Alignment options (start, center, end)

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

A specialized input component designed for search functionality with built-in icon, validation, and keyboard shortcuts.

### Features

- **3 Sizes**: `sm`, `md`, `lg`
- **3 States**: `default`, `error`, `success`
- **Built-in Search Icon**: Magnifying glass icon with customizable position
- **Icon Support**: Custom icon option for brand-specific searches
- **Field Validation**: Integrated with `useFieldValidation` hook
- **Keyboard Shortcut**: Escape key clears input value
- **Accessibility**: Full ARIA support, keyboard navigation, focus management
- **Dark Mode**: Consistent styling across light and dark themes
- **Validation Indicators**: Loading spinner during async validation

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
| `placeholder` | `string` | `undefined` | Placeholder text displayed in the input |
| `icon` | `React.ReactNode` | `undefined` | Custom icon to replace default search icon |
| `iconPosition` | `'left'` \| `'right'` | `'left'` | Position of the icon relative to text |
| `validationRules` | `Array<{validate: (value: string) => boolean; message: string}>` | `[]` | Custom validation rules |
| `validateOnChange` | `boolean` | `true` | Whether to validate on value change |
| `validateOnBlur` | `boolean` | `true` | Whether to validate on blur |
| `accessibility` | `{announceErrors?: boolean; describedBy?: string}` | `{announceErrors: true}` | Accessibility configuration |
| `id` | `string` | Auto-generated | Unique identifier for the input |
| `className` | `string` | `''` | Additional CSS classes |
| All standard input attributes | - | - | Passes through all standard HTML input props |

### Sizes

#### Small (sm)

Compact size for dense interfaces.

```tsx
import SearchInput from './ui/SearchInput';

<SearchInput
  label="Cari Siswa"
  size="sm"
  placeholder="Masukkan nama atau NIS"
  fullWidth
/>
```

**Dimensions**:
- Input padding: `px-3 py-2`
- Input text: `text-sm`
- Icon size: `w-4 h-4`
- Label: `text-xs`
- Helper text: `text-xs`

#### Medium (md)

Standard size for most use cases (default).

```tsx
<SearchInput
  label="Cari Guru"
  size="md"
  placeholder="Masukkan nama guru"
  fullWidth
/>
```

**Dimensions**:
- Input padding: `px-4 py-3`
- Input text: `text-sm sm:text-base`
- Icon size: `w-5 h-5`
- Label: `text-sm`
- Helper text: `text-xs`

#### Large (lg)

Larger size for better accessibility and touch targets.

```tsx
<SearchInput
  label="Cari Materi"
  size="lg"
  placeholder="Cari materi pelajaran"
  fullWidth
/>
```

**Dimensions**:
- Input padding: `px-5 py-4`
- Input text: `text-base sm:text-lg`
- Icon size: `w-6 h-6`
- Label: `text-base`
- Helper text: `text-sm`

### States

#### Default State

```tsx
<SearchInput
  label="Cari Buku"
  placeholder="Masukkan judul buku"
  state="default"
/>
```

**Appearance**:
- Border: Neutral gray with hover effect
- Background: White (light mode) / Neutral-700 (dark mode)
- Focus: Primary ring with primary border

#### Error State

```tsx
<SearchInput
  label="Cari Buku"
  placeholder="Masukkan judul buku"
  errorText="Minimal 3 karakter"
  state="error"
/>
```

**Appearance**:
- Border: Red with hover effect
- Background: Red-50 (light mode) / Red-900/20 (dark mode)
- Placeholder: Red-400 (dark mode: Red-500)
- Focus: Red ring with red border

#### Success State

```tsx
<SearchInput
  label="Cari Buku"
  placeholder="Masukkan judul buku"
  helperText="Ketik untuk mencari"
  state="success"
/>
```

**Appearance**:
- Border: Green with hover effect
- Background: Green-50 (light mode) / Green-900/20 (dark mode)
- Placeholder: Green-400 (dark mode: Green-500)
- Focus: Green ring with green border

### Icon Position

#### Left Icon (Default)

```tsx
<SearchInput
  label="Cari"
  placeholder="Masukkan kata kunci"
  iconPosition="left"
/>
```

- Icon appears on the left side of input
- Text starts after icon (padding adjusted)

#### Right Icon

```tsx
<SearchInput
  label="Cari"
  placeholder="Masukkan kata kunci"
  iconPosition="right"
/>
```

- Icon appears on the right side of input
- Text starts at normal position

### Custom Icon

```tsx
import { FunnelIcon } from '@heroicons/react/24/outline';

<SearchInput
  label="Filter"
  placeholder="Masukkan kriteria filter"
  icon={<FunnelIcon aria-hidden />}
  showIcon
/>
```

### Validation

```tsx
<SearchInput
  label="Cari Siswa"
  placeholder="Masukkan NIS atau nama"
  validationRules={[
    { validate: (value) => value.length >= 3, message: 'Minimal 3 karakter' },
    { validate: (value) => /^[a-zA-Z0-9\s]+$/.test(value), message: 'Hanya huruf dan angka' }
  ]}
  validateOnChange
  validateOnBlur
  errorText={error}
/>
```

### Keyboard Shortcuts

The SearchInput component includes built-in keyboard support:

- **Escape Key**: Clears the input value
- **Tab**: Normal tab navigation
- **Shift+Tab**: Reverse tab navigation

### Accessibility

Full WCAG 2.1 AA compliance:

- **Semantic HTML**: Uses `<input type="search">` with `role="searchbox"`
- **Label Association**: `htmlFor` connects label to input via `id`
- **Error Announcement**: Uses `role="alert"` and `aria-live="polite"` for errors
- **Validation Feedback**: `aria-invalid` and `aria-errormessage` attributes
- **Loading State**: `aria-live="polite"` and `aria-busy` during validation
- **Screen Reader**: Hidden decorative elements with `aria-hidden`
- **Focus Management**: Visible focus ring, proper tab order
- **Required Indicator**: `aria-required` for required fields

### Usage Examples

#### Basic Search

```tsx
const [searchTerm, setSearchTerm] = useState('');

<SearchInput
  label="Cari Siswa"
  placeholder="Masukkan nama atau NIS"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  fullWidth
/>
```

#### Search with Validation

```tsx
const [searchValue, setSearchValue] = useState('');
const [error, setError] = useState('');

const handleSearch = (value: string) => {
  setSearchValue(value);
  if (value.length > 0 && value.length < 3) {
    setError('Minimal 3 karakter');
  } else {
    setError('');
  }
};

<SearchInput
  label="Cari Guru"
  placeholder="Nama guru atau mapel"
  value={searchValue}
  onChange={handleSearch}
  errorText={error}
  fullWidth
/>
```

#### Search with Custom Icon and Position

```tsx
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';

<SearchInput
  label="Cari Dokumen"
  placeholder="Nama dokumen"
  icon={<DocumentMagnifyingGlassIcon aria-hidden />}
  iconPosition="left"
  fullWidth
/>
```

### Testing

Comprehensive test coverage with 30+ test cases:

- Props rendering and validation
- Size variants (sm, md, lg)
- State variants (default, error, success)
- Icon position and custom icon
- Label and helper text
- Error text display
- Validation rules and triggers
- Keyboard shortcuts (Escape clear)
- Accessibility attributes (ARIA labels, roles)
- Focus management
- Form integration

See `src/components/ui/__tests__/SearchInput.test.tsx` for complete test suite.

### Common Patterns

**In DataTable**:
```tsx
<SearchInput
  value={searchValue}
  onChange={(e) => onSearch(e.target.value)}
  placeholder="Search data..."
  size="sm"
  showIcon
/>
```

**In Modal**:
```tsx
<SearchInput
  label="Cari Item"
  placeholder="Ketik untuk mencari"
  fullWidth
  autoFocus
/>
```

**With Async Validation**:
```tsx
<SearchInput
  label="Cari Pengguna"
  placeholder="Email atau username"
  validationRules={[
    { validate: async (value) => await checkUserExists(value), message: 'User tidak ditemukan' }
  ]}
  validateOnChange={false}
  validateOnBlur
/>
```

---

## GradientButton Component

**Location**: `src/components/ui/GradientButton.tsx`

A visually striking button component with gradient backgrounds, designed for primary actions and call-to-action elements.

### Features

- **2 Variants**: `primary`, `secondary`
- **3 Sizes**: `sm`, `md`, `lg`
- **Gradient Background**: Uses centralized gradient system (`GRADIENT_CLASSES`)
- **Dark Mode Support**: Automatic color adaptation
- **Hover Effects**: Scale transform, shadow enhancement
- **Active States**: Press animation with scale reduction
- **Link or Button**: Can render as `<a>` or `<button>` element
- **Full Width Option**: For full-width button layouts
- **Focus Management**: Visible focus ring with offset

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `GradientButtonVariant` | `'primary'` | Button variant style |
| `size` | `GradientButtonSize` | `'md'` | Button size |
| `fullWidth` | `boolean` | `false` | Whether button takes full width |
| `href` | `string` | `undefined` | If provided, renders as `<a>` element |
| `children` | `React.ReactNode` | **Required** | Button content |
| `className` | `string` | `''` | Additional CSS classes |
| Standard HTML attributes | - | - | Passes through `<button>` or `<a>` props |

### Variants

#### Primary Variant

Gradient background with primary colors.

```tsx
<GradientButton variant="primary" size="md">
  Login
</GradientButton>
```

**Styling**:
- Background: `GRADIENT_CLASSES.CHAT_HEADER` (primary gradient)
- Text: White
- Hover: Darker gradient tones
- Focus: Primary ring (50% opacity)

#### Secondary Variant

White/neutral background with border.

```tsx
<GradientButton variant="secondary" size="md">
  Batal
</GradientButton>
```

**Styling**:
- Background: White (light mode) / Neutral-800 (dark mode)
- Border: Neutral-200 (light mode) / Neutral-600 (dark mode)
- Text: Neutral-700 (light mode) / Neutral-200 (dark mode)
- Hover: Border changes to primary, slight background tint

### Sizes

#### Small (sm)

Compact button for tight spaces.

```tsx
<GradientButton size="sm">Edit</GradientButton>
```

**Dimensions**:
- Padding: `px-6 py-2.5`
- Text: `text-sm`

#### Medium (md)

Standard button (default).

```tsx
<GradientButton size="md">Submit</GradientButton>
```

**Dimensions**:
- Padding: `px-8 sm:px-10 lg:px-12 py-4`
- Text: `text-sm sm:text-base`

#### Large (lg)

Prominent button for key actions.

```tsx
<GradientButton size="lg">Register Now</GradientButton>
```

**Dimensions**:
- Padding: `px-10 sm:px-12 lg:px-14 py-5`
- Text: `text-base sm:text-lg`

### As Link

Render as anchor element for navigation:

```tsx
<GradientButton
  href="/register"
  target="_blank"
  rel="noopener noreferrer"
>
  Register
</GradientButton>
```

### Full Width

Button stretches to fill container:

```tsx
<GradientButton fullWidth size="md">
  Sign Up
</GradientButton>
```

### With Icon

Include icons inside button:

```tsx
<GradientButton variant="primary" size="md">
  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
  Tambah Baru
</GradientButton>
```

### Accessibility

WCAG 2.1 AA compliant:

- **Keyboard Navigation**: Tab to focus, Enter/Space to activate
- **Focus Ring**: Visible ring with 2px border and offset
- **ARIA Labels**: Can accept `aria-label` for screen readers
- **Color Contrast**: WCAG AA compliant in both light and dark modes
- **Role**: Automatic role based on element type (button/link)

### Animation States

- **Hover**: `hover:shadow-xl` and `hover:-translate-y-0.5` and `hover:scale-[1.01]`
- **Active**: `active:scale-95` for press feedback
- **Focus**: `focus-visible:ring-2 focus-visible:ring-offset-2`

### Usage Examples

#### Primary Action

```tsx
<GradientButton variant="primary" size="md" onClick={handleSubmit}>
  Simpan Perubahan
</GradientButton>
```

#### Secondary Action

```tsx
<GradientButton variant="secondary" size="md" onClick={handleCancel}>
  Batal
</GradientButton>
```

#### Full Width CTA

```tsx
<div className="w-full max-w-md">
  <GradientButton fullWidth size="lg" variant="primary">
    Mulai Sekarang
  </GradientButton>
</div>
```

#### Link to External Site

```tsx
<GradientButton
  href="https://example.com"
  target="_blank"
  rel="noopener noreferrer"
  variant="primary"
  size="md"
>
  Kunjungi Website
</GradientButton>
```

### Integration

The GradientButton uses the centralized gradient system:

```typescript
// Uses GRADIENT_CLASSES from src/config/gradients.ts
variantClasses = {
  primary: GRADIENT_CLASSES.CHAT_HEADER,
  // ... other variants
}
```

### Best Practices

- Use `primary` variant for main actions (Submit, Save, Register)
- Use `secondary` variant for secondary actions (Cancel, Back)
- Use `fullWidth` for mobile layouts and centered content
- Include meaningful icon + text for better UX
- Ensure proper spacing with adjacent elements

---

## SmallActionButton Component

**Location**: `src/components/ui/SmallActionButton.tsx`

A compact button component designed for inline actions, table rows, and toolbar controls with seven color variants.

### Features

- **7 Variants**: `primary`, `secondary`, `danger`, `success`, `info`, `warning`, `neutral`
- **3 Sizes**: Not applicable (fixed `sm` size) - **Actually has fixed text-sm**
- **Icon Support**: Optional icon with left/right positioning
- **Loading State**: Built-in spinner for async operations
- **Full Width Option**: For flex layouts
- **Accessibility**: Full ARIA support and keyboard navigation
- **Dark Mode**: Consistent styling across themes

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `SmallActionButtonVariant` | `'info'` | Button color variant |
| `isLoading` | `boolean` | `false` | Loading state with spinner |
| `fullWidth` | `boolean` | `false` | Whether button takes full width (flex) |
| `icon` | `React.ReactNode` | `undefined` | Icon to display |
| `iconPosition` | `'left'` \| `'right'` | `'left'` | Position of icon relative to text |
| `children` | `React.ReactNode` | **Required** | Button text content |
| `className` | `string` | `''` | Additional CSS classes |
| Standard HTML button attributes | - | - | Passes through all standard HTML button props |

### Color Variants

#### Primary

```tsx
<SmallActionButton variant="primary">Edit</SmallActionButton>
```

- Background: Primary-600
- Text: White
- Hover: Primary-700

#### Secondary

```tsx
<SmallActionButton variant="secondary">Cancel</SmallActionButton>
```

- Background: White (light mode) / Neutral-800 (dark mode)
- Text: Neutral-700 (light mode) / Neutral-300 (dark mode)
- Border: Neutral-200 (light mode) / Neutral-600 (dark mode)

#### Danger

```tsx
<SmallActionButton variant="danger">Delete</SmallActionButton>
```

- Background: Red-100 (light mode) / Red-900/30 (dark mode)
- Text: Red-700 (light mode) / Red-300 (dark mode)
- Hover: Red-200 (light mode) / Red-800/50 (dark mode)

#### Success

```tsx
<SmallActionButton variant="success">Approve</SmallActionButton>
```

- Background: Green-100 (light mode) / Green-900/30 (dark mode)
- Text: Green-700 (light mode) / Green-300 (dark mode)
- Hover: Green-200 (light mode) / Green-800/50 (dark mode)

#### Info

```tsx
<SmallActionButton variant="info">Details</SmallActionButton>
```

- Background: Blue-50 (light mode) / Blue-900/20 (dark mode)
- Text: Blue-600 (light mode) / Blue-400 (dark mode)
- Hover: Blue-100 (light mode) / Blue-900/30 (dark mode)

#### Warning

```tsx
<SmallActionButton variant="warning">Warning</SmallActionButton>
```

- Background: Orange-100 (light mode) / Orange-900/30 (dark mode)
- Text: Orange-700 (light mode) / Orange-300 (dark mode)
- Hover: Orange-200 (light mode) / Orange-800/50 (dark mode)

#### Neutral

```tsx
<SmallActionButton variant="neutral">Action</SmallActionButton>
```

- Background: Neutral-200 (light mode) / Neutral-700 (dark mode)
- Text: Neutral-700 (light mode) / Neutral-300 (dark mode)
- Hover: Neutral-300 (light mode) / Neutral-600 (dark mode)

### Loading State

```tsx
const [isDeleting, setIsDeleting] = useState(false);

<SmallActionButton
  variant="danger"
  isLoading={isDeleting}
  onClick={async () => {
    setIsDeleting(true);
    await handleDelete();
    setIsDeleting(false);
  }}
>
  Delete
</SmallActionButton>
```

Shows spinner and disables button during operation.

### Icon Support

#### Icon Left (Default)

```tsx
<SmallActionButton
  variant="primary"
  icon={<PencilIcon className="w-4 h-4" />}
  iconPosition="left"
>
  Edit
</SmallActionButton>
```

#### Icon Right

```tsx
<SmallActionButton
  variant="primary"
  icon={<ArrowRightIcon className="w-4 h-4" />}
  iconPosition="right"
>
  Continue
</SmallActionButton>
```

### Full Width

For flex layouts with multiple buttons:

```tsx
<div className="flex gap-2">
  <SmallActionButton variant="secondary" fullWidth>
    Cancel
  </SmallActionButton>
  <SmallActionButton variant="primary" fullWidth>
    Save
  </SmallActionButton>
</div>
```

### Accessibility

- **Keyboard**: Tab to focus, Enter/Space to activate
- **Loading State**: `aria-busy="true"` during loading
- **Focus Ring**: 2px focus ring with offset
- **Disabled**: `disabled` attribute with visual feedback
- **Screen Reader**: Hidden loading spinner with `role="status"`

### Usage Examples

#### Table Row Actions

```tsx
<td>
  <div className="flex gap-2">
    <SmallActionButton variant="info" onClick={() => onView(record)}>
      View
    </SmallActionButton>
    <SmallActionButton variant="primary" onClick={() => onEdit(record)}>
      Edit
    </SmallActionButton>
    <SmallActionButton variant="danger" onClick={() => onDelete(record)}>
      Delete
    </SmallActionButton>
  </div>
</td>
```

#### Toolbar Actions

```tsx
<div className="flex items-center gap-3">
  <SmallActionButton variant="primary" onClick={handleAdd}>
    Add New
  </SmallActionButton>
  <SmallActionButton variant="neutral" onClick={handleRefresh}>
    Refresh
  </SmallActionButton>
  <SmallActionButton variant="warning" onClick={handleExport}>
    Export
  </SmallActionButton>
</div>
```

#### Status Actions

```tsx
<SmallActionButton
  variant={user.isActive ? 'danger' : 'success'}
  onClick={() => toggleStatus(user.id)}
>
  {user.isActive ? 'Deactivate' : 'Activate'}
</SmallActionButton>
```

### Loading Pattern

```tsx
<SmallActionButton
  variant="primary"
  isLoading={isSubmitting}
  disabled={isSubmitting}
  onClick={handleSubmit}
>
  {isSubmitting ? 'Processing...' : 'Submit'}
</SmallActionButton>
```

### Testing

Comprehensive test coverage:

- Prop validation and rendering
- All color variants
- Icon positioning
- Loading state transitions
- Full width behavior
- Disabled states
- Accessibility attributes
- Keyboard interaction
- Click event handling

### Best Practices

- Use color variants to indicate action type (danger = delete, success = approve)
- Add icons for better visual recognition
- Use `isLoading` for async operations
- Pair with other buttons using `fullWidth` for consistent layout
- Ensure sufficient color contrast for text variants

---


## BaseModal Component

**Location**: `src/components/ui/BaseModal.tsx`

A foundational modal component with comprehensive accessibility features, focus management, and customizable footer actions.

### Features

- **5 Sizes**: `sm`, `md`, `lg`, `xl`, `full`
- **3 Variants**: `default`, `danger`, `success`
- **Focus Management**: Auto-focus on confirm button or first focusable element
- **Escape Key Handler**: Closes modal when enabled
- **Backdrop Click**: Close on overlay click when enabled
- **Body Scroll Lock**: Prevents background scrolling when modal is open
- **Footer Actions**: Built-in confirm/cancel buttons with loading states
- **Custom Footer**: Override default footer with custom content
- **Accessibility**: Full ARIA compliance with dialog role
- **Dark Mode**: Consistent styling across themes

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | **Required** | Whether modal is visible |
| `onClose` | `() => void` | **Required** | Callback when modal closes |
| `children` | `React.ReactNode` | **Required** | Modal body content |
| `title` | `string` | `undefined` | Modal title displayed in header |
| `description` | `string` | `undefined` | Screen reader description (hidden) |
| `size` | `'sm'` \| `'md'` \| `'lg'` \| `'xl'` \| `'full'` | `'md'` | Modal size |
| `closeOnBackdropClick` | `boolean` | `true` | Allow closing by clicking backdrop |
| `closeOnEscape` | `boolean` | `true` | Allow closing with Escape key |
| `showCloseButton` | `boolean` | `true` | Show X button in header |
| `showHeader` | `boolean` | `true` | Show header section |
| `showFooter` | `boolean` | `false` | Show footer with actions |
| `footer` | `React.ReactNode` | `undefined` | Custom footer content |
| `confirmText` | `string` | `'Confirm'` | Text for confirm button |
| `cancelText` | `string` | `'Cancel'` | Text for cancel button |
| `onConfirm` | `() => void \| Promise<void>` | `undefined` | Callback for confirm action |
| `loading` | `boolean` | `false` | Loading state for confirm button |
| `disabled` | `boolean` | `false` | Disable confirm button |
| `variant` | `'default'` \| `'danger'` \| `'success'` | `'default'` | Color variant for confirm button |
| `className` | `string` | `''` | Additional CSS classes |
| `overlayClassName` | `string` | `''` | Additional CSS classes for overlay |

### Sizes

#### Small (sm)

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  size="sm"
  title="Konfirmasi"
>
  <p>Konfirmasi aksi ini?</p>
</BaseModal>
```

- Max width: `max-w-sm`

#### Medium (md)

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  size="md"
  title="Edit User"
>
  {/* Form content */}
</BaseModal>
```

- Max width: `max-w-md`

#### Large (lg)

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  size="lg"
  title="Form Pendaftaran"
>
  {/* Long form content */}
</BaseModal>
```

- Max width: `max-w-lg`

#### Extra Large (xl)

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  size="xl"
  title="Detail Dokumen"
>
  {/* Detailed content */}
</BaseModal>
```

- Max width: `max-w-xl`

#### Full Screen

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  size="full"
  title="Pengaturan"
>
  {/* Full-screen settings */}
</BaseModal>
```

- Width: `w-full`, Height: `h-full`, No rounded corners

### Variants

#### Default Variant

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  variant="default"
  title="Simpan Perubahan"
  showFooter
  onConfirm={handleSave}
>
  <p>Simpan perubahan data?</p>
</BaseModal>
```

- Confirm button: Primary color (blue)
- Normal action flow

#### Danger Variant

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  variant="danger"
  title="Hapus Data"
  showFooter
  onConfirm={handleDelete}
>
  <p>Tindakan ini tidak dapat dibatalkan.</p>
</BaseModal>
```

- Confirm button: Red color
- For destructive actions

#### Success Variant

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  variant="success"
  title="Konfirmasi"
  showFooter
  onConfirm={handleApprove}
>
  <p>Setujui data ini?</p>
</BaseModal>
```

- Confirm button: Green color
- For positive confirmations

### Footer Actions

#### Default Footer

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Konfirmasi"
  showFooter
  confirmText="Ya, Lanjutkan"
  cancelText="Batal"
  onConfirm={handleConfirm}
  loading={isSaving}
>
  <p>Lanjutkan dengan aksi ini?</p>
</BaseModal>
```

Shows cancel (secondary) and confirm (primary) buttons.

#### Custom Footer

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Pilih Aksi"
  showFooter
  footer={
    <div className="flex gap-3">
      <Button variant="secondary" onClick={onClose}>
        Tutup
      </Button>
      <Button variant="primary" onClick={handleSave}>
        Simpan
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Hapus
      </Button>
    </div>
  }
>
  <p>Pilih aksi yang ingin dilakukan.</p>
</BaseModal>
```

Override footer with custom content.

### Loading State

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Upload File"
  showFooter
  onConfirm={handleUpload}
  loading={isUploading}
  confirmText="Upload"
>
  <p>Upload file ke server?</p>
</BaseModal>
```

Shows loading spinner in confirm button during operation.

### No Header

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  showHeader={false}
>
  <div className="p-6">
    {/* Content without header */}
  </div>
</BaseModal>
```

### Description (Screen Reader)

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Form Input"
  description="Formulir untuk memasukkan data siswa baru"
>
  {/* Content */}
</BaseModal>
```

Description is hidden visually but announced to screen readers.

### Accessibility

WCAG 2.1 AA compliant:

- **Dialog Role**: `role="dialog"` with `aria-modal="true"`
- **Label Association**: `aria-labelledby` links to title
- **Description Association**: `aria-describedby` links to description
- **Focus Management**: Auto-focus on open, return focus on close
- **Escape Key**: Closes modal when enabled
- **Backdrop Click**: Close overlay when enabled
- **Body Scroll Lock**: Prevents scrolling in background
- **Keyboard Navigation**: Tab within modal only
- **ARIA Live**: Proper announcements for screen readers

### Focus Management

1. **On Open**: Focuses confirm button or first focusable element
2. **Within Modal**: Tab cycles through modal elements
3. **Escape**: Closes modal and returns focus to trigger
4. **On Close**: Returns focus to element that opened modal

### Usage Examples

#### Confirmation Dialog

```tsx
const [showModal, setShowModal] = useState(false);

<BaseModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Konfirmasi Penghapusan"
  showFooter
  variant="danger"
  confirmText="Ya, Hapus"
  cancelText="Batal"
  onConfirm={async () => {
    await deleteItem();
    setShowModal(false);
  }}
>
  <p>Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.</p>
</BaseModal>
```

#### Form Modal

```tsx
const [isOpen, setIsOpen] = useState(false);

<BaseModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Profil"
  size="lg"
  showFooter
  confirmText="Simpan"
  onConfirm={handleSave}
  loading={isSaving}
>
  <form onSubmit={handleSave}>
    <div className="space-y-4">
      <Input label="Nama" name="name" />
      <Input label="Email" name="email" />
    </div>
  </form>
</BaseModal>
```

#### Info Modal

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Informasi"
  size="md"
>
  <div className="prose dark:prose-invert">
    <p>Detail informasi...</p>
  </div>
</BaseModal>
```

### Testing

Comprehensive test coverage:

- Modal open/close states
- Size variants
- Backdrop click handling
- Escape key handling
- Footer button rendering
- Custom footer rendering
- Loading states
- Accessibility attributes
- Focus management
- Body scroll lock

### Best Practices

- Always provide `title` for accessibility
- Use `variant="danger"` for destructive actions
- Include `description` for complex modals
- Set `closeOnEscape={false}` for critical confirmations
- Use `size="lg"` or `xl` for forms
- Disable buttons during async operations with `loading` prop

---

## ConfirmationDialog Component

**Location**: `src/components/ui/ConfirmationDialog.tsx`

A pre-configured modal for confirmations with type-specific icons and colors, using the Modal component internally.

### Features

- **3 Types**: `danger`, `warning`, `info`
- **Type-Specific Icons**: Auto-configured icons for each type
- **Color Themes**: Consistent color schemes by type
- **No Close Button**: Requires explicit action
- **Built-in Loading**: Loading spinner during confirmation action
- **Accessibility**: Full ARIA compliance
- **Responsive**: Adapts to all screen sizes

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | **Required** | Whether dialog is visible |
| `title` | `string` | **Required** | Dialog title |
| `message` | `string` | **Required** | Dialog message content |
| `confirmText` | `string` | `'Ya, Lanjutkan'` | Text for confirm button |
| `cancelText` | `string` | `'Batal'` | Text for cancel button |
| `type` | `'danger'` \| `'warning'` \| `'info'` | `'warning'` | Dialog type |
| `onConfirm` | `() => void` | **Required** | Callback for confirm action |
| `onCancel` | `() => void` | **Required** | Callback for cancel action |
| `isLoading` | `boolean` | `false` | Loading state for confirm button |

### Types

#### Danger Type

```tsx
<ConfirmationDialog
  isOpen={showDialog}
  title="Hapus Data"
  message="Data akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
  type="danger"
  confirmText="Ya, Hapus"
  cancelText="Batal"
  onConfirm={handleDelete}
  onCancel={() => setShowDialog(false)}
  isLoading={isDeleting}
/>
```

**Appearance**:
- Icon: Trash can (red)
- Icon background: Red-50 (light mode) / Red-900/20 (dark mode)
- Border: Red-200 (light mode) / Red-800 (dark mode)
- Confirm button: Red-solid variant

#### Warning Type

```tsx
<ConfirmationDialog
  isOpen={showDialog}
  title="Peringatan"
  message="Perubahan ini akan mempengaruhi data lain."
  type="warning"
  confirmText="Ya, Lanjutkan"
  cancelText="Batal"
  onConfirm={handleProceed}
  onCancel={() => setShowDialog(false)}
/>
```

**Appearance**:
- Icon: Exclamation triangle (amber)
- Icon background: Amber-50 (light mode) / Amber-900/20 (dark mode)
- Border: Amber-200 (light mode) / Amber-800 (dark mode)
- Confirm button: Orange-solid variant

#### Info Type

```tsx
<ConfirmationDialog
  isOpen={showDialog}
  title="Informasi"
  message="Data akan diproses dalam beberapa saat."
  type="info"
  confirmText="OK"
  cancelText="Tutup"
  onConfirm={handleProceed}
  onCancel={() => setShowDialog(false)}
/>
```

**Appearance**:
- Icon: Information circle (blue)
- Icon background: Blue-50 (light mode) / Blue-900/20 (dark mode)
- Border: Blue-200 (light mode) / Blue-800 (dark mode)
- Confirm button: Blue-solid variant

### Loading State

```tsx
<ConfirmationDialog
  isOpen={showDialog}
  title="Proses Data"
  message="Memproses data Anda..."
  type="info"
  confirmText="OK"
  isLoading={isProcessing}
  onConfirm={handleConfirm}
  onCancel={() => setShowDialog(false)}
/>
```

Shows loading spinner in confirm button during operation.

### Custom Labels

```tsx
<ConfirmationDialog
  isOpen={showDialog}
  title="Konfirmasi Logout"
  message="Anda akan keluar dari sistem."
  type="warning"
  confirmText="Ya, Logout"
  cancelText="Tetap Masuk"
  onConfirm={handleLogout}
  onCancel={() => setShowDialog(false)}
/>
```

### Accessibility

- **Dialog Role**: Uses Modal component with proper ARIA
- **Type Icons**: Decorative icons with `role="img"` and `aria-hidden`
- **Button Labels**: Proper `aria-label` attributes
- **Focus Trap**: Inherits from Modal component
- **Keyboard Navigation**: Escape to cancel, Tab to navigate
- **Screen Reader**: Announces title and message clearly

### Usage Examples

#### Delete Confirmation

```tsx
const [showDeleteDialog, setShowDeleteDialog] = useState(false);

<ConfirmationDialog
  isOpen={showDeleteDialog}
  title="Hapus Siswa"
  message={`Hapus data siswa ${studentName}? Data akan dihapus permanen.`}
  type="danger"
  confirmText="Ya, Hapus"
  cancelText="Batal"
  onConfirm={async () => {
    await deleteStudent(studentId);
    setShowDeleteDialog(false);
  }}
  onCancel={() => setShowDeleteDialog(false)}
  isLoading={isDeleting}
/>
```

#### Logout Confirmation

```tsx
<ConfirmationDialog
  isOpen={showLogoutDialog}
  title="Konfirmasi Logout"
  message="Anda akan keluar dari sistem. Perubahan yang belum disimpan akan hilang."
  type="warning"
  confirmText="Ya, Logout"
  cancelText="Batal"
  onConfirm={handleLogout}
  onCancel={() => setShowLogoutDialog(false)}
/>
```

#### System Reset Confirmation

```tsx
<ConfirmationDialog
  isOpen={showResetDialog}
  title="Reset Pengaturan"
  message="Semua pengaturan akan dikembalikan ke default. Lanjutkan?"
  type="warning"
  confirmText="Ya, Reset"
  cancelText="Batal"
  onConfirm={async () => {
    await resetSettings();
    setShowResetDialog(false);
  }}
  onCancel={() => setShowResetDialog(false)}
  isLoading={isResetting}
/>
```

### Best Practices

- Use `type="danger"` for destructive actions (delete, remove)
- Use `type="warning"` for actions with consequences (logout, reset)
- Use `type="info"` for informational confirmations
- Provide clear, concise messages
- Use `isLoading` for async operations
- Consider irreversible actions carefully (use double confirmation for critical operations)

---

## Section Component

**Location**: `src/components/ui/Section.tsx`

A section wrapper component for page-level content areas with semantic HTML structure and optional badge support.

### Features

- **Semantic HTML**: Uses `<section>` element
- **ARIA Labeling**: `aria-labelledby` for accessibility
- **Responsive Spacing**: Adaptive padding for different screen sizes
- **Title & Subtitle**: Built-in heading and description
- **Badge Support**: Optional badge element above title
- **Center Alignment**: Text and content centered by default
- **Fade Animation**: Subtle fade-in animation for title area
- **Flexible Layout**: Supports any child content

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | **Required** | Section identifier (used for navigation) |
| `title` | `string` | **Required** | Section heading |
| `subtitle` | `string` | `undefined` | Subtitle/description text |
| `children` | `React.ReactNode` | **Required** | Section content |
| `className` | `string` | `''` | Additional CSS classes |
| `badge` | `React.ReactNode` | `undefined` | Badge element displayed above title |

### Basic Usage

```tsx
<Section id="about" title="Tentang Kami">
  <p>Lorem ipsum dolor sit amet...</p>
</Section>
```

### With Subtitle

```tsx
<Section
  id="features"
  title="Fitur Utama"
  subtitle="Platform lengkap untuk manajemen sekolah"
>
  <div className="grid grid-cols-3 gap-6">
    {/* Feature cards */}
  </div>
</Section>
```

### With Badge

```tsx
import Badge from './ui/Badge';

<Section
  id="new-features"
  title="Fitur Baru"
  badge={<Badge variant="success">Updated</Badge>}
>
  <div>
    {/* New feature content */}
  </div>
</Section>
```

### With Custom Classes

```tsx
<Section
  id="contact"
  title="Hubungi Kami"
  subtitle="Ada pertanyaan? Kami siap membantu."
  className="bg-neutral-50 dark:bg-neutral-900"
>
  {/* Contact form */}
</Section>
```

### Semantic Structure

```html
<section id="about" aria-labelledby="about-heading" class="py-20 sm:py-24">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12 sm:mb-16 animate-fade-in">
      <h2 id="about-heading" class="text-4xl sm:text-5xl md:text-6xl font-bold">
        Tentang Kami
      </h2>
    </div>
    <!-- Children content -->
  </div>
</section>
```

### Responsive Behavior

- **Padding**: `py-20 sm:py-24` (desktop has more padding)
- **Title Size**: `text-4xl sm:text-5xl md:text-6xl` (responsive text size)
- **Container**: `max-w-7xl` with responsive horizontal padding

### Skip Link Integration

Works seamlessly with SkipLink component:

```tsx
<SkipLink targetId="about" label="Langsung ke Tentang Kami" />

<Section id="about" title="Tentang Kami">
  {/* Content */}
</Section>
```

### Accessibility

- **Semantic HTML**: `<section>` element
- **Heading Association**: `aria-labelledby` connects to heading
- **Screen Reader**: Clear heading structure
- **Keyboard**: Tab to section, standard navigation

### Usage Examples

#### About Section

```tsx
<Section
  id="about"
  title="Tentang MA Malnu Kananga"
  subtitle="Sistem manajemen sekolah modern dan terintegrasi"
>
  <div className="max-w-3xl mx-auto prose dark:prose-invert">
    <p>
      MA Malnu Kananga adalah platform berbasis web yang menyediakan solusi
      lengkap untuk manajemen pendidikan...
    </p>
  </div>
</Section>
```

#### Features Section

```tsx
<Section
  id="features"
  title="Fitur Unggulan"
  badge={<Badge variant="success">Baru</Badge>}
>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
    <Card title="Manajemen Akademik">
      {/* Content */}
    </Card>
    <Card title="E-Learning">
      {/* Content */}
    </Card>
    <Card title="Keuangan">
      {/* Content */}
    </Card>
  </div>
</Section>
```

#### Contact Section

```tsx
<Section
  id="contact"
  title="Hubungi Kami"
  subtitle="Kami siap membantu Anda"
>
  <div className="max-w-2xl mx-auto">
    <form>
      {/* Contact form */}
    </form>
  </div>
</Section>
```

### Best Practices

- Use unique `id` for navigation and skip links
- Include `subtitle` for additional context
- Use `badge` for status or important information
- Keep content within max-width container
- Use semantic heading hierarchy

---


## ErrorBoundary Component

**Location**: `src/components/ui/ErrorBoundary.tsx`

A React error boundary component that catches JavaScript errors in component tree, displays fallback UI, and provides recovery options.

### Features

- **Error Catching**: Catches JavaScript errors in component tree
- **Fallback UI**: Default error display with Card component
- **Custom Fallback**: Override with custom error component
- **Error Logging**: Logs errors via centralized logger
- **Reset Keys**: Automatic reset on prop changes
- **Reload Option**: Page reload button for recovery
- **Retry Option**: Try again button to reset error boundary
- **Error Details**: Expandable error stack for debugging
- **Contact Support**: Links to support email
- **Accessibility**: `role="alert"` and `aria-live` for screen readers

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **Required** | Child components to monitor |
| `fallback` | `ReactNode` | `undefined` | Custom fallback UI to display on error |
| `onError` | `(error: Error, errorInfo: ErrorInfo) => void` | `undefined` | Callback when error occurs |
| `resetKeys` | `Array<string \| number>` | `undefined` | Array of keys that trigger reset when changed |
| `onReset` | `() => void` | `undefined` | Callback when error boundary is reset |

### Default Fallback

```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

Displays default error UI with:
- Error icon (triangle with exclamation)
- Title: "Terjadi Kesalahan"
- Message: Error description
- Reload and Retry buttons
- Expandable error details (for debugging)
- Contact support link

### Custom Fallback

```tsx
<ErrorBoundary fallback={<CustomErrorPage />}>
  <App />
</ErrorBoundary>
```

Replace with your own error page.

### Error Callback

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Log to error tracking service
    logErrorToService(error, errorInfo);
    // Show user notification
    showNotification('Terjadi error');
  }}
>
  <App />
</ErrorBoundary>
```

### Reset on Props Change

```tsx
<ErrorBoundary
  resetKeys={[userId]}
  onReset={() => {
    // Perform cleanup
    clearData();
  }}
>
  <UserProfile userId={userId} />
</ErrorBoundary>
```

Resets error boundary when `userId` changes.

### Reset Handler

```tsx
<ErrorBoundary
  onReset={() => {
    // Navigate to home
    navigate('/');
  }}
>
  <App />
</ErrorBoundary>
```

Called when user clicks "Coba Lagi" button.

### Default Error UI Structure

```tsx
<div role="alert" aria-live="assertive">
  <Card padding="lg" shadow="float" className="max-w-2xl w-full">
    <div className="text-center">
      {/* Error Icon */}
      <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-red-100">
        <AlertTriangleIcon className="h-10 w-10 text-red-600" />
      </div>

      {/* Error Title */}
      <h1 className="text-3xl font-bold mb-3">
        Terjadi Kesalahan
      </h1>

      {/* Error Message */}
      <p className="text-base mb-8">
        Maaf, terjadi kesalahan yang tidak terduga.
        Tim kami telah menerima laporan mengenai masalah ini.
      </p>

      {/* Expandable Error Details */}
      <details>
        <summary>Lihat detail error (untuk debugging)</summary>
        <div className="p-4 bg-neutral-100 rounded-lg">
          <p className="text-red-600 mb-2">
            {error.name}: {error.message}
          </p>
          <pre className="text-neutral-600 whitespace-pre-wrap">
            {error.stack}
          </pre>
        </div>
      </details>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="primary" onClick={() => window.location.reload()}>
          Reload Halaman
        </Button>
        <Button variant="secondary" onClick={() => errorBoundary.reset()}>
          Coba Lagi
        </Button>
      </div>

      {/* Contact Support */}
      <p className="mt-6 text-sm">
        Jika masalah ini berlanjut, hubungi{' '}
        <a href={`mailto:${INFO_EMAIL}`}>
          {INFO_EMAIL}
        </a>
      </p>
    </div>
  </Card>
</div>
```

### Custom Error UI Example

```tsx
const CustomErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-900 dark:to-neutral-800">
    <div className="text-center p-8">
      <div className="text-6xl mb-4">🐛</div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
        Oops! Terjadi Error
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        Jangan khawatir, kami sedang memperbaikinya.
      </p>
      <Button variant="primary" onClick={() => window.location.reload()}>
        Kembali ke Beranda
      </Button>
    </div>
  </div>
);

<ErrorBoundary fallback={<CustomErrorFallback />}>
  <App />
</ErrorBoundary>
```

### Best Practices

- **Wrap at Root Level**: Place at top of component tree
- **Use Reset Keys**: Reset on route/user changes
- **Log Errors**: Send to error tracking service
- **Provide Recovery**: Give users options to recover
- **Friendly Messages**: User-friendly error descriptions
- **Debug Info**: Hide technical details by default
- **Contact Support**: Link to support channels

### Usage Patterns

#### Root Level

```tsx
function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Routes */}
      </Routes>
    </ErrorBoundary>
  );
}
```

#### Feature Specific

```tsx
function FeaturePage() {
  return (
    <ErrorBoundary
      resetKeys={[featureId]}
      fallback={<FeatureError />}
    >
      <ComplexFeature id={featureId} />
    </ErrorBoundary>
  );
}
```

#### With Error Tracking

```tsx
import * as Sentry from '@sentry/react';

<ErrorBoundary
  onError={(error, errorInfo) => {
    Sentry.captureException(error, { extra: errorInfo });
  }}
>
  <App />
</ErrorBoundary>
```

---

## SkipLink Component

**Location**: `src/components/ui/SkipLink.tsx`

An accessibility component that provides keyboard-only navigation links, allowing users to skip to main content or specific sections.

### Features

- **Keyboard Only**: Invisible until focused (for screen readers and keyboard users)
- **Multiple Targets**: Support for multiple skip links
- **Smooth Scroll**: Animated scrolling to target
- **Focus Management**: Auto-focuses target element
- **Single Target**: Simplified API for single skip link
- **Multiple Targets**: Support for navigation menu
- **Full Accessibility**: ARIA attributes and semantic HTML
- **High Contrast**: WCAG AA compliant colors

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `targetId` | `string` | `'main-content'` | ID of target element to skip to |
| `label` | `string` | `'Langsung ke konten utama'` | Text displayed in link |
| `className` | `string` | `''` | Additional CSS classes |
| `targets` | `Array<{id: string, label: string}>` | `undefined` | Array of skip targets (for multiple links) |

### Single Target

```tsx
<SkipLink
  targetId="main-content"
  label="Langsung ke konten utama"
/>

<main id="main-content">
  {/* Main content */}
</main>
```

Renders single skip link above header.

### Multiple Targets

```tsx
<SkipLink
  targets={[
    { id: 'main-content', label: 'Langsung ke konten utama' },
    { id: 'navigation', label: 'Langsung ke navigasi' },
    { id: 'search', label: 'Langsung ke pencarian' },
    { id: 'footer', label: 'Langsung ke footer' }
  ]}
/>
```

Renders multiple skip links as navigation menu.

### Visual Behavior

```css
/* Default state: hidden above viewport */
transform: -translate-y-[200%];

/* Focused state: visible at top-left */
focus:translate-y-0;
```

Links are invisible until Tab key focuses them.

### Skip Handler

```tsx
const handleSkip = (e: React.MouseEvent, targetId: string) => {
  e.preventDefault();
  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    targetElement.focus();
  }
};
```

1. Prevents default link behavior
2. Finds target element by ID
3. Scrolls to target with animation
4. Sets focus to target element

### Accessibility

- **Keyboard Navigation**: Tab to skip link, Enter/Space to activate
- **Screen Reader**: Announces skip links on page load
- **Focus Management**: Sets focus to target element
- **ARIA Labels**: Proper `aria-label` attributes
- **Semantic HTML**: Uses `<a>` elements
- **High Contrast**: Visible when focused

### Common Targets

#### Main Content

```tsx
<SkipLink targetId="main-content" label="Langsung ke konten utama" />

<main id="main-content">
  {/* Main content */}
</main>
```

#### Navigation

```tsx
<SkipLink targetId="main-nav" label="Langsung ke navigasi" />

<nav id="main-nav">
  {/* Navigation */}
</nav>
```

#### Search

```tsx
<SkipLink targetId="search-input" label="Langsung ke pencarian" />

<input id="search-input" type="search" />
```

#### Footer

```tsx
<SkipLink targetId="footer" label="Langsung ke footer" />

<footer id="footer">
  {/* Footer content */}
</footer>
```

### Multiple Links as Nav

```tsx
<SkipLink
  targets={[
    { id: 'main-content', label: 'Konten Utama' },
    { id: 'nav-menu', label: 'Menu Navigasi' },
    { id: 'search-box', label: 'Pencarian' }
  ]}
/>
```

Renders as navigation menu:

```html
<nav aria-label="Tautan navigasi cepat" class="absolute top-4 left-4 flex flex-col gap-2">
  <a href="#main-content" aria-label="Konten Utama">Konten Utama</a>
  <a href="#nav-menu" aria-label="Menu Navigasi">Menu Navigasi</a>
  <a href="#search-box" aria-label="Pencarian">Pencarian</a>
</nav>
```

### Custom Styling

```tsx
<SkipLink
  targetId="main-content"
  label="Skip to content"
  className="z-[100] px-6 py-3 text-base rounded-lg bg-primary-600 text-white"
/>
```

### Integration with App

```tsx
function App() {
  return (
    <>
      <SkipLink
        targetId="main-content"
        label="Langsung ke konten utama"
      />

      <Header />

      <main id="main-content">
        {/* Main content */}
      </main>

      <Footer />
    </>
  );
}
```

### Best Practices

- **Place at Top**: Render as first element after `<body>`
- **Use Meaningful Labels**: Clear, descriptive text
- **Match Target IDs**: Ensure target IDs exist in DOM
- **Focusable Targets**: Targets should be focusable elements
- **Multiple Targets**: Use for complex pages with many sections
- **Test Keyboard**: Verify Tab navigation works correctly
- **Test Screen Reader**: Verify announcements are correct

### WCAG Compliance

- **SC 2.4.1 Bypass Blocks**: Provides way to skip navigation
- **SC 2.4.6 Headings and Labels**: Clear labeling
- **SC 1.3.1 Info and Relationships**: Proper semantic structure
- **SC 2.1.1 Keyboard**: Fully keyboard accessible

---


## DashboardActionCard Component

**Location**: `src/components/ui/DashboardActionCard.tsx`

A specialized card component for dashboard action buttons with 13 color themes, status badges, and offline detection.

### Features

- **13 Color Themes**: Primary, blue, green, purple, orange, teal, indigo, red, pink, emerald, cyan, yellow, rose
- **2 Layouts**: Vertical (default), Horizontal
- **Card Variants**: Inherits from Card component (default, hover, interactive, gradient)
- **Status Badges**: Inline badge display with offline support
- **Extra Role Support**: Special badge for extra role users (staff, OSIS)
- **Offline Detection**: Automatic disabled state when offline
- **Icon Animation**: Scale animation on hover
- **Accessibility**: Full ARIA support and keyboard navigation
- **Dark Mode**: Consistent styling across themes

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ReactNode` | **Required** | Icon to display in card |
| `title` | `string` | **Required** | Card title |
| `description` | `string` | **Required** | Card description |
| `colorTheme` | `ColorTheme` | `'primary'` | Color theme for icon and badge |
| `variant` | `CardVariant` | `'interactive'` | Card visual variant |
| `gradient` | `CardGradient` | `undefined` | Gradient background (if enabled) |
| `statusBadge` | `string` | `undefined` | Status badge text |
| `offlineBadge` | `string` | `undefined` | Badge text when offline |
| `isOnline` | `boolean` | `true` | Network status |
| `isExtraRole` | `boolean` | `false` | Whether user has extra role |
| `extraRoleBadge` | `string` | `undefined` | Extra role badge text |
| `disabled` | `boolean` | `false` | Disable card interaction |
| `layout` | `'vertical'` \| `'horizontal'` | `'vertical'` | Card layout orientation |
| `onClick` | `() => void` | `undefined` | Click handler |
| `ariaLabel` | `string` | `undefined` | ARIA label for screen readers |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `React.CSSProperties` | `undefined` | Inline styles |

### Color Themes

#### Primary

```tsx
<DashboardActionCard
  icon={<AcademicCapIcon />}
  title="Manajemen Akademik"
  description="Kelola nilai, jadwal, dan absensi"
  colorTheme="primary"
  onClick={() => navigate('/academic')}
/>
```

#### Blue

```tsx
<DashboardActionCard
  icon={<UsersIcon />}
  title="Data Siswa"
  description="Kelola data siswa dan ortu"
  colorTheme="blue"
/>
```

#### Green

```tsx
<DashboardActionCard
  icon={<BanknoteIcon />}
  title="Keuangan"
  description="SPP dan pembayaran lain"
  colorTheme="green"
/>
```

#### Purple

```tsx
<DashboardActionCard
  icon={<BookOpenIcon />}
  title="E-Library"
  description="Akses materi dan dokumen"
  colorTheme="purple"
/>
```

#### Orange

```tsx
<DashboardActionCard
  icon={<CalendarIcon />}
  title="Jadwal"
  description="Jadwal pelajaran dan ujian"
  colorTheme="orange"
/>
```

#### Teal

```tsx
<DashboardActionCard
  icon={<ChartBarIcon />}
  title="Analitik"
  description="Statistik dan laporan"
  colorTheme="teal"
/>
```

#### Indigo

```tsx
<DashboardActionCard
  icon={<ChatBubbleLeftRightIcon />}
  title="Komunikasi"
  description="Pesan dan pengumuman"
  colorTheme="indigo"
/>
```

#### Red

```tsx
<DashboardActionCard
  icon={<ShieldCheckIcon />}
  title="Keamanan"
  description="Pengaturan keamanan akun"
  colorTheme="red"
/>
```

#### Pink

```tsx
<DashboardActionCard
  icon={<HeartIcon />}
  title="Favorit"
  description="Materi favorit Anda"
  colorTheme="pink"
/>
```

#### Emerald

```tsx
<DashboardActionCard
  icon={<CheckCircleIcon />}
  title="Tugas"
  description="Tugas dan proyek"
  colorTheme="emerald"
/>
```

#### Cyan

```tsx
<DashboardActionCard
  icon={<DocumentIcon />}
  title="Dokumen"
  description="Dokumen dan arsip"
  colorTheme="cyan"
/>
```

#### Yellow

```tsx
<DashboardActionCard
  icon={<StarIcon />}
  title="Prestasi"
  description="Prestasi dan penghargaan"
  colorTheme="yellow"
/>
```

#### Rose

```tsx
<DashboardActionCard
  icon={<BellIcon />}
  title="Notifikasi"
  description="Notifikasi dan pengingat"
  colorTheme="rose"
/>
```

### Layouts

#### Vertical (Default)

```tsx
<DashboardActionCard
  icon={<AcademicCapIcon />}
  title="Akademik"
  description="Kelola nilai dan jadwal"
  colorTheme="primary"
  layout="vertical"
/>
```

Icon centered above title, full width layout.

#### Horizontal

```tsx
<DashboardActionCard
  icon={<AcademicCapIcon />}
  title="Akademik"
  description="Kelola nilai dan jadwal"
  colorTheme="primary"
  layout="horizontal"
/>
```

Icon on left, content on right, inline layout.

### Status Badge

```tsx
<DashboardActionCard
  icon={<UsersIcon />}
  title="Manajemen User"
  description="Kelola hak akses dan roles"
  colorTheme="primary"
  statusBadge="Aktif"
/>
```

Shows "Aktif" badge in status color.

### Offline Detection

```tsx
<DashboardActionCard
  icon={<CloudIcon />}
  title="Sinkronisasi"
  description="Sinkronisasi data offline"
  colorTheme="blue"
  isOnline={isNetworkOnline}
  offlineBadge="Offline"
  statusBadge={isNetworkOnline ? "Aktif" : undefined}
/>
```

Automatically disables and shows offline badge when offline.

### Extra Role Badge

```tsx
<DashboardActionCard
  icon={<CalendarIcon />}
  title="Kegiatan OSIS"
  description="Kelola kegiatan dan event"
  colorTheme="orange"
  isExtraRole={user.extraRole === 'osis'}
  extraRoleBadge="OSIS Only"
/>
```

Shows special badge for users with extra role.

### Disabled State

```tsx
<DashboardActionCard
  icon={<LockClosedIcon />}
  title="Fitur Terkunci"
  description="Fitur ini belum tersedia"
  colorTheme="neutral"
  disabled
/>
```

Card appears dimmed and non-interactive.

### With Gradient

```tsx
import { GRADIENT_CLASSES } from '../../config/gradients';

<DashboardActionCard
  icon={<AcademicCapIcon />}
  title="Akademik"
  description="Kelola nilai dan jadwal"
  colorTheme="primary"
  gradient={GRADIENT_CLASSES.PRIMARY_DECORATIVE}
/>
```

Applies gradient background.

### Click Handler

```tsx
<DashboardActionCard
  icon={<HomeIcon />}
  title="Dashboard"
  description="Kembali ke dashboard utama"
  colorTheme="primary"
  onClick={() => navigate('/dashboard')}
  ariaLabel="Buka dashboard"
/>
```

Card becomes clickable with hover effect.

### Accessibility

- **Button Role**: Interactive cards have proper button semantics
- **ARIA Labels**: Custom labels for screen readers
- **Focus Management**: Visible focus ring on keyboard navigation
- **Keyboard Access**: Enter/Space to activate cards
- **Disabled State**: `aria-disabled` for non-interactive cards
- **Screen Reader**: Clear title and description announcements

### Usage Examples

#### Admin Dashboard

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <DashboardActionCard
    icon={<AcademicCapIcon />}
    title="Manajemen Akademik"
    description="Nilai, jadwal, absensi"
    colorTheme="primary"
    onClick={() => navigate('/academic')}
  />
  <DashboardActionCard
    icon={<UsersIcon />}
    title="Manajemen User"
    description="Roles dan hak akses"
    colorTheme="blue"
    onClick={() => navigate('/users')}
  />
  <DashboardActionCard
    icon={<BanknoteIcon />}
    title="Keuangan"
    description="SPP dan pembayaran"
    colorTheme="green"
    onClick={() => navigate('/finance')}
  />
</div>
```

#### Role-Based Dashboard

```tsx
{user.role === 'student' && (
  <DashboardActionCard
    icon={<BookOpenIcon />}
    title="E-Library"
    description="Materi pelajaran dan dokumen"
    colorTheme="purple"
    onClick={() => navigate('/library')}
  />
)}

{user.extraRole === 'osis' && (
  <DashboardActionCard
    icon={<CalendarIcon />}
    title="Kegiatan OSIS"
    description="Kelola event OSIS"
    colorTheme="orange"
    isExtraRole
    extraRoleBadge="OSIS Only"
    onClick={() => navigate('/osis')}
  />
)}
```

#### Offline-First Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <DashboardActionCard
    icon={<UserIcon />}
    title="Profil"
    description="Lihat dan edit profil"
    colorTheme="primary"
    isOnline={isOnline}
    offlineBadge="Offline"
    statusBadge={isOnline ? "Aktif" : undefined}
    onClick={() => navigate('/profile')}
  />
  <DashboardActionCard
    icon={<CloudIcon />}
    title="Sinkronisasi"
    description="Sinkronisasi data"
    colorTheme="blue"
    isOnline={isOnline}
    offlineBadge="Perlu Koneksi"
    statusBadge={isOnline ? "Sinkron" : undefined}
    onClick={syncData}
  />
</div>
```

### Best Practices

- **Match Purpose**: Use appropriate color theme for function
- **Clear Descriptions**: Keep descriptions concise and clear
- **Status Indicators**: Show online/offline status for network-dependent features
- **Extra Roles**: Highlight extra role features with special badges
- **Visual Hierarchy**: Use layout and color to guide users
- **Offline UX**: Provide clear offline state and requirements

---

## SocialLink Component

**Location**: `src/components/ui/SocialLink.tsx`

A social media link/button component with 3 variants, 4 sizes, and support for both anchor and button elements.

### Features

- **3 Variants**: `default`, `primary`, `secondary`
- **4 Sizes**: `sm`, `md`, `lg`, `xl`
- **Dual Mode**: Can render as `<a>` or `<button>`
- **Disabled State**: Visual feedback when disabled
- **Hover Effects**: Scale transform, shadow enhancement
- **Active Press**: Scale reduction for press feedback
- **Focus Ring**: Visible focus indicator for keyboard users
- **Dark Mode**: Consistent styling across themes
- **Accessibility**: Full ARIA support and keyboard navigation

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ReactNode` | **Required** | Icon to display |
| `label` | `string` | **Required** | Text label for accessibility |
| `href` | `string` | `undefined` | Link URL (renders as `<a>`) |
| `onClick` | `() => void` | `undefined` | Click handler (renders as `<button>`) |
| `size` | `SocialLinkSize` | `'lg'` | Icon size |
| `variant` | `SocialLinkVariant` | `'default'` | Color and style variant |
| `className` | `string` | `''` | Additional CSS classes |
| `target` | `string` | `undefined` | Link target (e.g., `_blank`) |
| `rel` | `string` | `'noopener noreferrer'` | Link relationship attribute |
| `disabled` | `boolean` | `false` | Disable interaction |

### Variants

#### Default

```tsx
<SocialLink
  icon={<FacebookIcon />}
  label="Facebook"
  href="https://facebook.com/malnukananga"
  variant="default"
/>
```

**Styling**:
- Color: Neutral-400 (light mode) / Neutral-500 (dark mode)
- Hover: Primary-600 (light mode) / Primary-400 (dark mode)
- Background hover: Primary-50 (light mode) / Primary-900/40 (dark mode)

#### Primary

```tsx
<SocialLink
  icon={<TwitterIcon />}
  label="Twitter"
  href="https://twitter.com/malnukananga"
  variant="primary"
/>
```

**Styling**:
- Color: Primary-600 (light mode) / Primary-400 (dark mode)
- Hover: Darker/lighter primary shade
- Background hover: Primary-100 (light mode) / Primary-900/60 (dark mode)

#### Secondary

```tsx
<SocialLink
  icon={<InstagramIcon />}
  label="Instagram"
  href="https://instagram.com/malnukananga"
  variant="secondary"
/>
```

**Styling**:
- Color: Neutral-500 (light mode) / Neutral-500 (dark mode)
- Hover: Neutral-700 (light mode) / Neutral-300 (dark mode)
- Background hover: Neutral-100 (light mode) / Neutral-800/50 (dark mode)

### Sizes

#### Small (sm)

```tsx
<SocialLink
  icon={<FacebookIcon />}
  label="Facebook"
  size="sm"
  href="https://facebook.com/page"
/>
```

- Padding: `p-2`
- Icon: `w-5 h-5`

#### Medium (md)

```tsx
<SocialLink
  icon={<TwitterIcon />}
  label="Twitter"
  size="md"
  href="https://twitter.com/page"
/>
```

- Padding: `p-2.5`
- Icon: `w-5 h-5`

#### Large (lg)

```tsx
<SocialLink
  icon={<InstagramIcon />}
  label="Instagram"
  size="lg"
  href="https://instagram.com/page"
/>
```

- Padding: `p-3`
- Icon: `w-6 h-6`

#### Extra Large (xl)

```tsx
<SocialLink
  icon={<YouTubeIcon />}
  label="YouTube"
  size="xl"
  href="https://youtube.com/channel"
/>
```

- Padding: `p-4`
- Icon: `w-7 h-7`

### As Link

```tsx
<SocialLink
  icon={<FacebookIcon />}
  label="Ikuti kami di Facebook"
  href="https://facebook.com/malnukananga"
  target="_blank"
  rel="noopener noreferrer"
  variant="default"
  size="lg"
/>
```

Renders as anchor element with external link behavior.

### As Button

```tsx
<SocialLink
  icon={<ShareIcon />}
  label="Share"
  onClick={handleShare}
  variant="primary"
  size="md"
/>
```

Renders as button element for in-page actions.

### Disabled State

```tsx
<SocialLink
  icon={<FacebookIcon />}
  label="Facebook (Coming Soon)"
  href="#"
  disabled
  variant="default"
  size="lg"
/>
```

Shows reduced opacity and prevents interaction.

### Social Media Icons

Typical icon usage:

```tsx
import { FacebookIcon, InstagramIcon, TwitterIcon, YouTubeIcon, LinkedInIcon } from './icons';

<div className="flex gap-3">
  <SocialLink icon={<FacebookIcon />} label="Facebook" href="..." />
  <SocialLink icon={<InstagramIcon />} label="Instagram" href="..." />
  <SocialLink icon={<TwitterIcon />} label="Twitter" href="..." />
  <SocialLink icon={<YouTubeIcon />} label="YouTube" href="..." />
  <SocialLink icon={<LinkedInIcon />} label="LinkedIn" href="..." />
</div>
```

### Footer Usage

```tsx
<footer className="bg-neutral-100 dark:bg-neutral-800 py-8">
  <div className="max-w-7xl mx-auto px-4 flex justify-center gap-4">
    <SocialLink icon={<FacebookIcon />} label="Facebook" href="..." size="lg" />
    <SocialLink icon={<InstagramIcon />} label="Instagram" href="..." size="lg" />
    <SocialLink icon={<TwitterIcon />} label="Twitter" href="..." size="lg" />
    <SocialLink icon={<YouTubeIcon />} label="YouTube" href="..." size="lg" />
  </div>
</footer>
```

### Contact Section

```tsx
<div className="flex items-center gap-4">
  <SocialLink icon={<EmailIcon />} label="Email" href="mailto:info@malnu.com" variant="primary" />
  <SocialLink icon={<PhoneIcon />} label="Phone" href="tel:+62812345678" variant="primary" />
  <SocialLink icon={<MapPinIcon />} label="Location" href="https://maps.google.com/..." variant="primary" />
</div>
```

### Accessibility

- **ARIA Labels**: Provides `aria-label` for screen readers
- **Icon Hidden**: Icons marked with `aria-hidden` for decoration
- **Keyboard Navigation**: Tab to focus, Enter/Space to activate
- **Focus Ring**: 2px focus ring with offset
- **Disabled State**: `aria-disabled` and reduced opacity
- **External Links**: Proper `rel="noopener noreferrer"` for external links

### Animation States

- **Hover**: `hover:shadow-md hover:scale-110`
- **Active**: `active:scale-95` for press feedback
- **Focus**: `focus-visible:ring-2` for keyboard visibility

### Best Practices

- **Use Meaningful Labels**: Clear accessibility labels
- **External Links**: Always use `target="_blank"` and `rel="noopener noreferrer"`
- **Consistent Sizing**: Use same size for social links in same section
- **Disabled Features**: Use disabled state for unavailable features
- **Button vs Link**: Use button for in-page actions, link for navigation

---


## Table Components

**Location**: `src/components/ui/Table.tsx`

A comprehensive table component with sub-components (Thead, Tbody, Tfoot, Tr, Th, Td) for accessible data display.

### Features

- **3 Sizes**: `sm`, `md`, `lg`
- **4 Variants**: `default`, `striped`, `bordered`, `simple`
- **Sub-components**: Modular Table, Thead, Tbody, Tfoot, Tr, Th, Td
- **Sortable Headers**: Built-in sort icon support
- **Hoverable Rows**: Visual hover effect on rows
- **Selected State**: Highlight selected rows
- **Accessibility**: Full ARIA compliance
- **Dark Mode**: Consistent styling
- **Responsive**: Adapts to screen sizes

### Table Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **Required** | Table content |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Font size for table content |
| `variant` | `'default'` \| `'striped'` \| `'bordered'` \| `'simple'` | `'default'` | Table visual style |
| `caption` | `string` | `undefined` | Table caption (screen reader only) |
| `description` | `string` | `undefined` | Table description (screen reader only) |
| `ariaLabel` | `string` | `undefined` | ARIA label for table |
| `className` | `string` | `''` | Additional CSS classes |

### Sub-Components

#### Thead (Table Header)

```tsx
<Table size="md">
  <Thead>
    <Tr>
      <Th>Name</Th>
      <Th>Email</Th>
      <Th>Role</Th>
    </Tr>
  </Thead>
  <Tbody>
    {/* Rows */}
  </Tbody>
</Table>
```

#### Tbody (Table Body)

```tsx
<Table>
  <Thead>...</Thead>
  <Tbody>
    <Tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td>Admin</td>
    </Tr>
  </Tbody>
</Table>
```

#### Tfoot (Table Footer)

```tsx
<Table>
  <Thead>...</Thead>
  <Tbody>...</Tbody>
  <Tfoot>
    <Tr>
      <td colSpan={3}>Total: 10 records</td>
    </Tr>
  </Tfoot>
</Table>
```

#### Tr (Table Row)

```tsx
<Tr hoverable selected>
  <Td>Content</Td>
</Tr>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **Required** | Row content |
| `hoverable` | `boolean` | `true` | Hover effect |
| `selected` | `boolean` | `false` | Highlight row |
| `className` | `string` | `''` | Additional classes |

#### Th (Table Header Cell)

```tsx
<Th sortable sortDirection="asc">Name</Th>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **Required** | Header text |
| `scope` | `'col'` \| `'row'` \| `'colgroup'` \| `'rowgroup'` | `'col'` | Cell scope |
| `sortable` | `boolean` | `false` | Enable sort click |
| `sortDirection` | `'asc'` \| `'desc'` | `undefined` | Sort direction |
| `className` | `string` | `''` | Additional classes |

#### Td (Table Data Cell)

```tsx
<Td>Cell content</Td>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **Required** | Cell content |
| `className` | `string` | `''` | Additional classes |

### Sizes

#### Small (sm)

```tsx
<Table size="sm">
  <Thead>...</Thead>
</Table>
```

Text size: `text-xs`

#### Medium (md)

```tsx
<Table size="md">
  <Thead>...</Thead>
</Table>
```

Text size: `text-sm`

#### Large (lg)

```tsx
<Table size="lg">
  <Thead>...</Thead>
</Table>
```

Text size: `text-base`

### Variants

#### Default

```tsx
<Table variant="default">
  <Thead>...</Thead>
</Table>
```

- Dividers between rows
- Neutral border colors

#### Striped

```tsx
<Table variant="striped">
  <Thead>...</Thead>
</Table>
```

- Alternating row colors
- Improved readability

#### Bordered

```tsx
<Table variant="bordered">
  <Thead>...</Thead>
</Table>
```

- Vertical borders on sides
- Enhanced visual structure

#### Simple

```tsx
<Table variant="simple">
  <Thead>...</Thead>
</Table>
```

- Minimal styling
- No row dividers

### Sortable Headers

```tsx
const [sortKey, setSortKey] = useState('name');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

<Table>
  <Thead>
    <Tr>
      <Th
        sortable
        sortDirection={sortKey === 'name' ? sortDirection : undefined}
        onClick={() => {
          setSortKey('name');
          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }}
      >
        Name
      </Th>
    </Tr>
  </Thead>
</Table>
```

### Selected Rows

```tsx
<Table>
  <Thead>...</Thead>
  <Tbody>
    <Tr selected={selectedRows.includes(user.id)} hoverable>
      <Td>{user.name}</Td>
    </Tr>
  </Tbody>
</Table>
```

### Accessibility

- **Role**: `role="table"` on table
- **Caption**: `sr-only` caption for screen readers
- **Scope**: Proper `scope` attributes on headers
- **Sort**: `aria-sort` on sortable headers
- **Selection**: `aria-selected` on selected rows

---

## DataTable Component

**Location**: `src/components/ui/DataTable.tsx`

A comprehensive data table component with search, pagination, sorting, selection, and loading states.

### Features

- **Search**: Built-in search input
- **Pagination**: Integrated pagination component
- **Sorting**: Column sorting with indicators
- **Row Selection**: Multi-select with checkboxes
- **Loading States**: Loading overlay and skeleton
- **Empty State**: Empty state display
- **Error State**: Error message with retry
- **Sticky Header**: Fixed header on scroll
- **Custom Rendering**: Custom cell renderers
- **Fixed Columns**: Left/right column pinning
- **Accessibility**: Full ARIA compliance

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | **Required** | Table data |
| `columns` | `Column<T>[]` | **Required** | Column definitions |
| `loading` | `boolean` | `false` | Loading state |
| `error` | `string \| null` | `null` | Error message |
| `empty` | `boolean` | `false` | Empty data state |
| `emptyMessage` | `string` | `'No data available'` | Empty state message |
| `pagination` | `PaginationProps` | `undefined` | Pagination configuration |
| `selection` | `SelectionProps` | `undefined` | Row selection configuration |
| `filter` | `FilterProps` | `undefined` | Search/filter configuration |
| `sort` | `SortProps` | `undefined` | Sort configuration |
| `rowClassName` | `(record: T, index: number) => string` | `undefined` | Custom row class |
| `onRowClick` | `(record: T, index: number) => void` | `undefined` | Row click handler |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Table size |
| `variant` | `'default'` \| `'bordered'` \| `'striped'` \| `'simple'` | `'default'` | Table style |
| `stickyHeader` | `boolean` | `false` | Sticky header |
| `scrollX` | `boolean` | `false` | Horizontal scroll |
| `scrollY` | `number` | `undefined` | Max height with scroll |
| `className` | `string` | `''` | Additional classes |

### Column Definition

```tsx
interface Column<User> {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, record: User, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}
```

### Basic Usage

```tsx
const columns: Column<User>[] = [
  { key: 'name', title: 'Nama' },
  { key: 'email', title: 'Email' },
  { key: 'role', title: 'Role' },
];

<DataTable
  data={users}
  columns={columns}
  loading={loading}
/>
```

### With Search

```tsx
<DataTable
  data={users}
  columns={columns}
  filter={{
    searchable: true,
    onSearch: (value) => handleSearch(value),
    placeholder: 'Search users...'
  }}
/>
```

### With Pagination

```tsx
<DataTable
  data={users}
  columns={columns}
  pagination={{
    currentPage: page,
    totalPages: totalPages,
    totalItems: total,
    itemsPerPage: pageSize,
    onPageChange: handlePageChange,
    onItemsPerPageChange: handlePageSizeChange,
  }}
/>
```

### With Sorting

```tsx
const [sortKey, setSortKey] = useState('name');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

<DataTable
  data={users}
  columns={columns}
  sort={{
    sortKey,
    sortDirection,
    onSortChange: (key, direction) => {
      setSortKey(key);
      setSortDirection(direction);
    }
  }}
/>
```

### With Selection

```tsx
const [selectedRows, setSelectedRows] = useState<string[]>([]);

<DataTable
  data={users}
  columns={columns}
  selection={{
    selectedRowKeys: selectedRows,
    onSelectAll: (checked) => {
      setSelectedRows(checked ? users.map(u => u.id) : []);
    },
    onSelect: (key, checked) => {
      setSelectedRows(prev =>
        checked ? [...prev, key] : prev.filter(k => k !== key)
      );
    },
    getRowKey: (record) => record.id,
  }}
/>
```

### Custom Cell Renderer

```tsx
const columns: Column<User>[] = [
  {
    key: 'name',
    title: 'Nama',
    render: (value, record) => (
      <div className="flex items-center gap-2">
        <Avatar src={record.avatar} size="sm" />
        <span>{value as string}</span>
      </div>
    ),
  },
  {
    key: 'status',
    title: 'Status',
    render: (value) => (
      <Badge variant={value === 'Active' ? 'success' : 'neutral'}>
        {value as string}
      </Badge>
    ),
  },
];
```

### Row Click

```tsx
<DataTable
  data={users}
  columns={columns}
  onRowClick={(record, index) => {
    navigate(`/users/${record.id}`);
  }}
/>
```

### Custom Row Class

```tsx
<DataTable
  data={users}
  columns={columns}
  rowClassName={(record, index) => {
    if (record.status === 'Inactive') return 'opacity-50';
    return '';
  }}
/>
```

### Sticky Header with Scroll

```tsx
<DataTable
  data={users}
  columns={columns}
  stickyHeader
  scrollY={400}
  scrollX
/>
```

### Empty State

```tsx
<DataTable
  data={[]}
  columns={columns}
  empty
  emptyMessage="Tidak ada data user"
/>
```

### Error State

```tsx
<DataTable
  data={users}
  columns={columns}
  error="Failed to load data"
  loading={false}
/>
```

### Loading State

```tsx
<DataTable
  data={[]}
  columns={columns}
  loading
/>
```

### Combined Example

```tsx
<DataTable
  data={users}
  columns={[
    { key: 'name', title: 'Nama', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'role', title: 'Role' },
    { key: 'status', title: 'Status', sortable: true },
  ]}
  loading={loading}
  error={error}
  empty={users.length === 0}
  emptyMessage="Tidak ada data user"
  pagination={{
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
  }}
  filter={{
    searchable: true,
    onSearch: setSearchValue,
    placeholder: 'Search users...',
  }}
  sort={{
    sortKey,
    sortDirection,
    onSortChange: handleSortChange,
  }}
  selection={{
    selectedRowKeys,
    onSelectAll,
    onSelect,
    getRowKey: (record) => record.id,
  }}
  onRowClick={handleRowClick}
  stickyHeader
  scrollY={500}
  size="md"
  variant="bordered"
/>
```

### Accessibility

- **Keyboard Navigation**: Arrow keys for pagination
- **Selection ARIA**: Proper checkbox states
- **Sort Indicators**: Visual and ARIA sort direction
- **Loading Announcements**: `aria-live="polite"` and `aria-busy`
- **Empty/Error States**: `role="status"` announcements

---


## Tab Component

**Location**: `src/components/ui/Tab.tsx`

A tab component with 3 variants, 6 colors, badges, and keyboard navigation.

### Features

- **3 Variants**: `pill`, `border`, `icon`
- **6 Colors**: green, blue, purple, red, yellow, neutral
- **Badges**: Optional count badges on tabs
- **Keyboard Navigation**: Arrow keys + Enter/Space
- **Icons**: Optional icon support
- **Orientation**: Horizontal or vertical
- **Accessibility**: Full ARIA tab roles
- **Focus Management**: Auto-focus on tab change

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `TabOption[]` | **Required** | Tab configuration |
| `activeTab` | `string` | **Required** | Currently active tab ID |
| `onTabChange` | `(tabId: string) => void` | **Required** | Tab change handler |
| `variant` | `'pill'` \| `'border'` \| `'icon'` | `'pill'` | Tab style |
| `color` | `TabColor` | `'green'` | Color theme |
| `className` | `string` | `''` | Additional CSS classes |
| `orientation` | `'horizontal'` \| `'vertical'` | `'horizontal'` | Layout direction |
| `aria-label` | `string` | `'Tabs'` | ARIA label for tablist |

### Tab Option

```tsx
interface TabOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
  disabled?: boolean;
}
```

### Pill Variant

```tsx
<Tab
  options={[
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'students', label: 'Siswa', badge: studentCount },
    { id: 'teachers', label: 'Guru' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="pill"
  color="green"
/>
```

### Border Variant

```tsx
<Tab
  options={[
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details' },
    { id: 'settings', label: 'Settings' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="border"
  color="blue"
/>
```

### Icon Variant

```tsx
<Tab
  options={[
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="icon"
  color="purple"
/>
```

### With Badges

```tsx
<Tab
  options={[
    { id: 'inbox', label: 'Inbox', badge: 5 },
    { id: 'sent', label: 'Sent', badge: 12 },
    { id: 'drafts', label: 'Drafts', badge: 3 },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="pill"
/>
```

### With Disabled Tabs

```tsx
<Tab
  options={[
    { id: 'available', label: 'Available' },
    { id: 'locked', label: 'Locked', disabled: true },
    { id: 'coming-soon', label: 'Coming Soon', disabled: true },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Vertical Orientation

```tsx
<Tab
  options={[
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  orientation="vertical"
  variant="icon"
/>
```

### Colors

All variants support 6 colors: `green`, `blue`, `purple`, `red`, `yellow`, `neutral`.

```tsx
<Tab color="green" />  {/* Green tabs */}
<Tab color="blue" />   {/* Blue tabs */}
<Tab color="purple" /> {/* Purple tabs */}
<Tab color="red" />    {/* Red tabs */}
<Tab color="yellow" />  {/* Yellow tabs */}
<Tab color="neutral" /> {/* Neutral tabs */}
```

### Accessibility

- **Tab Role**: `role="tab"` on buttons
- **Tablist Role**: `role="tablist"` on container
- **ARIA Selected**: `aria-selected` on active tab
- **ARIA Controls**: `aria-controls` links to panel
- **Keyboard**: Arrow keys for navigation, Enter/Space to select
- **Disabled**: `disabled` attribute on inactive tabs
 - **Badges**: `aria-label` on badge count
 
---
 
## Toast Component

**Location**: `src/components/Toast.tsx`

A toast notification component with 3 types, keyboard controls, pause-on-hover, and auto-dismiss functionality.

### Features

- **3 Types**: `success`, `info`, `error`
- **Auto-Dismiss**: Configurable duration with countdown
- **Pause on Hover**: Suspends timer when user hovers over toast
- **Keyboard Controls**: Escape key to dismiss
- **Focus Management**: Manages focus when toast appears/disappears
- **Accessibility**: Full ARIA support with live regions
- **Dark Mode**: Consistent styling across light and dark themes
- **Icons**: Built-in icons for each toast type
- **Smooth Animations**: Slide-in/out transitions with custom easing
- **Backdrop Blur**: Visual separation from content

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | **Required** | Toast message to display |
| `type` | `ToastType` | `'success'` | Toast type (success, info, error) |
| `isVisible` | `boolean` | **Required** | Whether toast is visible |
| `onClose` | `() => void` | **Required** | Callback when toast closes |
| `duration` | `number` | `3000` | Auto-dismiss duration in milliseconds (default: 3 seconds) |
| `className` | `string` | `''` | Additional CSS classes |

### Toast Types

#### Success Toast

Green-themed toast for successful operations.

```tsx
import { Toast } from './Toast';

<Toast
  message="Data saved successfully"
  type="success"
  isVisible={showSuccess}
  onClose={() => setShowSuccess(false)}
/>
```

**Icon**: Checkmark icon in green
**Border**: Left border in primary green
**ARIA Role**: `role="status"`, `aria-live="polite"`

#### Info Toast

Blue-themed toast for informational messages.

```tsx
<Toast
  message="New message received"
  type="info"
  isVisible={showInfo}
  onClose={() => setShowInfo(false)}
/>
```

**Icon**: Info circle icon in blue
**Border**: Left border in blue
**ARIA Role**: `role="status"`, `aria-live="polite"`

#### Error Toast

Red-themed toast for error messages.

```tsx
<Toast
  message="Failed to save data"
  type="error"
  isVisible={showError}
  onClose={() => setShowError(false)}
/>
```

**Icon**: Exclamation triangle icon in red
**Border**: Left border in red
**ARIA Role**: `role="alert"`, `aria-live="assertive"`

### Auto-Dismiss Duration

Configure how long toast displays before auto-dismissing.

```tsx
<Toast
  message="Short toast (2s)"
  duration={2000}
  type="success"
  isVisible={isVisible}
  onClose={handleClose}
/>

<Toast
  message="Long toast (5s)"
  duration={5000}
  type="info"
  isVisible={isVisible}
  onClose={handleClose}
/>
```

**Behavior**:
- Timer starts when toast becomes visible
- Timer pauses when mouse hovers over toast
- Timer resumes when mouse leaves toast
- Toast dismisses when timer reaches 0
- Duration is reset if toast re-appears

### Pause on Hover

Automatic pause when user hovers, preventing premature dismissal.

```tsx
<Toast
  message="Long message to read carefully"
  type="info"
  isVisible={isVisible}
  onClose={handleClose}
  duration={5000}
/>
```

**User Experience**:
- User can read message without toast disappearing
- Timer pauses during hover
- Timer resumes when mouse leaves toast
- Useful for long messages or important notifications

### Keyboard Controls

Press Escape key to dismiss toast immediately.

```tsx
<Toast
  message="Press Escape to close"
  type="info"
  isVisible={isVisible}
  onClose={handleClose}
/>
```

**Behavior**:
- Escape key triggers `onClose` callback
- Works even if toast is not focused
- Accessibility: Screen reader users can dismiss easily

### Focus Management

Component manages focus for accessibility:

```tsx
const [showToast, setShowToast] = useState(false);

// Toast appears
setShowToast(true);
// Toast receives focus automatically

// Toast dismisses
setShowToast(false);
// Focus returns to previous element
```

**Behavior**:
- Toast receives focus when `isVisible` becomes `true`
- Previous focused element is saved
- When toast closes, focus returns to saved element
- Improves keyboard navigation and screen reader experience

### Accessibility Features

The Toast component includes comprehensive accessibility support:

1. **ARIA Role**: `role="alert"` for errors, `role="status"` for info/success
2. **ARIA Live Region**: `aria-live="assertive"` for errors, `aria-live="polite"` for others
3. **ARIA Atomic**: `aria-atomic="true"` ensures entire toast is announced
4. **Keyboard Support**: Escape key to dismiss
5. **Focus Management**: Auto-focus and focus restoration
6. **Pause on Hover**: Prevents premature dismissal while reading
7. **Icons**: Descriptive icons for visual feedback
8. **Colors**: Color-coded for different toast types
9. **Dismiss Button**: IconButton with proper ARIA label

```tsx
<Toast
  message="Operation completed successfully"
  type="success"
  isVisible={showSuccess}
  onClose={handleClose}
  duration={4000}
/>
```

**Screen Reader Experience**:
- "Operation completed successfully" is announced via live region
- User can press Escape to dismiss
- Focus returns to previous element automatically
- No blocking interactions with rest of page

### Dark Mode

All toast types automatically support dark mode:

- **Background**: Semi-transparent white/neutral overlay with backdrop blur
- **Border Colors**: 
  - Success: `border-l-primary-500`
  - Info: `border-l-blue-500`
  - Error: `border-l-red-500`
- **Icons**: Adapt colors to theme
- **Text**: `text-neutral-900 dark:text-white`

### Real-World Examples

#### Success Toast

```tsx
function SaveButton() {
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveData();
      setShowToast(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <>
      <Button onClick={handleSave} isLoading={saving}>
        Save
      </Button>
      <Toast
        message="Data saved successfully"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
```

#### Error Toast

```tsx
function DeleteButton({ itemId }) {
  const [showError, setShowError] = useState(false);
  
  const handleDelete = async () => {
    try {
      await deleteItem(itemId);
    } catch (error) {
      setShowError(true);
    }
  };
  
  return (
    <>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
      <Toast
        message="Failed to delete item"
        type="error"
        isVisible={showError}
        onClose={() => setShowError(false)}
      />
    </>
  );
}
```

#### Info Toast with Long Duration

```tsx
function NotificationDisplay() {
  const [showToast, setShowToast] = useState(false);
  
  const showNotification = (message: string) => {
    setShowToast(true);
  };
  
  return (
    <Toast
      message="You have a new message from Admin. Please check your inbox for important announcements."
      type="info"
      isVisible={showToast}
      onClose={() => setShowToast(false)}
      duration={8000}
    />
  );
}
```

#### Integration with Toast Hook

```tsx
function ComponentWithToast() {
  const { showSuccessToast, showErrorToast } = useToast();
  
  const handleSubmit = async () => {
    try {
      await submitForm();
      showSuccessToast('Form submitted successfully');
    } catch (error) {
      showErrorToast('Failed to submit form');
    }
  };
  
  return (
    <Button onClick={handleSubmit}>
      Submit
    </Button>
  );
}
```

### Performance Considerations

The Toast component is optimized using:
- Functional component with hooks
- Efficient timer management with cleanup
- Proper focus restoration
- CSS-only animations and transitions
- No unnecessary re-renders
- Custom easing function for smooth animations
- Memoized event handlers with `useCallback`

### Styling Details

The component uses these Tailwind CSS classes:

**Container**:
- Fixed position: `fixed top-20 right-4 sm:top-6 sm:right-6`
- Z-index: `z-50`
- Padding: `px-5 py-4`
- Rounded: `rounded-xl`
- Shadow: `shadow-float`
- Flex layout: `flex items-center gap-3`
- Transition: `transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`
- Transform: `transform`
- Max width: `max-w-md`
- Border: `border`
- Backdrop blur: `backdrop-blur-xl`

**Type-Specific**:
- **Success**: `border-l-4 border-l-primary-500` with green icon
- **Info**: `border-l-4 border-l-blue-500` with blue icon
- **Error**: `border-l-4 border-l-red-500` with red icon

**Visibility States**:
- **Visible**: `translate-x-0 opacity-100`
- **Hidden**: `translate-x-full opacity-0 pointer-events-none`

### Migration Guide

To migrate existing toast implementations:

**Before:**
```tsx
{showToast && (
  <div className="fixed top-20 right-4 px-4 py-3 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border-l-4 border-l-green-500 flex items-center gap-3">
    <svg className="w-6 h-6 text-green-600">
      {/* Check icon */}
    </svg>
    <span>{message}</span>
    <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
      <CloseIcon />
    </button>
  </div>
)}
```

**After:**
```tsx
import { Toast } from './Toast';

<Toast
  message={message}
  type="success"
  isVisible={showToast}
  onClose={onClose}
/>
```

**Benefits:**
- ✅ Consistent styling across application
- ✅ Improved accessibility with proper ARIA support
- ✅ Built-in keyboard controls (Escape key)
- ✅ Pause on hover functionality
- ✅ Auto-dismiss with countdown
- ✅ Focus management
- ✅ Smooth animations
- ✅ Dark mode support
- ✅ Reduced code duplication
- ✅ Type-safe props

### Test Coverage

The Toast component has comprehensive test coverage:

Run tests with:
```bash
npm test src/components/ui/__tests__/Toast.test.tsx
```

Test scenarios include:
- Rendering with all toast types (success, info, error)
- Rendering with custom messages
- Rendering with custom duration
- Keyboard controls (Escape key)
- Mouse enter/leave pause behavior
- Auto-dismiss after duration
- onClose callback invocation
- Focus management (focus on show, restore on hide)
- ARIA attributes (role, aria-live, aria-atomic)
- Visibility classes (translate-x-0 vs translate-x-full)
- Opacity transitions
- Dismiss button rendering
- Dismiss button click handling
- Icon rendering for each type
- Border colors for each type
- Dark mode styling
- Custom className application
- Accessibility features (pause-on-hover, focus trap)

### Usage in Application

Currently integrated throughout the application for all toast notifications.

**Common Patterns:**

```tsx
// Success toast
<Toast message="Saved successfully" type="success" isVisible={show} onClose={close} />

// Info toast
<Toast message="New message" type="info" isVisible={show} onClose={close} />

// Error toast
<Toast message="Failed to load" type="error" isVisible={show} onClose={close} />

// Custom duration
<Toast message="Long message" type="info" duration={5000} isVisible={show} onClose={close} />

// With useToast hook
const { showSuccessToast } = useToast();
showSuccessToast('Operation completed');
```

### Future Enhancements

Potential improvements to consider:
- Progress bar toast (upload/download progress)
- Action buttons in toast (e.g., "Undo", "Retry")
- Stacked toasts (multiple notifications)
- Custom position options (top-left, bottom-right, etc.)
- Sound notifications
- Dismiss timeout with countdown display
- Grouped notifications (e.g., "3 new messages")

---

## Pagination Component

**Location**: `src/components/ui/Pagination.tsx`

A pagination component with 3 variants, items per page selector, and keyboard navigation.

### Features

- **3 Variants**: `default`, `compact`, `minimal`
- **3 Sizes**: `sm`, `md`, `lg`
- **Page Numbers**: Ellipsis for large page counts
- **Items Per Page**: Configurable dropdown
- **Total Count**: Display showing X to Y of Z
- **Keyboard Nav**: Previous/Next buttons with ARIA
- **Auto Hide**: Hides when 1 or fewer pages

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentPage` | `number` | **Required** | Current page (1-indexed) |
| `totalPages` | `number` | **Required** | Total number of pages |
| `totalItems` | `number` | **Required** | Total item count |
| `itemsPerPage` | `number` | **Required** | Items per page |
| `onPageChange` | `(page: number) => void` | **Required** | Page change handler |
| `onItemsPerPageChange` | `(itemsPerPage: number) => void` | `undefined` | Page size change handler |
| `variant` | `'default'` \| `'compact'` \| `'minimal'` | `'default'` | Pagination style |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Text/button size |
| `showItemsPerPageSelector` | `boolean` | `true` | Show items per page dropdown |
| `showTotalCount` | `boolean` | `true` | Show "X to Y of Z" text |
| `maxVisiblePages` | `number` | `5` | Maximum page numbers to show |
| `ariaLabel` | `string` | `'Pagination navigation'` | ARIA label |
| `className` | `string` | `''` | Additional CSS classes |

### Default Variant

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={handlePageChange}
  onItemsPerPageChange={handlePageSizeChange}
/>
```

Shows: Total count, Previous/Next buttons, Page numbers, Items per page selector.

### Compact Variant

```tsx
<Pagination
  variant="compact"
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={handlePageChange}
/>
```

Shows: Previous/Next buttons, Page numbers (no total count).

### Minimal Variant

```tsx
<Pagination
  variant="minimal"
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={handlePageChange}
/>
```

Shows: Previous/Next buttons, "X / Y" counter (no page numbers).

### Without Items Per Page

```tsx
<Pagination
  showItemsPerPageSelector={false}
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={handlePageChange}
/>
```

### Without Total Count

```tsx
<Pagination
  showTotalCount={false}
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={handlePageChange}
/>
```

### Custom Max Visible Pages

```tsx
<Pagination
  maxVisiblePages={7}
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={handlePageChange}
/>
```

### Accessibility

- **Navigation Role**: `role="navigation"` on container
- **ARIA Labels**: `aria-label` for buttons
- **Current Page**: `aria-current="page"` on active page button
- **Disabled States**: `disabled` attribute on first/last buttons

---


## Loading Components

### EmptyState Component

**Location**: `src/components/ui/LoadingState.tsx` (exported)

A reusable empty state component with optional action button.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | **Required** | Empty state message |
| `icon` | `ReactNode` | `undefined` | Custom icon |
| `action` | `{ label: string; onClick: () => void }` | `undefined` | Action button |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Component size |
| `variant` | `'default'` \| `'minimal'` \| `'illustrated'` | `'default'` | Visual style |
| `ariaLabel` | `string` | `undefined` | ARIA label |

### Usage

```tsx
<EmptyState
  message="Tidak ada data"
  icon={<DocumentIcon />}
  action={{
    label: 'Tambah Data',
    onClick: handleAdd,
  }}
/>
```

### ErrorState Component

**Location**: `src/components/ui/LoadingState.tsx` (exported)

An error state component with retry button.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | **Required** | Error message |
| `onRetry` | `() => void` | `undefined` | Retry handler |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Component size |

### Usage

```tsx
<ErrorState
  message="Gagal memuat data"
  onRetry={handleRetry}
/>
```

---

### LoadingSpinner Component

**Location**: `src/components/ui/LoadingSpinner.tsx`

A loading spinner component with 4 colors, 3 sizes, and full-screen option.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Spinner size |
| `color` | `'primary'` \| `'neutral'` \| `'success'` \| `'error'` | `'primary'` | Spinner color |
| `text` | `string` | `undefined` | Loading text message |
| `fullScreen` | `boolean` | `false` | Full-screen overlay |
| `className` | `string` | `''` | Additional CSS classes |

### Sizes

```tsx
<LoadingSpinner size="sm" />   {/* h-4 w-4 */}
<LoadingSpinner size="md" />   {/* h-8 w-8 */}
<LoadingSpinner size="lg" />   {/* h-12 w-12 */}
```

### Colors

```tsx
<LoadingSpinner color="primary" />  {/* Blue */}
<LoadingSpinner color="neutral" />  {/* Gray */}
<LoadingSpinner color="success" />  {/* Green */}
<LoadingSpinner color="error" />    {/* Red */}
```

### With Text

```tsx
<LoadingSpinner
  text="Memuat data..."
  size="md"
  color="primary"
/>
```

### Full Screen

```tsx
<LoadingSpinner
  fullScreen
  text="Harap tunggu..."
  size="lg"
/>
```

---

### LoadingOverlay Component

**Location**: `src/components/ui/LoadingOverlay.tsx`

An overlay loading component with optional progress bar and backdrop.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | `boolean` | **Required** | Show loading state |
| `message` | `string` | `'Loading...'` | Loading message |
| `size` | `'sm'` \| `'md'` \| `'lg'` \| `'full'` | `'md'` | Content size |
| `variant` | `'default'` \| `'minimal'` \| `'centered'` | `'default'` | Overlay style |
| `showBackdrop` | `boolean` | `true` | Show backdrop |
| `backdropBlur` | `boolean` | `true` | Blur backdrop |
| `progress` | `number` | `undefined` | Progress percentage (0-100) |
| `showProgress` | `boolean` | `false` | Show progress bar |
| `className` | `string` | `''` | Additional CSS classes |
| `children` | `ReactNode` | `undefined` | Content (hidden when loading) |

### Variants

```tsx
// Default: Min-height container
<LoadingOverlay isLoading={loading}>
  {/* Content */}
</LoadingOverlay>

// Minimal: Simple overlay
<LoadingOverlay isLoading={loading} variant="minimal">
  {/* Content */}
</LoadingOverlay>

// Centered: Fixed position modal-style
<LoadingOverlay isLoading={loading} variant="centered">
  {/* Content */}
</LoadingOverlay>
```

### With Progress Bar

```tsx
<LoadingOverlay
  isLoading={uploading}
  message={`Uploading: ${fileName}`}
  progress={uploadProgress}
  showProgress
>
  {/* Content */}
</LoadingOverlay>
```

### Backdrop Options

```tsx
// No backdrop
<LoadingOverlay
  isLoading={loading}
  showBackdrop={false}
>
  {/* Content */}
</LoadingOverlay>

// No blur
<LoadingOverlay
  isLoading={loading}
  backdropBlur={false}
>
  {/* Content */}
</LoadingOverlay>
```

---

### Skeleton Component

**Location**: `src/components/ui/Skeleton.tsx`

Skeleton loading placeholders with 3 variants and 2 animations.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes |
| `variant` | `'text'` \| `'rectangular'` \| `'circular'` | `'rectangular'` | Shape variant |
| `width` | `string \| number` | `undefined` | Custom width |
| `height` | `string \| number` | `undefined` | Custom height |
| `animation` | `'pulse'` \| `'wave'` | `'pulse'` | Animation type |

### Basic Usage

```tsx
<Skeleton variant="text" width={200} height={20} />
<Skeleton variant="rectangular" width="100%" height={150} />
<Skeleton variant="circular" width={48} height={48} />
```

### Variants

```tsx
{/* Text placeholder */}
<Skeleton variant="text" width="75%" height={16} />

{/* Rectangular (image/card) */}
<Skeleton variant="rectangular" width="100%" height={200} />

{/* Circular (avatar) */}
<Skeleton variant="circular" width={48} height={48} />
```

### Animations

```tsx
<Skeleton animation="pulse" />   {/* Pulse animation */}
<Skeleton animation="wave" />    {/* Wave gradient animation */}
```

### Pre-built Skeletons

#### CardSkeleton

```tsx
import { CardSkeleton } from './Skeleton';

<CardSkeleton />
```

Renders: Image placeholder + 3 text lines.

#### ListItemSkeleton

```tsx
import { ListItemSkeleton } from './Skeleton';

<ListItemSkeleton />
```

Renders: Circular avatar + 2 text lines.

#### TableSkeleton

```tsx
import { TableSkeleton } from './Skeleton';

<TableSkeleton rows={5} cols={4} />
```

Renders: Table with 5 rows, 4 columns.

---


## ProgressBar Component

**Location**: `src/components/ui/ProgressBar.tsx`

A progress bar component with 12 colors, 4 sizes, 3 variants, and label support.

### Features

- **4 Sizes**: `sm`, `md`, `lg`, `xl`
- **12 Colors**: primary, secondary, success, error, warning, info, purple, indigo, orange, red, blue, green
- **3 Variants**: `default`, `striped`, `animated`
- **Label Support**: Optional label overlay (xl size only)
- **Accessibility**: Full ARIA progressbar role
- **Smooth Transitions**: 300ms transition duration
- **Dark Mode**: Consistent colors

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | **Required** | Current progress value |
| `max` | `number` | `100` | Maximum value |
| `size` | `'sm'` \| `'md'` \| `'lg'` \| `'xl'` | `'md'` | Bar height |
| `color` | `ProgressBarColor` | `'primary'` | Bar color |
| `variant` | `'default'` \| `'striped'` \| `'animated'` | `'default'` | Visual style |
| `showLabel` | `boolean` | `false` | Show percentage label (xl size only) |
| `label` | `string` | `undefined` | Custom label text |
| `fullWidth` | `boolean` | `true` | Full width bar |
| `className` | `string` | `''` | Additional CSS classes |
| `aria-label` | `string` | `undefined` | ARIA label |
| `aria-valuenow` | `number` | `undefined` | ARIA current value |
| `aria-valuemin` | `number` | `0` | ARIA minimum value |
| `aria-valuemax` | `number` | `undefined` | ARIA maximum value |

### Sizes

```tsx
<ProgressBar value={50} size="sm" />   {/* h-1.5 */}
<ProgressBar value={50} size="md" />   {/* h-2 */}
<ProgressBar value={50} size="lg" />   {/* h-2.5 */}
<ProgressBar value={50} size="xl" />   {/* h-6, supports label */}
```

### Colors

```tsx
<ProgressBar color="primary" value={50} />
<ProgressBar color="success" value={75} />
<ProgressBar color="warning" value={25} />
<ProgressBar color="error" value={10} />
<ProgressBar color="neutral" value={60} />
```

### Variants

```tsx
{/* Default: Solid color */}
<ProgressBar variant="default" value={50} />

{/* Striped: Static stripes */}
<ProgressBar variant="striped" value={50} />

{/* Animated: Moving stripes */}
<ProgressBar variant="animated" value={50} />
```

### With Label

```tsx
<ProgressBar
  value={75}
  size="xl"
  showLabel
  label="Processing"
/>
```

Shows percentage inside bar.

### Custom ARIA

```tsx
<ProgressBar
  value={50}
  max={200}
  aria-label="Upload progress"
  aria-valuenow={50}
  aria-valuemin={0}
  aria-valuemax={200}
/>
```

### Dynamic Progress

```tsx
const [progress, setProgress] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setProgress(p => Math.min(p + 1, 100));
  }, 100);
  return () => clearInterval(interval);
}, []);

<ProgressBar
  value={progress}
  size="md"
  color="primary"
  variant="animated"
  label="Uploading..."
/>
```

### Accessibility

- **Progress Role**: `role="progressbar"` on container
- **Value Now**: `aria-valuenow` for current value
- **Value Min/Max**: `aria-valuemin` and `aria-valuemax`
- **Labels**: `aria-label` for descriptive text
- **Hidden Label**: `aria-hidden` on text inside bar

---


## Utility Components

### PageHeader Component

**Location**: `src/components/ui/PageHeader.tsx`

A page header component with back button, title, subtitle, and action area.

### Features

- **3 Sizes**: `sm`, `md`, `lg`
- **Back Button**: Optional back button with customizable label
- **Back Button Variants**: `primary`, `green`, `custom`
- **Actions**: Optional action buttons/elements
- **Responsive**: Flex layout adapts to screen size
- **Accessibility**: Semantic heading structure

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **Required** | Page title |
| `subtitle` | `string` | `undefined` | Page subtitle |
| `showBackButton` | `boolean` | `false` | Show back button |
| `backButtonLabel` | `string` | `'Kembali'` | Back button text |
| `backButtonVariant` | `'primary'` \| `'green'` \| `'custom'` | `'primary'` | Back button style |
| `onBackButtonClick` | `() => void` | `undefined` | Back button click handler |
| `actions` | `ReactNode` | `undefined` | Action buttons area |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Header size |
| `className` | `string` | `''` | Additional CSS classes |

### Basic Usage

```tsx
<PageHeader
  title="Manajemen User"
  subtitle="Kelola data user dan hak akses"
/>
```

### With Back Button

```tsx
<PageHeader
  title="Edit User"
  showBackButton
  onBackButtonClick={() => navigate(-1)}
/>
```

### With Actions

```tsx
<PageHeader
  title="Daftar Siswa"
  actions={
    <div className="flex gap-2">
      <Button variant="primary" onClick={handleAdd}>
        Tambah Siswa
      </Button>
      <Button variant="secondary" onClick={handleExport}>
        Export
      </Button>
    </div>
  }
/>
```

### With Subtitle

```tsx
<PageHeader
  title="Dashboard"
  subtitle="Selamat datang kembali, {user.name}"
/>
```

### Complete Example

```tsx
<PageHeader
  title="Manajemen Akademik"
  subtitle="Kelola nilai, jadwal, dan absensi"
  showBackButton
  backButtonLabel="Kembali ke Dashboard"
  onBackButtonClick={() => navigate('/dashboard')}
  backButtonVariant="primary"
  actions={
    <div className="flex gap-2">
      <Button variant="secondary" onClick={handleRefresh}>
        Refresh
      </Button>
      <Button variant="primary" onClick={handleAdd}>
        Tambah Baru
      </Button>
    </div>
  }
  size="lg"
/>
```

### Sizes

```tsx
<PageHeader size="sm"> {/* text-xl */}
  <h3>Small Title</h3>
</PageHeader>

<PageHeader size="md"> {/* text-2xl sm:text-xl */}
  <h2>Medium Title</h2>
</PageHeader>

<PageHeader size="lg"> {/* text-3xl sm:text-2xl */}
  <h1>Large Title</h1>
</PageHeader>
```

---

### ErrorMessage Component

**Location**: `src/components/ui/ErrorMessage.tsx`

A reusable error message component with 2 variants and icon support.

### Features

- **2 Variants**: `inline`, `card`
- **Icon Support**: Optional icon element
- **Custom Title**: Override default "Error" title
- **Semantic HTML**: `role="alert"` for accessibility
- **Responsive**: Adapts to content

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Error'` | Error title (card variant only) |
| `message` | `string` | **Required** | Error message |
| `variant` | `'inline'` \| `'card'` | `'card'` | Display style |
| `icon` | `ReactNode` | `undefined` | Custom error icon |
| `className` | `string` | `''` | Additional CSS classes |

### Inline Variant

```tsx
<ErrorMessage
  message="Gagal memuat data"
  variant="inline"
/>
```

Simple inline error message.

### Card Variant

```tsx
<ErrorMessage
  title="Error Jaringan"
  message="Tidak dapat terhubung ke server. Periksa koneksi Anda."
  variant="card"
/>
```

Full card with title and message.

### With Icon

```tsx
<ErrorMessage
  title="Error Upload"
  message="File terlalu besar (max 10MB)"
  variant="card"
  icon={<ExclamationTriangleIcon />}
/>
```

### Custom Styling

```tsx
<ErrorMessage
  message="Field ini wajib diisi"
  variant="inline"
  className="mt-2 text-xs"
/>
```

---

### PDFExportButton Component

**Location**: `src/components/ui/PDFExportButton.tsx`

A PDF export button with loading state and icon.

### Features

- **3 Variants**: `primary`, `secondary`, `ghost`
- **3 Sizes**: `sm`, `md`, `lg`
- **Loading State**: Spinner during export
- **Icon**: Built-in DocumentArrowDownIcon
- **Disabled State**: Prevents clicks during export
- **Dark Mode**: Consistent styling

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onExport` | `() => void` | **Required** | Export handler |
| `loading` | `boolean` | `false` | Loading state |
| `disabled` | `boolean` | `false` | Disabled state |
| `variant` | `'primary'` \| `'secondary'` \| `'ghost'` | `'primary'` | Button style |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'sm'` | Button size |
| `label` | `string` | `'Export PDF'` | Button text |
| `className` | `string` | `''` | Additional CSS classes |

### Basic Usage

```tsx
<PDFExportButton
  onExport={handleExportPDF}
  loading={isExporting}
/>
```

### Custom Label

```tsx
<PDFExportButton
  label="Download Laporan"
  onExport={handleExportPDF}
  variant="primary"
  size="md"
/>
```

### With Disabled State

```tsx
<PDFExportButton
  label="Export PDF"
  onExport={handleExportPDF}
  disabled={!canExport}
  loading={isExporting}
/>
```

### Different Variants

```tsx
<PDFExportButton variant="primary" label="Export PDF" onExport={handleExport} />
<PDFExportButton variant="secondary" label="Export PDF" onExport={handleExport} />
<PDFExportButton variant="ghost" label="Export PDF" onExport={handleExport} />
```

### Different Sizes

```tsx
<PDFExportButton size="sm" label="Export" onExport={handleExport} />
<PDFExportButton size="md" label="Export PDF" onExport={handleExport} />
<PDFExportButton size="lg" label="Export PDF Report" onExport={handleExport} />
```

---

