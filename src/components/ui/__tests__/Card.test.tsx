 
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from '../Card';

describe('Card', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('renders with default variant', () => {
      render(<Card>Default Card</Card>);
      const card = screen.getByText('Default Card').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-xl', 'shadow-card', 'border');
    });

    it('renders with hover variant', () => {
      render(<Card variant="hover">Hover Card</Card>);
      const card = screen.getByText('Hover Card').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('hover:shadow-card-hover', 'hover:-translate-y-1');
    });

    it('renders with interactive variant as button', () => {
      render(<Card variant="interactive">Interactive Card</Card>);
      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('type', 'button');
    });

    it('renders with gradient variant', () => {
      render(
        <Card
          variant="gradient"
          gradient={{ from: 'from-blue-500', to: 'to-purple-600' }}
        >
          Gradient Card
        </Card>
      );
      const card = screen.getByText('Gradient Card').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-gradient-to-br', 'from-blue-500', 'to-purple-600');
    });

    it('renders with light text for gradient cards', () => {
      render(
        <Card
          variant="gradient"
          gradient={{ from: 'from-blue-500', to: 'to-purple-600', text: 'light' }}
        >
          Gradient Light Text
        </Card>
      );
      const card = screen.getByText('Gradient Light Text').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('text-white');
    });
  });

  describe('Padding', () => {
    it('renders with none padding', () => {
      render(<Card padding="none">No Padding</Card>);
      const card = screen.getByText('No Padding').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).not.toHaveClass('p-4', 'p-6', 'p-8');
    });

    it('renders with small padding', () => {
      render(<Card padding="sm">Small Padding</Card>);
      const card = screen.getByText('Small Padding').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('p-4');
    });

    it('renders with medium padding (default)', () => {
      render(<Card padding="md">Medium Padding</Card>);
      const card = screen.getByText('Medium Padding').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('p-6');
    });

    it('renders with large padding', () => {
      render(<Card padding="lg">Large Padding</Card>);
      const card = screen.getByText('Large Padding').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('p-6', 'sm:p-8');
    });
  });

  describe('Custom Classes', () => {
    it('applies custom className', () => {
      render(<Card className="custom-class">Custom Classes</Card>);
      const card = screen.getByText('Custom Classes').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('custom-class');
    });

    it('preserves default classes when custom className provided', () => {
      render(<Card className="custom-class">Preserved Classes</Card>);
      const card = screen.getByText('Preserved Classes').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-xl', 'shadow-card', 'custom-class');
    });
  });

  describe('Interactivity', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Card onClick={handleClick}>Clickable Card</Card>);
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders as button when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>Clickable</Card>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('does not render as button when onClick is not provided', () => {
      render(<Card>Not Clickable</Card>);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('adds aria-label when provided', () => {
      render(<Card aria-label="Card label">Card Content</Card>);
      const card = screen.getByLabelText('Card label');
      expect(card).toBeInTheDocument();
    });

    it('adds aria-describedby when provided', () => {
      render(
        <>
          <Card aria-describedby="card-description">Card Content</Card>
          <span id="card-description">Card description</span>
        </>
      );
      const card = screen.getByText('Card Content').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('aria-describedby', 'card-description');
    });

    it('interactive card has focus ring classes', () => {
      render(<Card variant="interactive">Interactive</Card>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('hover variant with onClick has focus ring classes', () => {
      render(<Card variant="hover" onClick={vi.fn()}>Hover Card</Card>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary-500/50', 'focus:ring-offset-2');
    });

    it('has keyboard focus on interactive cards', async () => {
      const user = userEvent.setup();
      render(<Card variant="interactive">Focusable Card</Card>);
      const button = screen.getByRole('button');
      
      await user.tab();
      expect(button).toHaveFocus();
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode border classes', () => {
      render(<Card>Dark Mode Card</Card>);
      const card = screen.getByText('Dark Mode Card').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('dark:border-neutral-700');
    });

    it('interactive card has dark mode focus offset classes', () => {
      render(<Card variant="interactive">Dark Focus</Card>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('dark:focus:ring-offset-neutral-900');
    });
  });

  describe('Complex Children', () => {
    it('renders with nested elements', () => {
      render(
        <Card>
          <h2>Title</h2>
          <p>Description</p>
          <button>Action</button>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('renders with React components as children', () => {
      const ChildComponent = () => <div>Child Component</div>;
      render(
        <Card>
          <ChildComponent />
        </Card>
      );
      expect(screen.getByText('Child Component')).toBeInTheDocument();
    });
  });

  describe('Variant Combinations', () => {
    it('hover variant with custom padding', () => {
      render(<Card variant="hover" padding="lg">Hover Large</Card>);
      const card = screen.getByText('Hover Large').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('hover:shadow-card-hover', 'hover:-translate-y-1', 'p-6', 'sm:p-8');
    });

    it('gradient variant with light text', () => {
      render(
        <Card
          variant="gradient"
          gradient={{ from: 'from-indigo-500', to: 'to-purple-600', text: 'light' }}
          padding="lg"
        >
          Gradient Large Light
        </Card>
      );
      const card = screen.getByText('Gradient Large Light').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-gradient-to-br', 'from-indigo-500', 'to-purple-600', 'text-white');
    });
  });

  describe('Rounded Variants', () => {
    it('renders with none rounded', () => {
      render(<Card rounded="none">No Rounded</Card>);
      const card = screen.getByText('No Rounded');
      expect(card).toBeInTheDocument();
      expect(card.closest('.rounded-none')).toBeInTheDocument();
    });

    it('renders with sm rounded', () => {
      render(<Card rounded="sm">Small Rounded</Card>);
      const card = screen.getByText('Small Rounded');
      expect(card).toBeInTheDocument();
      expect(card.closest('.rounded-sm')).toBeInTheDocument();
    });

    it('renders with md rounded', () => {
      render(<Card rounded="md">Medium Rounded</Card>);
      const card = screen.getByText('Medium Rounded');
      expect(card).toBeInTheDocument();
      expect(card.closest('.rounded-md')).toBeInTheDocument();
    });

    it('renders with lg rounded', () => {
      render(<Card rounded="lg">Large Rounded</Card>);
      const card = screen.getByText('Large Rounded');
      expect(card).toBeInTheDocument();
      expect(card.closest('.rounded-lg')).toBeInTheDocument();
    });

    it('renders with xl rounded (default)', () => {
      render(<Card>Extra Large Rounded</Card>);
      const card = screen.getByText('Extra Large Rounded');
      expect(card).toBeInTheDocument();
      expect(card.closest('.rounded-xl')).toBeInTheDocument();
    });

    it('renders with 2xl rounded', () => {
      render(<Card rounded="2xl">2XL Rounded</Card>);
      const card = screen.getByText('2XL Rounded');
      expect(card).toBeInTheDocument();
      expect(card.closest('.rounded-2xl')).toBeInTheDocument();
    });

    it('renders with 3xl rounded', () => {
      render(<Card rounded="3xl">3XL Rounded</Card>);
      const card = screen.getByText('3XL Rounded');
      expect(card).toBeInTheDocument();
      expect(card.closest('.rounded-3xl')).toBeInTheDocument();
    });

    it('renders with full rounded', () => {
      render(<Card rounded="full">Full Rounded</Card>);
      const card = screen.getByText('Full Rounded');
      expect(card).toBeInTheDocument();
      expect(card.closest('.rounded-full')).toBeInTheDocument();
    });
  });

  describe('Shadow Variants', () => {
    it('renders with none shadow', () => {
      render(<Card shadow="none">No Shadow</Card>);
      const card = screen.getByText('No Shadow');
      expect(card).toBeInTheDocument();
      expect(card.closest('.shadow-none')).toBeInTheDocument();
    });

    it('renders with sm shadow', () => {
      render(<Card shadow="sm">Small Shadow</Card>);
      const card = screen.getByText('Small Shadow');
      expect(card).toBeInTheDocument();
      expect(card.closest('.shadow-sm')).toBeInTheDocument();
    });

    it('renders with md shadow', () => {
      render(<Card shadow="md">Medium Shadow</Card>);
      const card = screen.getByText('Medium Shadow');
      expect(card).toBeInTheDocument();
      expect(card.closest('.shadow-md')).toBeInTheDocument();
    });

    it('renders with lg shadow', () => {
      render(<Card shadow="lg">Large Shadow</Card>);
      const card = screen.getByText('Large Shadow');
      expect(card).toBeInTheDocument();
      expect(card.closest('.shadow-lg')).toBeInTheDocument();
    });

    it('renders with xl shadow', () => {
      render(<Card shadow="xl">XL Shadow</Card>);
      const card = screen.getByText('XL Shadow');
      expect(card).toBeInTheDocument();
      expect(card.closest('.shadow-xl')).toBeInTheDocument();
    });

    it('renders with card shadow (default)', () => {
      render(<Card>Card Shadow</Card>);
      const card = screen.getByText('Card Shadow');
      expect(card).toBeInTheDocument();
      expect(card.closest('.shadow-card')).toBeInTheDocument();
    });

    it('renders with float shadow', () => {
      render(<Card shadow="float">Float Shadow</Card>);
      const card = screen.getByText('Float Shadow');
      expect(card).toBeInTheDocument();
      expect(card.closest('.shadow-float')).toBeInTheDocument();
    });
  });

  describe('Border Variants', () => {
    it('renders with none border', () => {
      render(<Card border="none">No Border</Card>);
      const card = screen.getByText('No Border').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).not.toHaveClass('border');
    });

    it('renders with neutral-200 border (default)', () => {
      render(<Card>Default Border</Card>);
      const card = screen.getByText('Default Border').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('border-neutral-200', 'dark:border-neutral-700');
    });

    it('renders with neutral-100 border', () => {
      render(<Card border="neutral-100">Light Border</Card>);
      const card = screen.getByText('Light Border').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('border-neutral-100', 'dark:border-neutral-700');
    });
  });

  describe('Prop Combinations', () => {
    it('renders with 2xl rounded, sm shadow, and neutral-100 border', () => {
      render(<Card rounded="2xl" shadow="sm" border="neutral-100">Combined Props</Card>);
      const card = screen.getByText('Combined Props');
      expect(card).toBeInTheDocument();
      const cardElement = card.closest('.rounded-2xl');
      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveClass('rounded-2xl', 'shadow-sm', 'border-neutral-100');
    });

    it('renders with 3xl rounded, xl shadow, and lg padding', () => {
      render(<Card rounded="3xl" shadow="xl" padding="lg">Large Props</Card>);
      const card = screen.getByText('Large Props');
      expect(card).toBeInTheDocument();
      const cardElement = card.closest('.rounded-3xl');
      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveClass('rounded-3xl', 'shadow-xl', 'p-6', 'sm:p-8');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Card>{null}</Card>);
      const card = document.querySelector('.rounded-xl');
      expect(card).toBeInTheDocument();
    });

    it('handles undefined gradient with gradient variant', () => {
      render(<Card variant="gradient">No Gradient</Card>);
      expect(screen.getByText('No Gradient')).toBeInTheDocument();
    });

    it('handles multiple className additions', () => {
      render(
        <Card className="class-1 class-2 class-3" padding="sm">
          Multiple Classes
        </Card>
      );
      const card = screen.getByText('Multiple Classes').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('class-1', 'class-2', 'class-3', 'p-4');
    });
  });
});
