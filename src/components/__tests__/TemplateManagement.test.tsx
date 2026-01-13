import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TemplateManagement from './TemplateManagement';
import { NotificationTemplate, PushNotification } from '../types';

describe('TemplateManagement', () => {
  const mockTemplates: NotificationTemplate[] = [
    {
      id: 'template-1',
      name: 'Pengumuman Libur',
      type: 'announcement',
      title: 'Libur Nasional',
      body: 'Libur nasional akan dilaksanakan pada {{tanggal}}',
      variables: ['tanggal'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  const mockCreateTemplate = vi.fn((name: string, type: PushNotification['type'], title: string, body: string, variables?: string[]) => {
    return {
      id: `template-${Date.now()}`,
      name,
      type,
      title,
      body,
      variables: variables || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const mockCreateNotificationFromTemplate = vi.fn((templateId: string, variables?: Record<string, string | number>) => {
    const template = mockTemplates.find(t => t.id === templateId);
    if (!template) return null;

    return {
      id: 'notif-1',
      type: template.type,
      title: template.title,
      body: template.body,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal',
    };
  });

  const mockShowNotification = vi.fn().mockResolvedValue(undefined);
  const mockOnShowToast = vi.fn();

  const defaultProps = {
    templates: mockTemplates,
    createTemplate: mockCreateTemplate,
    createNotificationFromTemplate: mockCreateNotificationFromTemplate,
    showNotification: mockShowNotification,
    onShowToast: mockOnShowToast,
  };

  it('renders template list when templates exist', () => {
    render(<TemplateManagement {...defaultProps} />);

    expect(screen.getByText('Template Notifikasi')).toBeInTheDocument();
    expect(screen.getByText('Pengumuman Libur')).toBeInTheDocument();
    expect(screen.getByText('Buat Template')).toBeInTheDocument();
  });

  it('renders empty state when no templates', () => {
    render(<TemplateManagement {...defaultProps} templates={[]} />);

    expect(screen.getByText('Belum ada template notifikasi')).toBeInTheDocument();
  });

  it('opens create modal when "Buat Template" button is clicked', () => {
    render(<TemplateManagement {...defaultProps} />);

    fireEvent.click(screen.getByText('Buat Template'));

    expect(screen.getByText('Buat Template Baru')).toBeInTheDocument();
    expect(screen.getByLabelText('Nama Template')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipe Notifikasi')).toBeInTheDocument();
    expect(screen.getByLabelText('Judul')).toBeInTheDocument();
    expect(screen.getByLabelText('Isi Pesan')).toBeInTheDocument();
  });

  it('creates new template when form is submitted', () => {
    render(<TemplateManagement {...defaultProps} />);

    fireEvent.click(screen.getByText('Buat Template'));

    fireEvent.change(screen.getByLabelText('Nama Template'), {
      target: { value: 'Test Template' },
    });
    fireEvent.change(screen.getByLabelText('Judul'), {
      target: { value: 'Test Title' },
    });
    fireEvent.change(screen.getByLabelText('Isi Pesan'), {
      target: { value: 'Test Body' },
    });

    fireEvent.click(screen.getByText('Buat Template'));

    expect(mockCreateTemplate).toHaveBeenCalledWith(
      'Test Template',
      'announcement',
      'Test Title',
      'Test Body',
      []
    );
    expect(mockOnShowToast).toHaveBeenCalledWith('Template berhasil dibuat', 'success');
  });

  it('opens test modal when "Tes" button is clicked', () => {
    render(<TemplateManagement {...defaultProps} />);

    fireEvent.click(screen.getByText('Tes'));

    expect(screen.getByText('Tes Template')).toBeInTheDocument();
    expect(screen.getByText(/Template: Pengumuman Libur/)).toBeInTheDocument();
  });

  it('shows loading state when sending test notification', async () => {
    const slowMockShowNotification = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <TemplateManagement
        {...defaultProps}
        showNotification={slowMockShowNotification}
      />
    );

    fireEvent.click(screen.getByText('Tes'));

    const sendButton = screen.getByText('Kirim Notifikasi Tes');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Mengirim...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Mengirim...')).not.toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('disables buttons during notification sending', async () => {
    const slowMockShowNotification = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <TemplateManagement
        {...defaultProps}
        showNotification={slowMockShowNotification}
      />
    );

    fireEvent.click(screen.getByText('Tes'));

    const sendButton = screen.getByText('Kirim Notifikasi Tes');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });
  });

  it('shows toast on successful test notification', async () => {
    render(<TemplateManagement {...defaultProps} />);

    fireEvent.click(screen.getByText('Tes'));
    fireEvent.click(screen.getByText('Kirim Notifikasi Tes'));

    await waitFor(() => {
      expect(mockOnShowToast).toHaveBeenCalledWith(
        'Notifikasi tes berhasil dikirim',
        'success'
      );
    });
  });

  it('closes test modal after successful notification', async () => {
    render(<TemplateManagement {...defaultProps} />);

    fireEvent.click(screen.getByText('Tes'));
    expect(screen.getByText('Tes Template')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Kirim Notifikasi Tes'));

    await waitFor(() => {
      expect(screen.queryByText('Tes Template')).not.toBeInTheDocument();
    });
  });

  it('shows error toast when notification creation fails', () => {
    const mockCreateFail = vi.fn().mockReturnValue(null);

    render(
      <TemplateManagement
        {...defaultProps}
        createNotificationFromTemplate={mockCreateFail}
      />
    );

    fireEvent.click(screen.getByText('Tes'));
    fireEvent.click(screen.getByText('Kirim Notifikasi Tes'));

    expect(mockOnShowToast).toHaveBeenCalledWith(
      'Gagal membuat notifikasi dari template',
      'error'
    );
  });

  it('disables template creation button when form is empty', () => {
    render(<TemplateManagement {...defaultProps} />);

    fireEvent.click(screen.getByText('Buat Template'));

    const createButton = screen.getByText('Buat Template');
    expect(createButton).toBeDisabled();
  });

  it('enables template creation button when required fields are filled', () => {
    render(<TemplateManagement {...defaultProps} />);

    fireEvent.click(screen.getByText('Buat Template'));

    fireEvent.change(screen.getByLabelText('Nama Template'), {
      target: { value: 'Test Template' },
    });
    fireEvent.change(screen.getByLabelText('Judul'), {
      target: { value: 'Test Title' },
    });
    fireEvent.change(screen.getByLabelText('Isi Pesan'), {
      target: { value: 'Test Body' },
    });

    const createButton = screen.getByText('Buat Template');
    expect(createButton).not.toBeDisabled();
  });
});
