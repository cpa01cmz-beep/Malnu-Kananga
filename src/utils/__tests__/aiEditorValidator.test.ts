import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateAICommand, validateAIResponse, type AuditLogEntry } from '../aiEditorValidator';
import type { FeaturedProgram, LatestNews } from '../../types';

// Mock localStorage for audit logging tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

beforeEach(() => {
  global.localStorage = localStorageMock as any;
});

afterEach(() => {
  localStorageMock.clear();
});

describe('AI Editor Validator', () => {
  describe('validateAICommand', () => {
    it('should accept valid prompt', () => {
      const result = validateAICommand('Tambahkan program baru tentang Robotika');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedPrompt).toBe('Tambahkan program baru tentang Robotika');
    });

    it('should reject empty prompt', () => {
      const result = validateAICommand('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('tidak valid');
    });

    it('should reject prompt with dangerous patterns - import', () => {
      const result = validateAICommand('import os from system');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('tidak diizinkan');
    });

    it('should reject prompt with dangerous patterns - eval', () => {
      const result = validateAICommand('eval("malicious code")');
      expect(result.isValid).toBe(false);
    });

    it('should reject prompt with dangerous patterns - file path traversal', () => {
      const result = validateAICommand('../../../etc/passwd');
      expect(result.isValid).toBe(false);
    });

    it('should reject prompt with dangerous patterns - fetch API', () => {
      const result = validateAICommand('fetch("https://evil.com/api")');
      expect(result.isValid).toBe(false);
    });

    it('should reject prompt with dangerous patterns - SQL injection', () => {
      const result = validateAICommand('DELETE FROM users WHERE 1=1');
      expect(result.isValid).toBe(false);
    });

    it('should reject prompt with HTML tags', () => {
      const result = validateAICommand('Ubah judul menjadi <script>alert(1)</script>');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('tidak diizinkan');
    });

    it('should reject too short prompt', () => {
      const result = validateAICommand('ab');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Minimal');
    });

    it('should reject too long prompt', () => {
      const longPrompt = 'a'.repeat(1001);
      const result = validateAICommand(longPrompt);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Maksimal');
    });

    it('should block javascript: protocol', () => {
      const result = validateAICommand('javascript:alert(1)');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('tidak diizinkan');
    });

    it('should sanitize data: protocol', () => {
      const result = validateAICommand('Click here data:text/html,safe content');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('tidak diizinkan');
    });

    it('should reject prompt with system file patterns', () => {
      const result = validateAICommand('access /proc/version');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('tidak diizinkan');
    });

    it('should reject prompt with shell commands', () => {
      const result = validateAICommand('execute bash command');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('tidak diizinkan');
    });

    it('should reject prompt with encoding patterns', () => {
      const result = validateAICommand('use 0x48656c6c6f for hex encoding');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('tidak diizinkan');
    });

    it('should log audit entries for blocked commands', () => {
      validateAICommand('eval("malicious")', 'test-user');
      const logs = JSON.parse(localStorageMock.getItem('malnu_ai_editor_audit_log') || '[]');
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        action: 'command_blocked',
        userId: 'test-user',
        reason: expect.stringContaining('Pola berbahaya terdeteksi')
      });
    });

    it('should log audit entries for valid commands', () => {
      validateAICommand('tambahkan program baru', 'test-user');
      const logs = JSON.parse(localStorageMock.getItem('malnu_ai_editor_audit_log') || '[]');
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        action: 'command_validated',
        userId: 'test-user',
        reason: expect.stringContaining('Validasi berhasil')
      });
    });

    it('should implement rate limiting', () => {
      const userId = 'rate-limit-test-user';
      
      // Allow first few requests
      for (let i = 0; i < 10; i++) {
        const result = validateAICommand(`request ${i}`, userId);
        expect(result.isValid).toBe(true);
      }
      
      // Should block the 11th request
      const blockedResult = validateAICommand('request 10', userId);
      expect(blockedResult.isValid).toBe(false);
      expect(blockedResult.error).toContain('Terlalu banyak permintaan');
    });

    it('should assess risk levels correctly', () => {
      const cmd1 = validateAICommand('tambahkan program robotika', 'user');
      expect(cmd1.isValid).toBe(true);

      const cmd2 = validateAICommand('tambahkan link website baru', 'user');
      expect(cmd2.isValid).toBe(true);

      const cmd3 = validateAICommand('delete program yang tidak aktif', 'user');
      expect(cmd3.isValid).toBe(true);

      const logs = JSON.parse(localStorageMock.getItem('malnu_ai_editor_audit_log') || '[]') as AuditLogEntry[];
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some((l: AuditLogEntry) => l.reason?.includes('risiko: low'))).toBe(true);
      expect(logs.some((l: AuditLogEntry) => l.reason?.includes('risiko: medium'))).toBe(true);
      expect(logs.some((l: AuditLogEntry) => l.reason?.includes('risiko: high'))).toBe(true);
    });
  });

  describe('validateAIResponse', () => {
    const mockCurrentContent: { featuredPrograms: FeaturedProgram[]; latestNews: LatestNews[] } = {
      featuredPrograms: [{ title: 'Existing Program', description: 'Test', imageUrl: 'https://placehold.co/600x400' }],
      latestNews: [{ title: 'Existing News', date: '2026-01-01', category: 'Umum', imageUrl: 'https://placehold.co/600x400' }]
    };

    it('should accept valid JSON response', () => {
      const validJson = JSON.stringify({
        featuredPrograms: [{ title: 'New Program', description: 'Desc', imageUrl: 'https://example.com/image.jpg' }],
        latestNews: []
      });
      const result = validateAIResponse(validJson, mockCurrentContent);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedContent?.featuredPrograms).toHaveLength(1);
      expect(result.sanitizedContent?.featuredPrograms[0].title).toBe('New Program');
    });

    it('should reject empty response', () => {
      const result = validateAIResponse('', mockCurrentContent);
      expect(result.isValid).toBe(false);
    });

    it('should reject response without JSON structure', () => {
      const result = validateAIResponse('This is not JSON', mockCurrentContent);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('JSON');
    });

    it('should extract JSON from response with text around it', () => {
      const responseWithText = `Here is the JSON you requested:
\`\`\`json
{"featuredPrograms": [{"title": "Test", "description": "Desc", "imageUrl": "https://example.com/img.jpg"}], "latestNews": []}
\`\`\`
Let me know if you need anything else.`;
      const result = validateAIResponse(responseWithText, mockCurrentContent);
      expect(result.isValid).toBe(true);
    });

    it('should sanitize HTML tags in response', () => {
      const jsonWithHtml = JSON.stringify({
        featuredPrograms: [{ title: '<script>alert(1)</script>Program', description: 'Desc', imageUrl: 'https://example.com/img.jpg' }],
        latestNews: []
      });
      const result = validateAIResponse(jsonWithHtml, mockCurrentContent);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedContent?.featuredPrograms[0].title).not.toContain('<script>');
    });

    it('should sanitize dangerous URLs in response', () => {
      const jsonWithDangerousUrl = JSON.stringify({
        featuredPrograms: [{ title: 'Test', description: 'Desc', imageUrl: 'javascript:alert(1)' }],
        latestNews: []
      });
      const result = validateAIResponse(jsonWithDangerousUrl, mockCurrentContent);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedContent?.featuredPrograms[0].imageUrl).not.toContain('javascript:');
    });

    it('should use placeholder for missing image URL', () => {
      const jsonNoImage = JSON.stringify({
        featuredPrograms: [{ title: 'Test Program', description: 'Description', imageUrl: null }],
        latestNews: []
      });
      const result = validateAIResponse(jsonNoImage, mockCurrentContent);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedContent?.featuredPrograms[0].imageUrl).toContain('placehold.co');
    });

    it('should limit number of programs to prevent DoS', () => {
      const manyPrograms = Array(25).fill({ title: 'Program', description: 'Desc', imageUrl: 'https://example.com/img.jpg' });
      const json = JSON.stringify({ featuredPrograms: manyPrograms, latestNews: [] });
      const result = validateAIResponse(json, mockCurrentContent);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('melebihi batas maksimal');
    });

    it('should limit number of news to prevent DoS', () => {
      const manyNews = Array(60).fill({ title: 'News', date: '2026-01-01', category: 'Umum', imageUrl: 'https://example.com/img.jpg' });
      const json = JSON.stringify({ featuredPrograms: [], latestNews: manyNews });
      const result = validateAIResponse(json, mockCurrentContent);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('melebihi batas maksimal');
    });

    it('should preserve existing content when AI returns empty arrays', () => {
      const jsonEmpty = JSON.stringify({ featuredPrograms: [], latestNews: [] });
      const result = validateAIResponse(jsonEmpty, mockCurrentContent);
      expect(result.isValid).toBe(false);
      expect(result.sanitizedContent?.featuredPrograms).toEqual(mockCurrentContent.featuredPrograms);
      expect(result.sanitizedContent?.latestNews).toEqual(mockCurrentContent.latestNews);
    });

    it('should validate date format', () => {
      const jsonWithDate = JSON.stringify({
        featuredPrograms: [],
        latestNews: [{ title: 'News', date: 'invalid-date', category: 'Umum', imageUrl: 'https://example.com/img.jpg' }]
      });
      const result = validateAIResponse(jsonWithDate, mockCurrentContent);
      expect(result.isValid).toBe(true);
    });

    it('should accept valid ISO date format', () => {
      const jsonWithValidDate = JSON.stringify({
        featuredPrograms: [],
        latestNews: [{ title: 'News', date: '2026-01-15', category: 'Umum', imageUrl: 'https://example.com/img.jpg' }]
      });
      const result = validateAIResponse(jsonWithValidDate, mockCurrentContent);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedContent?.latestNews[0].date).toBe('2026-01-15');
    });

    it('should log audit entries for sanitized responses', () => {
      const maliciousJson = JSON.stringify({
        featuredPrograms: [{ title: '<script>alert(1)</script>', description: 'Desc', imageUrl: 'https://example.com/img.jpg' }],
        latestNews: []
      });
      validateAIResponse(maliciousJson, mockCurrentContent, 'test-user');
      const logs = JSON.parse(localStorageMock.getItem('malnu_ai_editor_audit_log') || '[]');
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        action: 'response_validated',
        userId: 'test-user'
      });
      expect(logs[0].reason).toContain('berhasil');
    });

    it('should log audit entries for valid responses', () => {
      const validJson = JSON.stringify({
        featuredPrograms: [{ title: 'Valid Program', description: 'Desc', imageUrl: 'https://example.com/img.jpg' }],
        latestNews: []
      });
      validateAIResponse(validJson, mockCurrentContent, 'test-user');
      const logs = JSON.parse(localStorageMock.getItem('malnu_ai_editor_audit_log') || '[]');
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        action: 'response_validated',
        userId: 'test-user'
      });
    });

    it('should reject response with too many programs', () => {
      const manyPrograms = Array(25).fill({ title: 'Program', description: 'Desc', imageUrl: 'https://example.com/img.jpg' });
      const json = JSON.stringify({ featuredPrograms: manyPrograms, latestNews: [] });
      const result = validateAIResponse(json, mockCurrentContent);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('melebihi batas maksimal');
    });

    it('should reject response with too many news items', () => {
      const manyNews = Array(55).fill({ title: 'News', date: '2026-01-01', category: 'Umum', imageUrl: 'https://example.com/img.jpg' });
      const json = JSON.stringify({ featuredPrograms: [], latestNews: manyNews });
      const result = validateAIResponse(json, mockCurrentContent);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('melebihi batas maksimal');
    });

    it('should reject response that adds too many items at once', () => {
      const currentWithMany = {
        featuredPrograms: Array(5).fill({ title: 'Program', description: 'Desc', imageUrl: 'https://example.com/img.jpg' }),
        latestNews: Array(10).fill({ title: 'News', date: '2026-01-01', category: 'Umum', imageUrl: 'https://example.com/img.jpg' })
      };
      const manyNewPrograms = Array(16).fill({ title: 'New Program', description: 'Desc', imageUrl: 'https://example.com/img.jpg' });
      const json = JSON.stringify({ featuredPrograms: manyNewPrograms, latestNews: currentWithMany.latestNews });
      const result = validateAIResponse(json, currentWithMany);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('dalam satu permintaan');
    });

    it('should validate program structure thoroughly', () => {
      const validProgramJson = JSON.stringify({
        featuredPrograms: [{ title: 'Valid Title', description: 'Valid Description', imageUrl: 'https://example.com/img.jpg' }],
        latestNews: []
      });
      const result = validateAIResponse(validProgramJson, mockCurrentContent);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedContent?.featuredPrograms[0].title).toBe('Valid Title');
    });

    it('should validate news structure thoroughly', () => {
      const validNewsJson = JSON.stringify({
        featuredPrograms: [],
        latestNews: [{ title: 'Valid News Title', date: '2026-01-01', category: 'Umum', imageUrl: 'https://example.com/img.jpg' }]
      });
      const result = validateAIResponse(validNewsJson, mockCurrentContent);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedContent?.latestNews[0].title).toBe('Valid News Title');
    });

    it('should prevent complete content deletion', () => {
      const deletionJson = JSON.stringify({
        featuredPrograms: [],
        latestNews: []
      });
      const result = validateAIResponse(deletionJson, mockCurrentContent);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('tidak mengembalikan');
    });
  });
});
