import type { ApiResponse } from '../services/api';

export const handleApiResponse = <T>(
  response: ApiResponse<T>,
  successMessage?: string,
  onShowToast?: (msg: string, type: 'success' | 'error') => void
): T | null => {
  if (response.success && response.data) {
    if (successMessage && onShowToast) {
      onShowToast(successMessage, 'success');
    }
    return response.data;
  } else {
    if (onShowToast) {
      onShowToast(response.message || 'Gagal memuat data', 'error');
    }
    return null;
  }
};