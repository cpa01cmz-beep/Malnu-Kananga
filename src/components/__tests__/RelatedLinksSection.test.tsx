import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import RelatedLinksSection from '../sections/RelatedLinksSection';

vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn()
  }
}));

describe('RelatedLinksSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render section with correct heading', async () => {
    render(<RelatedLinksSection />);
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Tautan Terkait' })).toBeInTheDocument();
      expect(screen.getByText('Akses cepat ke portal dan layanan terkait.')).toBeInTheDocument();
    });
  });

  it('should render navigation section for accessibility', async () => {
    render(<RelatedLinksSection />);
    
    await waitFor(() => {
      const nav = screen.getByRole('navigation', { name: 'Tautan terkait eksternal' });
      expect(nav).toBeInTheDocument();
    });
  });

  it('should use semantic HTML structure', async () => {
    render(<RelatedLinksSection />);
    
    await waitFor(() => {
      const section = screen.getByRole('heading', { level: 2, name: 'Tautan Terkait' }).closest('section');
      expect(section).toBeInTheDocument();
      expect(section?.tagName).toBe('SECTION');
    });
  });

  it('should have proper responsive design classes', async () => {
    render(<RelatedLinksSection />);
    
    await waitFor(() => {
      const section = screen.getByRole('heading', { level: 2, name: 'Tautan Terkait' }).closest('section');
      expect(section).toHaveClass('py-20', 'sm:py-24');
    });
  });
});
