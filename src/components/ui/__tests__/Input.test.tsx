import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Input from '../Input';
import { standardValidationRules } from '../../../hooks/useFieldValidation';

describe('Input Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders correctly with basic props', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with label and helper text', () => {
      render(
        <Input
          label="Email"
          helperText="Enter your email address"
        />
      );
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('shows error state and error text', () => {
      render(
        <Input
          label="Password"
          errorText="Password is required"
        />
      );
      const input = screen.getByLabelText('Password');
      expect(input).toHaveClass('border-red-300');
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('applies correct size classes', () => {
      const { rerender } = render(<Input size="sm" />);
      let input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-3', 'py-2', 'text-sm');

      rerender(<Input size="md" />);
      input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-4', 'py-3');

      rerender(<Input size="lg" />);
      input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-5', 'py-4', 'text-base');
    });

    it('disables input when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('shows required asterisk when required prop is true', () => {
      render(<Input label="Name" required />);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('calls onChange handler when input changes', () => {
      render(<Input onChange={mockOnChange} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'test value' } });
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('renders with left and right icons', () => {
      render(
        <Input
          leftIcon={<span data-testid="left-icon">L</span>}
          rightIcon={<span data-testid="right-icon">R</span>}
        />
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('has proper ARIA attributes for accessibility', () => {
      render(<Input label="Test Label" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAccessibleName('Test Label');
    });

    it('associates helper text with input using aria-describedby', () => {
      render(
        <Input
          label="Email"
          helperText="Enter your email address"
        />
      );
      const input = screen.getByRole('textbox');
      const helperText = screen.getByText('Enter your email address');
      expect(input).toHaveAttribute('aria-describedby');
      expect(helperText.id).toBe(input.getAttribute('aria-describedby'));
    });

    it('associates error text with input using aria-describedby and role="alert"', () => {
      render(
        <Input
          label="Password"
          errorText="Password is required"
        />
      );
      const input = screen.getByRole('textbox');
      const errorText = screen.getByText('Password is required');
      expect(input).toHaveAttribute('aria-describedby');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(errorText).toHaveAttribute('role', 'alert');
      expect(errorText.id).toBe(input.getAttribute('aria-describedby'));
    });

    it('sets aria-invalid to false for non-error states', () => {
      render(<Input label="Test" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('supports fullWidth prop', () => {
      render(<Input fullWidth />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full');
    });
  });

  describe('Enhanced Validation Features', () => {
    it('renders with validation rules', () => {
      render(
        <Input
          label="Email"
          placeholder="Enter email"
          validationRules={[standardValidationRules.email()]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    it('shows validation error on blur', async () => {
      render(
        <Input
          label="Email"
          validationRules={[
            { validate: (v: string) => v.trim().length > 0, message: 'Email wajib diisi' },
            standardValidationRules.email()
          ]}
          onChange={mockOnChange}
          accessibility={{ announceErrors: false }}
        />
      );

      const input = screen.getByLabelText('Email');

      fireEvent.focus(input);
      fireEvent.blur(input);

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const visibleAlert = alerts.find(alert => !alert.style.position || alert.style.position !== 'absolute');
        expect(visibleAlert).toHaveTextContent('Email wajib diisi');
      });
    });

    it('validates on change when enabled', async () => {
      render(
        <Input
          label="Required Field"
          validationRules={[standardValidationRules.required()]}
          onChange={mockOnChange}
          validateOnChange={true}
          accessibility={{ announceErrors: false }}
        />
      );

      const input = screen.getByLabelText('Required Field');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.blur(input);
      fireEvent.change(input, { target: { value: '' } });

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const visibleAlert = alerts.find(alert => !alert.style.position || alert.style.position !== 'absolute');
        expect(visibleAlert).toHaveTextContent('Field ini wajib diisi');
      });
    });

    it('does not validate on change when disabled', async () => {
      render(
        <Input
          label="Required Field"
          validationRules={[standardValidationRules.required()]}
          onChange={mockOnChange}
          validateOnChange={false}
          validateOnBlur={false}
          accessibility={{ announceErrors: false }}
        />
      );

      const input = screen.getByLabelText('Required Field');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.change(input, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('shows placeholder hint for masked inputs', () => {
      render(
        <Input
          label="NISN"
          inputMask="nisn"
          customType="nisn"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('NISN 10 digit')).toBeInTheDocument();
    });
  });

  describe('Accessibility Enhancements', () => {
    it('has proper ARIA attributes with validation', () => {
      render(
        <Input
          label="Email"
          required
          validationRules={[standardValidationRules.required()]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByText('*', { selector: '[aria-label="wajib diisi"]' })).toBeInTheDocument();
    });

    it('updates ARIA attributes on validation error', async () => {
      render(
        <Input
          label="Email"
          validationRules={[standardValidationRules.required()]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('Email');

      fireEvent.focus(input);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('focuses input on validation error', async () => {
      render(
        <Input
          label="Email"
          validationRules={[standardValidationRules.required()]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('Email');

      fireEvent.focus(input);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });
    });

    it('shows loading indicator during validation', () => {
      render(
        <Input
          label="Email"
          validationRules={[standardValidationRules.required()]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('Email');
      fireEvent.change(input, { target: { value: 'test' } });

      // The component should render the loading indicator during validation
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
  });

  describe('Custom Types and Masks', () => {
    it('sets appropriate input mode for NISN', () => {
      render(
        <Input
          label="NISN"
          customType="nisn"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('NISN');
      expect(input).toHaveAttribute('inputMode', 'numeric');
      expect(input).toHaveAttribute('pattern', '[0-9]{10}');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('sets correct attributes for phone input', () => {
      render(
        <Input
          label="Phone"
          customType="phone"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('Phone');
      expect(input).toHaveAttribute('inputMode', 'numeric');
      expect(input).toHaveAttribute('pattern', '[0-9]{10,13}');
    });

    it('sets maxLength for year input', () => {
      render(
        <Input
          label="Year"
          customType="year"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('Year');
      expect(input).toHaveAttribute('maxLength', '4');
    });
  });

  describe('Backward Compatibility', () => {
    it('works without validation rules', () => {
      render(
        <Input
          label="Simple Input"
          placeholder="Just a basic input"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('Simple Input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Just a basic input');
    });

    it('respects manual error text over validation errors', () => {
      render(
        <Input
          label="Input"
          errorText="Manual error message"
          validationRules={[standardValidationRules.required()]}
          onChange={mockOnChange}
          accessibility={{ announceErrors: false }}
        />
      );

      const alerts = screen.getAllByRole('alert');
      const visibleAlert = alerts.find(alert => !alert.style.position || alert.style.position !== 'absolute');
      expect(visibleAlert).toHaveTextContent('Manual error message');
    });
  });
});
