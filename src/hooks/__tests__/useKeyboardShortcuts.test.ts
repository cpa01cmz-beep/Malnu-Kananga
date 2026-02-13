import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, KeyboardShortcut } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts Hook', () => {
  const mockAction = vi.fn();
  const mockAction2 = vi.fn();

  const createShortcut = (overrides: Partial<KeyboardShortcut> = {}): KeyboardShortcut => ({
    key: 'a',
    description: 'Test shortcut',
    action: mockAction,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should add event listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useKeyboardShortcuts({ shortcuts: [createShortcut()] }));
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should return shortcuts in result', () => {
    const shortcuts = [createShortcut()];
    const { result } = renderHook(() => useKeyboardShortcuts({ shortcuts }));
    expect(result.current.shortcuts).toEqual(shortcuts);
  });

  it('should remove event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useKeyboardShortcuts({ shortcuts: [createShortcut()] }));
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should not register listener when disabled', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useKeyboardShortcuts({ shortcuts: [createShortcut()], enabled: false }));
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('should trigger action when key matches', () => {
    const shortcut = createShortcut({ key: 'a' });
    renderHook(() => useKeyboardShortcuts({ shortcuts: [shortcut] }));
    
    const event = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(event);
    
    expect(mockAction).toHaveBeenCalled();
  });

  it('should not trigger action when disabled in shortcut', () => {
    const shortcut = createShortcut({ key: 'a', disabled: true });
    renderHook(() => useKeyboardShortcuts({ shortcuts: [shortcut] }));
    
    const event = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(event);
    
    expect(mockAction).not.toHaveBeenCalled();
  });

  it('should trigger with ctrl key', () => {
    const shortcut = createShortcut({ key: 's', ctrlKey: true });
    renderHook(() => useKeyboardShortcuts({ shortcuts: [shortcut] }));
    
    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    window.dispatchEvent(event);
    
    expect(mockAction).toHaveBeenCalled();
  });

  it('should not trigger without ctrl key when required', () => {
    const shortcut = createShortcut({ key: 's', ctrlKey: true });
    renderHook(() => useKeyboardShortcuts({ shortcuts: [shortcut] }));
    
    const event = new KeyboardEvent('keydown', { key: 's' });
    window.dispatchEvent(event);
    
    expect(mockAction).not.toHaveBeenCalled();
  });

  it('should trigger with shift key', () => {
    const shortcut = createShortcut({ key: 'z', shiftKey: true });
    renderHook(() => useKeyboardShortcuts({ shortcuts: [shortcut] }));
    
    const event = new KeyboardEvent('keydown', { key: 'Z', shiftKey: true });
    window.dispatchEvent(event);
    
    expect(mockAction).toHaveBeenCalled();
  });

  it('should handle multiple shortcuts', () => {
    const shortcut1 = createShortcut({ key: 'a', action: mockAction });
    const shortcut2 = createShortcut({ key: 'b', action: mockAction2 });
    renderHook(() => useKeyboardShortcuts({ shortcuts: [shortcut1, shortcut2] }));
    
    const eventA = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(eventA);
    
    expect(mockAction).toHaveBeenCalled();
    expect(mockAction2).not.toHaveBeenCalled();
  });

  it('should not trigger in input fields without modifier keys', () => {
    const shortcut = createShortcut({ key: 'a' });
    renderHook(() => useKeyboardShortcuts({ shortcuts: [shortcut] }));
    
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    
    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
    input.dispatchEvent(event);
    
    expect(mockAction).not.toHaveBeenCalled();
    
    document.body.removeChild(input);
  });

  it('should trigger in input fields with ctrl key', () => {
    const shortcut = createShortcut({ key: 'a', ctrlKey: true });
    renderHook(() => useKeyboardShortcuts({ shortcuts: [shortcut] }));
    
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    
    const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true });
    input.dispatchEvent(event);
    
    expect(mockAction).toHaveBeenCalled();
    
    document.body.removeChild(input);
  });
});
