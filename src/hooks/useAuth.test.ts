import { useAuth } from './useAuth';
import { renderHook } from '@testing-library/react';

describe('useAuth', () => {
  test('provides authentication state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current).toBeDefined();
  });
});