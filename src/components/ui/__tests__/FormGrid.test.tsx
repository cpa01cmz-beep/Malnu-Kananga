import { render, screen } from '@testing-library/react';
import FormGrid from '../FormGrid';

describe('FormGrid', () => {
  it('renders children correctly', () => {
    render(
      <FormGrid>
        <div>Field 1</div>
        <div>Field 2</div>
      </FormGrid>
    );
    expect(screen.getByText('Field 1')).toBeInTheDocument();
    expect(screen.getByText('Field 2')).toBeInTheDocument();
  });

  it('applies default 2-column grid layout', () => {
    const { container } = render(
      <FormGrid data-testid="form-grid">
        <div>Field</div>
      </FormGrid>
    );
    const grid = container.querySelector('[data-testid="form-grid"]');
    expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-4');
  });

  it('supports custom cols prop', () => {
    const { container } = render(
      <FormGrid cols={3} data-testid="form-grid">
        <div>Field</div>
      </FormGrid>
    );
    const grid = container.querySelector('[data-testid="form-grid"]');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-3');
  });

  it('supports gap size variants', () => {
    const { container: smallGrid } = render(
      <FormGrid gap="sm" data-testid="small-grid">
        <div>Field</div>
      </FormGrid>
    );
    const { container: largeGrid } = render(
      <FormGrid gap="lg" data-testid="large-grid">
        <div>Field</div>
      </FormGrid>
    );

    expect(smallGrid.querySelector('[data-testid="small-grid"]')).toHaveClass('gap-2');
    expect(largeGrid.querySelector('[data-testid="large-grid"]')).toHaveClass('gap-6');
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormGrid className="custom-class" data-testid="form-grid">
        <div>Field</div>
      </FormGrid>
    );
    const grid = container.querySelector('[data-testid="form-grid"]');
    expect(grid).toHaveClass('custom-class');
  });

  it('forwards additional props to div element', () => {
    const { container } = render(
      <FormGrid id="test-id" aria-label="Form grid" data-testid="form-grid">
        <div>Field</div>
      </FormGrid>
    );
    const grid = container.querySelector('[data-testid="form-grid"]');
    expect(grid).toHaveAttribute('id', 'test-id');
    expect(grid).toHaveAttribute('aria-label', 'Form grid');
  });

  it('handles 1-column layout', () => {
    const { container } = render(
      <FormGrid cols={1} data-testid="form-grid">
        <div>Field 1</div>
        <div>Field 2</div>
        <div>Field 3</div>
      </FormGrid>
    );
    const grid = container.querySelector('[data-testid="form-grid"]');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-1');
  });

  it('handles 4-column layout', () => {
    const { container } = render(
      <FormGrid cols={4} data-testid="form-grid">
        <div>Field</div>
      </FormGrid>
    );
    const grid = container.querySelector('[data-testid="form-grid"]');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-4');
  });

  it('uses default gap of md when not specified', () => {
    const { container } = render(
      <FormGrid data-testid="form-grid">
        <div>Field</div>
      </FormGrid>
    );
    const grid = container.querySelector('[data-testid="form-grid"]');
    expect(grid).toHaveClass('gap-4');
  });

  it('renders with multiple children correctly', () => {
    const { container } = render(
      <FormGrid>
        <div>Field 1</div>
        <div>Field 2</div>
        <div>Field 3</div>
        <div>Field 4</div>
      </FormGrid>
    );
    const children = container.querySelectorAll('div');
    expect(children.length).toBeGreaterThan(0);
  });
});
