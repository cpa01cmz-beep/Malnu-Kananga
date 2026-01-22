import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AssignmentCreation from '../AssignmentCreation';
import { STORAGE_KEYS } from '../../constants';
import * as apiService from '../../services/apiService';
import { categoryService } from '../../services/categoryService';
import { AssignmentType, AssignmentStatus, Subject, Class } from '../../types';

const mockOnBack = vi.fn();
const mockOnShowToast = vi.fn();

const mockSubjects: Subject[] = [
  { id: 'sub1', name: 'Matematika', code: 'MTK', description: '', creditHours: 4 },
  { id: 'sub2', name: 'Fisika', code: 'FIS', description: '', creditHours: 3 },
  { id: 'sub3', name: 'Bahasa Indonesia', code: 'BIN', description: '', creditHours: 3 }
];

const mockClasses: Class[] = [
  { id: 'cls1', name: 'X-A', homeroomTeacherId: 't1', academicYear: '2025-2026', semester: '1' },
  { id: 'cls2', name: 'XI-B', homeroomTeacherId: 't2', academicYear: '2025-2026', semester: '1' },
  { id: 'cls3', name: 'XII-C', homeroomTeacherId: 't3', academicYear: '2025-2026', semester: '1' }
];

const mockUser = {
  id: 'teacher1',
  name: 'Guru Test',
  email: 'guru@test.com',
  role: 'teacher' as const,
  status: 'active' as const,
  extraRole: null
};

vi.mock('../../services/apiService', () => ({
  assignmentsAPI: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('../../services/categoryService', () => ({
  categoryService: {
    getSubjects: vi.fn(),
    getClasses: vi.fn()
  }
}));

vi.mock('../../services/unifiedNotificationManager', () => ({
  unifiedNotificationManager: {
    showNotification: vi.fn()
  }
}));

vi.mock('../../hooks/useEventNotifications', () => ({
  useEventNotifications: () => ({
    notifyAssignmentCreate: vi.fn()
  })
}));

vi.mock('../../hooks/useCanAccess', () => ({
  useCanAccess: () => ({
    user: { id: 'teacher1', name: 'Guru', email: 'guru@malnu.sch.id', status: 'active' },
    userRole: 'teacher',
    userExtraRole: null,
    canAccess: vi.fn(() => true),
    canAccessAny: vi.fn(() => true),
    canAccessResource: vi.fn(() => true),
    userPermissions: [],
    userPermissionIds: [],
  })
}));

describe('AssignmentCreation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
    vi.mocked(categoryService.getSubjects).mockResolvedValue(mockSubjects);
    vi.mocked(categoryService.getClasses).mockResolvedValue(mockClasses);
  });

  it('renders loading state initially', () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    expect(screen.getByText(/Loading|Memuat/i)).toBeInTheDocument();
  });

  it('renders assignment creation form after loading', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByText('Buat Tugas Baru')).toBeInTheDocument();
    });
  });

  it('displays all required form fields', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Judul Tugas/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Deskripsi/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Jenis Tugas/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nilai Maksimal/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mata Pelajaran/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Kelas/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tanggal Tenggat/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Instruksi Lengkap/i)).toBeInTheDocument();
    });
  });

  it('populates subject dropdown with mock subjects', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      const subjectSelect = screen.getByLabelText(/Mata Pelajaran/i);
      expect(subjectSelect).toBeInTheDocument();
    });
    
    const options = screen.getAllByRole('option');
    const subjectOptions = options.filter(opt => mockSubjects.some(s => s.name === opt.textContent));
    expect(subjectOptions.length).toBeGreaterThan(0);
  });

  it('populates class dropdown with mock classes', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      const classSelect = screen.getByLabelText(/Kelas/i);
      expect(classSelect).toBeInTheDocument();
    });
    
    const options = screen.getAllByRole('option');
    const classOptions = options.filter(opt => mockClasses.some(c => c.name === opt.textContent));
    expect(classOptions.length).toBeGreaterThan(0);
  });

  it('shows validation errors when form is submitted with empty fields', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByText('Buat Tugas Baru')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Simpan Draft');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Kesalahan Validasi:/i)).toBeInTheDocument();
    });
  });

  it('validates title is required', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByText('Buat Tugas Baru')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Simpan Draft');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Judul tugas harus diisi/i)).toBeInTheDocument();
    });
  });

  it('validates max score is positive', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Judul Tugas/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Judul Tugas/i);
    fireEvent.change(titleInput, { target: { value: 'Tugas Test' } });

    const descriptionInput = screen.getByLabelText(/Deskripsi/i);
    fireEvent.change(descriptionInput, { target: { value: 'Deskripsi test' } });

    const dueDateInput = screen.getByLabelText(/Tanggal Tenggat/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-12-31T23:59' } });

    const maxScoreInput = screen.getByLabelText(/Nilai Maksimal/i);
    fireEvent.change(maxScoreInput, { target: { value: '0' } });

    const submitButton = screen.getByText('Simpan Draft');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Nilai maksimal harus lebih dari 0/i)).toBeInTheDocument();
    });
  });

  it('allows user to fill in form fields', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Judul Tugas/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Judul Tugas/i);
    fireEvent.change(titleInput, { target: { value: 'Tugas Matematika' } });
    expect(titleInput).toHaveValue('Tugas Matematika');

    const descriptionInput = screen.getByLabelText(/Deskripsi/i);
    fireEvent.change(descriptionInput, { target: { value: 'Tugas tentang aljabar' } });
    expect(descriptionInput).toHaveValue('Tugas tentang aljabar');

    const instructionsInput = screen.getByLabelText(/Instruksi Lengkap/i);
    fireEvent.change(instructionsInput, { target: { value: 'Kerjakan soal 1-10' } });
    expect(instructionsInput).toHaveValue('Kerjakan soal 1-10');
  });

  it('allows changing assignment type', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Jenis Tugas/i)).toBeInTheDocument();
    });

    const typeSelect = screen.getByLabelText(/Jenis Tugas/i) as HTMLSelectElement;
    
    fireEvent.change(typeSelect, { target: { value: AssignmentType.PROJECT } });
    expect(typeSelect.value).toBe(AssignmentType.PROJECT);
  });

  it('toggles rubric section', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByText('Rubrik Penilaian')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/Gunakan Rubrik/i);
    
    expect(screen.queryByText(/Kriteria 1/i)).not.toBeInTheDocument();
    
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(screen.getByText(/Kriteria 1/i)).toBeInTheDocument();
    });
  });

  it('allows adding multiple rubric criteria', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByText('Rubrik Penilaian')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/Gunakan Rubrik/i);
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(screen.getByText(/Kriteria 1/i)).toBeInTheDocument();
    });

    const addButton = screen.getByText('Tambah Kriteria');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Kriteria 2/i)).toBeInTheDocument();
    });
  });

  it('allows removing rubric criteria', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByText('Rubrik Penilaian')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/Gunakan Rubrik/i);
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(screen.getByText(/Kriteria 1/i)).toBeInTheDocument();
    });

    const addButton = screen.getByText('Tambah Kriteria');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Kriteria 2/i)).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByLabelText(/Hapus kriteria/i);
    fireEvent.click(removeButtons[0]);
    
    await waitFor(() => {
      expect(screen.queryByText(/Kriteria 2/i)).not.toBeInTheDocument();
    });
  });

  it('validates rubric weight total equals 100%', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByText('Rubrik Penilaian')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/Gunakan Rubrik/i);
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(screen.getByText(/Kriteria 1/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Judul Tugas/i);
    fireEvent.change(titleInput, { target: { value: 'Tugas Test' } });

    const descriptionInput = screen.getByLabelText(/Deskripsi/i);
    fireEvent.change(descriptionInput, { target: { value: 'Deskripsi test' } });

    const dueDateInput = screen.getByLabelText(/Tanggal Tenggat/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-12-31T23:59' } });

    const weightInput = screen.getByLabelText(/Bobot \(%\)/i);
    fireEvent.change(weightInput, { target: { value: '50' } });

    const submitButton = screen.getByText('Simpan Draft');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Total bobot rubrik harus 100%/i)).toBeInTheDocument();
    });
  });

  it('calls assignmentsAPI.create on successful form submission', async () => {
    const mockCreatedAssignment = {
      id: 'assign1',
      title: 'Tugas Test',
      description: 'Deskripsi test',
      type: AssignmentType.ASSIGNMENT,
      subjectId: 'sub1',
      classId: 'cls1',
      teacherId: 'teacher1',
      academicYear: '2025-2026',
      semester: '1',
      maxScore: 100,
      dueDate: '2025-12-31T23:59',
      status: AssignmentStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vi.mocked(apiService.assignmentsAPI.create).mockResolvedValue({
      success: true,
      data: mockCreatedAssignment,
      message: 'Tugas berhasil dibuat'
    });

    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Judul Tugas/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Judul Tugas/i);
    fireEvent.change(titleInput, { target: { value: 'Tugas Test' } });

    const descriptionInput = screen.getByLabelText(/Deskripsi/i);
    fireEvent.change(descriptionInput, { target: { value: 'Deskripsi test' } });

    const dueDateInput = screen.getByLabelText(/Tanggal Tenggat/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-12-31T23:59' } });

    const submitButton = screen.getByText('Simpan Draft');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(apiService.assignmentsAPI.create).toHaveBeenCalled();
    });
  });

  it('shows toast notification on successful assignment creation', async () => {
    const mockCreatedAssignment = {
      id: 'assign1',
      title: 'Tugas Test',
      description: 'Deskripsi test',
      type: AssignmentType.ASSIGNMENT,
      subjectId: 'sub1',
      classId: 'cls1',
      teacherId: 'teacher1',
      academicYear: '2025-2026',
      semester: '1',
      maxScore: 100,
      dueDate: '2025-12-31T23:59',
      status: AssignmentStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vi.mocked(apiService.assignmentsAPI.create).mockResolvedValue({
      success: true,
      data: mockCreatedAssignment,
      message: 'Tugas berhasil dibuat'
    });

    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Judul Tugas/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Judul Tugas/i);
    fireEvent.change(titleInput, { target: { value: 'Tugas Test' } });

    const descriptionInput = screen.getByLabelText(/Deskripsi/i);
    fireEvent.change(descriptionInput, { target: { value: 'Deskripsi test' } });

    const dueDateInput = screen.getByLabelText(/Tanggal Tenggat/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-12-31T23:59' } });

    const submitButton = screen.getByText('Simpan Draft');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnShowToast).toHaveBeenCalledWith('Draft tugas berhasil disimpan', 'success');
    });
  });

  it('calls onBack after successful submission', async () => {
    const mockCreatedAssignment = {
      id: 'assign1',
      title: 'Tugas Test',
      description: 'Deskripsi test',
      type: AssignmentType.ASSIGNMENT,
      subjectId: 'sub1',
      classId: 'cls1',
      teacherId: 'teacher1',
      academicYear: '2025-2026',
      semester: '1',
      maxScore: 100,
      dueDate: '2025-12-31T23:59',
      status: AssignmentStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vi.mocked(apiService.assignmentsAPI.create).mockResolvedValue({
      success: true,
      data: mockCreatedAssignment,
      message: 'Tugas berhasil dibuat'
    });

    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Judul Tugas/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Judul Tugas/i);
    fireEvent.change(titleInput, { target: { value: 'Tugas Test' } });

    const descriptionInput = screen.getByLabelText(/Deskripsi/i);
    fireEvent.change(descriptionInput, { target: { value: 'Deskripsi test' } });

    const dueDateInput = screen.getByLabelText(/Tanggal Tenggat/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-12-31T23:59' } });

    const submitButton = screen.getByText('Simpan Draft');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  it('publishes assignment when publish button is clicked', async () => {
    const mockCreatedAssignment = {
      id: 'assign1',
      title: 'Tugas Test',
      description: 'Deskripsi test',
      type: AssignmentType.ASSIGNMENT,
      subjectId: 'sub1',
      classId: 'cls1',
      teacherId: 'teacher1',
      academicYear: '2025-2026',
      semester: '1',
      maxScore: 100,
      dueDate: '2025-12-31T23:59',
      status: AssignmentStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vi.mocked(apiService.assignmentsAPI.create).mockResolvedValue({
      success: true,
      data: mockCreatedAssignment,
      message: 'Tugas berhasil dibuat'
    });

    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Judul Tugas/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Judul Tugas/i);
    fireEvent.change(titleInput, { target: { value: 'Tugas Test' } });

    const descriptionInput = screen.getByLabelText(/Deskripsi/i);
    fireEvent.change(descriptionInput, { target: { value: 'Deskripsi test' } });

    const dueDateInput = screen.getByLabelText(/Tanggal Tenggat/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-12-31T23:59' } });

    const publishButton = screen.getByText('Publikasikan Tugas');
    fireEvent.click(publishButton);
    
    await waitFor(() => {
      const createCall = vi.mocked(apiService.assignmentsAPI.create).mock.calls[0][0];
      expect(createCall.status).toBe(AssignmentStatus.PUBLISHED);
    });
  });

  it('shows error toast on failed submission', async () => {
    vi.mocked(apiService.assignmentsAPI.create).mockRejectedValue(new Error('Network error'));

    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Judul Tugas/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Judul Tugas/i);
    fireEvent.change(titleInput, { target: { value: 'Tugas Test' } });

    const descriptionInput = screen.getByLabelText(/Deskripsi/i);
    fireEvent.change(descriptionInput, { target: { value: 'Deskripsi test' } });

    const dueDateInput = screen.getByLabelText(/Tanggal Tenggat/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-12-31T23:59' } });

    const submitButton = screen.getByText('Simpan Draft');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnShowToast).toHaveBeenCalledWith('Gagal membuat tugas. Silakan coba lagi.', 'error');
    });
  });

  it('calls onBack when cancel button is clicked', async () => {
    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByText('Buat Tugas Baru')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Batal');
    fireEvent.click(cancelButton);
    
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('disables form fields while submitting', async () => {
    vi.mocked(apiService.assignmentsAPI.create).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        data: { id: '1' } as any,
        message: 'Success'
      }), 1000))
    );

    render(<AssignmentCreation onBack={mockOnBack} onShowToast={mockOnShowToast} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Judul Tugas/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Judul Tugas/i);
    fireEvent.change(titleInput, { target: { value: 'Tugas Test' } });

    const descriptionInput = screen.getByLabelText(/Deskripsi/i);
    fireEvent.change(descriptionInput, { target: { value: 'Deskripsi test' } });

    const dueDateInput = screen.getByLabelText(/Tanggal Tenggat/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-12-31T23:59' } });

    const submitButton = screen.getByText('Simpan Draft');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(titleInput).toBeDisabled();
      expect(descriptionInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });
});