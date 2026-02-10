/**
 * Enhanced input masking utilities for form validation
 * Supports Indonesian data formats (NISN, phone numbers, dates)
 * Flexy: All mask patterns are imported from constants - never hardcoded!
 */

import { INPUT_MASKS, INPUT_MASK_PLACEHOLDERS, DATE_VALIDATION, DAYS_IN_MONTH } from '../constants';

export interface MaskOptions {
  mask: string;
  placeholder?: string;
  showMask?: boolean;
  permanentChars?: string[];
}

/**
 * NISN masking (10 digits)
 * Flexy: Uses INPUT_MASKS constant
 */
export const nisnMask: MaskOptions = {
  mask: INPUT_MASKS.NISN,
  placeholder: INPUT_MASK_PLACEHOLDERS.NISN,
  permanentChars: []
};

/**
 * Phone number masking (Indonesian format)
 * Flexy: Uses INPUT_MASKS constant
 */
export const phoneMask: MaskOptions = {
  mask: INPUT_MASKS.PHONE,
  placeholder: INPUT_MASK_PLACEHOLDERS.PHONE,
  permanentChars: []
};

/**
 * Date masking (DD-MM-YYYY)
 * Flexy: Uses INPUT_MASKS constant
 */
export const dateMask: MaskOptions = {
  mask: INPUT_MASKS.DATE,
  placeholder: INPUT_MASK_PLACEHOLDERS.DATE,
  permanentChars: ['-', '-']
};

/**
 * Year masking (YYYY)
 * Flexy: Uses INPUT_MASKS constant
 */
export const yearMask: MaskOptions = {
  mask: INPUT_MASKS.YEAR,
  placeholder: INPUT_MASK_PLACEHOLDERS.YEAR,
  permanentChars: []
};

/**
 * Class code masking (e.g., "XII RPL 1")
 */
export const classMask: MaskOptions = {
  mask: 'aaa aaa 9',
  placeholder: 'XII RPL 1',
  permanentChars: [' ', ' ']
};

/**
 * Grade masking (0-100)
 */
export const gradeMask: MaskOptions = {
  mask: '999',
  placeholder: '0-100',
  permanentChars: []
};

/**
 * Apply mask to input value
 */
export function applyMask(value: string, options: MaskOptions): string {
  const { mask, permanentChars = [] } = options;
  
  if (!value) return '';
  
  // Remove non-digit characters for numeric masks
  const cleanValue = value.replace(/\D/g, '');
  let maskedValue = '';
  let valueIndex = 0;
  
  for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
    const maskChar = mask[i];
    
    if (maskChar === '9') {
      // Digit placeholder
      maskedValue += cleanValue[valueIndex];
      valueIndex++;
    } else if (permanentChars.includes(maskChar)) {
      // Permanent character
      maskedValue += maskChar;
    } else {
      // Other placeholder (like letters)
      if (valueIndex < cleanValue.length) {
        maskedValue += cleanValue[valueIndex];
        valueIndex++;
      }
    }
  }
  
  return maskedValue;
}

/**
 * Remove mask from value (get clean value)
 */
export function removeMask(value: string, options: MaskOptions): string {
  const { permanentChars = [] } = options;
  let cleanValue = '';
  
  for (const char of value) {
    if (permanentChars.includes(char)) {
      continue; // Skip permanent characters
    }
    cleanValue += char;
  }
  
  return cleanValue;
}

/**
 * Validate masked value length
 */
export function validateMaskedLength(value: string, options: MaskOptions): boolean {
  const { mask, permanentChars = [] } = options;
  const expectedLength = mask.length - permanentChars.length;
  const actualLength = removeMask(value, options).length;
  
  return actualLength === expectedLength;
}

/**
 * Input formatting utilities for real-time formatting
 */
export class InputFormatter {
  protected options: MaskOptions;
  protected previousValue: string = '';
  
  constructor(options: MaskOptions) {
    this.options = options;
  }
  
  /**
   * Format input value on change
   */
  format(value: string): string {
    if (!value) return '';
    
    // If backspace was pressed, don't reformat to allow deletion
    if (value.length < this.previousValue.length) {
      this.previousValue = value;
      return value;
    }
    
    const masked = applyMask(value, this.options);
    this.previousValue = masked;
    
    return masked;
  }
  
  /**
   * Get clean value for submission
   */
  getCleanValue(value: string): string {
    return removeMask(value, this.options);
  }
  
  /**
   * Validate complete input
   */
  isValid(value: string): boolean {
    return validateMaskedLength(value, this.options);
  }
}

/**
 * Phone number specific formatter
 */
export class PhoneFormatter extends InputFormatter {
  constructor() {
    super(phoneMask);
  }
  
  format(value: string): string {
    if (!value) return '';
    
    // Handle backspace
    if (value.length < this.previousValue.length) {
      this.previousValue = value;
      return value;
    }
    
    // Start with 0 for Indonesian numbers
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 0 && !cleanValue.startsWith('0')) {
      cleanValue = '0' + cleanValue;
    }
    
    let formatted = '';
    if (cleanValue.length >= 1) formatted += cleanValue.substring(0, 3);
    if (cleanValue.length >= 4) formatted += '-' + cleanValue.substring(3, 7);
    if (cleanValue.length >= 8) formatted += '-' + cleanValue.substring(7, 12);
    
    this.previousValue = formatted;
    return formatted;
  }
}

/**
 * Date specific formatter
 */
export class DateFormatter extends InputFormatter {
  constructor() {
    super(dateMask);
  }
  
  format(value: string): string {
    if (!value) return '';
    
    // Handle backspace
    if (value.length < this.previousValue.length) {
      this.previousValue = value;
      return value;
    }
    
    const cleanValue = value.replace(/\D/g, '');
    let formatted = '';
    
    if (cleanValue.length >= 1) formatted += cleanValue.substring(0, 2);
    if (cleanValue.length >= 3) formatted += '-' + cleanValue.substring(2, 4);
    if (cleanValue.length >= 5) formatted += '-' + cleanValue.substring(4, 8);
    
    this.previousValue = formatted;
    return formatted;
  }
  
  /**
   * Validate date format and logical date
   */
  isValid(value: string): boolean {
    if (!validateMaskedLength(value, this.options)) {
      return false;
    }
    
    const cleanValue = this.getCleanValue(value);
    if (cleanValue.length !== 8) return false;
    
    const day = parseInt(cleanValue.substring(0, 2));
    const month = parseInt(cleanValue.substring(2, 4));
    const year = parseInt(cleanValue.substring(4, 8));
    
    // Basic date validation - Flexy: Uses DATE_VALIDATION constant
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < DATE_VALIDATION.MIN_YEAR || year > new Date().getFullYear() + DATE_VALIDATION.MAX_YEAR_OFFSET) return false;
    
    // Month-specific day validation - Flexy: Uses DAYS_IN_MONTH pattern
    const daysInMonthArray = [
      DAYS_IN_MONTH[0], // Jan: 31
      (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : DAYS_IN_MONTH[1], // Feb
      DAYS_IN_MONTH[2], // Mar: 31
      DAYS_IN_MONTH[3], // Apr: 30
      DAYS_IN_MONTH[4], // May: 31
      DAYS_IN_MONTH[5], // Jun: 30
      DAYS_IN_MONTH[6], // Jul: 31
      DAYS_IN_MONTH[7], // Aug: 31
      DAYS_IN_MONTH[8], // Sep: 30
      DAYS_IN_MONTH[9], // Oct: 31
      DAYS_IN_MONTH[10], // Nov: 30
      DAYS_IN_MONTH[11], // Dec: 31
    ];
    
    return day <= daysInMonthArray[month - 1];
  }
}

/**
 * Create appropriate formatter based on type
 */
export function createFormatter(type: 'nisn' | 'phone' | 'date' | 'year' | 'class' | 'grade'): InputFormatter {
  switch (type) {
    case 'nisn':
      return new InputFormatter(nisnMask);
    case 'phone':
      return new PhoneFormatter();
    case 'date':
      return new DateFormatter();
    case 'year':
      return new InputFormatter(yearMask);
    case 'class':
      return new InputFormatter(classMask);
    case 'grade':
      return new InputFormatter(gradeMask);
    default:
      return new InputFormatter({ mask: '', permanentChars: [] });
  }
}