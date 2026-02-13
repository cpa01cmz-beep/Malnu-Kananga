import { describe, it, expect } from 'vitest';
import {
  FORM_FIELD_BASE_CLASSES,
  FORM_FIELD_SIZES,
  FORM_FIELD_STATES,
  FORM_FIELD_FOCUS,
  FORM_LABEL_CLASSES,
  FORM_ERROR_CLASSES,
  FORM_SUCCESS_CLASSES,
  buildFormFieldClasses,
  VALIDATION_FEEDBACK_CLASSES,
} from '../formUtils';

describe('formUtils', () => {
  describe('Constants', () => {
    it('should have FORM_FIELD_BASE_CLASSES defined', () => {
      expect(FORM_FIELD_BASE_CLASSES).toBeDefined();
      expect(FORM_FIELD_BASE_CLASSES).toContain('w-full');
      expect(FORM_FIELD_BASE_CLASSES).toContain('rounded-lg');
    });

    it('should have all size options in FORM_FIELD_SIZES', () => {
      expect(FORM_FIELD_SIZES).toHaveProperty('sm');
      expect(FORM_FIELD_SIZES).toHaveProperty('md');
      expect(FORM_FIELD_SIZES).toHaveProperty('lg');
    });

    it('should have all state options in FORM_FIELD_STATES', () => {
      expect(FORM_FIELD_STATES).toHaveProperty('default');
      expect(FORM_FIELD_STATES).toHaveProperty('error');
      expect(FORM_FIELD_STATES).toHaveProperty('success');
      expect(FORM_FIELD_STATES).toHaveProperty('disabled');
    });

    it('should have FORM_FIELD_FOCUS defined', () => {
      expect(FORM_FIELD_FOCUS).toContain('focus:ring');
      expect(FORM_FIELD_FOCUS).toContain('focus:border');
    });

    it('should have label classes defined', () => {
      expect(FORM_LABEL_CLASSES).toContain('block');
      expect(FORM_LABEL_CLASSES).toContain('font-medium');
    });

    it('should have error classes defined', () => {
      expect(FORM_ERROR_CLASSES).toContain('text-red-600');
      expect(FORM_ERROR_CLASSES).toContain('flex');
    });

    it('should have success classes defined', () => {
      expect(FORM_SUCCESS_CLASSES).toContain('text-green-600');
      expect(FORM_SUCCESS_CLASSES).toContain('flex');
    });
  });

  describe('buildFormFieldClasses', () => {
    it('should return base classes with default size and state', () => {
      const result = buildFormFieldClasses({});
      expect(result).toContain(FORM_FIELD_BASE_CLASSES);
      expect(result).toContain(FORM_FIELD_SIZES.md);
      expect(result).toContain(FORM_FIELD_STATES.default);
    });

    it('should apply sm size when specified', () => {
      const result = buildFormFieldClasses({ size: 'sm' });
      expect(result).toContain(FORM_FIELD_SIZES.sm);
    });

    it('should apply lg size when specified', () => {
      const result = buildFormFieldClasses({ size: 'lg' });
      expect(result).toContain(FORM_FIELD_SIZES.lg);
    });

    it('should apply error state when specified', () => {
      const result = buildFormFieldClasses({ state: 'error' });
      expect(result).toContain(FORM_FIELD_STATES.error);
    });

    it('should apply success state when specified', () => {
      const result = buildFormFieldClasses({ state: 'success' });
      expect(result).toContain(FORM_FIELD_STATES.success);
    });

    it('should apply disabled state when specified', () => {
      const result = buildFormFieldClasses({ disabled: true });
      expect(result).toContain(FORM_FIELD_STATES.disabled);
    });

    it('should apply disabled state over custom state', () => {
      const result = buildFormFieldClasses({ state: 'error', disabled: true });
      expect(result).toContain(FORM_FIELD_STATES.disabled);
    });

    it('should include custom className when provided', () => {
      const result = buildFormFieldClasses({ className: 'custom-class' });
      expect(result).toContain('custom-class');
    });

    it('should include focus classes', () => {
      const result = buildFormFieldClasses({});
      expect(result).toContain(FORM_FIELD_FOCUS);
    });

    it('should handle all parameters together', () => {
      const result = buildFormFieldClasses({
        size: 'lg',
        state: 'success',
        disabled: false,
        className: 'my-custom-class'
      });
      expect(result).toContain(FORM_FIELD_SIZES.lg);
      expect(result).toContain(FORM_FIELD_STATES.success);
      expect(result).toContain('my-custom-class');
    });
  });

  describe('VALIDATION_FEEDBACK_CLASSES', () => {
    it('should have all validation states', () => {
      expect(VALIDATION_FEEDBACK_CLASSES).toHaveProperty('success');
      expect(VALIDATION_FEEDBACK_CLASSES).toHaveProperty('error');
      expect(VALIDATION_FEEDBACK_CLASSES).toHaveProperty('warning');
      expect(VALIDATION_FEEDBACK_CLASSES).toHaveProperty('info');
    });

    it('should have base classes defined', () => {
      expect(VALIDATION_FEEDBACK_CLASSES.base).toContain('flex');
      expect(VALIDATION_FEEDBACK_CLASSES.base).toContain('rounded-lg');
    });

    it('should have success classes with green colors', () => {
      expect(VALIDATION_FEEDBACK_CLASSES.success).toContain('green');
    });

    it('should have error classes with red colors', () => {
      expect(VALIDATION_FEEDBACK_CLASSES.error).toContain('red');
    });
  });
});
