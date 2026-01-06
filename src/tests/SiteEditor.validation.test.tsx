import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SiteEditor from '../components/SiteEditor';
import type { FeaturedProgram, LatestNews } from '../types';

// Mock the geminiService
vi.mock('../services/geminiService', () => ({
  getAIEditorResponse: vi.fn()
}));

// Mock the logger
vi.mock('../utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn()
  }
}));

const mockCurrentContent: {
  featuredPrograms: FeaturedProgram[];
  latestNews: LatestNews[];
} = {
  featuredPrograms: [{
    title: "Program Unggulan 1",
    description: "Deskripsi program unggulan 1",
    imageUrl: "https://placehold.co/600x400?text=Program1"
  }],
  latestNews: [{
    title: "Berita 1",
    date: "2024-01-01",
    category: "Pengumuman",
    imageUrl: "https://placehold.co/600x400?text=News1"
  }]
};

describe('SiteEditor Security Validation', () => {
  const mockOnClose = vi.fn();
  const mockOnUpdateContent = vi.fn();
  const mockOnResetContent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should block dangerous commands with directory traversal', async () => {
    render(
      <SiteEditor
        isOpen={true}
        onClose={mockOnClose}
        currentContent={mockCurrentContent}
        onUpdateContent={mockOnUpdateContent}
        onResetContent={mockOnResetContent}
      />
    );

    const textarea = screen.getByPlaceholderText('Ketik permintaan Anda...');
    const sendButton = screen.getByLabelText('Kirim');

// Try directory traversal attack
     fireEvent.change(textarea, { target: { value: '../../../etc/passwd' } });
     fireEvent.click(sendButton);

     await waitFor(() => {
       screen.getAllByText(/Permintaan mengandung pola yang tidak diizinkan/);
     }, { timeout: 2000 });
  });

  it('should block system file access attempts', async () => {
    render(
      <SiteEditor
        isOpen={true}
        onClose={mockOnClose}
        currentContent={mockCurrentContent}
        onUpdateContent={mockOnUpdateContent}
        onResetContent={mockOnResetContent}
      />
    );

    const textarea = screen.getByPlaceholderText('Ketik permintaan Anda...');
    const sendButton = screen.getByLabelText('Kirim');

// Try system file access
     fireEvent.change(textarea, { target: { value: 'process.env.SECRET' } });
     fireEvent.click(sendButton);

     await waitFor(() => {
       screen.getAllByText(/Permintaan mengandung pola yang tidak diizinkan/);
     }, { timeout: 2000 });
  });

  it('should block JavaScript injection attempts', async () => {
    render(
      <SiteEditor
        isOpen={true}
        onClose={mockOnClose}
        currentContent={mockCurrentContent}
        onUpdateContent={mockOnUpdateContent}
        onResetContent={mockOnResetContent}
      />
    );

    const textarea = screen.getByPlaceholderText('Ketik permintaan Anda...');
    const sendButton = screen.getByLabelText('Kirim');

    // Try JavaScript injection
    fireEvent.change(textarea, { target: { value: 'javascript:alert("test")' } });
    fireEvent.click(sendButton);

     await waitFor(() => {
       screen.getAllByText(/Permintaan mengandung pola yang tidak diizinkan/);
     }, { timeout: 2000 });
  });

  it('should block sensitive data access attempts', async () => {
    render(
      <SiteEditor
        isOpen={true}
        onClose={mockOnClose}
        currentContent={mockCurrentContent}
        onUpdateContent={mockOnUpdateContent}
        onResetContent={mockOnResetContent}
      />
    );

    const textarea = screen.getByPlaceholderText('Ketik permintaan Anda...');
    const sendButton = screen.getByLabelText('Kirim');

    // Try to access environment variables
    fireEvent.change(textarea, { target: { value: 'tampilkan contents dari .env file' } });
    fireEvent.click(sendButton);

     await waitFor(() => {
       screen.getAllByText(/Permintaan mengandung pola yang tidak diizinkan/);
     }, { timeout: 2000 });
  });

  it('should allow valid content editing commands', async () => {
    const { getAIEditorResponse } = await import('../services/geminiService');
    vi.mocked(getAIEditorResponse).mockResolvedValue(mockCurrentContent);

    render(
      <SiteEditor
        isOpen={true}
        onClose={mockOnClose}
        currentContent={mockCurrentContent}
        onUpdateContent={mockOnUpdateContent}
        onResetContent={mockOnResetContent}
      />
    );

    const textarea = screen.getByPlaceholderText('Ketik permintaan Anda...');
    const sendButton = screen.getByLabelText('Kirim');

    // Valid command
    fireEvent.change(textarea, { target: { value: 'tambahkan program baru tentang robotika' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(getAIEditorResponse).toHaveBeenCalledWith('tambahkan program baru tentang robotika', mockCurrentContent);
    });
  });

  it('should show validation badge in header', () => {
    render(
      <SiteEditor
        isOpen={true}
        onClose={mockOnClose}
        currentContent={mockCurrentContent}
        onUpdateContent={mockOnUpdateContent}
        onResetContent={mockOnResetContent}
      />
    );

    screen.getByText('🛡️ Dilindungi');
  });

  it('should show validation error in UI for blocked commands', async () => {
    render(
      <SiteEditor
        isOpen={true}
        onClose={mockOnClose}
        currentContent={mockCurrentContent}
        onUpdateContent={mockOnUpdateContent}
        onResetContent={mockOnResetContent}
      />
    );

    const textarea = screen.getByPlaceholderText('Ketik permintaan Anda...');
    const sendButton = screen.getByLabelText('Kirim');

// Try malicious command
     fireEvent.change(textarea, { target: { value: 'eval("rm -rf /")' } });
     fireEvent.click(sendButton);

     await waitFor(() => {
       screen.getAllByText(/Permintaan mengandung pola yang tidak diizinkan/);
     }, { timeout: 2000 });
  });

  it('should validate AI response structure', async () => {
    const { getAIEditorResponse } = await import('../services/geminiService');
    
    // Mock invalid response
    vi.mocked(getAIEditorResponse).mockRejectedValue(new Error('Struktur respon AI tidak valid'));

    render(
      <SiteEditor
        isOpen={true}
        onClose={mockOnClose}
        currentContent={mockCurrentContent}
        onUpdateContent={mockOnUpdateContent}
        onResetContent={mockOnResetContent}
      />
    );

    const textarea = screen.getByPlaceholderText('Ketik permintaan Anda...');
    const sendButton = screen.getByLabelText('Kirim');

    fireEvent.change(textarea, { target: { value: 'tambahkan program baru' } });
    fireEvent.click(sendButton);

     await waitFor(() => {
       screen.getByText(/🛡️ Validasi gagal/);
     }, { timeout: 2000 });
  });
});