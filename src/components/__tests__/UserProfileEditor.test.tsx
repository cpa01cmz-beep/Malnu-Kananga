import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileEditor from '../UserProfileEditor';
import { authService } from '../../services/authService';
import { usersAPI } from '../../services/apiService';

vi.mock('../../services/authService');
vi.mock('../../services/apiService');
vi.mock('../../hooks/useCanAccess', () => ({
  useCanAccess: () => ({
    user: { id: 'user-1', role: 'student', name: 'Test User', email: 'test@example.com' },
    canAccess: vi.fn(() => ({ canAccess: true })),
    canAccessAny: vi.fn(() => ({ canAccess: true }))
  })
}));

vi.mock('../../hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    errorState: { hasError: false, feedback: null },
    handleAsyncError: vi.fn((fn) => fn()),
    clearError: vi.fn()
  })
}));

vi.mock('../../services/unifiedNotificationManager', () => ({
  unifiedNotificationManager: {
    showLocalNotification: vi.fn().mockResolvedValue({ success: true })
  }
}));

describe('UserProfileEditor', () => {
  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student' as const,
    extraRole: null,
    status: 'active' as const,
    phone: '081234567890',
    address: '123 Main Street',
    bio: 'Student',
    dateOfBirth: '2000-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (usersAPI.getById as any).mockResolvedValue({
      success: true,
      data: mockUser
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders user profile information', async () => {
    render(<UserProfileEditor />);

    await waitFor(() => {
      expect(screen.getByText('Profil Saya')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    (usersAPI.getById as any).mockImplementation(() => new Promise(() => {}));

    render(<UserProfileEditor />);

    expect(screen.getByText('Memuat Profil...')).toBeInTheDocument();
  });

  it('displays error state on failed fetch', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    (usersAPI.getById as any).mockRejectedValue(new Error('Network error'));

    render(<UserProfileEditor />);

    await waitFor(() => {
      expect(screen.getByText(/Memuat Profil/)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('allows editing profile fields', async () => {
    render(<UserProfileEditor />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Nama Lengkap');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Doe');

    expect(nameInput).toHaveValue('Jane Doe');
  });

  it('saves profile on form submission', async () => {
    (authService.updateProfile as any).mockResolvedValue({
      success: true,
      data: { ...mockUser, name: 'Updated Name' }
    });

    const mockShowToast = vi.fn();
    render(<UserProfileEditor onShowToast={mockShowToast} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Nama Lengkap')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Nama Lengkap');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Name');

    const saveButton = screen.getByRole('button', { name: /Simpan Profil/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith('user-1', {
        name: 'Updated Name',
        email: 'john@example.com',
        phone: '081234567890',
        address: '123 Main Street',
        bio: 'Student',
        dateOfBirth: '2000-01-01',
        avatar: '',
      });
      expect(mockShowToast).toHaveBeenCalledWith('Profil berhasil diperbarui', 'success');
    });
  });

  it('opens password change modal when clicking Ubah Password', async () => {
    render(<UserProfileEditor />);

    await waitFor(() => {
      expect(screen.getByText('Ubah Password')).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByRole('button', { name: /Ubah Password/i });
    await userEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByText('Ubah Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Password Saat Ini')).toBeInTheDocument();
      expect(screen.getByLabelText('Password Baru')).toBeInTheDocument();
      expect(screen.getByLabelText('Konfirmasi Password Baru')).toBeInTheDocument();
    });
  });

  it('validates password form', async () => {
    render(<UserProfileEditor />);

    await waitFor(() => {
      expect(screen.getByText('Ubah Password')).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByRole('button', { name: /Ubah Password/i });
    await userEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Password Saat Ini')).toBeInTheDocument();
    });

    const submitButton = screen.getAllByRole('button', { name: /Ubah Password/i })[1];
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Password saat ini harus diisi/)).toBeInTheDocument();
    });
  });

  it('changes password successfully', async () => {
    (authService.changePassword as any).mockResolvedValue({
      success: true
    });

    const mockShowToast = vi.fn();
    render(<UserProfileEditor onShowToast={mockShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Ubah Password')).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByRole('button', { name: /Ubah Password/i });
    await userEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Password Saat Ini')).toBeInTheDocument();
    });

    const currentPasswordInput = screen.getByLabelText('Password Saat Ini');
    const newPasswordInput = screen.getByLabelText('Password Baru');
    const confirmPasswordInput = screen.getByLabelText('Konfirmasi Password Baru');

    await userEvent.type(currentPasswordInput, 'oldpassword');
    await userEvent.type(newPasswordInput, 'newpassword123');
    await userEvent.type(confirmPasswordInput, 'newpassword123');

    const submitButton = screen.getAllByRole('button', { name: /Ubah Password/i })[1];
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.changePassword).toHaveBeenCalledWith('user-1', 'oldpassword', 'newpassword123');
      expect(mockShowToast).toHaveBeenCalledWith('Password berhasil diubah', 'success');
    });
  });

  it('validates password confirmation mismatch', async () => {
    render(<UserProfileEditor />);

    await waitFor(() => {
      expect(screen.getByText('Ubah Password')).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByRole('button', { name: /Ubah Password/i });
    await userEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Password Saat Ini')).toBeInTheDocument();
    });

    const currentPasswordInput = screen.getByLabelText('Password Saat Ini');
    const newPasswordInput = screen.getByLabelText('Password Baru');
    const confirmPasswordInput = screen.getByLabelText('Konfirmasi Password Baru');

    await userEvent.type(currentPasswordInput, 'oldpassword');
    await userEvent.type(newPasswordInput, 'newpassword123');
    await userEvent.type(confirmPasswordInput, 'differentpassword');

    const submitButton = screen.getAllByRole('button', { name: /Ubah Password/i })[1];
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Password baru tidak cocok dengan konfirmasi/)).toBeInTheDocument();
    });
  });

  it('validates minimum password length', async () => {
    render(<UserProfileEditor />);

    await waitFor(() => {
      expect(screen.getByText('Ubah Password')).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByRole('button', { name: /Ubah Password/i });
    await userEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Password Saat Ini')).toBeInTheDocument();
    });

    const currentPasswordInput = screen.getByLabelText('Password Saat Ini');
    const newPasswordInput = screen.getByLabelText('Password Baru');
    const confirmPasswordInput = screen.getByLabelText('Konfirmasi Password Baru');

    await userEvent.type(currentPasswordInput, 'oldpassword');
    await userEvent.type(newPasswordInput, '1234567');
    await userEvent.type(confirmPasswordInput, '1234567');

    const submitButton = screen.getAllByRole('button', { name: /Ubah Password/i })[1];
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Password baru minimal 8 karakter/)).toBeInTheDocument();
    });
  });

  it('shows role badges correctly', async () => {
    render(<UserProfileEditor />);

    await waitFor(() => {
      expect(screen.getByText('student')).toBeInTheDocument();
    });
  });

  it('displays avatar with initials when no avatar URL', async () => {
    render(<UserProfileEditor />);

    await waitFor(() => {
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  it('displays avatar image when avatar URL is provided', async () => {
    const userWithAvatar = { ...mockUser, avatar: 'https://example.com/avatar.jpg' };
    (usersAPI.getById as any).mockResolvedValue({
      success: true,
      data: userWithAvatar
    });

    render(<UserProfileEditor />);

    await waitFor(() => {
      const avatarImage = screen.getByAltText(/John Doe's avatar/);
      expect(avatarImage).toBeInTheDocument();
      expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  it('closes password modal on cancel', async () => {
    render(<UserProfileEditor />);

    await waitFor(() => {
      expect(screen.getByText('Ubah Password')).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByRole('button', { name: /Ubah Password/i });
    await userEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Password Saat Ini')).toBeInTheDocument();
    });

    const cancelButton = screen.getAllByRole('button', { name: /Batal/i })[1];
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByLabelText('Password Saat Ini')).not.toBeInTheDocument();
    });
  });

  it('shows back button when onBack prop is provided', async () => {
    const mockOnBack = vi.fn();
    render(<UserProfileEditor onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Kembali/i })).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /Kembali/i });
    await userEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('disables form fields when not allowed to edit', async () => {
    vi.mock('../../hooks/useCanAccess', () => ({
      useCanAccess: () => ({
        user: { id: 'user-2', role: 'student' },
        canAccess: vi.fn(() => ({ canAccess: false })),
        canAccessAny: vi.fn(() => ({ canAccess: true }))
      })
    }));

    const userWithId = { ...mockUser, id: 'user-1' };
    (usersAPI.getById as any).mockResolvedValue({
      success: true,
      data: userWithId
    });

    render(<UserProfileEditor userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeDisabled();
    });
  });

  it('shows character count for bio field', async () => {
    render(<UserProfileEditor />);

    await waitFor(() => {
      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    });

    const bioInput = screen.getByLabelText('Bio');
    await userEvent.type(bioInput, 'This is a test bio');

    await waitFor(() => {
      expect(screen.getByText('18/500')).toBeInTheDocument();
    });
  });
});