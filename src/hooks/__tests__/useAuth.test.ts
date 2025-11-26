import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useAuth Hook', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('initializes with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('handles login successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser, token: 'mock-token' }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('auth_token')).toBe('mock-token');
  });

  test('handles login failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'wrong-password');
    });

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  test('handles logout', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    localStorage.setItem('auth_token', 'mock-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      result.current.logout();
    });

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('auth_token')).toBe(null);
  });

  test('persists authentication across page reloads', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    localStorage.setItem('auth_token', 'mock-token');
    localStorage.setItem('user_data', JSON.stringify(mockUser));

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.checkAuth();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('handles token refresh', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    localStorage.setItem('auth_token', 'expired-token');

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, token: 'new-token' }),
      });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.checkAuth();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('auth_token')).toBe('new-token');
  });

  test('handles registration', async () => {
    const mockUser = { id: '1', email: 'new@example.com', name: 'New User' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser, token: 'mock-token' }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('new@example.com', 'password', 'New User');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('validates email format', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('invalid-email', 'password');
    });

    expect(result.current.error).toContain('email');
  });

  test('handles password reset', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Password reset email sent' }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.resetPassword('test@example.com');
    });

    expect(result.current.success).toBeTruthy();
  });

  test('updates user profile', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    const updatedUser = { ...mockUser, name: 'Updated Name' };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: updatedUser }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.updateProfile({ name: 'Updated Name' });
    });

    expect(result.current.user.name).toBe('Updated Name');
  });

  test('handles network errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isAuthenticated).toBe(false);
  });
});