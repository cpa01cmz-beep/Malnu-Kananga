// Featured Programs API Service
// Menggantikan mock data featuredPrograms.ts

import { baseApiService, type ApiResponse } from './baseApiService';
import type { FeaturedProgram } from '../../types';

export class FeaturedProgramsService {
  private baseUrl = 'featured-programs';

  // Get all featured programs
  async getAll(): Promise<ApiResponse<FeaturedProgram[]>> {
    return baseApiService.get<FeaturedProgram[]>(`/${this.baseUrl}`);
  }

  // Get featured program by ID
  async getById(id: number): Promise<ApiResponse<FeaturedProgram>> {
    return baseApiService.get<FeaturedProgram>(`/${this.baseUrl}/${id}`);
  }

  // Create new featured program
  async create(program: Omit<FeaturedProgram, 'id'>): Promise<ApiResponse<FeaturedProgram>> {
    return baseApiService.post<FeaturedProgram>(`/${this.baseUrl}`, program);
  }

  // Update featured program
  async update(id: number, program: Partial<FeaturedProgram>): Promise<ApiResponse<FeaturedProgram>> {
    return baseApiService.put<FeaturedProgram>(`/${this.baseUrl}/${id}`, program);
  }

  // Delete featured program
  async delete(id: number): Promise<ApiResponse<void>> {
    return baseApiService.delete<void>(`/${this.baseUrl}/${id}`);
  }

  // Get active featured programs only
  async getActive(): Promise<ApiResponse<FeaturedProgram[]>> {
    return baseApiService.get<FeaturedProgram[]>(`/${this.baseUrl}?active=true`);
  }
}

// Development mode fallback dengan mock data
class LocalFeaturedProgramsService {
  private static STORAGE_KEY = 'malnu_featured_programs';

  static getAll(): FeaturedProgram[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Fallback ke mock data jika tidak ada di localStorage
    return [
      {
        id: 1,
        title: 'Tahfidz Al-Qur\'an',
        description: 'Program intensif menghafal Al-Qur\'an dengan bimbingan ustadz/ustadzah berkompeten.',
        imageUrl: 'https://images.unsplash.com/photo-1599339942293-86b72a38547b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
      },
      {
        id: 2,
        title: 'Ekstrakurikuler Tahfidz',
        description: 'Program menghafal Al-Qur\'an dengan bimbingan para ustaz yang berpengalaman.',
        imageUrl: 'https://images.unsplash.com/photo-1599339942293-86b72a38547b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
      },
      {
        id: 3,
        title: 'Kajian Kitab Kuning',
        description: 'Pendalaman khazanah Islam klasik melalui kajian kitab-kitab kuning oleh para ahli.',
        imageUrl: 'https://images.unsplash.com/photo-1585056701393-85835978f84e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
      },
      {
        id: 4,
        title: 'Sains & Teknologi',
        description: 'Mengintegrasikan ilmu pengetahuan modern dengan nilai-nilai Islam untuk mencetak generasi unggul.',
        imageUrl: 'https://images.unsplash.com/photo-1532187643623-8f691689017a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
      }
    ];
  }

  static saveAll(programs: FeaturedProgram[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(programs));
  }
}

// Development mode check
const isDevelopment = import.meta.env?.DEV || false;

// Main service yang memilih implementation berdasarkan environment

export class FeaturedProgramsApiService {
  private static service: FeaturedProgramsService | LocalFeaturedProgramsService;

  private static getService() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      return LocalFeaturedProgramsService;
    } else {
      return this.service || (this.service = new FeaturedProgramsService());
    }
  }

  static async getAll(): Promise<FeaturedProgram[]> {
    if (isDevelopment) {
      return LocalFeaturedProgramsService.getAll();
    } else {
      const response = await new FeaturedProgramsService().getAll();
      return response.success && response.data ? response.data : [];
    }
  }

  static async getById(id: number): Promise<FeaturedProgram | null> {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      const programs = await this.getAll();
       return programs.find((p: any) => p.id === id) || null;
    } else {
      const service = new FeaturedProgramsService();
      const response = await service.getById(id);
      return response.success && response.data ? response.data : null;
    }
  }

  static async create(program: Omit<FeaturedProgram, 'id'>): Promise<FeaturedProgram | null> {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      const programs = await this.getAll();
      const newProgram: FeaturedProgram = {
        ...program,
        id: Date.now() // Simple ID generation
      } as FeaturedProgram;
      programs.push(newProgram);
       LocalFeaturedProgramsService.saveAll(programs);
      return newProgram;
    } else {
      const response = await new FeaturedProgramsService().create(program);
      return response.success && response.data ? response.data : null;
    }
  }

  static async update(id: number, program: Partial<FeaturedProgram>): Promise<FeaturedProgram | null> {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      const programs = await this.getAll();
       const index = programs.findIndex((p: any) => p.id === id);
       if (index === -1) return null;

       programs[index] = { ...programs[index], ...program };
       LocalFeaturedProgramsService.saveAll(programs);
      return programs[index];
    } else {
      const response = await new FeaturedProgramsService().update(id, program);
      return response.success && response.data ? response.data : null;
    }
  }

  static async delete(id: number): Promise<boolean> {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      const programs = await this.getAll();
       const filteredPrograms = programs.filter((p: any) => p.id !== id);
       if (filteredPrograms.length === programs.length) return false;

       LocalFeaturedProgramsService.saveAll(filteredPrograms);
      return true;
    } else {
      const response = await new FeaturedProgramsService().delete(id);
      return response.success;
    }
  }

  static async getActive(): Promise<FeaturedProgram[]> {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      return await this.getAll(); // Dalam development, return semua programs
    } else {
      const response = await new FeaturedProgramsService().getActive();
      return response.success && response.data ? response.data : [];
    }
  }
}

// Export untuk kemudahan testing
export { LocalFeaturedProgramsService };