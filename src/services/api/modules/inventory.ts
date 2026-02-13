// api/modules/inventory.ts - Inventory API

import type { InventoryItem } from '../../../types';
import { request } from '../client';
import { API_ENDPOINTS } from '../../../constants';

export const inventoryAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: InventoryItem[]; error?: string }> {
    return request<InventoryItem[]>(API_ENDPOINTS.INVENTORY.BASE);
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: InventoryItem; error?: string }> {
    return request<InventoryItem>(API_ENDPOINTS.INVENTORY.BY_ID(id));
  },

  async create(item: Partial<InventoryItem>): Promise<{ success: boolean; message: string; data?: InventoryItem; error?: string }> {
    return request<InventoryItem>(API_ENDPOINTS.INVENTORY.BASE, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async update(id: string, item: Partial<InventoryItem>): Promise<{ success: boolean; message: string; data?: InventoryItem; error?: string }> {
    return request<InventoryItem>(API_ENDPOINTS.INVENTORY.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(API_ENDPOINTS.INVENTORY.BY_ID(id), {
      method: 'DELETE',
    });
  },
};
