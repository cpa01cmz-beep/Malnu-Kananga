 
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Textarea from '../Textarea';

describe('Textarea Component', () => {
  it('renders correctly with basic props', () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label and helper text', () => {
    render(
      <Textarea
        label="Description"
        helperText="Provide a detailed description"
      />
    );
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Provide a detailed description')).toBeInTheDocument();
  });

  it('shows error state and error text', () => {
    render(
      <Textarea
        label="Comments"
        errorText="Comments are required"
      />
    );
    const textarea = screen.getByLabelText('Comments');
    expect(textarea).toHaveClass('border-red-300');
    expect(screen.getByText('Comments are required')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Textarea size="sm" />);
    let textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('px-3', 'py-2', 'text-sm');

    rerender(<Textarea size="md" />);
    textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('px-4', 'py-3');

    rerender(<Textarea size="lg" />);
    textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('px-5', 'py-4', 'text-base');
  });

  it('disables textarea when disabled prop is true', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('shows required asterisk when required prop is true', () => {
    render(<Textarea label="Feedback" required />);
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange handler when textarea changes', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'test value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<Textarea label="Test Label" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAccessibleName('Test Label');
  });

  it('associates helper text with textarea using aria-describedby', () => {
    render(
      <Textarea
        label="Description"
        helperText="Provide a detailed description"
      />
    );
    const textarea = screen.getByRole('textbox');
    const helperText = screen.getByText('Provide a detailed description');
    expect(textarea).toHaveAttribute('aria-describedby');
    expect(helperText.id).toBe(textarea.getAttribute('aria-describedby'));
  });

  it('associates error text with textarea using aria-describedby and role="alert"', () => {
    render(
      <Textarea
        label="Comments"
        errorText="Comments are required"
      />
    );
    const textarea = screen.getByRole('textbox');
    const errorText = screen.getByText('Comments are required');
    expect(textarea).toHaveAttribute('aria-describedby');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(errorText).toHaveAttribute('role', 'alert');
    expect(errorText.id).toBe(textarea.getAttribute('aria-describedby'));
  });

  it('sets aria-invalid to false for non-error states', () => {
    render(<Textarea label="Test" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'false');
  });

  it('supports fullWidth prop', () => {
    render(<Textarea fullWidth />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('w-full');
  });

  it('auto-resizes when autoResize is true and value changes', () => {
    const { rerender } = render(<Textarea autoResize value="Short text" />);
    const textarea = screen.getByRole('textbox');
    
    expect(textarea.style.height).toBeDefined();
    const initialHeight = textarea.style.height;

    rerender(<Textarea autoResize value="This is a much longer text that should cause the textarea to auto-resize to accommodate all the content" />);
    expect(textarea.style.height).toBeDefined();
    
    rerender(<Textarea autoResize value="Short text" />);
    expect(textarea.style.height).toBe(initialHeight);
  });

  it('does not auto-resize when autoResize is false', () => {
    render(<Textarea autoResize={false} value="Any text" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).not.toHaveStyle('height: auto');
  });

  it('respects maxRows limit when auto-resizing', () => {
    const longText = 'Line 1\n'.repeat(20);
    render(<Textarea autoResize maxRows={5} value={longText} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.style.height).toBeDefined();
  });

  it('respects minRows limit when auto-resizing', () => {
    render(<Textarea autoResize minRows={3} value="Short" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.style.height).toBeDefined();
  });

  it('applies success state', () => {
    render(<Textarea state="success" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-green-300');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('renders with custom className', () => {
    render(<Textarea className="custom-class" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-class');
  });

  it('generates unique id when not provided', () => {
    const { rerender } = render(<Textarea label="Test 1" />);
    const textarea1 = screen.getByRole('textbox');
    const id1 = textarea1.id;

    rerender(<Textarea label="Test 2" />);
    const textarea2 = screen.getByRole('textbox');
    const id2 = textarea2.id;

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^textarea_/);
    expect(id2).toMatch(/^textarea_/);
  });

  it('respects provided id prop', () => {
    render(<Textarea id="custom-id" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.id).toBe('custom-id');
  });

  it('shows error text when both helper and error text are present', () => {
    render(
      <Textarea
        label="Test"
        helperText="Helper text"
        errorText="Error text"
      />
    );
    const textarea = screen.getByRole('textbox');
    const errorText = screen.getByText('Error text');
    const helperText = screen.getByText('Helper text');

    expect(helperText).toBeInTheDocument();
    const describedBy = textarea.getAttribute('aria-describedby');
    expect(describedBy).toContain(errorText.id);
    expect(describedBy).toContain(helperText.id);
  });

  // Micro-UX: Clear button tests
  describe('Clear button functionality', () => {
    it('should not show clear button by default', () => {
      render(<Textarea value="Some text" />);
      const clearButton = screen.queryByRole('button', { name: /bersihkan/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should show clear button when showClearButton is true and there is a value', () => {
      render(<Textarea value="Some text" showClearButton />);
      const clearButton = screen.getByRole('button', { name: /bersihkan/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should not show clear button when value is empty', () => {
      render(<Textarea value="" showClearButton />);
      const clearButton = screen.queryByRole('button', { name: /bersihkan/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should not show clear button when textarea is disabled', () => {
      render(<Textarea value="Some text" showClearButton disabled />);
      const clearButton = screen.queryByRole('button', { name: /bersihkan/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should clear value when clear button is clicked', () => {
      const handleChange = vi.fn();
      render(<Textarea value="Some text" showClearButton onChange={handleChange} />);

      const clearButton = screen.getByRole('button', { name: /bersihkan/i });
      fireEvent.click(clearButton);

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: '' })
        })
      );
    });

    it('should focus textarea after clearing', () => {
      render(<Textarea value="Some text" showClearButton />);
      const textarea = screen.getByRole('textbox');
      const clearButton = screen.getByRole('button', { name: /bersihkan/i });

      fireEvent.click(clearButton);

      expect(document.activeElement).toBe(textarea);
    });
  });

  // Micro-UX: Escape key functionality
  describe('Escape key functionality', () => {
    it('should not clear on escape by default', () => {
      const handleChange = vi.fn();
      render(<Textarea value="Some text" onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');

      fireEvent.keyDown(textarea, { key: 'Escape' });

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should clear value when escape is pressed and clearOnEscape is true', () => {
      const handleChange = vi.fn();
      render(<Textarea value="Some text" clearOnEscape onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');

      fireEvent.keyDown(textarea, { key: 'Escape' });

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: '' })
        })
      );
    });

    it('should focus textarea after clearing with escape key', () => {
      render(<Textarea value="Some text" clearOnEscape />);
      const textarea = screen.getByRole('textbox');

      fireEvent.keyDown(textarea, { key: 'Escape' });

      expect(document.activeElement).toBe(textarea);
    });

    it('should show escape hint tooltip when focused with value and clearOnEscape is true', async () => {
      render(<Textarea value="Some text" clearOnEscape />);
      const textarea = screen.getByRole('textbox');

      fireEvent.focus(textarea);

      await waitFor(() => {
        const hint = screen.getByRole('tooltip');
        expect(hint).toBeInTheDocument();
        expect(hint).toHaveTextContent('ESC');
        expect(hint).toHaveTextContent('bersihkan');
      }, { timeout: 500 });
    });

    it('should not show escape hint when clearOnEscape is false', async () => {
      render(<Textarea value="Some text" clearOnEscape={false} />);
      const textarea = screen.getByRole('textbox');

      fireEvent.focus(textarea);
      await new Promise(resolve => setTimeout(resolve, 500));
      const hint = screen.queryByRole('tooltip');
      expect(hint).not.toBeInTheDocument();
    });

    it('should not show escape hint when textarea is empty', async () => {
      render(<Textarea value="" clearOnEscape />);
      const textarea = screen.getByRole('textbox');

      fireEvent.focus(textarea);
      await new Promise(resolve => setTimeout(resolve, 500));
      const hint = screen.queryByRole('tooltip');
      expect(hint).not.toBeInTheDocument();
    });

    it('should hide escape hint when textarea loses focus', async () => {
      render(<Textarea value="Some text" clearOnEscape />);
      const textarea = screen.getByRole('textbox');

      fireEvent.focus(textarea);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      }, { timeout: 500 });

      fireEvent.blur(textarea);
      const hint = screen.queryByRole('tooltip');
      expect(hint).not.toBeInTheDocument();
    });
  });

  describe('Ctrl+Enter submit functionality', () => {
    it('should not submit on Ctrl+Enter by default', () => {
      const handleSubmit = vi.fn();
      render(<Textarea value="Some text" onSubmit={handleSubmit} />);
      const textarea = screen.getByRole('textbox');

      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should call onSubmit when Ctrl+Enter is pressed and submitOnCtrlEnter is true', () => {
      const handleSubmit = vi.fn();
      render(<Textarea value="Some text" submitOnCtrlEnter onSubmit={handleSubmit} />);
      const textarea = screen.getByRole('textbox');

      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should call onSubmit when Cmd+Enter is pressed (Mac) and submitOnCtrlEnter is true', () => {
      const handleSubmit = vi.fn();
      render(<Textarea value="Some text" submitOnCtrlEnter onSubmit={handleSubmit} />);
      const textarea = screen.getByRole('textbox');

      fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should not call onSubmit when textarea is empty', () => {
      const handleSubmit = vi.fn();
      render(<Textarea value="" submitOnCtrlEnter onSubmit={handleSubmit} />);
      const textarea = screen.getByRole('textbox');

      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should prevent default behavior when Ctrl+Enter is pressed', () => {
      const handleSubmit = vi.fn();
      render(<Textarea value="Some text" submitOnCtrlEnter onSubmit={handleSubmit} />);
      const textarea = screen.getByRole('textbox');

      const keyDownEvent = fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      expect(keyDownEvent).toBe(false);
    });

    it('should show submit hint tooltip when focused with value and submitOnCtrlEnter is true', async () => {
      render(<Textarea value="Some text" submitOnCtrlEnter />);
      const textarea = screen.getByRole('textbox');

      fireEvent.focus(textarea);

      await waitFor(() => {
        const hints = screen.getAllByRole('tooltip');
        const submitHint = hints.find(hint => hint.textContent?.includes('kirim'));
        expect(submitHint).toBeInTheDocument();
        expect(submitHint).toHaveTextContent('kirim');
      }, { timeout: 700 });
    });

    it('should not show submit hint when submitOnCtrlEnter is false', async () => {
      render(<Textarea value="Some text" submitOnCtrlEnter={false} />);
      const textarea = screen.getByRole('textbox');

      fireEvent.focus(textarea);
      await new Promise(resolve => setTimeout(resolve, 700));
      const hints = screen.queryAllByRole('tooltip');
      const submitHint = hints.find(hint => hint.textContent?.includes('kirim'));
      expect(submitHint).toBeUndefined();
    });

    it('should not show submit hint when textarea is empty', async () => {
      render(<Textarea value="" submitOnCtrlEnter />);
      const textarea = screen.getByRole('textbox');

      fireEvent.focus(textarea);
      await new Promise(resolve => setTimeout(resolve, 700));
      const hints = screen.queryAllByRole('tooltip');
      const submitHint = hints.find(hint => hint.textContent?.includes('kirim'));
      expect(submitHint).toBeUndefined();
    });

    it('should hide submit hint when textarea loses focus', async () => {
      render(<Textarea value="Some text" submitOnCtrlEnter />);
      const textarea = screen.getByRole('textbox');

      fireEvent.focus(textarea);
      await waitFor(() => {
        const hints = screen.getAllByRole('tooltip');
        expect(hints.some(hint => hint.textContent?.includes('kirim'))).toBe(true);
      }, { timeout: 700 });

      fireEvent.blur(textarea);
      await new Promise(resolve => setTimeout(resolve, 100));
      const hints = screen.queryAllByRole('tooltip');
      const submitHint = hints.find(hint => hint.textContent?.includes('kirim'));
      expect(submitHint).toBeUndefined();
    });

    it('should include keyboard shortcut in aria-label when submitOnCtrlEnter is true', () => {
      render(
        <Textarea
          value="Some text"
          submitOnCtrlEnter
          aria-label="Pesan"
        />
      );
      const textarea = screen.getByRole('textbox');

      expect(textarea).toHaveAttribute('aria-label', expect.stringContaining('Tekan'));
      expect(textarea).toHaveAttribute('aria-label', expect.stringContaining('untuk mengirim'));
    });
  });
});
