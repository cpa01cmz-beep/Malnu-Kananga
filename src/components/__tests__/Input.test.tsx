// Input.test.tsx - Tests for Input component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../ui/Input';

describe('Input Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Input label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter your name" />);
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      render(<Input helperText="This is a helper message" />);
      expect(screen.getByText('This is a helper message')).toBeInTheDocument();
    });

    it('should render with error state', () => {
      render(<Input state="error" errorText="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should render with success state', () => {
      render(<Input state="success" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-green-300');
    });
  });

  describe('Size variants', () => {
    it('should render small size', () => {
      const { container } = render(<Input size="sm" />);
      expect(container.querySelector('.px-3')).toBeInTheDocument();
    });

    it('should render medium size', () => {
      const { container } = render(<Input size="md" />);
      expect(container.querySelector('.px-4')).toBeInTheDocument();
    });

    it('should render large size', () => {
      const { container } = render(<Input size="lg" />);
      expect(container.querySelector('.px-5')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onChange when value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should be readOnly when readOnly prop is true', () => {
      render(<Input readOnly />);
      expect(screen.getByRole('textbox')).toHaveAttribute('readOnly');
    });

    it('should show clear button when showClearButton is true and has value', () => {
      render(<Input showClearButton defaultValue="test" />);
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper id for accessibility', () => {
      render(<Input id="username-input" label="Username" />);
      expect(screen.getByLabelText('Username')).toHaveAttribute('id', 'username-input');
    });

    it('should have aria-describedby for helper text', () => {
      render(<Input helperText="Helper info" aria-describedby="helper" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('should have aria-invalid when in error state', () => {
      render(<Input state="error" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Character count', () => {
    it('should show character count when showCharacterCount is true', () => {
      render(<Input showCharacterCount maxLength={100} defaultValue="Hello" />);
      expect(screen.getByText('5 / 100')).toBeInTheDocument();
    });
  });
});
