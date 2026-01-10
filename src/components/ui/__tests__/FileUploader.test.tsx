 
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUploader from '../FileUploader';

// Mock the fileStorageAPI
vi.mock('../../../services/apiService', () => ({
  fileStorageAPI: {
    upload: vi.fn().mockResolvedValue({
      success: true,
      message: 'Upload successful',
      data: {
        key: 'test-file-key',
        url: 'http://example.com/files/test-file-key',
        name: 'test-file.pdf',
        size: 1024,
        type: 'application/pdf',
      },
    }),
    delete: vi.fn().mockResolvedValue({ success: true }),
    getDownloadUrl: vi.fn().mockReturnValue('http://example.com/download'),
  },
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

// Mock icons
vi.mock('../../icons/CloudArrowUpIcon', () => ({
  CloudArrowUpIcon: () => <div data-testid="cloud-icon">Cloud</div>,
}));

vi.mock('../../icons/TrashIcon', () => ({
  TrashIcon: () => <div data-testid="trash-icon">Trash</div>,
}));

vi.mock('../../icons/CloseIcon', () => ({
  CloseIcon: () => <div data-testid="close-icon">Close</div>,
}));

vi.mock('../../icons/ArrowDownTrayIcon', () => ({
  ArrowDownTrayIcon: () => <div data-testid="download-icon">Download</div>,
}));

describe('FileUploader', () => {
  it('renders upload area', () => {
    render(<FileUploader />);
    
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByText(/\.pdf,\.doc,\.docx,\.ppt,\.pptx,\.jpg,\.jpeg,\.png,\.mp4/)).toBeInTheDocument();
    expect(screen.getByText(/\(Max 50MB\)/)).toBeInTheDocument();
  });

  it('shows files list when files are provided', () => {
    const existingFiles = [
      {
        id: '1',
        key: 'test-key',
        name: 'test.pdf',
        size: 1024,
        type: 'application/pdf',
        uploadDate: '2023-01-01T00:00:00Z',
      },
    ];

    render(<FileUploader existingFiles={existingFiles} />);
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });

  it('shows minimal variant correctly', () => {
    render(<FileUploader variant="minimal" />);
    
    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.queryByText('Click to upload or drag and drop')).not.toBeInTheDocument();
  });

  it('disables upload when disabled prop is true', () => {
    render(<FileUploader disabled={true} />);
    
    const uploadButton = screen.getByRole('button');
    expect(uploadButton).toBeDisabled();
    expect(uploadButton).toHaveClass('cursor-not-allowed');
  });

  it('validates file types', async () => {
    render(<FileUploader acceptedFileTypes=".pdf,.doc" />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button').previousSibling as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText(/File type not accepted/)).toBeInTheDocument();
    });
  });

  it('handles file deletion', async () => {
    const mockOnFileDeleted = vi.fn();
    const existingFiles = [
      {
        id: '1',
        key: 'test-key',
        name: 'test.pdf',
        size: 1024,
        type: 'application/pdf',
        uploadDate: '2023-01-01T00:00:00Z',
      },
    ];

    render(<FileUploader existingFiles={existingFiles} onFileDeleted={mockOnFileDeleted} />);
    
    const deleteButton = screen.getByLabelText('Delete file');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockOnFileDeleted).toHaveBeenCalledWith('test-key');
    });
  });

it('shows loading state during upload', async () => {
    const { fileStorageAPI } = await import('../../../services/apiService');
    
    // Mock slow upload
    vi.mocked(fileStorageAPI.upload).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
success: true,
      message: 'Upload successful',
      data: {
        key: 'test-file-key',
        url: 'http://example.com/files/test-file-key',
        name: 'test.pdf',
        size: 1024,
        type: 'application/pdf',
      },
      }), 100))
    );

    render(<FileUploader />);
    
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('button').previousSibling as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });
  });

  it('limits number of files according to maxFiles', () => {
    const existingFiles = Array.from({ length: 10 }, (_, i) => ({
      id: i.toString(),
      key: `key-${i}`,
      name: `file${i}.pdf`,
      size: 1024,
      type: 'application/pdf',
      uploadDate: '2023-01-01T00:00:00Z',
    }));

    render(<FileUploader existingFiles={existingFiles} maxFiles={10} />);
    
    expect(screen.getByText('Uploaded Files (10/10)')).toBeInTheDocument();
  });

  it('handles drag and drop events', () => {
    render(<FileUploader dragAndDrop={true} />);
    
    const dropZone = screen.getByRole('button');
    
    fireEvent.dragOver(dropZone);
    fireEvent.dragEnter(dropZone);
    
    // Check that drag events are handled without errors
    expect(dropZone).toBeInTheDocument();
  });

  it('shows preview for image files', () => {
    const existingFiles = [
      {
        id: '1',
        key: 'test-key',
        name: 'test.jpg',
        size: 1024,
        type: 'image/jpeg',
        uploadDate: '2023-01-01T00:00:00Z',
        preview: 'data:image/jpeg;base64,test',
      },
    ];

    render(<FileUploader existingFiles={existingFiles} showPreview={true} />);
    
    const image = screen.getByRole('img', { name: /test\.jpg/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'data:image/jpeg;base64,test');
  });
});