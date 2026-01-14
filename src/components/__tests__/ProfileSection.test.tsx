import { render, screen } from '@testing-library/react';
import ProfileSection from '../sections/ProfileSection';

describe('ProfileSection', () => {
  it('renders the profile section with title and subtitle', () => {
    render(<ProfileSection />);
    expect(screen.getByText('Profil Madrasah')).toBeInTheDocument();
    expect(screen.getByText('Mengenal Lebih Dekat MA Malnu Kananga')).toBeInTheDocument();
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

  it('Visi article has proper semantic structure', () => {
    render(<ProfileSection />);
    const visiHeading = screen.getByRole('heading', { name: 'Visi' });
    expect(visiHeading).toBeInTheDocument();
    expect(visiHeading).toHaveAttribute('id', 'visi-heading');
    expect(screen.getByText('Melahirkan peserta didik berakhlak mulia, akademis unggul, serta berjiwa wirausaha.')).toBeInTheDocument();
  });

  it('Misi article has proper semantic structure', () => {
    render(<ProfileSection />);
    const misiHeading = screen.getByRole('heading', { name: 'Misi' });
    expect(misiHeading).toBeInTheDocument();
    expect(misiHeading).toHaveAttribute('id', 'misi-heading');
    const misiArticles = screen.getAllByRole('article');
    const misiArticle = misiArticles.find(a => a.getAttribute('aria-labelledby') === 'misi-heading');
    expect(misiArticle).toBeInTheDocument();
  });

  it('applies responsive classes', () => {
    const { container } = render(<ProfileSection />);
    const section = container.querySelector('#profil');
    expect(section).toBeInTheDocument();
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer?.className).toContain('lg:grid-cols-5');
  });

  it('decorative SVG elements have aria-hidden', () => {
    const { container } = render(<ProfileSection />);
    const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('applies card styling classes correctly', () => {
    const { container } = render(<ProfileSection />);
    const articles = container.querySelectorAll('article');
    articles.forEach(article => {
      expect(article.className).toContain('rounded-xl');
      expect(article.className).toContain('shadow-card');
      expect(article.className).toContain('border');
      expect(article.className).toContain('transition-all');
      expect(article.className).toContain('duration-300');
    });
  });

  it('applies hover effects on cards', () => {
    const { container } = render(<ProfileSection />);
    const articles = container.querySelectorAll('article');
    articles.forEach(article => {
      expect(article.className).toContain('hover:shadow-card-hover');
      expect(article.className).toContain('hover:-translate-y-1');
    });
  });

  it('applies dark mode support to cards', () => {
    const { container } = render(<ProfileSection />);
    const articles = container.querySelectorAll('article');
    articles.forEach(article => {
      expect(article.className).toContain('dark:border-neutral-700');
    });
  });
});
