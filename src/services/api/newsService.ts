// News API Service
// Menggantikan mock data latestNews.ts

import { baseApiService, type ApiResponse } from './baseApiService';
import type { LatestNews } from '../../types';

// Development mode - menggunakan mock data untuk testing
const isDevelopment = import.meta.env?.DEV;

export class NewsService {
  private baseUrl = 'news';

  // Get all news
  async getAll(): Promise<ApiResponse<LatestNews[]>> {
    return baseApiService.get<LatestNews[]>(`/${this.baseUrl}`);
  }

  // Get news by ID
  async getById(id: number): Promise<ApiResponse<LatestNews>> {
    return baseApiService.get<LatestNews>(`/${this.baseUrl}/${id}`);
  }

  // Create new news
  async create(news: Omit<LatestNews, 'id'>): Promise<ApiResponse<LatestNews>> {
    return baseApiService.post<LatestNews>(`/${this.baseUrl}`, news);
  }

  // Update news
  async update(id: number, news: Partial<LatestNews>): Promise<ApiResponse<LatestNews>> {
    return baseApiService.put<LatestNews>(`/${this.baseUrl}/${id}`, news);
  }

  // Delete news
  async delete(id: number): Promise<ApiResponse<void>> {
    return baseApiService.delete<void>(`/${this.baseUrl}/${id}`);
  }

  // Get news by category
  async getByCategory(category: string): Promise<ApiResponse<LatestNews[]>> {
    return baseApiService.get<LatestNews[]>(`/${this.baseUrl}?category=${category}`);
  }

  // Get active news only
  async getActive(): Promise<ApiResponse<LatestNews[]>> {
    return baseApiService.get<LatestNews[]>(`/${this.baseUrl}?active=true`);
  }
}

// Development mode fallback dengan mock data
class LocalNewsService {
  private static STORAGE_KEY = 'malnu_news';

  static getAll(): LatestNews[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Fallback ke mock data jika tidak ada di localStorage
    return [
      {
        id: 1,
        title: 'MA Malnu Kananga Raih Juara 1 Lomba Cerdas Cermat Tingkat Kabupaten',
        date: '15 Juli 2024',
        category: 'Prestasi',
        imageUrl: 'https://images.unsplash.com/photo-1571260899204-42aebca5a2aa?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
      },
      {
        id: 2,
        title: 'Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2025/2026 Resmi Dibuka',
        date: '10 Juli 2024',
        category: 'Sekolah',
        imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
      },
      {
        id: 3,
        title: 'Kegiatan Bakti Sosial Sukses Digelar di Desa Sekitar Sekolah',
        date: '5 Juli 2024',
        category: 'Kegiatan',
        imageUrl: 'https://images.unsplash.com/photo-1618494955439-78a25c1b698a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
      }
    ];
  }

  static saveAll(news: LatestNews[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(news));
  }
}

// Main service yang memilih implementation berdasarkan environment
export class NewsApiService {
  private static service: NewsService | LocalNewsService;

  private static getService() {
    if (isDevelopment) {
      return LocalNewsService;
    } else {
      return this.service || (this.service = new NewsService());
    }
  }

  static async getAll(): Promise<LatestNews[]> {
    if (isDevelopment) {
      return LocalNewsService.getAll();
    } else {
      const response = await new NewsService().getAll();
      return response.success && response.data ? response.data : [];
    }
  }

  static async getById(id: number): Promise<LatestNews | null> {
    if (isDevelopment) {
      const news = await this.getAll();
       return news.find((n: any) => n.id === id) || null;
    } else {
      const response = await new NewsService().getById(id);
      return response.success && response.data ? response.data : null;
    }
  }

  static async create(news: Omit<LatestNews, 'id'>): Promise<LatestNews | null> {
    if (isDevelopment) {
      const newsList = await this.getAll();
      const newNews: LatestNews = {
        ...news,
        id: Date.now() // Simple ID generation
      } as LatestNews;
      newsList.push(newNews);
       LocalNewsService.saveAll(newsList);
      return newNews;
    } else {
      const response = await new NewsService().create(news);
      return response.success && response.data ? response.data : null;
    }
  }

  static async update(id: number, news: Partial<LatestNews>): Promise<LatestNews | null> {
    if (isDevelopment) {
      const newsList = await this.getAll();
       const index = newsList.findIndex((n: any) => n.id === id);
       if (index === -1) return null;

       newsList[index] = { ...newsList[index], ...news };
       LocalNewsService.saveAll(newsList);
      return newsList[index];
    } else {
      const response = await new NewsService().update(id, news);
      return response.success && response.data ? response.data : null;
    }
  }

  static async delete(id: number): Promise<boolean> {
    if (isDevelopment) {
      const newsList = await this.getAll();
       const filteredNews = newsList.filter((n: any) => n.id !== id);
       if (filteredNews.length === newsList.length) return false;

       LocalNewsService.saveAll(filteredNews);
      return true;
    } else {
      const response = await new NewsService().delete(id);
      return response.success;
    }
  }

  static async getByCategory(category: string): Promise<LatestNews[]> {
    if (isDevelopment) {
      const newsList = await this.getAll();
      return newsList.filter((n: any) => n.category === category);
    } else {
      const response = await new NewsService().getByCategory(category);
      return response.success && response.data ? response.data : [];
    }
  }

  static async getActive(): Promise<LatestNews[]> {
    if (isDevelopment) {
      return await this.getAll(); // Dalam development, return semua news
    } else {
      const response = await new NewsService().getActive();
      return response.success && response.data ? response.data : [];
    }
  }
}

// Export untuk kemudahan testing
export { LocalNewsService };