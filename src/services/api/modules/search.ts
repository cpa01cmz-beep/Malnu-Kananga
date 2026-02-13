import { request } from '../client';
import { API_ENDPOINTS } from '../../../constants';

export type SearchResultType = 'student' | 'teacher' | 'grade' | 'assignment' | 'material' | 'class' | 'subject' | 'announcement' | 'event';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  icon?: string;
  score?: number;
  timestamp?: string;
}

export interface SearchFilters {
  types?: SearchResultType[];
  dateFrom?: string;
  dateTo?: string;
  classId?: string;
  subjectId?: string;
  limit?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  filters: SearchFilters;
  suggestions?: string[];
}

export interface SavedSearch {
  id: string;
  query: string;
  filters: SearchFilters;
  createdAt: string;
}

export const searchAPI = {
  async search(query: string, filters?: SearchFilters): Promise<{ success: boolean; message: string; data?: SearchResponse; error?: string }> {
    const params = new URLSearchParams({ q: query });
    if (filters?.types?.length) params.append('types', filters.types.join(','));
    if (filters?.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters?.dateTo) params.append('date_to', filters.dateTo);
    if (filters?.classId) params.append('class_id', filters.classId);
    if (filters?.subjectId) params.append('subject_id', filters.subjectId);
    if (filters?.limit) params.append('limit', String(filters.limit));
    return request<SearchResponse>(`${API_ENDPOINTS.SEARCH.QUERY}?${params}`);
  },

  async getRecent(limit = 10): Promise<{ success: boolean; message: string; data?: string[]; error?: string }> {
    const params = new URLSearchParams({ limit: String(limit) });
    return request<string[]>(`${API_ENDPOINTS.SEARCH.RECENT}?${params}`);
  },

  async getSavedSearches(): Promise<{ success: boolean; message: string; data?: SavedSearch[]; error?: string }> {
    return request<SavedSearch[]>(API_ENDPOINTS.SEARCH.SAVED);
  },

  async saveSearch(query: string, filters?: SearchFilters): Promise<{ success: boolean; message: string; data?: SavedSearch; error?: string }> {
    return request<SavedSearch>(API_ENDPOINTS.SEARCH.SAVE, {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    });
  },

  async removeSavedSearch(id: string): Promise<{ success: boolean; message: string; error?: string }> {
    return request<{ success: boolean; message: string }>(API_ENDPOINTS.SEARCH.REMOVE(id), {
      method: 'DELETE',
    });
  },
};
