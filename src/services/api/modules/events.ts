// api/modules/events.ts - Events and Event Sub-APIs

import type { SchoolEvent, EventRegistration, EventBudget, EventPhoto, EventFeedback } from '../../../types';
import { request } from '../client';
import { API_ENDPOINTS } from '../../../constants';

// ============================================
// SCHOOL EVENTS API
// ============================================

export const eventsAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: SchoolEvent[]; error?: string }> {
    return request<SchoolEvent[]>(API_ENDPOINTS.EVENTS.BASE);
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: SchoolEvent; error?: string }> {
    return request<SchoolEvent>(API_ENDPOINTS.EVENTS.BY_ID(id));
  },

  async create(event: Partial<SchoolEvent>): Promise<{ success: boolean; message: string; data?: SchoolEvent; error?: string }> {
    return request<SchoolEvent>(API_ENDPOINTS.EVENTS.BASE, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  async update(id: string, event: Partial<SchoolEvent>): Promise<{ success: boolean; message: string; data?: SchoolEvent; error?: string }> {
    return request<SchoolEvent>(API_ENDPOINTS.EVENTS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  },

  async updateStatus(
    id: string,
    status: 'Upcoming' | 'Ongoing' | 'Completed'
  ): Promise<{ success: boolean; message: string; data?: SchoolEvent; error?: string }> {
    return request<SchoolEvent>(API_ENDPOINTS.EVENTS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(API_ENDPOINTS.EVENTS.BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================
// EVENT REGISTRATIONS API
// ============================================

export const eventRegistrationsAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: EventRegistration[]; error?: string }> {
    return request<EventRegistration[]>(API_ENDPOINTS.EVENTS.REGISTRATIONS);
  },

  async getByEventId(eventId: string): Promise<{ success: boolean; message: string; data?: EventRegistration[]; error?: string }> {
    return request<EventRegistration[]>(`${API_ENDPOINTS.EVENTS.REGISTRATIONS}?event_id=${eventId}`);
  },

  async create(registration: Partial<EventRegistration>): Promise<{ success: boolean; message: string; data?: EventRegistration; error?: string }> {
    return request<EventRegistration>(API_ENDPOINTS.EVENTS.REGISTRATIONS, {
      method: 'POST',
      body: JSON.stringify(registration),
    });
  },

  async updateAttendance(
    id: string,
    status: 'registered' | 'attended' | 'absent',
    notes?: string
  ): Promise<{ success: boolean; message: string; data?: EventRegistration; error?: string }> {
    return request<EventRegistration>(API_ENDPOINTS.EVENTS.REGISTRATION_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify({ attendance_status: status, notes }),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(API_ENDPOINTS.EVENTS.REGISTRATION_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================
// EVENT BUDGETS API
// ============================================

export const eventBudgetsAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: EventBudget[]; error?: string }> {
    return request<EventBudget[]>(API_ENDPOINTS.EVENTS.BUDGETS);
  },

  async getByEventId(eventId: string): Promise<{ success: boolean; message: string; data?: EventBudget[]; error?: string }> {
    return request<EventBudget[]>(`${API_ENDPOINTS.EVENTS.BUDGETS}?event_id=${eventId}`);
  },

  async create(budget: Partial<EventBudget>): Promise<{ success: boolean; message: string; data?: EventBudget; error?: string }> {
    return request<EventBudget>(API_ENDPOINTS.EVENTS.BUDGETS, {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  },

  async update(id: string, budget: Partial<EventBudget>): Promise<{ success: boolean; message: string; data?: EventBudget; error?: string }> {
    return request<EventBudget>(API_ENDPOINTS.EVENTS.BUDGET_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(budget),
    });
  },

  async approve(id: string): Promise<{ success: boolean; message: string; data?: EventBudget; error?: string }> {
    return request<EventBudget>(API_ENDPOINTS.EVENTS.BUDGET_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved' }),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(API_ENDPOINTS.EVENTS.BUDGET_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================
// EVENT PHOTOS API
// ============================================

export const eventPhotosAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: EventPhoto[]; error?: string }> {
    return request<EventPhoto[]>(API_ENDPOINTS.EVENTS.PHOTOS);
  },

  async getByEventId(eventId: string): Promise<{ success: boolean; message: string; data?: EventPhoto[]; error?: string }> {
    return request<EventPhoto[]>(`${API_ENDPOINTS.EVENTS.PHOTOS}?event_id=${eventId}`);
  },

  async create(photo: Partial<EventPhoto>): Promise<{ success: boolean; message: string; data?: EventPhoto; error?: string }> {
    return request<EventPhoto>(API_ENDPOINTS.EVENTS.PHOTOS, {
      method: 'POST',
      body: JSON.stringify(photo),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(API_ENDPOINTS.EVENTS.PHOTO_BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================
// EVENT FEEDBACK API
// ============================================

export const eventFeedbackAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: EventFeedback[]; error?: string }> {
    return request<EventFeedback[]>(API_ENDPOINTS.EVENTS.FEEDBACK);
  },

  async getByEventId(eventId: string): Promise<{ success: boolean; message: string; data?: EventFeedback[]; error?: string }> {
    return request<EventFeedback[]>(`${API_ENDPOINTS.EVENTS.FEEDBACK}?event_id=${eventId}`);
  },

  async create(feedback: Partial<EventFeedback>): Promise<{ success: boolean; message: string; data?: EventFeedback; error?: string }> {
    return request<EventFeedback>(API_ENDPOINTS.EVENTS.FEEDBACK, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(API_ENDPOINTS.EVENTS.FEEDBACK_BY_ID(id), {
      method: 'DELETE',
    });
  },
};
