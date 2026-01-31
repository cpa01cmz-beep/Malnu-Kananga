// api/modules/ppdb.ts - PPDB API

import type { PPDBRegistrant } from '../../../types';
import { request } from '../client';

export const ppdbAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: PPDBRegistrant[]; error?: string }> {
    return request<PPDBRegistrant[]>('/api/ppdb_registrants');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: PPDBRegistrant; error?: string }> {
    return request<PPDBRegistrant>(`/api/ppdb_registrants/${id}`);
  },

  async create(registrant: Partial<PPDBRegistrant>): Promise<{ success: boolean; message: string; data?: PPDBRegistrant; error?: string }> {
    return request<PPDBRegistrant>('/api/ppdb_registrants', {
      method: 'POST',
      body: JSON.stringify(registrant),
    });
  },

  async updateStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<{ success: boolean; message: string; data?: PPDBRegistrant; error?: string }> {
    return request<PPDBRegistrant>(`/api/ppdb_registrants/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...(notes && { notes }) }),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/ppdb_registrants/${id}`, {
      method: 'DELETE',
    });
  },
};
