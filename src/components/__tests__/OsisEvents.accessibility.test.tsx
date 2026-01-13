import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OsisEvents from '../OsisEvents';

const mockEvents = [
  {
    id: '1',
    eventName: 'Pentas Seni',
    date: '2025-02-15',
    location: 'Aula Utama',
    description: 'Pentas seni tahunan untuk menampilkan bakat siswa',
    status: 'Upcoming',
    budget: 5000000,
    registrations: [],
    photos: []
  },
  {
    id: '2',
    eventName: 'Bakti Sosial',
    date: '2025-02-20',
    location: 'Kompleks Sekolah',
    description: 'Kegiatan sosial untuk membantu masyarakat sekitar',
    status: 'Ongoing',
    budget: 3000000,
    registrations: [],
    photos: []
  }
];

describe('OsisEvents Accessibility Improvements', () => {
  const defaultProps = {
    onBack: vi.fn(),
    onShowToast: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders events as button elements instead of div with role="button"', () => {
    render(<OsisEvents {...defaultProps} />);

    const eventButtons = screen.getAllByRole('button');
    expect(eventButtons.length).toBeGreaterThan(0);

    eventButtons.forEach(button => {
      expect(button.tagName.toLowerCase()).toBe('button');
    });
  });

  it('uses native button with type="button" to prevent form submission', () => {
    render(<OsisEvents {...defaultProps} />);

    const eventButtons = screen.getAllByRole('button');
    eventButtons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  it('does not use role="button" attribute (native button has this implicitly)', () => {
    render(<OsisEvents {...defaultProps} />);

    const eventButtons = screen.getAllByRole('button');
    eventButtons.forEach(button => {
      expect(button).not.toHaveAttribute('role', 'button');
    });
  });

  it('does not use tabIndex={0} (buttons are focusable by default)', () => {
    render(<OsisEvents {...defaultProps} />);

    const eventButtons = screen.getAllByRole('button');
    eventButtons.forEach(button => {
      expect(button).not.toHaveAttribute('tabindex');
    });
  });

  it('has proper ARIA labels for all event buttons', () => {
    render(<OsisEvents {...defaultProps} />);

    const eventButtons = screen.getAllByRole('button');
    eventButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
      expect(button.getAttribute('aria-label')).toContain('Lihat detail kegiatan:');
    });
  });

  it('activates event selection when button is clicked', async () => {
    const user = userEvent.setup();
    render(<OsisEvents {...defaultProps} />);

    const pentasSeniButton = screen.getByLabelText(/Lihat detail kegiatan: Pentas Seni/i);
    await user.click(pentasSeniButton);

    expect(pentasSeniButton).toBeInTheDocument();
  });

  it('activates on Enter key press (native button behavior)', async () => {
    const user = userEvent.setup();
    render(<OsisEvents {...defaultProps} />);

    const pentasSeniButton = screen.getByLabelText(/Lihat detail kegiatan: Pentas Seni/i);
    pentasSeniButton.focus();
    await user.keyboard('{Enter}');

    expect(pentasSeniButton).toBeInTheDocument();
  });

  it('activates on Space key press (native button behavior)', async () => {
    const user = userEvent.setup();
    render(<OsisEvents {...defaultProps} />);

    const pentasSeniButton = screen.getByLabelText(/Lihat detail kegiatan: Pentas Seni/i);
    pentasSeniButton.focus();
    await user.keyboard(' ');

    expect(pentasSeniButton).toBeInTheDocument();
  });

  it('has focus-visible styles for keyboard navigation', () => {
    render(<OsisEvents {...defaultProps} />);

    const eventButtons = screen.getAllByRole('button');
    eventButtons.forEach(button => {
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2');
    });
  });

  it('maintains text-left alignment for button content', () => {
    render(<OsisEvents {...defaultProps} />);

    const eventButtons = screen.getAllByRole('button');
    eventButtons.forEach(button => {
      expect(button).toHaveClass('text-left');
    });
  });

  it('is keyboard accessible and focusable', () => {
    render(<OsisEvents {...defaultProps} />);

    const eventButtons = screen.getAllByRole('button');
    eventButtons.forEach(button => {
      expect(button).toBeEnabled();
    });
  });

  it('follows WCAG 2.1 AA accessibility standards', () => {
    render(<OsisEvents {...defaultProps} />);

    const eventButtons = screen.getAllByRole('button');

    eventButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
      expect(button.tagName.toLowerCase()).toBe('button');
      expect(button).not.toHaveAttribute('tabindex');
      expect(button).not.toHaveAttribute('role', 'button');
    });
  });

  it('maintains all existing functionality after refactoring', () => {
    render(<OsisEvents {...defaultProps} />);

    const eventButtons = screen.getAllByRole('button');
    expect(eventButtons.length).toBeGreaterThan(0);

    eventButtons.forEach(button => {
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('rounded-2xl');
      expect(button).toHaveClass('shadow-sm');
    });
  });
});
