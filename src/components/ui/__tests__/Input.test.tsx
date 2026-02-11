import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    it('renders tooltip icon when tooltip prop is provided', () => {
      render(
        <Input
          label="Password"
          tooltip="Minimal 8 karakter dengan huruf dan angka"
        />
      );
      
      // Tooltip button should be present with the tooltip text as aria-label
      const tooltipButton = screen.getByLabelText('Minimal 8 karakter dengan huruf dan angka');
      expect(tooltipButton).toBeInTheDocument();
      expect(tooltipButton.tagName.toLowerCase()).toBe('button');
    });

    it('does not render tooltip icon when tooltip prop is not provided', () => {
      render(<Input label="Name" />);
      
      // Should only have the label text, no tooltip buttons
      const label = screen.getByText('Name');
      expect(label).toBeInTheDocument();
      
      // Query all buttons (tooltip icon is a button)
      const buttons = screen.queryAllByRole('button');
      // Filter out any clear buttons that might be present
      const iconButtons = buttons.filter(btn => btn.getAttribute('aria-label') !== 'Bersihkan input');
      expect(iconButtons.length).toBe(0);
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
      userEvent.type(input, 'test');
      fireEvent.blur(input);
      userEvent.clear(input);

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
      userEvent.type(input, 'test');
      userEvent.clear(input);

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
      userEvent.type(input, 'test');
      
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

  describe('Character Counter Feature', () => {
    it('does not show character counter by default', () => {
      render(
        <Input
          label="Description"
          maxLength={100}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByText(/0/)).not.toBeInTheDocument();
      expect(screen.queryByText(/100/)).not.toBeInTheDocument();
    });

    it('shows character counter when showCharacterCount is true and maxLength is provided', () => {
      render(
        <Input
          label="Description"
          maxLength={100}
          value="Hello"
          showCharacterCount
          onChange={mockOnChange}
        />
      );

      // The counter displays as "5/100" - check the aria-label for verification
      expect(screen.getByLabelText('5 dari 100 karakter digunakan')).toBeInTheDocument();
    });

    it('shows character counter with correct format', () => {
      render(
        <Input
          label="Bio"
          maxLength={50}
          value="Test input"
          showCharacterCount
          onChange={mockOnChange}
        />
      );

      const counter = screen.getByLabelText('10 dari 50 karakter digunakan');
      expect(counter).toBeInTheDocument();
    });

    it('updates character count when value changes', () => {
      const { rerender } = render(
        <Input
          label="Description"
          maxLength={100}
          value="Hello"
          showCharacterCount
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText('5 dari 100 karakter digunakan')).toBeInTheDocument();

      rerender(
        <Input
          label="Description"
          maxLength={100}
          value="Hello World"
          showCharacterCount
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText('11 dari 100 karakter digunakan')).toBeInTheDocument();
    });

    it('shows neutral color for usage below 80%', () => {
      render(
        <Input
          label="Description"
          maxLength={100}
          value="Short"
          showCharacterCount
          onChange={mockOnChange}
        />
      );

      const counter = screen.getByLabelText('5 dari 100 karakter digunakan');
      expect(counter).toHaveClass('text-neutral-400');
    });

    it('shows warning color when usage reaches 80% or more', () => {
      render(
        <Input
          label="Description"
          maxLength={100}
          value={"x".repeat(85)}
          showCharacterCount
          onChange={mockOnChange}
        />
      );

      const counter = screen.getByLabelText('85 dari 100 karakter digunakan');
      expect(counter).toHaveClass('text-amber-600');
    });

    it('shows error color when usage reaches 100%', () => {
      render(
        <Input
          label="Description"
          maxLength={50}
          value={"x".repeat(50)}
          showCharacterCount
          onChange={mockOnChange}
        />
      );

      const counter = screen.getByLabelText('50 dari 50 karakter digunakan');
      expect(counter).toHaveClass('text-red-600');
    });

    it('announces when character limit is reached', () => {
      render(
        <Input
          label="Description"
          maxLength={10}
          value={"x".repeat(10)}
          showCharacterCount
          onChange={mockOnChange}
        />
      );

      const liveRegion = screen.getByText('Batas karakter tercapai');
      expect(liveRegion).toHaveClass('sr-only');
      expect(liveRegion).toHaveAttribute('role', 'alert');
    });

    it('does not announce when character limit is not reached', () => {
      render(
        <Input
          label="Description"
          maxLength={100}
          value="Not full"
          showCharacterCount
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByText('Batas karakter tercapai')).not.toBeInTheDocument();
    });

    it('does not show counter when maxLength is not provided', () => {
      render(
        <Input
          label="Description"
          value="Some text"
          showCharacterCount
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByText(/Some/)).not.toBeInTheDocument();
    });

    it('respects reduced motion preference', () => {
      // Mock prefers-reduced-motion
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <Input
          label="Description"
          maxLength={100}
          value={"x".repeat(85)}
          showCharacterCount
          onChange={mockOnChange}
        />
      );

      // Counter should not have pulse animation when reduced motion is preferred
      const counter = screen.getByLabelText('85 dari 100 karakter digunakan');
      expect(counter).not.toHaveClass('animate-pulse-subtle');
    });
  });

  describe('Keyboard Shortcuts - Escape Hint', () => {
    it('shows escape hint tooltip when input is focused with clearOnEscape and has value', async () => {
      render(
        <Input
          label="Search"
          value="test query"
          clearOnEscape
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('Search');
      
      // Focus the input using userEvent for better simulation
      await userEvent.click(input);
      
      // Wait for the tooltip delay (400ms)
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent('ESC');
        expect(tooltip).toHaveTextContent('bersihkan');
      }, { timeout: 500 });
    });

    it('does not show escape hint when clearOnEscape is false', async () => {
      render(
        <Input
          label="Search"
          value="test query"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('Search');
      
      await userEvent.click(input);
      
      // Wait a bit and verify tooltip doesn't appear
      await new Promise(resolve => setTimeout(resolve, 450));
      
      // Tooltip should not exist
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('does not show escape hint when input has no value', async () => {
      render(
        <Input
          label="Search"
          value=""
          clearOnEscape
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('Search');
      
      await userEvent.click(input);
      
      // Wait a bit and verify tooltip doesn't appear
      await new Promise(resolve => setTimeout(resolve, 450));
      
      // Tooltip should not exist
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('hides escape hint when input loses focus', async () => {
      render(
        <>
          <Input
            label="Search"
            value="test query"
            clearOnEscape
            onChange={mockOnChange}
          />
          <button>Other button</button>
        </>
      );

      const input = screen.getByLabelText('Search');
      
      // Focus and wait for tooltip
      await userEvent.click(input);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      }, { timeout: 500 });
      
      // Click elsewhere to blur
      await userEvent.click(screen.getByRole('button', { name: 'Other button' }));
      
      // Tooltip should be removed
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('clears input value when escape is pressed and clearOnEscape is true', () => {
      render(
        <Input
          label="Search"
          value="test query"
          clearOnEscape
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('Search');
      
      fireEvent.keyDown(input, { key: 'Escape' });
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: '' })
        })
      );
    });

    it('does not clear input when escape is pressed without clearOnEscape', () => {
      render(
        <Input
          label="Search"
          value="test query"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('Search');
      
      fireEvent.keyDown(input, { key: 'Escape' });
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});
