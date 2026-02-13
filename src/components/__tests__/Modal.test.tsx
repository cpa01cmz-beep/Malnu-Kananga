// Modal.test.tsx - Tests for Modal component
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../ui/Modal';

// Mock the useFocusTrap hook
vi.mock('../../hooks/useFocusTrap', () => ({
  useFocusTrap: vi.fn(() => ({
    modalRef: { current: null },
    trapFocus: vi.fn()
  }))
}));

// Mock constants
vi.mock('../../constants', () => ({
  UI_GESTURES: {
    MIN_SWIPE_DISTANCE: 50
  },
  UI_DELAYS: {
    ESCAPE_HINT_DELAY: 5000
  },
  VIBRATION_PATTERNS: {
    SWIPE_CLOSE: 50
  }
}));

describe('Modal Component', () => {
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      );
      
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      );
      
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      );
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={mockOnClose} 
          title="Test Modal"
          description="Test description"
        >
          <div>Content</div>
        </Modal>
      );
      
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    it('should render small modal', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} size="sm">
          <div>Small Content</div>
        </Modal>
      );
      
      expect(container.querySelector('.max-w-sm')).toBeInTheDocument();
    });

    it('should render large modal', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} size="lg">
          <div>Large Content</div>
        </Modal>
      );
      
      expect(container.querySelector('.max-w-lg')).toBeInTheDocument();
    });

    it('should render full-width modal', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} size="full">
          <div>Full Content</div>
        </Modal>
      );
      
      expect(container.querySelector('.w-full.h-full')).toBeInTheDocument();
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Modal isOpen={true} onClose={mockOnClose} showCloseButton={true}>
          <div>Content</div>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Modal isOpen={true} onClose={mockOnClose} closeOnBackdropClick={true}>
          <div>Content</div>
        </Modal>
      );
      
      const backdrop = screen.getByTestId('modal-backdrop');
      await user.click(backdrop);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close on backdrop click when closeOnBackdropClick is false', async () => {
      const user = userEvent.setup();
      render(
        <Modal isOpen={true} onClose={mockOnClose} closeOnBackdropClick={false}>
          <div>Content</div>
        </Modal>
      );
      
      const backdrop = screen.getByTestId('modal-backdrop');
      await user.click(backdrop);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper role attribute', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-labelledby when title is provided', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Accessible Modal">
          <div>Content</div>
        </Modal>
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should have aria-describedby when description is provided', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={mockOnClose} 
          title="Modal"
          description="Modal description"
        >
          <div>Content</div>
        </Modal>
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby');
    });
  });

  describe('Animation', () => {
    it('should apply fade-in animation by default', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      expect(container.querySelector('.animate-scale-in')).toBeInTheDocument();
    });

    it('should apply fade-in-up animation when specified', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} animation="fade-in-up">
          <div>Content</div>
        </Modal>
      );
      
      expect(container.querySelector('.animate-fade-in-up')).toBeInTheDocument();
    });
  });
});
