# Test Generator Skill

## Description
Generate test files for components, services, hooks, and other code following the MA Malnu Kananga project patterns.

## Instructions

When asked to create tests for existing code:

1. **Test File Location**: Create tests in appropriate locations:
   - Components: `src/components/__tests__/ComponentName.test.tsx`
   - Services: `src/services/__tests__/serviceName.test.ts`
   - Hooks: `src/hooks/__tests__/useHookName.test.ts`
   - Utilities: `src/utils/__tests__/utilName.test.ts`

2. **Component Test Template**:
   ```typescript
   import { render, screen, fireEvent, waitFor } from '@testing-library/react';
   import { describe, it, expect, vi, beforeEach } from 'vitest';
   import ComponentName from '../ComponentName';
   
   describe('ComponentName', () => {
     const defaultProps = {};
     
     beforeEach(() => {
       vi.clearAllMocks();
     });
     
     it('renders correctly with default props', () => {
       render(<ComponentName {...defaultProps} />);
       expect(screen.getByText(/text/i)).toBeInTheDocument();
     });
     
     it('renders correctly with custom props', () => {
       render(<ComponentName title="Test Title" />);
       expect(screen.getByText('Test Title')).toBeInTheDocument();
     });
     
     it('handles user interactions', async () => {
       const onAction = vi.fn();
       render(<ComponentName onAction={onAction} />);
       
       fireEvent.click(screen.getByRole('button'));
       expect(onAction).toHaveBeenCalled();
     });
     
     it('displays loading state', () => {
       render(<ComponentName loading />);
       expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
     });
     
     it('displays error state', () => {
       render(<ComponentName error="Test error" />);
       expect(screen.getByText(/test error/i)).toBeInTheDocument();
     });
     
     it('is accessible', () => {
       render(<ComponentName />);
       expect(screen.getByRole('button')).toHaveAttribute('aria-label');
     });
   });
   ```

3. **Service Test Template**:
   ```typescript
   import { describe, it, expect, vi, beforeEach } from 'vitest';
   import { functionName } from '../serviceName';
   import { logger } from '../../utils/logger';
   import { errorHandler } from '../../utils/errorHandler';
   
   vi.mock('../../utils/logger');
   vi.mock('../../utils/errorHandler');
   
   describe('serviceName', () => {
     beforeEach(() => {
       vi.clearAllMocks();
     });
     
     it('should return success response', async () => {
       const mockData = {};
       global.fetch = vi.fn(() =>
         Promise.resolve({
           ok: true,
           json: () => Promise.resolve(mockData),
         } as Response)
       );
       
       const result = await functionName({ param: 'value' });
       
       expect(result.success).toBe(true);
       expect(result.data).toEqual(mockData);
     });
     
     it('should handle API errors', async () => {
       global.fetch = vi.fn(() =>
         Promise.resolve({
           ok: false,
           status: 500,
         } as Response)
       );
       
       const result = await functionName({ param: 'value' });
       
       expect(result.success).toBe(false);
       expect(result.error).toBeDefined();
     });
     
     it('should log errors', async () => {
       global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
       
       await functionName({ param: 'value' });
       
       expect(logger.error).toHaveBeenCalled();
       expect(errorHandler.handleError).toHaveBeenCalled();
     });
   });
   ```

4. **Hook Test Template**:
   ```typescript
   import { renderHook, act, waitFor } from '@testing-library/react';
   import { describe, it, expect, vi, beforeEach } from 'vitest';
   import { useHookName } from '../useHookName';
   
   describe('useHookName', () => {
     beforeEach(() => {
       vi.clearAllMocks();
     });
     
     it('initializes with default values', () => {
       const { result } = renderHook(() => useHookName());
       
       expect(result.current.data).toBeNull();
       expect(result.current.loading).toBe(false);
       expect(result.current.error).toBeNull();
     });
     
     it('loads data on mount', async () => {
       const { result } = renderHook(() => useHookName({ id: '123' }));
       
       expect(result.current.loading).toBe(true);
       
       await waitFor(() => {
         expect(result.current.loading).toBe(false);
       });
       
       expect(result.current.data).toBeDefined();
     });
     
     it('handles errors', async () => {
       const { result } = renderHook(() => useHookName({ id: 'invalid' }));
       
       await waitFor(() => {
         expect(result.current.error).not.toBeNull();
       });
     });
     
     it('resets state when reset is called', () => {
       const { result } = renderHook(() => useHookName());
       
       act(() => {
         result.current.reset();
       });
       
       expect(result.current.data).toBeNull();
       expect(result.current.error).toBeNull();
     });
   });
   ```

5. **Best Practices**:
   - Test user behavior, not implementation details
   - Use `screen.getBy...` queries for elements users can see
   - Mock external dependencies (API calls, services)
   - Test all code paths (success, error, loading)
   - Test accessibility (aria attributes, keyboard navigation)
   - Clean up mocks in `beforeEach`
   - Use `waitFor` for async operations
   - Test edge cases and boundary conditions

6. **What to Test**:
   - **Components**:
     - Rendering with different props
     - User interactions (clicks, inputs, forms)
     - Loading states
     - Error states
     - Accessibility
     - Conditional rendering
   
   - **Services**:
     - Success cases
     - Error cases
     - Network errors
     - Invalid inputs
     - Logging and error handling
   
   - **Hooks**:
     - Initial state
     - State updates
     - Side effects (useEffect)
     - Callback execution
     - Cleanup functions
   
   - **Utilities**:
     - Input validation
     - Output formatting
     - Edge cases
     - Performance

7. **Testing Anti-Patterns**:
   - Don't test internal implementation
   - Don't test third-party libraries
   - Don't test React itself
   - Don't over-mock (only mock what's necessary)
   - Don't test multiple concerns in one test

8. **Running Tests**:
   - Run all tests: `npm run test:run`
   - Run in watch mode: `npm test`
   - Run specific test file: `npm test -- path/to/test.test.ts`
   - Run with UI: `npm run test:ui`
   - Check coverage: `npm run test:coverage`

## Examples

See existing tests for patterns:
- `src/components/__tests__/` - Component test patterns
- `src/services/__tests__/` - Service test patterns
- `src/hooks/__tests__/` - Hook test patterns

## Notes

- Always run `npm run typecheck` and `npm run lint:fix` after creating tests
- Tests should be independent and not rely on each other
- Use descriptive test names
- Keep tests simple and readable
- Aim for high coverage but focus on critical paths
