import type { FeaturedProgram, LatestNews } from '../types';

export interface AICommandValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedPrompt?: string;
}

export interface AIResponseValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedContent?: { featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] };
}

const DANGEROUS_PATTERNS = [
  /import\s+.*\s+from\s+/gi,
  /require\s*\(/gi,
  /eval\s*\(/gi,
  /exec\s*\(/gi,
  /system\s*\(/gi,
  /child_process/gi,
  /fs\./gi,
  /process\./gi,
  /__dirname/gi,
  /__filename/gi,
  /fetch\s*\(/gi,
  /XMLHttpRequest/gi,
  /fetch\s*\(\s*['"`]\s*https?:/gi,
  /delete\s+from\s+\w+/gi,
  /drop\s+table/gi,
  /truncate/gi,
  /update\s+\w+\s+set/gi,
  /insert\s+into/gi,
  /\.\.\/.*\.\./gi,
  /\/etc\//gi,
  /\/proc\//gi,
  /\/sys\//gi,
  /0x[0-9a-fA-F]+/gi,
  /javascript\s*:/gi,
  /\.env/gi,
  /SECRET/gi,
];

const MAX_PROGRAMS = 20;
const MAX_NEWS = 50;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;

export function validateAICommand(prompt: string): AICommandValidationResult {
  if (!prompt || typeof prompt !== 'string') {
    return { isValid: false, error: 'Prompt tidak valid' };
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < 3) {
    return { isValid: false, error: 'Minimal 3 karakter untuk permintaan yang bermakna' };
  }

  if (trimmedPrompt.length > 1000) {
    return { isValid: false, error: 'Maksimal 1000 karakter' };
  }

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(prompt)) {
      return { 
        isValid: false, 
        error: 'Permintaan mengandung pola yang tidak diizinkan untuk keamanan sistem' 
      };
    }
  }

  const sanitized = prompt
    .replace(/javascript:/gi, 'javascript-removed:')
    .replace(/data:/gi, 'data-removed:')
    .replace(/vbscript:/gi, 'vbscript-removed:')
    .trim();

  if (/[<>]/.test(sanitized)) {
    return { 
      isValid: false, 
      error: 'Mohon hindari penggunaan tag HTML atau XML' 
    };
  }

  return { isValid: true, sanitizedPrompt: sanitized };
}

export function validateAIResponse(
  rawResponse: string,
  currentContent: { featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }
): AIResponseValidationResult {
  if (!rawResponse || typeof rawResponse !== 'string') {
    return { isValid: false, error: 'Respon AI tidak valid atau kosong' };
  }

  let jsonText = rawResponse.trim();

  const firstBrace = jsonText.indexOf('{');
  const lastBrace = jsonText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
  } else {
    return { isValid: false, error: 'Format respon tidak valid - tidak ditemukan JSON' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { isValid: false, error: 'Gagal memparse JSON dari respon AI' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { isValid: false, error: 'Struktur respon tidak valid' };
  }

  const content = parsed as { featuredPrograms?: unknown; latestNews?: unknown };

  if (!content.featuredPrograms && !content.latestNews) {
    return { isValid: false, error: 'Respon tidak mengandung data program atau berita yang diharapkan' };
  }

  const sanitizedPrograms: FeaturedProgram[] = [];
  if (Array.isArray(content.featuredPrograms)) {
    for (let i = 0; i < Math.min(content.featuredPrograms.length, MAX_PROGRAMS); i++) {
      const prog = content.featuredPrograms[i];
      if (prog && typeof prog === 'object') {
        const p = prog as Record<string, unknown>;
        const title = sanitizeString(p.title, MAX_TITLE_LENGTH);
        const description = sanitizeString(p.description, MAX_DESCRIPTION_LENGTH);
        const imageUrl = sanitizeImageUrl(p.imageUrl);
        
        if (title) {
          sanitizedPrograms.push({
            title,
            description: description || '',
            imageUrl: imageUrl || 'https://placehold.co/600x400?text=Program'
          });
        }
      }
    }
  }

  const sanitizedNews: LatestNews[] = [];
  if (Array.isArray(content.latestNews)) {
    for (let i = 0; i < Math.min(content.latestNews.length, MAX_NEWS); i++) {
      const news = content.latestNews[i];
      if (news && typeof news === 'object') {
        const n = news as Record<string, unknown>;
        const title = sanitizeString(n.title, MAX_TITLE_LENGTH);
        const date = sanitizeDate(n.date);
        const category = sanitizeString(n.category, 100);
        const imageUrl = sanitizeImageUrl(n.imageUrl);
        
        if (title) {
          sanitizedNews.push({
            title,
            date: date || new Date().toISOString().split('T')[0],
            category: category || 'Umum',
            imageUrl: imageUrl || 'https://placehold.co/600x400?text=News'
          });
        }
      }
    }
  }

  // If AI returned empty arrays, preserve existing content but mark as invalid
  const hasInputPrograms = content.featuredPrograms && Array.isArray(content.featuredPrograms) && content.featuredPrograms.length > 0;
  const hasInputNews = content.latestNews && Array.isArray(content.latestNews) && content.latestNews.length > 0;
  
  if (!hasInputPrograms && !hasInputNews) {
    return { 
      isValid: false, 
      error: 'AI tidak mengembalikan data program atau berita',
      sanitizedContent: {
        featuredPrograms: currentContent.featuredPrograms,
        latestNews: currentContent.latestNews
      }
    };
  }

  return {
    isValid: true,
    sanitizedContent: {
      featuredPrograms: sanitizedPrograms.length > 0 ? sanitizedPrograms : currentContent.featuredPrograms,
      latestNews: sanitizedNews.length > 0 ? sanitizedNews : currentContent.latestNews
    }
  };
}

function sanitizeString(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  let str = String(value).trim();
  
  if (str.length === 0 || str.length > maxLength) {
    return null;
  }

  str = str
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .trim();

  if (str.length === 0 || str.length > maxLength) {
    return null;
  }

  return str;
}

function sanitizeImageUrl(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  let url = String(value).trim();
  
  if (url.length === 0 || url.length > 500) {
    return null;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return null;
  }

  url = url
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .trim();

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return null;
  }

  return url;
}

function sanitizeDate(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  const str = String(value).trim();
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  
  const timestamp = Date.parse(str);
  if (!isNaN(timestamp)) {
    return new Date(timestamp).toISOString().split('T')[0];
  }
  
  return null;
}
