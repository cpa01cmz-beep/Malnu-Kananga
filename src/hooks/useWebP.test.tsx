// Mock canvas API untuk testing
const mockCanvas = {
  toDataURL: jest.fn(() => 'data:image/webp;base64,mockWebPData'),
  width: 1,
  height: 1
};

Object.defineProperty(mockCanvas, 'toDataURL', {
  writable: true,
  configurable: true,
  value: jest.fn(() => 'data:image/webp;base64,mockWebPData')
});

// Mock document.createElement untuk canvas
const originalCreateElement = document.createElement;
document.createElement = jest.fn((tagName) => {
  if (tagName === 'canvas') {
    return mockCanvas as any;
  }
  return originalCreateElement.call(document, tagName);
});

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { WebPProvider, useWebP } from './useWebP';

// Test component yang menggunakan useWebP hook
const TestComponent: React.FC = () => {
  const { supportsWebP, isLoading, getOptimalSrc } = useWebP();

  return (
    <div>
      <span data-testid="webp-status">
        {isLoading ? 'loading' : supportsWebP ? 'supported' : 'not-supported'}
      </span>
      <span data-testid="optimal-src">
        {getOptimalSrc('https://images.unsplash.com/photo-123.jpg')}
      </span>
    </div>
  );
};

describe('WebPProvider dan useWebP Hook', () => {
  beforeEach(() => {
    // Reset mocks sebelum setiap test
    jest.clearAllMocks();
    mockCanvas.toDataURL.mockReturnValue('data:image/webp;base64,mockWebPData');
  });

  afterAll(() => {
    // Restore original createElement setelah semua tests
    document.createElement = originalCreateElement;
  });

  it('seharusnya menyediakan WebP context tanpa error', () => {
    expect(() => {
      render(
        <WebPProvider>
          <TestComponent />
        </WebPProvider>
      );
    }).not.toThrow();
  });

  it('seharusnya tidak menampilkan error "useWebP must be used within a WebPProvider"', () => {
    // Test bahwa component dapat menggunakan useWebP hook tanpa error
    render(
      <WebPProvider>
        <TestComponent />
      </WebPProvider>
    );

    // Jika sampai di sini tanpa error, berarti test berhasil
    expect(screen.getByTestId('webp-status')).toBeInTheDocument();
    expect(screen.getByTestId('optimal-src')).toBeInTheDocument();
  });

  it('seharusnya memberikan WebP support status', async () => {
    render(
      <WebPProvider>
        <TestComponent />
      </WebPProvider>
    );

    // Tunggu hingga loading selesai dengan act
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const statusElement = screen.getByTestId('webp-status');
    expect(statusElement.textContent).toBe('supported');
  });

  it('seharusnya mengoptimalkan URL gambar untuk WebP', () => {
    render(
      <WebPProvider>
        <TestComponent />
      </WebPProvider>
    );

    const srcElement = screen.getByTestId('optimal-src');
    const optimizedSrc = srcElement.textContent;

    // Dengan WebP support, URL Unsplash seharusnya diubah ke format WebP
    expect(optimizedSrc).toBe('https://images.unsplash.com/photo-123.webp');
  });

  it('seharusnya menangani error detection dengan fallback', async () => {
    // Mock error pada WebP detection
    mockCanvas.toDataURL.mockImplementation(() => {
      throw new Error('Canvas error');
    });

    // Render dengan act untuk menangani state updates
    await act(async () => {
      render(
        <WebPProvider>
          <TestComponent />
        </WebPProvider>
      );
    });

    // Tunggu hingga error handling selesai
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const statusElement = screen.getByTestId('webp-status');
    // Seharusnya fallback ke 'not-supported' jika ada error
    expect(statusElement.textContent).toBe('not-supported');
  });
});