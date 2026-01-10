 
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import BaseModal from '../BaseModal';

describe('BaseModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    // Reset body overflow after each test
    document.body.style.overflow = '';
  });

  it('renders when isOpen is true', () => {
    render(<BaseModal {...defaultProps} />);
    
    expect(screen.getByText('Modal content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<BaseModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<BaseModal {...defaultProps} title="Test Modal" />);
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('renders description when provided', () => {
    render(<BaseModal {...defaultProps} description="This is a test modal" />);
    
    expect(screen.getByText('This is a test modal')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby', 'modal-description');
  });

  it('calls onClose when close button is clicked', async () => {
    const mockOnClose = vi.fn();
    render(<BaseModal {...defaultProps} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close modal');
    await userEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const mockOnClose = vi.fn();
    render(<BaseModal {...defaultProps} onClose={mockOnClose} />);
    
    const backdrop = screen.getByRole('presentation');
    await userEvent.click(backdrop);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not call onClose when clicking modal content', async () => {
    const mockOnClose = vi.fn();
    render(<BaseModal {...defaultProps} onClose={mockOnClose} />);
    
    const modalContent = screen.getByRole('dialog');
    await userEvent.click(modalContent);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const mockOnConfirm = vi.fn();
    render(
      <BaseModal
        {...defaultProps}
        showFooter={true}
        onConfirm={mockOnConfirm}
        confirmText="Save"
      />
    );
    
    const confirmButton = screen.getByText('Save');
    await userEvent.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const mockOnClose = vi.fn();
    render(
      <BaseModal
        {...defaultProps}
        showFooter={true}
        onClose={mockOnClose}
        cancelText="Cancel"
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state on confirm button', () => {
    render(
      <BaseModal
        {...defaultProps}
        showFooter={true}
        onConfirm={vi.fn()}
        loading={true}
      />
    );
    
    const confirmButton = screen.getByRole('button', { name: /please wait/i });
    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toBeDisabled();
  });

  it('applies variant styles to confirm button', () => {
    render(
      <BaseModal
        {...defaultProps}
        showFooter={true}
        onConfirm={vi.fn()}
        variant="danger"
      />
    );
    
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmButton).toHaveClass('bg-red-600');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<BaseModal {...defaultProps} size="lg" />);
    let modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('max-w-lg');

    rerender(<BaseModal {...defaultProps} size="full" />);
    modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('w-full', 'h-full', 'm-0', 'rounded-none');
  });

  it('hides close button when showCloseButton is false', () => {
    render(<BaseModal {...defaultProps} showCloseButton={false} />);
    
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('hides header when showHeader is false', () => {
    render(<BaseModal {...defaultProps} title="Test" showHeader={false} />);
    
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('renders custom footer when provided', () => {
    render(
      <BaseModal
        {...defaultProps}
        showFooter={true}
        footer={<div>Custom footer content</div>}
      />
    );
    
    expect(screen.getByText('Custom footer content')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('closes on escape key press', async () => {
    const mockOnClose = vi.fn();
    render(<BaseModal {...defaultProps} onClose={mockOnClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close on escape key when closeOnEscape is false', async () => {
    const mockOnClose = vi.fn();
    render(<BaseModal {...defaultProps} onClose={mockOnClose} closeOnEscape={false} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('manages body overflow correctly', () => {
    const { rerender } = render(<BaseModal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<BaseModal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('');
  });

  it('disables controls when disabled prop is true', () => {
    render(
      <BaseModal
        {...defaultProps}
        showFooter={true}
        onConfirm={vi.fn()}
        disabled={true}
      />
    );
    
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmButton).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<BaseModal {...defaultProps} className="custom-modal-class" />);
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('custom-modal-class');
  });

  it('applies custom overlay className', () => {
    render(<BaseModal {...defaultProps} overlayClassName="custom-overlay-class" />);
    
    const overlay = screen.getByRole('presentation');
    expect(overlay).toHaveClass('custom-overlay-class');
  });

  it('has proper accessibility attributes', () => {
    render(<BaseModal {...defaultProps} title="Test Modal" />);
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});