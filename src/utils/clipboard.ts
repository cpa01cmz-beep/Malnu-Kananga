/**
 * Clipboard utility functions for copying text to clipboard
 * with fallback for older browsers
 */

import { logger } from './logger';

export interface CopyResult {
  success: boolean;
  message: string;
}

/**
 * Copy text to clipboard using modern Clipboard API with fallback
 * @param text - The text to copy
 * @returns Promise<CopyResult> - Result of the copy operation
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  // Try modern Clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return {
        success: true,
        message: 'Berhasil disalin ke clipboard'
      };
    } catch (error) {
      logger.warn('Clipboard API failed, trying fallback', error);
    }
  }

  // Fallback for older browsers or non-secure contexts
  return fallbackCopyToClipboard(text);
}

/**
 * Fallback copy method using execCommand
 * @param text - The text to copy
 * @returns CopyResult - Result of the copy operation
 */
function fallbackCopyToClipboard(text: string): CopyResult {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Make the textarea out of viewport
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '0';
  textArea.setAttribute('aria-hidden', 'true');
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return {
        success: true,
        message: 'Berhasil disalin ke clipboard'
      };
    } else {
      return {
        success: false,
        message: 'Gagal menyalin ke clipboard'
      };
    }
  } catch (error) {
    document.body.removeChild(textArea);
    logger.error('Fallback copy failed', error);
    return {
      success: false,
      message: 'Gagal menyalin ke clipboard'
    };
  }
}

/**
 * Check if clipboard API is supported
 * @returns boolean
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard || document.execCommand);
}
