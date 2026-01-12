import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileSection from '../ProfileSection';

describe('ProfileSection', () => {
  it('renders the profile section with title and subtitle', () => {
    render(<ProfileSection />);
    expect(screen.getByText('Profil Madrasah')).toBeInTheDocument();
    expect(screen.getByText('Mengenal Lebih Dekat MA Malnu Kananga')).toBeInTheDocument();
  });

  it('renders the Visi card as a focusable button', () => {
    render(<ProfileSection />);
    const visiButton = screen.getByRole('button', { name: /Visi/i });
    expect(visiButton).toBeInTheDocument();
    expect(visiButton).toHaveAttribute('type', 'button');
    expect(visiButton).toHaveAttribute('aria-labelledby', 'visi-heading');
  });

  it('renders the Misi card as a focusable button', () => {
    render(<ProfileSection />);
    const misiButton = screen.getByRole('button', { name: /Misi/i });
    expect(misiButton).toBeInTheDocument();
    expect(misiButton).toHaveAttribute('type', 'button');
    expect(misiButton).toHaveAttribute('aria-labelledby', 'misi-heading');
  });

  it('renders Visi content correctly', () => {
    render(<ProfileSection />);
    expect(screen.getByText('Melahirkan peserta didik berakhlak mulia, akademis unggul, serta berjiwa wirausaha.')).toBeInTheDocument();
  });

  it('renders Misi list items correctly', () => {
    render(<ProfileSection />);
    expect(screen.getByText('Penguatan pendidikan agama Islam berlandasan nilai salafiyah.')).toBeInTheDocument();
    expect(screen.getByText('Penerapan kurikulum nasional yang diperkaya dengan penguatan karakter.')).toBeInTheDocument();
    expect(screen.getByText('Pengembangan kompetensi literasi, numerasi, dan teknologi informasi.')).toBeInTheDocument();
  });

  it('renders badges correctly', () => {
    render(<ProfileSection />);
    expect(screen.getByText('Kemenag RI')).toBeInTheDocument();
    expect(screen.getByText('Kurikulum Terpadu')).toBeInTheDocument();
    expect(screen.getByText('Berakhlak Mulia')).toBeInTheDocument();
  });

  it('applies correct ARIA attributes to Visi heading', () => {
    render(<ProfileSection />);
    const visiHeading = screen.getByRole('heading', { name: 'Visi' });
    expect(visiHeading).toHaveAttribute('id', 'visi-heading');
  });

  it('applies correct ARIA attributes to Misi heading', () => {
    render(<ProfileSection />);
    const misiHeading = screen.getByRole('heading', { name: 'Misi' });
    expect(misiHeading).toHaveAttribute('id', 'misi-heading');
  });

  it('Visi button is keyboard accessible', async () => {
    render(<ProfileSection />);
    const visiButton = screen.getByRole('button', { name: /Visi/i });
    visiButton.focus();
    expect(visiButton).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Space}');
  });

  it('Misi button is keyboard accessible', async () => {
    render(<ProfileSection />);
    const misiButton = screen.getByRole('button', { name: /Misi/i });
    misiButton.focus();
    expect(misiButton).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Space}');
  });

  it('applies responsive classes', () => {
    const { container } = render(<ProfileSection />);
    const section = container.querySelector('#profil');
    expect(section).toBeInTheDocument();
    expect(section?.className).toContain('lg:grid-cols-5');
  });

  it('decorative SVG elements have aria-hidden', () => {
    render(<ProfileSection />);
    const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('applies gradient classes correctly', () => {
    const { container } = render(<ProfileSection />);
    const cards = container.querySelectorAll('button');
    cards.forEach(card => {
      expect(card.className).toContain('rounded-xl');
      expect(card.className).toContain('shadow-card');
      expect(card.className).toContain('border');
    });
  });

  it('applies focus-visible styles for keyboard navigation', () => {
    const { container } = render(<ProfileSection />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button.className).toContain('focus-visible:ring-2');
      expect(button.className).toContain('focus-visible:ring-primary-500/50');
      expect(button.className).toContain('focus-visible:ring-offset-2');
    });
  });

  it('applies dark mode support', () => {
    const { container } = render(<ProfileSection />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button.className).toContain('dark:border-neutral-700');
      expect(button.className).toContain('dark:focus-visible:ring-offset-neutral-800');
    });
  });
});
