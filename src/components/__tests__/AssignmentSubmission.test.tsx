import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssignmentSubmission } from '../AssignmentSubmission';

const mockAssignment = {
  id: '1',
  title: 'Test Assignment',
  description: 'Test description',
  dueDate: '2023-12-31',
  maxScore: 100,
};

describe('AssignmentSubmission Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnSaveDraft = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  test('renders assignment submission form', () => {
    render(
      <AssignmentSubmission
        assignment={mockAssignment}
        onSubmit={mockOnSubmit}
        onSaveDraft={mockOnSaveDraft}
      />
    );

    expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByLabelText(/judul tugas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deskripsi/i)).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <AssignmentSubmission
        assignment={mockAssignment}
        onSubmit={mockOnSubmit}
        onSaveDraft={mockOnSaveDraft}
      />
    );

    const titleInput = screen.getByLabelText(/judul tugas/i);
    const descriptionInput = screen.getByLabelText(/deskripsi/i);
    const submitButton = screen.getByRole('button', { name: /kirim tugas/i });

    await user.type(titleInput, 'My Submission');
    await user.type(descriptionInput, 'My description');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'My Submission',
        description: 'My description',
        files: [],
      });
    });
  });

  test('saves draft', async () => {
    const user = userEvent.setup();
    
    render(
      <AssignmentSubmission
        assignment={mockAssignment}
        onSubmit={mockOnSubmit}
        onSaveDraft={mockOnSaveDraft}
      />
    );

    const titleInput = screen.getByLabelText(/judul tugas/i);
    const saveDraftButton = screen.getByRole('button', { name: /simpan draf/i });

    await user.type(titleInput, 'Draft Title');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(mockOnSaveDraft).toHaveBeenCalledWith({
        title: 'Draft Title',
        description: '',
        files: [],
      });
    });
  });

  test('handles file upload', async () => {
    const user = userEvent.setup();
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    render(
      <AssignmentSubmission
        assignment={mockAssignment}
        onSubmit={mockOnSubmit}
        onSaveDraft={mockOnSaveDraft}
      />
    );

    const fileInput = screen.getByLabelText(/unggah file/i);
    await user.upload(fileInput, file);

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <AssignmentSubmission
        assignment={mockAssignment}
        onSubmit={mockOnSubmit}
        onSaveDraft={mockOnSaveDraft}
      />
    );

    const submitButton = screen.getByRole('button', { name: /kirim tugas/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/judul wajib diisi/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('removes uploaded files', async () => {
    const user = userEvent.setup();
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    render(
      <AssignmentSubmission
        assignment={mockAssignment}
        onSubmit={mockOnSubmit}
        onSaveDraft={mockOnSaveDraft}
      />
    );

    const fileInput = screen.getByLabelText(/unggah file/i);
    await user.upload(fileInput, file);

    const removeButton = screen.getByRole('button', { name: /hapus/i });
    await user.click(removeButton);

    expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
  });

  test('shows character count for description', async () => {
    const user = userEvent.setup();
    
    render(
      <AssignmentSubmission
        assignment={mockAssignment}
        onSubmit={mockOnSubmit}
        onSaveDraft={mockOnSaveDraft}
      />
    );

    const descriptionInput = screen.getByLabelText(/deskripsi/i);
    await user.type(descriptionInput, 'Test');

    expect(screen.getByText(/4\/500 karakter/i)).toBeInTheDocument();
  });

  test('handles multiple file uploads', async () => {
    const user = userEvent.setup();
    const file1 = new File(['test1'], 'test1.pdf', { type: 'application/pdf' });
    const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
    
    render(
      <AssignmentSubmission
        assignment={mockAssignment}
        onSubmit={mockOnSubmit}
        onSaveDraft={mockOnSaveDraft}
      />
    );

    const fileInput = screen.getByLabelText(/unggah file/i);
    await user.upload(fileInput, [file1, file2]);

    expect(screen.getByText('test1.pdf')).toBeInTheDocument();
    expect(screen.getByText('test2.jpg')).toBeInTheDocument();
  });

  test('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    
    render(
      <AssignmentSubmission
        assignment={mockAssignment}
        onSubmit={mockOnSubmit}
        onSaveDraft={mockOnSaveDraft}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /mengirim/i });
    expect(submitButton).toBeDisabled();
  });

  test('shows confirmation dialog before submission', async () => {
    const user = userEvent.setup();
    
    render(
      <AssignmentSubmission
        assignment={mockAssignment}
        onSubmit={mockOnSubmit}
        onSaveDraft={mockOnSaveDraft}
      />
    );

    const titleInput = screen.getByLabelText(/judul tugas/i);
    const submitButton = screen.getByRole('button', { name: /kirim tugas/i });

    await user.type(titleInput, 'My Submission');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/konfirmasi pengiriman/i)).toBeInTheDocument();
    });
  });
});