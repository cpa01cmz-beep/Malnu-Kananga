import type { FeaturedProgram, LatestNews } from '../types';
import { logger } from './logger';
import { EXTERNAL_URLS, STORAGE_KEYS } from '../constants';

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
  // Code execution patterns
  /import\s+.*\s+from\s+/gi,
  /require\s*\(/gi,
  /eval\s*\(/gi,
  /exec\s*\(/gi,
  /system\s*\(/gi,
  /Function\s*\(/gi,
  /setTimeout\s*\(/gi,
  /setInterval\s*\(/gi,
  
  // Node.js modules and APIs
  /child_process/gi,
  /fs\./gi,
  /path\./gi,
  /os\./gi,
  /crypto\./gi,
  /buffer\./gi,
  /process\./gi,
  /global\./gi,
  /window\./gi,
  /document\./gi,
  /console\./gi,
  /__dirname/gi,
  /__filename/gi,
  /module\./gi,
  /exports\./gi,
  
  // Network requests
  /fetch\s*\(/gi,
  /XMLHttpRequest/gi,
  /axios\./gi,
  /http\./gi,
  /https\./gi,
  /request\s*\(/gi,
  /fetch\s*\(\s*['"`]\s*https?:/gi,
  /websocket/gi,
  /ws:/gi,
  /wss:/gi,
  
  // Database operations
  /delete\s+from\s+\w+/gi,
  /drop\s+table/gi,
  /truncate/gi,
  /update\s+\w+\s+set/gi,
  /insert\s+into/gi,
  /create\s+table/gi,
  /alter\s+table/gi,
  /exec\s*sp_/gi,
  /execute\s+immediate/gi,
  
  // File system and path traversal
  /\.\.\/.*\.\./gi,
  /\/etc\//gi,
  /\/proc\//gi,
  /\/sys\//gi,
  /\/var\//gi,
  /\/usr\//gi,
  /\/home\//gi,
  /\/root\//gi,
  /\.\./gi,
  /~\//gi,
  
  // Shell commands and scripts
  /shell\s*exec/gi,
  /spawn\s*\(/gi,
  /execSync/gi,
  /bash/gi,
  /sh\s/gi,
  /cmd\./gi,
  /powershell/gi,
  /wscript/gi,
  /cscript/gi,
  
  // Encoding and obfuscation
  /0x[0-9a-fA-F]+/gi,
  /\\u[0-9a-fA-F]{4}/gi,
  /\\x[0-9a-fA-F]{2}/gi,
  /btoa\s*\(/gi,
  /atob\s*\(/gi,
  /escape\s*\(/gi,
  /unescape\s*\(/gi,
  /encodeURI/gi,
  /decodeURI/gi,
  
  // Protocol handlers
  /javascript\s*:/gi,
  /data\s*:/gi,
  /vbscript\s*:/gi,
  /file\s*:/gi,
  /ftp\s*:/gi,
  /mailto\s*:/gi,
  
  // Environment and secrets
  /\.env/gi,
  /SECRET/gi,
  /PASSWORD/gi,
  /TOKEN/gi,
  /API[_-]?KEY/gi,
  /PRIVATE[_-]?KEY/gi,
  /DATABASE[_-]?URL/gi,
  /CONNECTION[_-]?STRING/gi,
  
  // XSS and injection patterns
  /<script[^>]*>/gi,
  /<\/script>/gi,
  /on\w+\s*=/gi,
  /javascript\s*:/gi,
  /expression\s*\(/gi,
  /@import/gi,
  /\{\s*\$.*\}/gi,
  /<iframe[^>]*>/gi,
  /<object[^>]*>/gi,
  /<embed[^>]*>/gi,
  
  // System commands
  /whoami/gi,
  /pwd/gi,
  /ls\s/gi,
  /dir\s/gi,
  /cat\s/gi,
  /type\s/gi,
  /net\s+user/gi,
  /ps\s/gi,
  /kill\s/gi,
  /rm\s/gi,
  /del\s/gi,
  
  // Malicious URLs and domains
  /bit\.ly/gi,
  /tinyurl\.com/gi,
  /t\.co/gi,
  /goo\.gl/gi,
  /shortened/gi,
  
  // Advanced attack patterns
  /union\s+select/gi,
  /concat\s*\(/gi,
  /char\s*\(/gi,
  /substring\s*\(/gi,
  /length\s*\(/gi,
  /ascii\s*\(/gi,
  /ord\s*\(/gi,
  /cast\s*\(/gi,
  /convert\s*\(/gi,
];

const MAX_PROGRAMS = 20;
const MAX_NEWS = 50;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;

// Rate limiting interface
interface RequestTracker {
  count: number;
  lastReset: number;
}

// In-memory rate limiting for AI editor requests
const RATE_LIMIT_MAP = new Map<string, RequestTracker>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_MINUTE = 10;

// Audit log storage
const MAX_AUDIT_ENTRIES = 100;

export interface AuditLogEntry {
  timestamp: number;
  action: 'command_validated' | 'command_blocked' | 'response_validated' | 'response_blocked';
  userId?: string;
  commandHash: string;
  reason?: string;
}

function hashCommand(command: string): string {
  let hash = 0;
  for (let i = 0; i < command.length; i++) {
    const char = command.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

function checkRateLimit(userId: string): { allowed: boolean; remaining?: number; resetTime?: number } {
  const now = Date.now();
  const tracker = RATE_LIMIT_MAP.get(userId);
  
  if (!tracker) {
    RATE_LIMIT_MAP.set(userId, { count: 1, lastReset: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }
  
  if (now - tracker.lastReset > RATE_LIMIT_WINDOW) {
    tracker.count = 1;
    tracker.lastReset = now;
    return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }
  
  if (tracker.count >= MAX_REQUESTS_PER_MINUTE) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: tracker.lastReset + RATE_LIMIT_WINDOW 
    };
  }
  
  tracker.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - tracker.count, resetTime: tracker.lastReset + RATE_LIMIT_WINDOW };
}

function logAuditEntry(entry: AuditLogEntry): void {
  try {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AI_EDITOR_AUDIT_LOG) || '[]');
    logs.unshift(entry);
    const trimmedLogs = logs.slice(0, MAX_AUDIT_ENTRIES);
    localStorage.setItem(STORAGE_KEYS.AI_EDITOR_AUDIT_LOG, JSON.stringify(trimmedLogs));
  } catch (error) {
    // Silently fail audit logging to not block main functionality
    logger.warn('Failed to log audit entry:', error);
  }
}

function getCommandRiskLevel(command: string): 'low' | 'medium' | 'high' {
  const lowerCommand = command.toLowerCase();
  
  // High risk: system access, file operations, database
  if (/system|file|database|delete|drop|exec|process|secret|password|token/i.test(lowerCommand)) {
    return 'high';
  }
  
  // Medium risk: network requests, external URLs, advanced operations
  if (/fetch|http|url|link|api|external|import|export/i.test(lowerCommand)) {
    return 'medium';
  }
  
  // Low risk: normal content editing
  return 'low';
}

export function validateAICommand(prompt: string, userId?: string): AICommandValidationResult {
  if (!prompt || typeof prompt !== 'string') {
    logAuditEntry({
      timestamp: Date.now(),
      action: 'command_blocked',
      userId,
      commandHash: hashCommand('invalid'),
      reason: 'Prompt tidak valid atau bukan string'
    });
    return { isValid: false, error: 'Prompt tidak valid' };
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < 3) {
    logAuditEntry({
      timestamp: Date.now(),
      action: 'command_blocked',
      userId,
      commandHash: hashCommand(prompt),
      reason: 'Input terlalu pendek (< 3 karakter)'
    });
    return { isValid: false, error: 'Minimal 3 karakter untuk permintaan yang bermakna' };
  }

  if (trimmedPrompt.length > 1000) {
    logAuditEntry({
      timestamp: Date.now(),
      action: 'command_blocked',
      userId,
      commandHash: hashCommand(prompt),
      reason: 'Input terlalu panjang (> 1000 karakter)'
    });
    return { isValid: false, error: 'Maksimal 1000 karakter' };
  }

  // Rate limiting
  if (userId) {
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      logAuditEntry({
        timestamp: Date.now(),
        action: 'command_blocked',
        userId,
        commandHash: hashCommand(prompt),
        reason: 'Rate limit terlampaui'
      });
      return { 
        isValid: false, 
        error: `Terlalu banyak permintaan. Silakan tunggu ${Math.ceil((rateLimit.resetTime! - Date.now()) / 1000)} detik.` 
      };
    }
  }

  // Enhanced pattern matching with detailed logging
  let matchedPattern: RegExp | null = null;
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(prompt)) {
      matchedPattern = pattern;
      break;
    }
  }

  if (matchedPattern) {
    const riskLevel = getCommandRiskLevel(prompt);
    logAuditEntry({
      timestamp: Date.now(),
      action: 'command_blocked',
      userId,
      commandHash: hashCommand(prompt),
      reason: `Pola berbahaya terdeteksi: ${matchedPattern.source} (risiko: ${riskLevel})`
    });
    return { 
      isValid: false, 
      error: 'Permintaan mengandung pola yang tidak diizinkan untuk keamanan sistem' 
    };
  }

  const sanitized = prompt
    .replace(/javascript:/gi, 'javascript-removed:')
    .replace(/data:/gi, 'data-removed:')
    .replace(/vbscript:/gi, 'vbscript-removed:')
    .trim();

  if (/[<>]/.test(sanitized)) {
    logAuditEntry({
      timestamp: Date.now(),
      action: 'command_blocked',
      userId,
      commandHash: hashCommand(prompt),
      reason: 'Tag HTML/XML terdeteksi'
    });
    return { 
      isValid: false, 
      error: 'Mohon hindari penggunaan tag HTML atau XML' 
    };
  }

  // Log successful validation
  const riskLevel = getCommandRiskLevel(prompt);
  logAuditEntry({
    timestamp: Date.now(),
    action: 'command_validated',
    userId,
    commandHash: hashCommand(prompt),
    reason: `Validasi berhasil (risiko: ${riskLevel})`
  });

  return { isValid: true, sanitizedPrompt: sanitized };
}

export function validateAIResponse(
  rawResponse: string,
  currentContent: { featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] },
  userId?: string
): AIResponseValidationResult {
  if (!rawResponse || typeof rawResponse !== 'string') {
    logAuditEntry({
      timestamp: Date.now(),
      action: 'response_blocked',
      userId,
      commandHash: hashCommand('response'),
      reason: 'Respon AI tidak valid atau kosong'
    });
    return { isValid: false, error: 'Respon AI tidak valid atau kosong' };
  }

  let jsonText = rawResponse.trim();

  // Enhanced JSON extraction with better error handling
  const firstBrace = jsonText.indexOf('{');
  const lastBrace = jsonText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
  } else {
    logAuditEntry({
      timestamp: Date.now(),
      action: 'response_blocked',
      userId,
      commandHash: hashCommand('response'),
      reason: 'Format respon tidak valid - tidak ditemukan JSON yang valid'
    });
    return { isValid: false, error: 'Format respon tidak valid - tidak ditemukan JSON' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    logAuditEntry({
      timestamp: Date.now(),
      action: 'response_blocked',
      userId,
      commandHash: hashCommand('response'),
      reason: `Gagal memparse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    return { isValid: false, error: 'Gagal memparse JSON dari respon AI' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    logAuditEntry({
      timestamp: Date.now(),
      action: 'response_blocked',
      userId,
      commandHash: hashCommand('response'),
      reason: 'Struktur respon bukan objek yang valid'
    });
    return { isValid: false, error: 'Struktur respon tidak valid' };
  }

  const content = parsed as { featuredPrograms?: unknown; latestNews?: unknown };

  // Validate expected structure
  if (!content.featuredPrograms && !content.latestNews) {
    logAuditEntry({
      timestamp: Date.now(),
      action: 'response_blocked',
      userId,
      commandHash: hashCommand('response'),
      reason: 'Respon tidak mengandung data program atau berita yang diharapkan'
    });
    return { isValid: false, error: 'Respon tidak mengandung data program atau berita yang diharapkan' };
  }

  // Enhanced content validation with security checks
  const sanitizedPrograms: FeaturedProgram[] = [];
  if (Array.isArray(content.featuredPrograms)) {
    if (content.featuredPrograms.length > MAX_PROGRAMS) {
      logAuditEntry({
        timestamp: Date.now(),
        action: 'response_blocked',
        userId,
        commandHash: hashCommand('response'),
        reason: `Jumlah program melebihi batas (${content.featuredPrograms.length} > ${MAX_PROGRAMS})`
      });
      return { isValid: false, error: `Jumlah program melebihi batas maksimal (${MAX_PROGRAMS})` };
    }

    for (let i = 0; i < content.featuredPrograms.length; i++) {
      const prog = content.featuredPrograms[i];
      if (prog && typeof prog === 'object') {
        const p = prog as Record<string, unknown>;
        const title = sanitizeString(p.title, MAX_TITLE_LENGTH);
        const description = sanitizeString(p.description, MAX_DESCRIPTION_LENGTH);
        const imageUrl = sanitizeImageUrl(p.imageUrl);
        
        if (title) {
          const program: FeaturedProgram = {
            title,
            description: description || '',
            imageUrl: imageUrl || `${EXTERNAL_URLS.PLACEHOLDER_IMAGE_BASE}Program`
          };
          
          // Additional structural validation
          if (!validateProgramStructure(program)) {
            logAuditEntry({
              timestamp: Date.now(),
              action: 'response_blocked',
              userId,
              commandHash: hashCommand('response'),
              reason: 'Struktur program tidak valid'
            });
            return { isValid: false, error: 'Struktur data program tidak valid' };
          }
          
          sanitizedPrograms.push(program);
        }
      }
    }
  }

  const sanitizedNews: LatestNews[] = [];
  if (Array.isArray(content.latestNews)) {
    if (content.latestNews.length > MAX_NEWS) {
      logAuditEntry({
        timestamp: Date.now(),
        action: 'response_blocked',
        userId,
        commandHash: hashCommand('response'),
        reason: `Jumlah berita melebihi batas (${content.latestNews.length} > ${MAX_NEWS})`
      });
      return { isValid: false, error: `Jumlah berita melebihi batas maksimal (${MAX_NEWS})` };
    }

    for (let i = 0; i < content.latestNews.length; i++) {
      const news = content.latestNews[i];
      if (news && typeof news === 'object') {
        const n = news as Record<string, unknown>;
        const title = sanitizeString(n.title, MAX_TITLE_LENGTH);
        const date = sanitizeDate(n.date);
        const category = sanitizeString(n.category, 100);
        const imageUrl = sanitizeImageUrl(n.imageUrl);
        
        if (title) {
          const newsItem: LatestNews = {
            title,
            date: date || new Date().toISOString().split('T')[0],
            category: category || 'Umum',
            imageUrl: imageUrl || `${EXTERNAL_URLS.PLACEHOLDER_IMAGE_BASE}News`
          };
          
          // Additional structural validation
          if (!validateNewsStructure(newsItem)) {
            logAuditEntry({
              timestamp: Date.now(),
              action: 'response_blocked',
              userId,
              commandHash: hashCommand('response'),
              reason: 'Struktur berita tidak valid'
            });
            return { isValid: false, error: 'Struktur data berita tidak valid' };
          }
          
          sanitizedNews.push(newsItem);
        }
      }
    }
  }

  // Check if AI returned meaningful content
  const hasInputPrograms = content.featuredPrograms && Array.isArray(content.featuredPrograms) && content.featuredPrograms.length > 0;
  const hasInputNews = content.latestNews && Array.isArray(content.latestNews) && content.latestNews.length > 0;
  
  if (!hasInputPrograms && !hasInputNews) {
    logAuditEntry({
      timestamp: Date.now(),
      action: 'response_blocked',
      userId,
      commandHash: hashCommand('response'),
      reason: 'AI mengembalikan array kosong untuk semua kategori'
    });
    return { 
      isValid: false, 
      error: 'AI tidak mengembalikan data program atau berita',
      sanitizedContent: {
        featuredPrograms: currentContent.featuredPrograms,
        latestNews: currentContent.latestNews
      }
    };
  }

  // Validate content changes are reasonable
  const validationResult = validateContentChanges(
    currentContent,
    {
      featuredPrograms: sanitizedPrograms.length > 0 ? sanitizedPrograms : currentContent.featuredPrograms,
      latestNews: sanitizedNews.length > 0 ? sanitizedNews : currentContent.latestNews
    }
  );

  if (!validationResult.isValid) {
    logAuditEntry({
      timestamp: Date.now(),
      action: 'response_blocked',
      userId,
      commandHash: hashCommand('response'),
      reason: validationResult.error
    });
    return { isValid: false, error: validationResult.error };
  }

  // Log successful validation
  logAuditEntry({
    timestamp: Date.now(),
    action: 'response_validated',
    userId,
    commandHash: hashCommand('response'),
    reason: `Validasi response berhasil (${sanitizedPrograms.length} program, ${sanitizedNews.length} berita)`
  });

  return {
    isValid: true,
    sanitizedContent: {
      featuredPrograms: sanitizedPrograms.length > 0 ? sanitizedPrograms : currentContent.featuredPrograms,
      latestNews: sanitizedNews.length > 0 ? sanitizedNews : currentContent.latestNews
    }
  };
}

function validateProgramStructure(program: FeaturedProgram): boolean {
  return !!(
    program.title &&
    typeof program.title === 'string' &&
    program.title.length > 0 &&
    program.title.length <= MAX_TITLE_LENGTH &&
    program.description !== undefined &&
    typeof program.description === 'string' &&
    program.description.length <= MAX_DESCRIPTION_LENGTH &&
    program.imageUrl !== undefined &&
    typeof program.imageUrl === 'string' &&
    program.imageUrl.length <= 500
  );
}

function validateNewsStructure(news: LatestNews): boolean {
  return !!(
    news.title &&
    typeof news.title === 'string' &&
    news.title.length > 0 &&
    news.title.length <= MAX_TITLE_LENGTH &&
    news.date &&
    typeof news.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(news.date) &&
    news.category &&
    typeof news.category === 'string' &&
    news.category.length > 0 &&
    news.category.length <= 100 &&
    news.imageUrl !== undefined &&
    typeof news.imageUrl === 'string' &&
    news.imageUrl.length <= 500
  );
}

function validateContentChanges(
  current: { featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] },
  proposed: { featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] }
): { isValid: boolean; error?: string } {
  // Check for reasonable changes (prevent complete content replacement)
  const currentProgramsCount = current.featuredPrograms.length;
  const proposedProgramsCount = proposed.featuredPrograms.length;
  const currentNewsCount = current.latestNews.length;
  const proposedNewsCount = proposed.latestNews.length;

  // Too many programs added at once
  if (proposedProgramsCount > currentProgramsCount + 10) {
    return { 
      isValid: false, 
      error: 'Terlalu banyak program yang ditambahkan dalam satu permintaan (maksimal 10)' 
    };
  }

  // Too many news items added at once
  if (proposedNewsCount > currentNewsCount + 20) {
    return { 
      isValid: false, 
      error: 'Terlalu banyak berita yang ditambahkan dalam satu permintaan (maksimal 20)' 
    };
  }

  // Check for suspicious deletion patterns
  if (proposedProgramsCount === 0 && currentProgramsCount > 0) {
    return { 
      isValid: false, 
      error: 'Tidak dapat menghapus semua program dalam satu permintaan' 
    };
  }

  if (proposedNewsCount === 0 && currentNewsCount > 0) {
    return { 
      isValid: false, 
      error: 'Tidak dapat menghapus semua berita dalam satu permintaan' 
    };
  }

  return { isValid: true };
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
