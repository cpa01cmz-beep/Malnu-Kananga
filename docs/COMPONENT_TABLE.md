# Table Component Documentation

## Overview

The Table component is a flexible, accessible, and fully typed React table component built with TypeScript and Tailwind CSS. It provides a consistent way to display tabular data throughout the application.

## Features

- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA attributes, keyboard navigation, and screen reader support
- **Responsive Design**: Horizontal scrolling on mobile devices
- **Dark Mode**: Full dark mode support with appropriate color classes
- **Customizable**: Multiple variants, sizes, and styling options
- **TypeScript**: Full type safety with comprehensive interfaces
- **Compound Component**: Composed of Table, Thead, Tbody, Tfoot, Tr, Th, and Td subcomponents

## Installation

```tsx
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td } from '@/components/ui/Table';
```

## Usage

### Basic Table

```tsx
<Table>
  <Thead>
    <Tr>
      <Th scope="col">Name</Th>
      <Th scope="col">Email</Th>
      <Th scope="col">Role</Th>
    </Tr>
  </Thead>
  <Tbody>
    <Tr>
      <Td>John Doe</Td>
      <Td>john@example.com</Td>
      <Td>Admin</Td>
    </Tr>
    <Tr>
      <Td>Jane Smith</Td>
      <Td>jane@example.com</Td>
      <Td>Teacher</Td>
    </Tr>
  </Tbody>
</Table>
```

### With Container and Scroll

```tsx
<div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
  <div className="overflow-x-auto">
    <Table>
      <Thead>
        <Tr>
          <Th scope="col">Name</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>John Doe</Td>
        </Tr>
      </Tbody>
    </Table>
  </div>
</div>
```

### With Size Variants

```tsx
<Table size="sm"> {/* sm | md | lg */}
  <Thead>
    <Tr><Th scope="col">Name</Th></Tr>
  </Thead>
  <Tbody>
    <Tr><Td>John</Td></Tr>
  </Tbody>
</Table>
```

### With Variants

```tsx
<Table variant="striped"> {/* default | striped | bordered | simple */}
  <Thead>
    <Tr><Th scope="col">Name</Th></Tr>
  </Thead>
  <Tbody>
    <Tr><Td>John</Td></Tr>
    <Tr><Td>Jane</Td></Tr>
  </Tbody>
</Table>
```

### With Sortable Headers

```tsx
<Table>
  <Thead>
    <Tr>
      <Th sortable sortDirection="asc">Name</Th>
      <Th sortable>Email</Th>
    </Tr>
  </Thead>
  <Tbody>
    <Tr><Td>John Doe</Td><Td>john@example.com</Td></Tr>
  </Tbody>
</Table>
```

### With Selected Rows

```tsx
<Table>
  <Tbody>
    <Tr selected><Td>Selected Row</Td></Tr>
    <Tr><Td>Normal Row</Td></Tr>
  </Tbody>
</Table>
```

### Without Hover Effect

```tsx
<Table>
  <Tbody>
    <Tr hoverable={false}><Td>No Hover</Td></Tr>
  </Tbody>
</Table>
```

### With Footer

```tsx
<Table>
  <Tbody>
    <Tr><Td>Data Row</Td></Tr>
  </Tbody>
  <Tfoot>
    <Tr>
      <Td colSpan={3}>Total: 10 items</Td>
    </Tr>
  </Tfoot>
</Table>
```

### With Accessibility

```tsx
<Table 
  ariaLabel="Student grades"
  description="List of student grades for this semester"
>
  <Thead>
    <Tr>
      <Th scope="col">Name</Th>
      <Th scope="col">Subject</Th>
      <Th scope="col">Grade</Th>
    </Tr>
  </Thead>
  <Tbody>
    <Tr>
      <Td>John Doe</Td>
      <Td>Mathematics</Td>
      <Td>A</Td>
    </Tr>
  </Tbody>
</Table>
```

## API Reference

### Table

Main table container component.

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | - | Table content (Thead, Tbody, Tfoot) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Text size variant |
| `variant` | `'default' \| 'striped' \| 'bordered' \| 'simple'` | `'default'` | Visual style variant |
| `caption` | `string` | - | Accessible caption (hidden visually) |
| `description` | `string` | - | Accessible description for screen readers |
| `ariaLabel` | `string` | - | ARIA label for the table |
| `className` | `string` | - | Additional CSS classes |

### Thead

Table header section.

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | - | Header content (Tr with Th) |
| `className` | `string` | - | Additional CSS classes |

### Tbody

Table body section.

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | - | Body content (Tr with Td) |
| `className` | `string` | - | Additional CSS classes |

### Tfoot

Table footer section.

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | - | Footer content (Tr with Td) |
| `className` | `string` | - | Additional CSS classes |

### Tr

Table row component.

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | - | Row content (Th or Td) |
| `hoverable` | `boolean` | `true` | Enable hover effect |
| `selected` | `boolean` | `false` | Selected state |
| `className` | `string` | - | Additional CSS classes |

### Th

Table header cell component.

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | - | Cell content |
| `scope` | `'col' \| 'row' \| 'colgroup' \| 'rowgroup'` | `'col'` | Cell scope for accessibility |
| `sortable` | `boolean` | `false` | Enable sort indicator |
| `sortDirection` | `'asc' \| 'desc'` | - | Sort direction indicator |
| `className` | `string` | - | Additional CSS classes |

### Td

Table data cell component.

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | - | Cell content |
| `className` | `string` | - | Additional CSS classes |

## Accessibility

The Table component follows WCAG 2.1 AA guidelines:

- **Semantic HTML**: Uses proper `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>` elements
- **ARIA Labels**: Includes `role="table"`, `role="rowgroup"`, `role="row"`, `role="cell"`, `role="columnheader"` attributes
- **Scope Attributes**: All `<th>` elements have `scope` attributes for screen readers
- **Keyboard Navigation**: Fully keyboard accessible via Tab key
- **Screen Reader Support**: Captions and descriptions can be provided for complex tables
- **Focus Indicators**: Clear focus states for keyboard users
- **Sort Indicators**: `aria-sort` attribute for sortable headers (`ascending`, `descending`, `none`)

### Screen Reader Tips

For complex tables, provide descriptions:

```tsx
<Table
  ariaLabel="Student Grade Report"
  description="Student names in column 1, subjects in row headers, grades in data cells"
>
  {/* table content */}
</Table>
```

## Responsive Design

For mobile responsiveness, wrap the table in a scrollable container:

```tsx
<div className="overflow-x-auto">
  <Table>
    {/* table content */}
  </Table>
</div>
```

## Dark Mode

All components support dark mode through Tailwind's `dark:` prefix:

```tsx
<Table className="dark:text-neutral-300">
  <Thead className="dark:bg-neutral-700">
    {/* content */}
  </Thead>
</Table>
```

## Best Practices

1. **Always use thead/tbody/tfoot** for proper semantic structure
2. **Provide scope attributes** on all Th elements
3. **Use ariaLabel** for complex tables or when table content isn't obvious
4. **Add descriptions** for data-heavy tables
5. **Wrap in scrollable container** for tables with many columns
6. **Use hoverable={false}** for read-only tables to avoid confusion
7. **Use selected state** to highlight important rows (e.g., selected student)
8. **Sort indicators** should be used when headers are clickable

## Examples

### Student Grades Table

```tsx
<div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
  <div className="overflow-x-auto">
    <Table ariaLabel="Student grades" description="Grade report for Fall 2024 semester">
      <Thead>
        <Tr>
          <Th scope="col">Name</Th>
          <Th scope="col">Subject</Th>
          <Th scope="col">Assignment</Th>
          <Th scope="col">Mid Exam</Th>
          <Th scope="col">Final Exam</Th>
          <Th scope="col">Grade</Th>
        </Tr>
      </Thead>
      <Tbody>
        {students.map(student => (
          <Tr key={student.id}>
            <Td>{student.name}</Td>
            <Td>{student.subject}</Td>
            <Td>{student.assignment}</Td>
            <Td>{student.midExam}</Td>
            <Td>{student.finalExam}</Td>
            <Td>{student.grade}</Td>
          </Tr>
        ))}
      </Tbody>
      <Tfoot>
        <Tr>
          <Td colSpan={6}>Total Students: {students.length}</Td>
        </Tr>
      </Tfoot>
    </Table>
  </div>
</div>
```

### Sortable Data Table

```tsx
const [sortColumn, setSortColumn] = useState('name');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

<Table>
  <Thead>
    <Tr>
      <Th 
        sortable 
        sortDirection={sortColumn === 'name' ? sortDirection : undefined}
        onClick={() => toggleSort('name')}
      >
        Name
      </Th>
      <Th 
        sortable 
        sortDirection={sortColumn === 'email' ? sortDirection : undefined}
        onClick={() => toggleSort('email')}
      >
        Email
      </Th>
    </Tr>
  </Thead>
  <Tbody>
    {/* sorted data */}
  </Tbody>
</Table>
```

## Migration Guide

### From Native HTML Tables

**Before:**
```tsx
<table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
  <thead className="bg-neutral-50 dark:bg-neutral-700 text-xs uppercase font-semibold text-neutral-500 dark:text-neutral-400">
    <tr>
      <th className="px-6 py-4">Name</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
      <td className="px-6 py-4">John</td>
    </tr>
  </tbody>
</table>
```

**After:**
```tsx
<Table>
  <Thead>
    <Tr>
      <Th scope="col">Name</Th>
    </Tr>
  </Thead>
  <Tbody>
    <Tr>
      <Td>John</Td>
    </Tr>
  </Tbody>
</Table>
```

## Test Coverage

The Table component has comprehensive test coverage with 29 test cases covering:
- Basic rendering with default props
- Size variants (sm, md, lg)
- Style variants (default, striped, bordered, simple)
- Accessibility attributes (aria-label, scope, roles)
- Sortable headers with indicators
- Selected row states
- Hover effects
- Dark mode classes
- Complete table integration

Run tests with:
```bash
npm test -- Table.test.tsx
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Components

- [Card](./Card.md) - Use Card to wrap Table with consistent styling
- [Button](./Button.md) - For action buttons in tables
- [Input](./Input.md) - For inline editing in tables
- [Modal](./Modal.md) - For detailed views from table rows
