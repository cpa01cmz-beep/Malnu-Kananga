import { render, screen } from '@testing-library/react';
import ProfileSection from '../sections/ProfileSection';

describe('ProfileSection', () => {
  it('renders the profile section with title and subtitle', () => {
    render(<ProfileSection />);
    expect(screen.getByText('Profil Madrasah')).toBeInTheDocument();
    expect(screen.getByText('Mengenal Lebih Dekat MA Malnu Kananga')).toBeInTheDocument();
  });

  it('renders the Visi article correctly', () => {
    render(<ProfileSection />);
    const visiArticle = screen.getByRole('article', { name: 'Visi' });
    expect(visiArticle).toBeInTheDocument();
    expect(visiArticle).toHaveAttribute('aria-labelledby', 'visi-heading');
  });

  it('renders Misi article correctly', () => {
    render(<ProfileSection />);
    const misiArticle = screen.getByRole('article', { name: 'Misi' });
    expect(misiArticle).toBeInTheDocument();
    expect(misiArticle).toHaveAttribute('aria-labelledby', 'misi-heading');
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

  it('applies gradient classes correctly', () => {
    const { container } = render(<ProfileSection />);
    const cards = container.querySelectorAll('button');
    cards.forEach(card => {
      expect(card.className).toContain('rounded-xl');
      expect(card.className).toContain('shadow-card');
      expect(card.className).toContain('border');
    });
  });

  it('applies hover styles to articles', () => {
    const { container } = render(<ProfileSection />);
    const articles = container.querySelectorAll('article');
    articles.forEach(article => {
      expect(article.className).toContain('hover:shadow-card-hover');
      expect(article.className).toContain('hover:-translate-y-1');
    });
  });

  it('applies dark mode support to articles', () => {
    const { container } = render(<ProfileSection />);
    const articles = container.querySelectorAll('article');
    articles.forEach(article => {
      expect(article.className).toContain('dark:border-neutral-700');
    });
  });
});
