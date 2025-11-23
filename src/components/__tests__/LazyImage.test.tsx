import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LazyImage } from '../LazyImage';

describe('LazyImage Component', () => {
  const mockSrc = 'https://example.com/image.jpg';
  const mockAlt = 'Test image';

  beforeEach(() => {
    global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
      observe: jest.fn((element) => {
        callback([{ isIntersecting: true, target: element }]);
      }),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  test('renders placeholder initially', () => {
    render(<LazyImage src={mockSrc} alt={mockAlt} />);

    expect(screen.getByTestId('image-placeholder')).toBeInTheDocument();
  });

  test('loads image when in viewport', async () => {
    render(<LazyImage src={mockSrc} alt={mockAlt} />);

    await waitFor(() => {
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', mockSrc);
      expect(image).toHaveAttribute('alt', mockAlt);
    });
  });

  test('shows error state when image fails to load', async () => {
    render(<LazyImage src="invalid-url" alt={mockAlt} />);

    const image = screen.getByRole('img');
    fireEvent.error(image);

    await waitFor(() => {
      expect(screen.getByText(/gagal memuat gambar/i)).toBeInTheDocument();
    });
  });

  test('applies custom className', () => {
    render(<LazyImage src={mockSrc} alt={mockAlt} className="custom-class" />);

    const container = screen.getByTestId('lazy-image-container');
    expect(container).toHaveClass('custom-class');
  });

  test('handles click events', async () => {
    const mockOnClick = jest.fn();
    const user = userEvent.setup();
    
    render(<LazyImage src={mockSrc} alt={mockAlt} onClick={mockOnClick} />);

    await waitFor(() => {
      const image = screen.getByRole('img');
      user.click(image);
    });

    expect(mockOnClick).toHaveBeenCalled();
  });

  test('shows loading spinner', () => {
    render(<LazyImage src={mockSrc} alt={mockAlt} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('supports placeholder image', () => {
    const placeholderSrc = 'https://example.com/placeholder.jpg';
    
    render(
      <LazyImage 
        src={mockSrc} 
        alt={mockAlt} 
        placeholder={placeholderSrc}
      />
    );

    const placeholder = screen.getByRole('img', { name: /placeholder/i });
    expect(placeholder).toHaveAttribute('src', placeholderSrc);
  });

  test('handles multiple images efficiently', async () => {
    const images = [
      { src: 'https://example.com/image1.jpg', alt: 'Image 1' },
      { src: 'https://example.com/image2.jpg', alt: 'Image 2' },
      { src: 'https://example.com/image3.jpg', alt: 'Image 3' },
    ];

    render(
      <div>
        {images.map((img, index) => (
          <LazyImage key={index} src={img.src} alt={img.alt} />
        ))}
      </div>
    );

    await waitFor(() => {
      expect(screen.getAllByRole('img')).toHaveLength(3);
    });
  });

  test('unobserves element on unmount', () => {
    const { unmount } = render(<LazyImage src={mockSrc} alt={mockAlt} />);

    const mockObserver = (global.IntersectionObserver as jest.Mock).mock.results[0].value;
    
    unmount();

    expect(mockObserver.unobserve).toHaveBeenCalled();
    expect(mockObserver.disconnect).toHaveBeenCalled();
  });

  test('supports WebP format detection', () => {
    const originalWebPSupport = window.Modernizr?.webp;
    
    Object.defineProperty(window, 'Modernizr', {
      value: { webp: true },
      writable: true,
    });

    render(<LazyImage src={mockSrc} alt={mockAlt} />);

    expect(screen.getByTestId('lazy-image-container')).toBeInTheDocument();

    Object.defineProperty(window, 'Modernizr', {
      value: { webp: originalWebPSupport },
      writable: true,
    });
  });

  test('handles responsive images', async () => {
    const srcSet = 'https://example.com/image-small.jpg 480w, https://example.com/image-large.jpg 1024w';
    
    render(<LazyImage src={mockSrc} alt={mockAlt} srcSet={srcSet} />);

    await waitFor(() => {
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('srcset', srcSet);
    });
  });

  test('applies fade-in animation on load', async () => {
    render(<LazyImage src={mockSrc} alt={mockAlt} />);

    const image = screen.getByRole('img');
    fireEvent.load(image);

    await waitFor(() => {
      expect(image).toHaveClass('fade-in');
    });
  });
});