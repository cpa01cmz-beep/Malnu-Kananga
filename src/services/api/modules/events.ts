// api/modules/events.ts - Events and Event Sub-APIs

import type { SchoolEvent, EventRegistration, EventBudget, EventPhoto, EventFeedback } from '../../../types';
import { request } from '../client';

// ============================================
// SCHOOL EVENTS API
// ============================================

export const eventsAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: SchoolEvent[]; error?: string }> {
    return request<SchoolEvent[]>('/api/school_events');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: SchoolEvent; error?: string }> {
    return request<SchoolEvent>(`/api/school_events/${id}`);
  },

  async create(event: Partial<SchoolEvent>): Promise<{ success: boolean; message: string; data?: SchoolEvent; error?: string }> {
    return request<SchoolEvent>('/api/school_events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  async update(id: string, event: Partial<SchoolEvent>): Promise<{ success: boolean; message: string; data?: SchoolEvent; error?: string }> {
    return request<SchoolEvent>(`/api/school_events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  },

  async updateStatus(
    id: string,
    status: 'Upcoming' | 'Ongoing' | 'Completed'
  ): Promise<{ success: boolean; message: string; data?: SchoolEvent; error?: string }> {
    return request<SchoolEvent>(`/api/school_events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/school_events/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// EVENT REGISTRATIONS API
// ============================================

export const eventRegistrationsAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: EventRegistration[]; error?: string }> {
    return request<EventRegistration[]>('/api/event_registrations');
  },

  async getByEventId(eventId: string): Promise<{ success: boolean; message: string; data?: EventRegistration[]; error?: string }> {
    return request<EventRegistration[]>(`/api/event_registrations?event_id=${eventId}`);
  },

  async create(registration: Partial<EventRegistration>): Promise<{ success: boolean; message: string; data?: EventRegistration; error?: string }> {
    return request<EventRegistration>('/api/event_registrations', {
      method: 'POST',
      body: JSON.stringify(registration),
    });
  },

  async updateAttendance(
    id: string,
    status: 'registered' | 'attended' | 'absent',
    notes?: string
  ): Promise<{ success: boolean; message: string; data?: EventRegistration; error?: string }> {
    return request<EventRegistration>(`/api/event_registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ attendance_status: status, notes }),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/event_registrations/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// EVENT BUDGETS API
// ============================================

export const eventBudgetsAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: EventBudget[]; error?: string }> {
    return request<EventBudget[]>('/api/event_budgets');
  },

  async getByEventId(eventId: string): Promise<{ success: boolean; message: string; data?: EventBudget[]; error?: string }> {
    return request<EventBudget[]>(`/api/event_budgets?event_id=${eventId}`);
  },

  async create(budget: Partial<EventBudget>): Promise<{ success: boolean; message: string; data?: EventBudget; error?: string }> {
    return request<EventBudget>('/api/event_budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  },

  async update(id: string, budget: Partial<EventBudget>): Promise<{ success: boolean; message: string; data?: EventBudget; error?: string }> {
    return request<EventBudget>(`/api/event_budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budget),
    });
  },

  async approve(id: string): Promise<{ success: boolean; message: string; data?: EventBudget; error?: string }> {
    return request<EventBudget>(`/api/event_budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved' }),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/event_budgets/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// EVENT PHOTOS API
// ============================================

export const eventPhotosAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: EventPhoto[]; error?: string }> {
    return request<EventPhoto[]>('/api/event_photos');
  },

  async getByEventId(eventId: string): Promise<{ success: boolean; message: string; data?: EventPhoto[]; error?: string }> {
    return request<EventPhoto[]>(`/api/event_photos?event_id=${eventId}`);
  },

  async create(photo: Partial<EventPhoto>): Promise<{ success: boolean; message: string; data?: EventPhoto; error?: string }> {
    return request<EventPhoto>('/api/event_photos', {
      method: 'POST',
      body: JSON.stringify(photo),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/event_photos/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// EVENT FEEDBACK API
// ============================================

export const eventFeedbackAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: EventFeedback[]; error?: string }> {
    return request<EventFeedback[]>('/api/event_feedback');
  },

  async getByEventId(eventId: string): Promise<{ success: boolean; message: string; data?: EventFeedback[]; error?: string }> {
    return request<EventFeedback[]>(`/api/event_feedback?event_id=${eventId}`);
  },

  async create(feedback: Partial<EventFeedback>): Promise<{ success: boolean; message: string; data?: EventFeedback; error?: string }> {
    return request<EventFeedback>('/api/event_feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/event_feedback/${id}`, {
      method: 'DELETE',
    });
  },
};
