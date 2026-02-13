// api/modules/ppdb.ts - PPDB API

import type { PPDBRegistrant } from '../../../types';
import { request } from '../client';
import { API_ENDPOINTS } from '../../../constants';

export const ppdbAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: PPDBRegistrant[]; error?: string }> {
    return request<PPDBRegistrant[]>(API_ENDPOINTS.PPDB.REGISTRANTS);
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: PPDBRegistrant; error?: string }> {
    return request<PPDBRegistrant>(`${API_ENDPOINTS.PPDB.REGISTRANTS}/${id}`);
  },

  async create(registrant: Partial<PPDBRegistrant>): Promise<{ success: boolean; message: string; data?: PPDBRegistrant; error?: string }> {
    return request<PPDBRegistrant>(API_ENDPOINTS.PPDB.REGISTRANTS, {
      method: 'POST',
      body: JSON.stringify(registrant),
    });
  },

  async updateStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<{ success: boolean; message: string; data?: PPDBRegistrant; error?: string }> {
    return request<PPDBRegistrant>(`${API_ENDPOINTS.PPDB.REGISTRANTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...(notes && { notes }) }),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`${API_ENDPOINTS.PPDB.REGISTRANTS}/${id}`, {
      method: 'DELETE',
    });
  },
};
