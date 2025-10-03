// Content API Service untuk MA Malnu Kananga
// Mengelola featured programs, news, dan content lainnya

import BaseApiService, { ApiResponse } from './baseApiService';

// Types untuk Content API
export interface FeaturedProgram {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl: string;
  category: 'Akademik' | 'Kegiatan' | 'Prestasi' | 'Pengumuman' | 'Informasi';
  priority: 'Rendah' | 'Sedang' | 'Tinggi';
  isPublished: boolean;
  publishedAt: string;
  author: string;
  tags: string[];
}

export interface RelatedLink {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  category: 'Government' | 'Education' | 'Resource' | 'Social';
  isActive: boolean;
  clickCount: number;
}

// Content API Service Class
class ContentApiService extends BaseApiService {
  constructor() {
    super();
  }

  // Featured Programs Management
  async getFeaturedPrograms(category?: string): Promise<ApiResponse<FeaturedProgram[]>> {
    const params = category ? `?category=${category}` : '';
    return this.get<FeaturedProgram[]>(`/api/content/featured-programs${params}`);
  }

  async createFeaturedProgram(program: Omit<FeaturedProgram, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<FeaturedProgram>> {
    return this.post<FeaturedProgram>('/api/admin/featured-programs', program);
  }

  async updateFeaturedProgram(id: string, updates: Partial<FeaturedProgram>): Promise<ApiResponse<FeaturedProgram>> {
    return this.put<FeaturedProgram>(`/api/admin/featured-programs/${id}`, updates);
  }

  async deleteFeaturedProgram(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/api/admin/featured-programs/${id}`);
  }

  // News Management
  async getLatestNews(limit: number = 6, category?: string): Promise<ApiResponse<NewsItem[]>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (category) params.append('category', category);

    return this.get<NewsItem[]>(`/api/content/news?${params.toString()}`);
  }

  async getNewsById(id: string): Promise<ApiResponse<NewsItem>> {
    return this.get<NewsItem>(`/api/content/news/${id}`);
  }

  async createNews(news: Omit<NewsItem, 'id' | 'publishedAt'>): Promise<ApiResponse<NewsItem>> {
    return this.post<NewsItem>('/api/admin/news', news);
  }

  async updateNews(id: string, updates: Partial<NewsItem>): Promise<ApiResponse<NewsItem>> {
    return this.put<NewsItem>(`/api/admin/news/${id}`, updates);
  }

  async deleteNews(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/api/admin/news/${id}`);
  }

  async publishNews(id: string): Promise<ApiResponse<NewsItem>> {
    return this.put<NewsItem>(`/api/admin/news/${id}/publish`);
  }

  // Related Links Management
  async getRelatedLinks(category?: string): Promise<ApiResponse<RelatedLink[]>> {
    const params = category ? `?category=${category}` : '';
    return this.get<RelatedLink[]>(`/api/content/related-links${params}`);
  }

  async trackLinkClick(linkId: string): Promise<ApiResponse<void>> {
    return this.post<void>(`/api/content/related-links/${linkId}/click`);
  }

  async createRelatedLink(link: Omit<RelatedLink, 'id' | 'clickCount'>): Promise<ApiResponse<RelatedLink>> {
    return this.post<RelatedLink>('/api/admin/related-links', link);
  }

  async updateRelatedLink(id: string, updates: Partial<RelatedLink>): Promise<ApiResponse<RelatedLink>> {
    return this.put<RelatedLink>(`/api/admin/related-links/${id}`, updates);
  }

  async deleteRelatedLink(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/api/admin/related-links/${id}`);
  }

  // Content Analytics
  async getContentStats(): Promise<ApiResponse<{
    totalPrograms: number;
    totalNews: number;
    totalLinks: number;
    popularContent: any[];
  }>> {
    return this.get(`/api/admin/content/stats`);
  }

  // Search Content
  async searchContent(query: string, type?: 'all' | 'programs' | 'news'): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (type) params.append('type', type);

    return this.get<any[]>(`/api/content/search?${params.toString()}`);
  }
}

// Export singleton instance
export const contentApiService = new ContentApiService();
export default ContentApiService;