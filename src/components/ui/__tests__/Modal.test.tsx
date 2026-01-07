import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal';

describe('Modal', () => {
  let originalBodyOverflow: string;

  beforeEach(() => {
    originalBodyOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    document.body.style.overflow = originalBodyOverflow;
  });

  describe('Rendering', () => {
    it('does not render when isOpen is false', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={false} onClose={handleClose}>Modal Content</Modal>);
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('renders children when isOpen is true', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Modal Content</Modal>);
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('renders with default size (md)', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Default Size</Modal>);
      const modal = screen.getByText('Default Size').closest('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('max-w-md');
    });

    it('renders with small size', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose} size="sm">Small Modal</Modal>);
      const modal = screen.getByText('Small Modal').closest('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('max-w-sm');
    });

    it('renders with large size', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose} size="lg">Large Modal</Modal>);
      const modal = screen.getByText('Large Modal').closest('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('max-w-lg');
    });

    it('renders with extra large size', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose} size="xl">Extra Large Modal</Modal>);
      const modal = screen.getByText('Extra Large Modal').closest('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('max-w-xl');
    });

    it('renders with full size', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose} size="full">Full Modal</Modal>);
      const modal = screen.getByText('Full Modal').closest('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('w-full', 'h-full', 'm-0', 'rounded-none');
    });

    it('renders with default animation (scale-in)', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Default Animation</Modal>);
      const modal = screen.getByText('Default Animation').closest('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('animate-scale-in');
    });

    it('renders with fade-in animation', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose} animation="fade-in">Fade In</Modal>);
      const modal = screen.getByText('Fade In').closest('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('animate-fade-in');
    });

    it('renders with fade-in-up animation', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose} animation="fade-in-up">Fade In Up</Modal>);
      const modal = screen.getByText('Fade In Up').closest('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('animate-fade-in-up');
    });

    it('renders with title', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose} title="Modal Title">Content</Modal>);
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('renders with close button by default', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      expect(closeButton).toBeInTheDocument();
    });

    it('does not render close button when showCloseButton is false', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose} showCloseButton={false}>Content</Modal>);
      expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
    });
  });

  describe('Custom Classes', () => {
    it('applies custom className', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose} className="custom-class">Custom Classes</Modal>);
      const modal = screen.getByText('Custom Classes').closest('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('custom-class');
    });

    it('preserves default classes when custom className provided', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose} className="custom-class">Preserved Classes</Modal>);
      const modal = screen.getByText('Preserved Classes').closest('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('bg-white', 'dark:bg-neutral-800', 'rounded-xl', 'shadow-float', 'custom-class');
    });
  });

  describe('Backdrop Click', () => {
    it('calls onClose when backdrop is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      
      const backdrop = screen.getByRole('presentation');
      await user.click(backdrop);
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when modal content is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(<Modal isOpen={true} onClose={handleClose}>Modal Content</Modal>);
      
      await user.click(screen.getByText('Modal Content'));
      
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when closeOnBackdropClick is false', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(<Modal isOpen={true} onClose={handleClose} closeOnBackdropClick={false}>Content</Modal>);
      
      const backdrop = screen.getByRole('presentation');
      await user.click(backdrop);
      
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Close Button', () => {
    it('calls onClose when close button is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      await user.click(closeButton);
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Escape Key', () => {
    it('calls onClose when Escape key is pressed', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      
      await user.keyboard('{Escape}');
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when closeOnEscape is false', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(<Modal isOpen={true} onClose={handleClose} closeOnEscape={false}>Content</Modal>);
      
      await user.keyboard('{Escape}');
      
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Lock', () => {
    it('locks body scroll when modal is open', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('unlocks body scroll when modal is closed', () => {
      const handleClose = vi.fn();
      const { rerender } = render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(<Modal isOpen={false} onClose={handleClose}>Content</Modal>);
      expect(document.body.style.overflow).toBe('');
    });

    it('restores original body scroll on unmount', () => {
      document.body.style.overflow = 'scroll';
      const handleClose = vi.fn();
      const { unmount } = render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      
      unmount();
      expect(document.body.style.overflow).toBe('scroll');
    });
  });

  describe('Accessibility', () => {
    it('has dialog role', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal attribute', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby when title is provided', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose} title="Modal Title">Content</Modal>);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(screen.getByText('Modal Title')).toHaveAttribute('id', 'modal-title');
    });

    it('does not have aria-labelledby when title is not provided', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      const modal = screen.getByRole('dialog');
      expect(modal).not.toHaveAttribute('aria-labelledby');
    });

    it('has aria-describedby when description is provided', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose} description="Modal Description">Content</Modal>);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-describedby', 'modal-description');
    });

    it('renders description as screen reader only text', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose} description="Screen Reader Description">Content</Modal>);
      const description = screen.getByText('Screen Reader Description');
      expect(description).toHaveClass('sr-only');
    });

    it('close button has proper aria-label', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      expect(closeButton).toBeInTheDocument();
    });

    it('focus trap is active', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Modal Title">
          <button type="button">First Button</button>
          <button type="button">Second Button</button>
        </Modal>
      );
      
      const firstButton = screen.getByRole('button', { name: 'First Button' });
      const secondButton = screen.getByRole('button', { name: 'Second Button' });
      
      await user.tab();
      expect(firstButton).toHaveFocus();
      
      await user.tab();
      expect(secondButton).toHaveFocus();
      
      await user.tab();
      expect(firstButton).toHaveFocus();
    });

    it('closes modal when escape is pressed', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      
      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode background classes', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Dark Mode Modal</Modal>);
      const modal = screen.getByText('Dark Mode Modal').closest('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('dark:bg-neutral-800', 'dark:border-neutral-700');
    });

    it('close button has dark mode hover classes', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      expect(closeButton).toHaveClass('dark:hover:bg-neutral-700', 'dark:text-neutral-400', 'dark:hover:text-neutral-200');
    });
  });

  describe('Complex Children', () => {
    it('renders with nested elements', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Modal Title">
          <p>Paragraph content</p>
          <button type="button">Action Button</button>
        </Modal>
      );
      expect(screen.getByText('Paragraph content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });

    it('renders with React components as children', () => {
      const handleClose = vi.fn();
      const ChildComponent = () => <div>Child Component Content</div>;
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <ChildComponent />
        </Modal>
      );
      expect(screen.getByText('Child Component Content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>{null}</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles rapid open/close', async () => {
      const handleClose = vi.fn();
      const _user = userEvent.setup();
      const { rerender } = render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      
      expect(screen.getByText('Content')).toBeInTheDocument();
      
      rerender(<Modal isOpen={false} onClose={handleClose}>Content</Modal>);
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
      
      rerender(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles multiple className additions', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} className="class-1 class-2 class-3">
          Multiple Classes
        </Modal>
      );
      const modal = screen.getByText('Multiple Classes').closest('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('class-1', 'class-2', 'class-3');
    });

    it('handles title without close button', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Title Only" showCloseButton={false}>
          Content
        </Modal>
      );
      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
    });

    it('handles close button without title', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('renders with backdrop transition classes', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      const backdrop = screen.getByRole('presentation');
      expect(backdrop).toHaveClass('transition-opacity', 'duration-300');
    });

    it('renders with backdrop blur', () => {
      const handleClose = vi.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      const backdrop = screen.getByRole('presentation');
      expect(backdrop).toHaveClass('backdrop-blur-sm');
    });
  });
});
