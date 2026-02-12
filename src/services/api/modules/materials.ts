// api/modules/materials.ts - E-Library and File Storage APIs

import type { ELibrary } from '../../../types';
import { request } from '../client';
import { getAuthToken } from '../auth';
import { API_ENDPOINTS } from '../../../constants';

// ============================================
// E-LIBRARY API
// ============================================

export const eLibraryAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: ELibrary[]; error?: string }> {
    return request<ELibrary[]>(API_ENDPOINTS.LIBRARY.MATERIALS);
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: ELibrary; error?: string }> {
    return request<ELibrary>(`${API_ENDPOINTS.LIBRARY.MATERIALS}/${id}`);
  },

  async getByCategory(category: string): Promise<{ success: boolean; message: string; data?: ELibrary[]; error?: string }> {
    return request<ELibrary[]>(`${API_ENDPOINTS.LIBRARY.MATERIALS}?category=${category}`);
  },

  async getBySubject(subjectId: string): Promise<{ success: boolean; message: string; data?: ELibrary[]; error?: string }> {
    return request<ELibrary[]>(`${API_ENDPOINTS.LIBRARY.MATERIALS}?subject_id=${subjectId}`);
  },

  async create(material: Partial<ELibrary>): Promise<{ success: boolean; message: string; data?: ELibrary; error?: string }> {
    return request<ELibrary>(API_ENDPOINTS.LIBRARY.MATERIALS, {
      method: 'POST',
      body: JSON.stringify(material),
    });
  },

  async update(id: string, material: Partial<ELibrary>): Promise<{ success: boolean; message: string; data?: ELibrary; error?: string }> {
    return request<ELibrary>(`${API_ENDPOINTS.LIBRARY.MATERIALS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(material),
    });
  },

  async incrementDownloadCount(id: string): Promise<{ success: boolean; message: string; data?: ELibrary; error?: string }> {
    return request<ELibrary>(`${API_ENDPOINTS.LIBRARY.MATERIALS}/${id}/download`, {
      method: 'PUT',
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`${API_ENDPOINTS.LIBRARY.MATERIALS}/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// FILE STORAGE API
// ============================================

export interface FileUploadResponse {
  id: string;
  key: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
  size: number;
  type: string;
  name: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fileStorageAPI = {
  async upload(
    file: File,
    path?: string,
    options?: {
      onProgress?: (progress: UploadProgress) => void;
      abortController?: {
        signal: { addEventListener: (event: string, handler: () => void) => void };
      };
    }
  ): Promise<{ success: boolean; message: string; data?: FileUploadResponse; error?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (path) {
      formData.append('path', path);
    }

    const token = getAuthToken();
    const { onProgress, abortController } = options || {};

    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-undef
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage,
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            reject(response);
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      if (abortController) {
        abortController.signal?.addEventListener('abort', () => {
          xhr.abort();
        });
      }

      xhr.open('POST', `${API_BASE_URL}${API_ENDPOINTS.FILES.UPLOAD}`);
      xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '');
      xhr.send(formData);
    });
  },

  async delete(key: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(API_ENDPOINTS.FILES.DELETE(key), {
      method: 'DELETE',
    });
  },

  async list(prefix?: string): Promise<{ success: boolean; message: string; data?: Array<{ key: string; size: number; uploaded: string }>; error?: string }> {
    return request<Array<{ key: string; size: number; uploaded: string }>>(
      API_ENDPOINTS.FILES.LIST(prefix)
    );
  },

  getDownloadUrl(key: string): string {
    return `${API_BASE_URL}${API_ENDPOINTS.FILES.DOWNLOAD(key)}`;
  },
};
