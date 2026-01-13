  
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageCard from '../ImageCard';

describe('ImageCard', () => {
  const defaultProps = {
    imageUrl: 'https://example.com/image.jpg',
    imageAlt: 'Test Image',
    title: 'Test Title',
  };

  it('renders correctly with minimal props', () => {
    render(<ImageCard {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders image with correct alt text', () => {
    render(<ImageCard {...defaultProps} />);
    const image = screen.getByAltText('Test Image');
    expect(image).toBeInTheDocument();
  });

  it('renders with hover variant', () => {
    const { container } = render(<ImageCard {...defaultProps} variant="hover" />);
    const card = container.querySelector('.group');
    expect(card).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    const { container } = render(<ImageCard {...defaultProps} variant="default" />);
    const card = container.firstChild;
    expect(card).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(
      <ImageCard
        {...defaultProps}
        badge={{ text: 'Category', variant: 'primary' }}
      />
    );
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Category')).toHaveClass('uppercase', 'tracking-wider');
  });

  it('renders children content', () => {
    render(
      <ImageCard {...defaultProps}>
        <p>Test description</p>
      </ImageCard>
    );
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders footer content', () => {
    render(
      <ImageCard
        {...defaultProps}
        footer={<p className="text-sm text-neutral-500">Footer content</p>}
      />
    );
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<ImageCard {...defaultProps} onClick={handleClick} />);
    
    const card = screen.getByText('Test Title').closest('.group');
    fireEvent.click(card as HTMLElement);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(
      <ImageCard {...defaultProps} className="custom-class" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('has correct aria-label when provided', () => {
    render(<ImageCard {...defaultProps} ariaLabel="Custom aria label" />);
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', 'Custom aria label');
  });

  it('disables card when disabled is true', () => {
    render(<ImageCard {...defaultProps} disabled />);
    const card = screen.getByRole('article');
    expect(card).toHaveClass('cursor-not-allowed');
  });

  it('does not show hover effect when disabled', () => {
    render(
      <ImageCard {...defaultProps} variant="hover" disabled />
    );
    const title = screen.getByText('Test Title');
    expect(title).not.toHaveClass('group-hover:text-primary-600');
  });

  it('truncates long title with line-clamp', () => {
    const longTitle = 'This is a very long title that should be truncated to two lines when displayed in the card component to test the line-clamp utility class';
    render(<ImageCard {...defaultProps} title={longTitle} />);
    const title = screen.getByText(longTitle);
    expect(title).toHaveClass('line-clamp-2');
  });

  it('truncates children content with line-clamp', () => {
    const longDescription = 'This is a very long description that should be truncated to three lines when displayed in the card component to test the line-clamp utility class for children content area';
    render(
      <ImageCard {...defaultProps}>
        <p>{longDescription}</p>
      </ImageCard>
    );
    const description = screen.getByText(longDescription);
    expect(description).toHaveClass('line-clamp-3');
  });

  it('renders with different badge variants', () => {
    render(
      <ImageCard
        {...defaultProps}
        badge={{ text: 'Warning', variant: 'warning' }}
      />
    );
    const badge = screen.getByText('Warning');
    expect(badge).toBeInTheDocument();
  });

  it('handles image loading error gracefully', () => {
    render(<ImageCard {...defaultProps} imageUrl="invalid-url.jpg" />);
    const image = screen.getByAltText('Test Image');
    expect(image).toHaveAttribute('src', 'invalid-url.jpg');
  });

  it('has correct padding when specified', () => {
    const { container } = render(
      <ImageCard {...defaultProps} padding="lg" />
    );
    const content = container.querySelector('.p-6');
    expect(content).toBeInTheDocument();
  });

  it('maintains aspect ratio for image container', () => {
    const { container } = render(<ImageCard {...defaultProps} />);
    const imageContainer = container.querySelector('.aspect-video');
    expect(imageContainer).toBeInTheDocument();
  });

  it('has proper responsive spacing', () => {
    const { container } = render(<ImageCard {...defaultProps} />);
    const content = container.querySelector('.p-6');
    expect(content).toHaveClass('sm:p-7');
  });
});
