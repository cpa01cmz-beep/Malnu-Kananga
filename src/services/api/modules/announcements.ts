// api/modules/announcements.ts - Announcements API

import type { Announcement } from '../../../types';
import { request } from '../client';
import { API_ENDPOINTS } from '../../../constants';

export const announcementsAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: Announcement[]; error?: string }> {
    return request<Announcement[]>(API_ENDPOINTS.ANNOUNCEMENTS.BASE);
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: Announcement; error?: string }> {
    return request<Announcement>(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id));
  },

  async getActive(): Promise<{ success: boolean; message: string; data?: Announcement[]; error?: string }> {
    return request<Announcement[]>(`${API_ENDPOINTS.ANNOUNCEMENTS.BASE}?active=true`);
  },

  async getByCategory(category: string): Promise<{ success: boolean; message: string; data?: Announcement[]; error?: string }> {
    return request<Announcement[]>(`${API_ENDPOINTS.ANNOUNCEMENTS.BASE}?category=${category}`);
  },

  async create(announcement: Partial<Announcement>): Promise<{ success: boolean; message: string; data?: Announcement; error?: string }> {
    return request<Announcement>(API_ENDPOINTS.ANNOUNCEMENTS.BASE, {
      method: 'POST',
      body: JSON.stringify(announcement),
    });
  },

  async update(id: string, announcement: Partial<Announcement>): Promise<{ success: boolean; message: string; data?: Announcement; error?: string }> {
    return request<Announcement>(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(announcement),
    });
  },

  async toggleStatus(id: string): Promise<{ success: boolean; message: string; data?: Announcement; error?: string }> {
    return request<Announcement>(`${API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id)}/toggle`, {
      method: 'PUT',
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id), {
      method: 'DELETE',
    });
  },
};
