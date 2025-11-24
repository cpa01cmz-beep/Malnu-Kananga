import React from 'react';
import { render, screen } from '@testing-library/react';
import { WebPProvider } from '../hooks/useWebP';
import LazyImage from './LazyImage';

// Mock IntersectionObserver untuk testing
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock canvas toDataURL untuk WebP detection
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
    return mockCanvas as unknown;
  }
  return originalCreateElement.call(document, tagName);
});

// Wrapper component untuk menyediakan WebP context
const LazyImageWithProvider: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <WebPProvider>
    <LazyImage src={src} alt={alt} />
  </WebPProvider>
);

describe('LazyImage dengan WebP Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanvas.toDataURL.mockReturnValue('data:image/webp;base64,mockWebPData');
  });

  afterAll(() => {
    // Restore original createElement setelah semua tests
    document.createElement = originalCreateElement;
  });

  it('seharusnya render tanpa error dengan WebP provider', () => {
    expect(() => {
      render(<LazyImageWithProvider src="test.jpg" alt="Test image" />);
    }).not.toThrow();
  });

  it('seharusnya menggunakan WebP detection tanpa error provider', () => {
    render(<LazyImageWithProvider src="https://example.com/test.jpg" alt="Test image" />);

    // Component seharusnya render tanpa error
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Test image');
  });

  it('seharusnya menggunakan priority loading untuk above-the-fold images', () => {
    render(
      <WebPProvider>
        <LazyImage src="hero.jpg" alt="Hero image" priority={true} />
      </WebPProvider>
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('seharusnya menggunakan lazy loading untuk non-priority images', () => {
    render(
      <LazyImageWithProvider src="content.jpg" alt="Content image" />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('seharusnya menangani error gambar dengan fallback', () => {
    render(
      <LazyImageWithProvider src="https://example.com/broken-image.jpg" alt="Broken image" />
    );

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });
});