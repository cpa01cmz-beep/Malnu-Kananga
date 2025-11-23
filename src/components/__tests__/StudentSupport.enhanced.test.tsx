import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudentSupport } from '../StudentSupport';

const mockSupportData = {
  announcements: [
    { id: '1', title: 'Pengumuman 1', content: 'Isi pengumuman 1', date: '2023-11-01' },
  ],
  resources: [
    { id: '1', title: 'Resource 1', type: 'document', url: 'https://example.com' },
  ],
  contacts: [
    { id: '1', name: 'Guru BK', email: 'bk@school.edu', role: 'counselor' },
  ],
};

describe('StudentSupport Component', () => {
  const mockOnSubmitTicket = jest.fn();
  const mockOnDownloadResource = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders student support interface', () => {
    render(
      <StudentSupport
        supportData={mockSupportData}
        onSubmitTicket={mockOnSubmitTicket}
        onDownloadResource={mockOnDownloadResource}
      />
    );

    expect(screen.getByText(/dukungan siswa/i)).toBeInTheDocument();
    expect(screen.getByText('Pengumuman 1')).toBeInTheDocument();
  });

  test('submits support ticket', async () => {
    const user = userEvent.setup();
    
    render(
      <StudentSupport
        supportData={mockSupportData}
        onSubmitTicket={mockOnSubmitTicket}
        onDownloadResource={mockOnDownloadResource}
      />
    );

    const titleInput = screen.getByLabelText(/judul tiket/i);
    const descriptionInput = screen.getByLabelText(/deskripsi/i);
    const submitButton = screen.getByRole('button', { name: /kirim tiket/i });

    await user.type(titleInput, 'Butuh Bantuan');
    await user.type(descriptionInput, 'Saya membutuhkan bantuan untuk tugas');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmitTicket).toHaveBeenCalledWith({
        title: 'Butuh Bantuan',
        description: 'Saya membutuhkan bantuan untuk tugas',
        category: 'academic',
      });
    });
  });

  test('downloads resources', async () => {
    const user = userEvent.setup();
    
    render(
      <StudentSupport
        supportData={mockSupportData}
        onSubmitTicket={mockOnSubmitTicket}
        onDownloadResource={mockOnDownloadResource}
      />
    );

    const downloadButton = screen.getByRole('button', { name: /unduh/i });
    await user.click(downloadButton);

    expect(mockOnDownloadResource).toHaveBeenCalledWith('1');
  });

  test('filters announcements by date', async () => {
    const user = userEvent.setup();
    
    render(
      <StudentSupport
        supportData={mockSupportData}
        onSubmitTicket={mockOnSubmitTicket}
        onDownloadResource={mockOnDownloadResource}
      />
    );

    const dateFilter = screen.getByLabelText(/filter tanggal/i);
    await user.type(dateFilter, '2023-11-01');

    expect(screen.getByText('Pengumuman 1')).toBeInTheDocument();
  });

  test('searches resources', async () => {
    const user = userEvent.setup();
    
    render(
      <StudentSupport
        supportData={mockSupportData}
        onSubmitTicket={mockOnSubmitTicket}
        onDownloadResource={mockOnDownloadResource}
      />
    );

    const searchInput = screen.getByPlaceholderText(/cari resource/i);
    await user.type(searchInput, 'Resource 1');

    expect(screen.getByText('Resource 1')).toBeInTheDocument();
  });

  test('displays contact information', () => {
    render(
      <StudentSupport
        supportData={mockSupportData}
        onSubmitTicket={mockOnSubmitTicket}
        onDownloadResource={mockOnDownloadResource}
      />
    );

    expect(screen.getByText('Guru BK')).toBeInTheDocument();
    expect(screen.getByText('bk@school.edu')).toBeInTheDocument();
  });

  test('validates ticket form', async () => {
    const user = userEvent.setup();
    
    render(
      <StudentSupport
        supportData={mockSupportData}
        onSubmitTicket={mockOnSubmitTicket}
        onDownloadResource={mockOnDownloadResource}
      />
    );

    const submitButton = screen.getByRole('button', { name: /kirim tiket/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/judul wajib diisi/i)).toBeInTheDocument();
    });

    expect(mockOnSubmitTicket).not.toHaveBeenCalled();
  });

  test('categorizes support tickets', async () => {
    const user = userEvent.setup();
    
    render(
      <StudentSupport
        supportData={mockSupportData}
        onSubmitTicket={mockOnSubmitTicket}
        onDownloadResource={mockOnDownloadResource}
      />
    );

    const categorySelect = screen.getByLabelText(/kategori/i);
    await user.selectOptions(categorySelect, 'technical');

    const titleInput = screen.getByLabelText(/judul tiket/i);
    const submitButton = screen.getByRole('button', { name: /kirim tiket/i });

    await user.type(titleInput, 'Technical Issue');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmitTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'technical',
        })
      );
    });
  });

  test('shows ticket history', () => {
    const mockTickets = [
      { id: '1', title: 'Ticket 1', status: 'resolved', date: '2023-11-01' },
    ];

    render(
      <StudentSupport
        supportData={mockSupportData}
        tickets={mockTickets}
        onSubmitTicket={mockOnSubmitTicket}
        onDownloadResource={mockOnDownloadResource}
      />
    );

    expect(screen.getByText('Ticket 1')).toBeInTheDocument();
    expect(screen.getByText('Selesai')).toBeInTheDocument();
  });

  test('handles file attachments in tickets', async () => {
    const user = userEvent.setup();
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    render(
      <StudentSupport
        supportData={mockSupportData}
        onSubmitTicket={mockOnSubmitTicket}
        onDownloadResource={mockOnDownloadResource}
      />
    );

    const fileInput = screen.getByLabelText(/lampiran/i);
    await user.upload(fileInput, file);

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  test('shows emergency contacts', () => {
    render(
      <StudentSupport
        supportData={mockSupportData}
        onSubmitTicket={mockOnSubmitTicket}
        onDownloadResource={mockOnDownloadResource}
      />
    );

    expect(screen.getByText(/kontak darurat/i)).toBeInTheDocument();
  });
});