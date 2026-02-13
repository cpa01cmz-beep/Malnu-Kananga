// FormWrapper.test.tsx - Tests for FormWrapper component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormWrapper from '../ui/FormWrapper';

describe('FormWrapper Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form element', () => {
      render(
        <FormWrapper isSubmitting={false} onSubmit={vi.fn()}>
          <input type="text" />
        </FormWrapper>
      );
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should render with submit button text', () => {
      render(
        <FormWrapper isSubmitting={false} onSubmit={vi.fn()} submitText="Save">
          <button type="submit">Save</button>
        </FormWrapper>
      );
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('Submit handling', () => {
    it('should call onSubmit when form is submitted', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      
      render(
        <FormWrapper isSubmitting={false} onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </FormWrapper>
      );
      
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);
      
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('Loading state', () => {
    it('should show loading overlay when isSubmitting is true', () => {
      render(
        <FormWrapper isSubmitting={true} onSubmit={vi.fn()}>
          <input type="text" />
        </FormWrapper>
      );
      
      expect(screen.getByText('Memproses...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form role', () => {
      render(
        <FormWrapper isSubmitting={false} onSubmit={vi.fn()}>
          <input type="text" />
        </FormWrapper>
      );
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });
});
