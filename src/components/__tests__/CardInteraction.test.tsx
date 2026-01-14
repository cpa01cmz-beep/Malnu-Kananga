import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProgramCard from '../ProgramCard';
import NewsCard from '../NewsCard';

describe('ProgramCard Interactivity', () => {
  const mockProgram = {
    id: '1',
    title: 'Test Program',
    description: 'This is a test program description',
    imageUrl: 'https://example.com/image.jpg',
  };

  it('renders without onClick handler as static card', () => {
    render(<ProgramCard program={mockProgram} />);
    const card = screen.getByRole('article') || screen.getByText(mockProgram.title).closest('article');
    expect(card).toBeInTheDocument();
    expect(card).not.toHaveAttribute('role', 'button');
  });

  it('renders with onClick handler as interactive card', () => {
    const handleClick = vi.fn();
    render(<ProgramCard program={mockProgram} onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('aria-label', 'View details for Test Program');
    
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders custom aria-label when provided', () => {
    const handleClick = vi.fn();
    render(
      <ProgramCard program={mockProgram} onClick={handleClick} ariaLabel="Custom label" />
    );
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'Custom label');
  });

  it('displays see more link when onClick is provided', () => {
    render(<ProgramCard program={mockProgram} onClick={vi.fn()} />);
    expect(screen.getByText('Lihat Selengkapnya')).toBeInTheDocument();
  });

  it('does not display see more link when onClick is not provided', () => {
    render(<ProgramCard program={mockProgram} />);
    expect(screen.queryByText('Lihat Selengkapnya')).not.toBeInTheDocument();
  });
});

describe('NewsCard Interactivity', () => {
  const mockNewsItem = {
    id: '1',
    title: 'Test News Article',
    description: 'This is a test news description',
    imageUrl: 'https://example.com/news.jpg',
    date: '2026-01-14',
    category: 'Berita',
  };

  it('renders without onClick handler as static article', () => {
    render(<NewsCard newsItem={mockNewsItem} />);
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
    expect(article).not.toHaveAttribute('role', 'button');
    expect(article).not.toHaveAttribute('tabIndex', '0');
  });

  it('renders with onClick handler as interactive article', () => {
    const handleClick = vi.fn();
    render(<NewsCard newsItem={mockNewsItem} onClick={handleClick} />);
    
    const article = screen.getByRole('button');
    expect(article).toBeInTheDocument();
    expect(article).toHaveAttribute('tabIndex', '0');
    expect(article).toHaveAttribute('aria-label', 'Read article: Test News Article');
    
    fireEvent.click(article);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation when interactive', () => {
    const handleClick = vi.fn();
    render(<NewsCard newsItem={mockNewsItem} onClick={handleClick} />);
    
    const article = screen.getByRole('button');
    
    fireEvent.keyDown(article, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(article, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('displays read more link when onClick is provided', () => {
    render(<NewsCard newsItem={mockNewsItem} onClick={vi.fn()} />);
    expect(screen.getByText('Baca Selengkapnya')).toBeInTheDocument();
  });

  it('does not display read more link when onClick is not provided', () => {
    render(<NewsCard newsItem={mockNewsItem} />);
    expect(screen.queryByText('Baca Selengkapnya')).not.toBeInTheDocument();
  });
});
