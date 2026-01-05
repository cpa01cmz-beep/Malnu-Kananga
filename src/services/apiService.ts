// apiService.ts - Frontend API Service
// Handles all backend API interactions

import type { User, PPDBRegistrant, InventoryItem, SchoolEvent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://malnu-kananga-worker.cpa01cmz.workers.dev';

// ============================================
// TYPES
// ============================================

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthPayload {
  user_id: string;
  email: string;
  role: string;
  session_id: string;
  exp: number;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get stored auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Set auth token
function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

// Clear auth token
function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

// Parse JWT token (without verification, for payload access only)
function parseJwtPayload(token: string): AuthPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      (typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString())
        .split('')
        .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Check if token is expired
function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

// ============================================
// AUTHENTICATION API
// ============================================

export const authAPI = {
  // Login
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse = await response.json();
    
    if (data.success && data.data?.token) {
      setAuthToken(data.data.token);
    }
    
    return data;
  },

  // Logout
  async logout(): Promise<void> {
    const token = getAuthToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      clearAuthToken();
    }
  },

  // Get current user from token
  getCurrentUser(): User | null {
    const token = getAuthToken();
    if (!token || isTokenExpired(token)) return null;

    const payload = parseJwtPayload(token);
    if (!payload) return null;

    return {
      id: payload.user_id,
      name: '', // Not stored in JWT
      email: payload.email,
      role: payload.role as 'admin' | 'teacher' | 'student',
      status: 'active',
    };
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    const token = getAuthToken();
    return token !== null && !isTokenExpired(token);
  },

  // Get auth token for API requests
  getAuthToken,
};

// ============================================
// GENERIC API FUNCTIONS
// ============================================

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    } as HeadersInit,
  });

  return response.json();
}

// Type declarations for Web API
declare global {
  interface Window {
    atob: (data: string) => string;
  }
}

interface RequestInit {
  headers?: Record<string, string>;
}

interface HeadersInit {
  [key: string]: string;
}

// ============================================
// USERS API
// ============================================

export const usersAPI = {
  // Get all users
  async getAll(): Promise<ApiResponse<User[]>> {
    return request<User[]>('/api/users');
  },

  // Get user by ID
  async getById(id: string): Promise<ApiResponse<User>> {
    return request<User>(`/api/users/${id}`);
  },

  // Create user
  async create(user: Partial<User>): Promise<ApiResponse<User>> {
    return request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  // Update user
  async update(id: string, user: Partial<User>): Promise<ApiResponse<User>> {
    return request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  // Delete user
  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// PPDB REGISTRANTS API
// ============================================

export const ppdbAPI = {
  // Get all registrants
  async getAll(): Promise<ApiResponse<PPDBRegistrant[]>> {
    return request<PPDBRegistrant[]>('/api/ppdb_registrants');
  },

  // Get registrant by ID
  async getById(id: string): Promise<ApiResponse<PPDBRegistrant>> {
    return request<PPDBRegistrant>(`/api/ppdb_registrants/${id}`);
  },

  // Create new registration
  async create(registrant: Partial<PPDBRegistrant>): Promise<ApiResponse<PPDBRegistrant>> {
    return request<PPDBRegistrant>('/api/ppdb_registrants', {
      method: 'POST',
      body: JSON.stringify(registrant),
    });
  },

  // Update registrant status
  async updateStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<ApiResponse<PPDBRegistrant>> {
    return request<PPDBRegistrant>(`/api/ppdb_registrants/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...(notes && { notes }) }),
    });
  },

  // Delete registrant
  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/ppdb_registrants/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// INVENTORY API
// ============================================

export const inventoryAPI = {
  // Get all inventory items
  async getAll(): Promise<ApiResponse<InventoryItem[]>> {
    return request<InventoryItem[]>('/api/inventory');
  },

  // Get item by ID
  async getById(id: string): Promise<ApiResponse<InventoryItem>> {
    return request<InventoryItem>(`/api/inventory/${id}`);
  },

  // Create new inventory item
  async create(item: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    return request<InventoryItem>('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  // Update inventory item
  async update(id: string, item: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    return request<InventoryItem>(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  // Delete inventory item
  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/inventory/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// SCHOOL EVENTS API
// ============================================

export const eventsAPI = {
  // Get all events
  async getAll(): Promise<ApiResponse<SchoolEvent[]>> {
    return request<SchoolEvent[]>('/api/school_events');
  },

  // Get event by ID
  async getById(id: string): Promise<ApiResponse<SchoolEvent>> {
    return request<SchoolEvent>(`/api/school_events/${id}`);
  },

  // Create new event
  async create(event: Partial<SchoolEvent>): Promise<ApiResponse<SchoolEvent>> {
    return request<SchoolEvent>('/api/school_events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  // Update event
  async update(id: string, event: Partial<SchoolEvent>): Promise<ApiResponse<SchoolEvent>> {
    return request<SchoolEvent>(`/api/school_events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  },

  // Update event status
  async updateStatus(
    id: string,
    status: 'Upcoming' | 'Ongoing' | 'Completed'
  ): Promise<ApiResponse<SchoolEvent>> {
    return request<SchoolEvent>(`/api/school_events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Delete event
  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/school_events/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// CHAT / RAG API
// ============================================

export const chatAPI = {
  // Get RAG context for chat
  async getContext(message: string): Promise<{ context: string }> {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    return response.json();
  },
};

// ============================================
// EXPORT ALL APIs
// ============================================

export const api = {
  auth: authAPI,
  users: usersAPI,
  ppdb: ppdbAPI,
  inventory: inventoryAPI,
  events: eventsAPI,
  chat: chatAPI,
};
