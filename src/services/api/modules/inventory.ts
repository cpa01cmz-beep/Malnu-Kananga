// api/modules/inventory.ts - Inventory API

import type { InventoryItem } from '../../../types';
import { request } from '../client';

export const inventoryAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: InventoryItem[]; error?: string }> {
    return request<InventoryItem[]>('/api/inventory');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: InventoryItem; error?: string }> {
    return request<InventoryItem>(`/api/inventory/${id}`);
  },

  async create(item: Partial<InventoryItem>): Promise<{ success: boolean; message: string; data?: InventoryItem; error?: string }> {
    return request<InventoryItem>('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async update(id: string, item: Partial<InventoryItem>): Promise<{ success: boolean; message: string; data?: InventoryItem; error?: string }> {
    return request<InventoryItem>(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/inventory/${id}`, {
      method: 'DELETE',
    });
  },
};
