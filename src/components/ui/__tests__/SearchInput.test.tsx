  
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchInput from '../SearchInput';
import { MagnifyingGlassIcon } from '../../icons/NotificationIcons';

describe('SearchInput Component', () => {
  describe('Rendering', () => {
    it('renders search input with default props', () => {
      render(<SearchInput placeholder="Search..." />);
      const input = screen.getByRole('searchbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'search');
      expect(input).toHaveAttribute('placeholder', 'Search...');
    });

    it('renders with label', () => {
      render(<SearchInput label="Search Items" placeholder="Search..." />);
      expect(screen.getByLabelText('Search Items')).toBeInTheDocument();
    });

    it('renders magnifying glass icon by default', () => {
      const { container } = render(<SearchInput placeholder="Search..." />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('renders with custom icon', () => {
      const customIcon = <MagnifyingGlassIcon className="w-6 h-6" />;
      const { container } = render(<SearchInput placeholder="Search..." icon={customIcon} />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('does not render icon when showIcon is false', () => {
      const { container } = render(<SearchInput placeholder="Search..." showIcon={false} />);
      const icon = container.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<SearchInput placeholder="Search..." helperText="Type to search items" />);
      expect(screen.getByText('Type to search items')).toBeInTheDocument();
    });

    it('renders with error text', () => {
      render(<SearchInput placeholder="Search..." errorText="Search failed" />);
      expect(screen.getByText('Search failed')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders with error state when errorText is provided', () => {
      render(<SearchInput placeholder="Search..." errorText="Invalid search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('border-red-300');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Size Variants', () => {
    it('renders sm size variant', () => {
      render(<SearchInput placeholder="Search..." size="sm" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('px-3', 'py-2', 'text-sm');
    });

    it('renders md size variant', () => {
      render(<SearchInput placeholder="Search..." size="md" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('px-4', 'py-3', 'text-sm');
    });

    it('renders lg size variant', () => {
      render(<SearchInput placeholder="Search..." size="lg" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('px-5', 'py-4', 'text-base');
    });
  });

  describe('State Variants', () => {
    it('renders with error state', () => {
      render(<SearchInput placeholder="Search..." state="error" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('border-red-300');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('renders with success state', () => {
      render(<SearchInput placeholder="Search..." state="success" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('border-green-300');
    });

    it('renders with default state', () => {
      render(<SearchInput placeholder="Search..." state="default" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('border-neutral-300');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Full Width', () => {
    it('applies fullWidth class when fullWidth is true', () => {
      const { container } = render(<SearchInput placeholder="Search..." fullWidth />);
      const wrapper = container.firstChild as HTMLElement;
      const input = screen.getByRole('searchbox');
      expect(wrapper).toHaveClass('w-full');
      expect(input).toHaveClass('w-full');
    });

    it('does not apply fullWidth class when fullWidth is false', () => {
      const { container } = render(<SearchInput placeholder="Search..." fullWidth={false} />);
      const wrapper = container.firstChild as HTMLElement;
      const input = screen.getByRole('searchbox');
      expect(wrapper).not.toHaveClass('w-full');
      expect(input).not.toHaveClass('w-full');
    });
  });

  describe('Icon Position', () => {
    it('positions icon on the left by default', () => {
      render(<SearchInput placeholder="Search..." />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('pl-11');
    });

    it('positions icon on the left when iconPosition is left', () => {
      render(<SearchInput placeholder="Search..." iconPosition="left" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('pl-11');
    });

    it('positions icon on the right when iconPosition is right', () => {
      render(<SearchInput placeholder="Search..." iconPosition="right" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('pr-11');
      expect(input).not.toHaveClass('pl-11');
    });

    it('does not apply icon padding when showIcon is false', () => {
      render(<SearchInput placeholder="Search..." showIcon={false} />);
      const input = screen.getByRole('searchbox');
      expect(input).not.toHaveClass('pl-11');
      expect(input).not.toHaveClass('pr-11');
    });
  });

  describe('Interaction', () => {
    it('calls onChange handler when input value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<SearchInput placeholder="Search..." onChange={handleChange} />);
      
      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('calls onFocus handler when input is focused', async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();
      render(<SearchInput placeholder="Search..." onFocus={handleFocus} />);
      
      const input = screen.getByRole('searchbox');
      await user.click(input);
      
      expect(handleFocus).toHaveBeenCalled();
    });

    it('calls onBlur handler when input loses focus', async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();
      render(<SearchInput placeholder="Search..." onBlur={handleBlur} />);
      
      const input = screen.getByRole('searchbox');
      await user.click(input);
      await user.tab();
      
      expect(handleBlur).toHaveBeenCalled();
    });

    it('calls onKeyDown handler when key is pressed', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      render(<SearchInput placeholder="Search..." onKeyDown={handleKeyDown} />);
      
      const input = screen.getByRole('searchbox');
      await user.type(input, '{Enter}');
      
      expect(handleKeyDown).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<SearchInput placeholder="Search..." id="test-search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('id', 'test-search');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('associates label with input using htmlFor', () => {
      render(<SearchInput label="Search Items" placeholder="Search..." id="search-input" />);
      const input = screen.getByRole('searchbox');
      const label = screen.getByText('Search Items');
      
      expect(label).toHaveAttribute('for', 'search-input');
      expect(input.id).toBe('search-input');
    });

    it('associates helper text with input using aria-describedby', () => {
      render(<SearchInput placeholder="Search..." helperText="Type to search" id="search-input" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('aria-describedby', 'search-input-helper');
    });

    it('associates error text with input using aria-describedby', () => {
      render(<SearchInput placeholder="Search..." errorText="Invalid search" id="search-input" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('aria-describedby', 'search-input-error');
    });

    it('sets aria-invalid when in error state', () => {
      render(<SearchInput placeholder="Search..." state="error" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-invalid="false" when not in error state', () => {
      render(<SearchInput placeholder="Search..." state="default" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('disables input when disabled prop is true', () => {
      render(<SearchInput placeholder="Search..." disabled />);
      const input = screen.getByRole('searchbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('marks icon as aria-hidden', () => {
      const { container } = render(<SearchInput placeholder="Search..." />);
      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('can be focused using keyboard', () => {
      render(<SearchInput placeholder="Search..." />);
      const input = screen.getByRole('searchbox');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('can be typed into using keyboard', async () => {
      const user = userEvent.setup();
      render(<SearchInput placeholder="Search..." />);
      
      const input = screen.getByRole('searchbox');
      await user.keyboard('{Tab}{T}{e}{s}{t}');
      
      expect(input).toHaveValue('test');
    });

    it('clears value when Escape key is pressed with clearOnEscape enabled', async () => {
      const user = userEvent.setup();
      render(<SearchInput placeholder="Search..." clearOnEscape />);
      
      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');
      expect(input).toHaveValue('test');
      
      await user.keyboard('{Escape}');
      expect(input).toHaveValue('');
    });

    it('does not clear value when Escape key is pressed with clearOnEscape disabled', async () => {
      const user = userEvent.setup();
      render(<SearchInput placeholder="Search..." clearOnEscape={false} />);
      
      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');
      expect(input).toHaveValue('test');
      
      await user.keyboard('{Escape}');
      expect(input).toHaveValue('test');
    });

    it('does not clear value when Escape key is pressed by default', async () => {
      const user = userEvent.setup();
      render(<SearchInput placeholder="Search..." />);
      
      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');
      expect(input).toHaveValue('test');
      
      await user.keyboard('{Escape}');
      expect(input).toHaveValue('test');
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<SearchInput placeholder="Search..." className="custom-class" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('custom-class');
    });

    it('forwards ref to input element', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<SearchInput placeholder="Search..." ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toHaveAttribute('type', 'search');
    });

    it('passes additional props to input', () => {
      render(<SearchInput placeholder="Search..." maxLength={50} autoComplete="off" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('maxlength', '50');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode classes', () => {
      render(<SearchInput placeholder="Search..." />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('dark:bg-neutral-700');
      expect(input).toHaveClass('dark:text-white');
      expect(input).toHaveClass('dark:border-neutral-600');
    });

    it('applies dark mode error state classes', () => {
      render(<SearchInput placeholder="Search..." state="error" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('dark:bg-red-900/20');
      expect(input).toHaveClass('dark:border-red-700');
    });

    it('applies dark mode success state classes', () => {
      render(<SearchInput placeholder="Search..." state="success" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('dark:bg-green-900/20');
      expect(input).toHaveClass('dark:border-green-700');
    });
  });

  describe('Edge Cases', () => {
    it('generates unique ID when not provided', () => {
      const { rerender } = render(<SearchInput placeholder="Search..." />);
      const input1 = screen.getByRole('searchbox');
      const id1 = input1.id;
      
      rerender(<SearchInput placeholder="Search 2..." />);
      const input2 = screen.getByRole('searchbox');
      const id2 = input2.id;
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^search-/);
      expect(id2).toMatch(/^search-/);
    });

    it('renders with empty label (does not crash)', () => {
      render(<SearchInput label="" placeholder="Search..." />);
      const input = screen.getByRole('searchbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with all props combined', () => {
      const handleChange = vi.fn();
      render(
        <SearchInput
          label="Search Items"
          placeholder="Search..."
          helperText="Type to search"
          errorText=""
          size="md"
          state="default"
          fullWidth
          showIcon
          iconPosition="left"
          onChange={handleChange}
          disabled={false}
        />
      );
      
      expect(screen.getByLabelText('Search Items')).toBeInTheDocument();
      expect(screen.getByText('Type to search')).toBeInTheDocument();
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });
  });
});
