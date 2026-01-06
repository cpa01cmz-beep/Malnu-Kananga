# React Component Generator Skill

## Description
Generate React components following the MA Malnu Kananga project patterns.

## Instructions

When asked to create a new React component:

1. **File Location**: Place components in the appropriate location under `src/components/`

2. **Component Structure**:
   ```typescript
   import React, { useState, useEffect } from 'react';

   // Props interface
   interface ComponentNameProps {
     // prop fields with types
     title?: string;
     onAction?: () => void;
     data?: DataType;
   }

   // Component
   export const ComponentName: React.FC<ComponentNameProps> = ({
     title,
     onAction,
     data
   }) => {
     // State hooks
     const [state, setState] = useState<Type>(initialValue);

     // Effects
     useEffect(() => {
       // effect logic
     }, [dependencies]);

     // Event handlers
     const handleAction = () => {
       // handler logic
     };

     // Render
     return (
       <div className="tailwind-classes">
         {/* JSX content */}
       </div>
     );
   };

   export default ComponentName;
   ```

3. **Best Practices**:
   - Use functional components with hooks (no class components)
   - Use TypeScript interfaces for props
   - Use Tailwind CSS classes for styling
   - Keep components focused and single-responsibility
   - Implement proper accessibility (aria attributes, keyboard nav)
   - Handle loading and error states
   - Use semantic HTML elements

4. **Performance**:
   - Use `React.memo` for components that re-render frequently
   - Use `useMemo` for expensive calculations
   - Use `useCallback` for event handlers passed to child components
   - Lazy load routes with React.lazy()
   - Optimize images and assets

5. **Styling**:
   - Use Tailwind CSS utility classes
   - Follow existing design system
   - Use responsive prefixes (md:, lg:, xl:)
   - Keep styling consistent with the app theme
   - Avoid inline styles

6. **Testing**: Always create tests in `__tests__/` folders:
   ```typescript
   import { render, screen } from '@testing-library/react';
   import { describe, it, expect, vi } from 'vitest';
   import ComponentName from './ComponentName';

   describe('ComponentName', () => {
     it('renders correctly', () => {
       render(<ComponentName />);
       expect(screen.getByText(/text/i)).toBeInTheDocument();
     });

     it('calls handler on action', async () => {
       const handler = vi.fn();
       render(<ComponentName onAction={handler} />);
       // interact and test
     });
   });
   ```

7. **Patterns from the project**:
   - See existing components for patterns
   - Use hooks from `src/hooks/` for reusable logic
   - Use services from `src/services/` for data fetching
   - Use constants from `src/constants.ts` for configuration
   - Implement proper error boundaries for major features

## Examples

Check existing components to understand patterns:
- Dashboard components - Layout patterns
- Form components - Input handling patterns
- List components - Rendering patterns
- Modal components - Overlay patterns
