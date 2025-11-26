import { renderHook } from '@testing-library/react';
import { useApiQueries } from './useApiQueries';

describe('useApiQueries', () => {
  test('returns default state', () => {
    const { result } = renderHook(() => useApiQueries());
    expect(result.current).toBeDefined();
  });
});