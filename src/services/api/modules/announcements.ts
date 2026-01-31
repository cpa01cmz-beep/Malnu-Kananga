// api/modules/announcements.ts - Announcements API

import type { Announcement } from '../../../types';
import { request } from '../client';

export const announcementsAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: Announcement[]; error?: string }> {
    return request<Announcement[]>('/api/announcements');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: Announcement; error?: string }> {
    return request<Announcement>(`/api/announcements/${id}`);
  },

  async getActive(): Promise<{ success: boolean; message: string; data?: Announcement[]; error?: string }> {
    return request<Announcement[]>('/api/announcements?active=true');
  },

  async getByCategory(category: string): Promise<{ success: boolean; message: string; data?: Announcement[]; error?: string }> {
    return request<Announcement[]>(`/api/announcements?category=${category}`);
  },

  async create(announcement: Partial<Announcement>): Promise<{ success: boolean; message: string; data?: Announcement; error?: string }> {
    return request<Announcement>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement),
    });
  },

  async update(id: string, announcement: Partial<Announcement>): Promise<{ success: boolean; message: string; data?: Announcement; error?: string }> {
    return request<Announcement>(`/api/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcement),
    });
  },

  async toggleStatus(id: string): Promise<{ success: boolean; message: string; data?: Announcement; error?: string }> {
    return request<Announcement>(`/api/announcements/${id}/toggle`, {
      method: 'PUT',
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/announcements/${id}`, {
      method: 'DELETE',
    });
  },
};
