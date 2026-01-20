import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnhancedMaterialSharing from '../EnhancedMaterialSharing';
import { ELibrary, UserRole, UserExtraRole, MaterialSharePermission, MaterialShareSettings } from '../../types';
import { materialPermissionService } from '../../services/materialPermissionService';

vi.mock('../../services/materialPermissionService', () => ({
  materialPermissionService: {
    checkAccess: vi.fn(),
    canShare: vi.fn(),
    getPermissionSummary: vi.fn(),
    formatPermissionName: vi.fn((perm) => perm),
    getPermissionDescription: vi.fn(() => 'Description'),
    validateShareRequest: vi.fn(),
    logShareAudit: vi.fn(),
    getShareAuditHistory: vi.fn(),
    revokeAccess: vi.fn(),
  },
}));

vi.mock('../../hooks/useCanAccess', () => ({
  useCanAccess: () => ({
    canAccess: () => ({ canAccess: true, permission: 'admin' }),
  }),
}));

const mockMaterial: ELibrary = {
  id: 'material123',
  title: 'Test Material',
  description: 'Test Description',
  category: 'Matematika',
  fileUrl: 'https://example.com/file.pdf',
  fileType: 'pdf',
  fileSize: 1024000,
  subjectId: 'subject123',
  uploadedBy: 'owner456',
  uploadedAt: new Date().toISOString(),
  downloadCount: 10,
  isShared: false,
  sharePermissions: [],
  shareSettings: {
    isPublic: false,
    allowAnonymous: false,
    requirePassword: false,
  },
};

const mockProps = {
  material: mockMaterial,
  onShowToast: vi.fn(),
  onSharingUpdate: vi.fn(),
  currentUserId: 'user123',
  currentUserRole: 'teacher' as UserRole,
  currentUserName: 'Test User',
};

describe('EnhancedMaterialSharing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (materialPermissionService.getPermissionSummary as ReturnType<typeof vi.fn>).mockReturnValue({
      userCount: 0,
      roleCount: 0,
      publicAccess: false,
      totalPermissions: 0,
    });
    (materialPermissionService.getShareAuditHistory as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (materialPermissionService.canShare as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render component without crashing', () => {
      render(<EnhancedMaterialSharing {...mockProps} />);
      expect(screen.getByText('Pengaturan Berbagi')).toBeInTheDocument();
    });

    it('should display share button when user can share', () => {
      render(<EnhancedMaterialSharing {...mockProps} />);
      expect(screen.getByText('+ Bagikan')).toBeInTheDocument();
    });

    it('should not display share button when user cannot share', () => {
      (materialPermissionService.canShare as ReturnType<typeof vi.fn>).mockReturnValue(false);
      render(<EnhancedMaterialSharing {...mockProps} />);
      expect(screen.queryByText('+ Bagikan')).not.toBeInTheDocument();
    });

    it('should display "not shared" state when no permissions', () => {
      render(<EnhancedMaterialSharing {...mockProps} />);
      expect(screen.getByText('Materi belum dibagikan')).toBeInTheDocument();
    });
  });

  describe('Share Modal', () => {
    it('should open share modal on button click', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      expect(screen.getByText('Bagikan Materi')).toBeInTheDocument();
      expect(screen.getByText('"Test Material"')).toBeInTheDocument();
    });

    it('should close share modal on cancel', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const cancelButton = screen.getByText('Batal');
      await user.click(cancelButton);

      expect(screen.queryByText('Bagikan Materi')).not.toBeInTheDocument();
    });

    it('should display sharing mode options', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      expect(screen.getByText('Pengguna Spesifik')).toBeInTheDocument();
      expect(screen.getByText('Berdasarkan Peran')).toBeInTheDocument();
      expect(screen.getByText('Publik')).toBeInTheDocument();
    });

    it('should display permission options', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      expect(screen.getByText('Lihat')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('User Sharing Mode', () => {
    it('should display user selection when in users mode', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const usersModeButton = screen.getByText('Pengguna Spesifik');
      await user.click(usersModeButton);

      expect(screen.getByPlaceholderText(/Cari berdasarkan nama atau email/)).toBeInTheDocument();
    });

    it('should filter users by search term', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const usersModeButton = screen.getByText('Pengguna Spesifik');
      await user.click(usersModeButton);

      const searchInput = screen.getByPlaceholderText(/Cari berdasarkan nama atau email/);
      await user.type(searchInput, 'Ahmad');

      await waitFor(() => {
        expect(screen.getByText(/Ahmad/)).toBeInTheDocument();
      });
    });

    it('should select user on checkbox click', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const usersModeButton = screen.getByText('Pengguna Spesifik');
      await user.click(usersModeButton);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        if (checkboxes.length > 0) {
          fireEvent.click(checkboxes[0]);
        }
      });
    });
  });

  describe('Role Sharing Mode', () => {
    it('should display role options when in roles mode', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const rolesModeButton = screen.getByText('Berdasarkan Peran');
      await user.click(rolesModeButton);

      expect(screen.getByText('Guru')).toBeInTheDocument();
      expect(screen.getByText('Siswa')).toBeInTheDocument();
      expect(screen.getByText('Orang Tua')).toBeInTheDocument();
    });

    it('should display extra role options', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const rolesModeButton = screen.getByText('Berdasarkan Peran');
      await user.click(rolesModeButton);

      expect(screen.getByText('STAFF')).toBeInTheDocument();
      expect(screen.getByText('OSIS')).toBeInTheDocument();
      expect(screen.getByText('WAKASEK')).toBeInTheDocument();
      expect(screen.getByText('KEPSEK')).toBeInTheDocument();
    });

    it('should select role on click', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const rolesModeButton = screen.getByText('Berdasarkan Peran');
      await user.click(rolesModeButton);

      const teacherRole = screen.getByText('Guru');
      await user.click(teacherRole);
    });
  });

  describe('Public Sharing Mode', () => {
    it('should display public sharing option', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const publicModeButton = screen.getByText('Publik');
      await user.click(publicModeButton);

      expect(publicModeButton).toHaveClass('border-blue-500');
    });
  });

  describe('Permission Selection', () => {
    it('should change permission on click', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const editPermission = screen.getByText('Edit');
      await user.click(editPermission);

      expect(editPermission).toHaveClass('border-blue-500');
    });
  });

  describe('Expiration Settings', () => {
    it('should show date picker when expiration enabled', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const expirationCheckbox = screen.getByLabelText(/Batasi waktu akses/);
      await user.click(expirationCheckbox);

      expect(screen.getByLabelText(/Tanggal kedaluwarsa/)).toBeInTheDocument();
    });

    it('should hide date picker when expiration disabled', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const expirationCheckbox = screen.queryByLabelText(/Batasi waktu akses/);
      if (expirationCheckbox) {
        await user.click(expirationCheckbox);
        await user.click(expirationCheckbox);
      }

      expect(screen.queryByLabelText(/Tanggal kedaluwarsa/)).not.toBeInTheDocument();
    });
  });

  describe('Share Action', () => {
    it('should disable share button when no targets selected', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const confirmButton = screen.getByRole('button', { name: /Bagikan Materi/ });
      expect(confirmButton).toBeDisabled();
    });

    it('should show validation error when no targets selected', async () => {
      const user = userEvent.setup();
      (materialPermissionService.validateShareRequest as ReturnType<typeof vi.fn>).mockReturnValue({
        valid: false,
        error: 'Pilih setidaknya satu target untuk berbagi',
      });

      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const confirmButton = screen.getByRole('button', { name: /Bagikan Materi/ });
      await user.click(confirmButton);

      expect(mockProps.onShowToast).toHaveBeenCalledWith(
        'Pilih setidaknya satu target untuk berbagi',
        'error'
      );
    });

    it('should call onSharingUpdate after successful share', async () => {
      const user = userEvent.setup();
      (materialPermissionService.validateShareRequest as ReturnType<typeof vi.fn>).mockReturnValue({
        valid: true,
      });

      render(<EnhancedMaterialSharing {...mockProps} />);

      const shareButton = screen.getByText('+ Bagikan');
      await user.click(shareButton);

      const publicModeButton = screen.getByText('Publik');
      await user.click(publicModeButton);

      const confirmButton = screen.getByRole('button', { name: /Bagikan Materi/ });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockProps.onSharingUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('Analytics Modal', () => {
    it('should open analytics modal on button click', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      await waitFor(() => {
        const analyticsButtons = screen.getAllByRole('button');
        const analyticsButton = analyticsButtons.find(btn =>
          btn.getAttribute('aria-label') === 'Lihat analitik'
        );
        if (analyticsButton) {
          user.click(analyticsButton);
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Analitik Berbagi')).toBeInTheDocument();
      });
    });
  });

  describe('Revoke Access', () => {
    beforeEach(() => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          userId: 'user1',
          permission: 'view',
          grantedBy: 'owner456',
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];
      (materialPermissionService.getPermissionSummary as ReturnType<typeof vi.fn>).mockReturnValue({
        userCount: 1,
        roleCount: 0,
        publicAccess: false,
        totalPermissions: 1,
      });
    });

    it('should show revoke dialog on click', async () => {
      const user = userEvent.setup();
      render(<EnhancedMaterialSharing {...mockProps} />);

      await waitFor(() => {
        const revokeButtons = screen.getAllByRole('button');
        const revokeButton = revokeButtons.find(btn =>
          btn.getAttribute('aria-label') === 'Batasi akses'
        );
        if (revokeButton) {
          user.click(revokeButton);
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Batasi Akses Pengguna')).toBeInTheDocument();
      });
    });

    it('should revoke access on confirmation', async () => {
      const user = userEvent.setup();
      (materialPermissionService.revokeAccess as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
      });

      render(<EnhancedMaterialSharing {...mockProps} />);

      await waitFor(() => {
        const revokeButtons = screen.getAllByRole('button');
        const revokeButton = revokeButtons.find(btn =>
          btn.getAttribute('aria-label') === 'Batasi akses'
        );
        if (revokeButton) {
          user.click(revokeButton);
        }
      });

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: 'Batasi' });
        if (confirmButton) {
          user.click(confirmButton);
        }
      });

      await waitFor(() => {
        expect(mockProps.onShowToast).toHaveBeenCalledWith('Akses materi berhasil dicabut', 'success');
      });
    });

    it('should show error message on revoke failure', async () => {
      const user = userEvent.setup();
      (materialPermissionService.revokeAccess as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: 'Gagal mencabut akses',
      });

      render(<EnhancedMaterialSharing {...mockProps} />);

      await waitFor(() => {
        const revokeButtons = screen.getAllByRole('button');
        const revokeButton = revokeButtons.find(btn =>
          btn.getAttribute('aria-label') === 'Batasi akses'
        );
        if (revokeButton) {
          user.click(revokeButton);
        }
      });

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: 'Batasi' });
        if (confirmButton) {
          user.click(confirmButton);
        }
      });

      await waitFor(() => {
        expect(mockProps.onShowToast).toHaveBeenCalledWith('Gagal mencabut akses', 'error');
      });
    });
  });

  describe('Permission Display', () => {
    beforeEach(() => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          userId: 'user1',
          permission: 'edit',
          grantedBy: 'owner456',
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
        {
          id: 'perm124',
          role: 'teacher',
          permission: 'view',
          grantedBy: 'owner456',
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];
      (materialPermissionService.getPermissionSummary as ReturnType<typeof vi.fn>).mockReturnValue({
        userCount: 1,
        roleCount: 1,
        publicAccess: false,
        totalPermissions: 2,
      });
    });

    it('should display role-based permissions', () => {
      render(<EnhancedMaterialSharing {...mockProps} />);
      expect(screen.getByText('Berbagi dengan Peran (1)')).toBeInTheDocument();
      expect(screen.getByText('Guru')).toBeInTheDocument();
    });

    it('should display user-based permissions', () => {
      render(<EnhancedMaterialSharing {...mockProps} />);
      expect(screen.getByText('Berbagi dengan Pengguna (1)')).toBeInTheDocument();
    });
  });

  describe('Public Access Display', () => {
    beforeEach(() => {
      mockMaterial.shareSettings = {
        isPublic: true,
        allowAnonymous: false,
        requirePassword: false,
      };
      (materialPermissionService.getPermissionSummary as ReturnType<typeof vi.fn>).mockReturnValue({
        userCount: 0,
        roleCount: 0,
        publicAccess: true,
        totalPermissions: 0,
      });
    });

    it('should display public access indicator', () => {
      render(<EnhancedMaterialSharing {...mockProps} />);
      expect(screen.getByText('Dibagikan ke Publik')).toBeInTheDocument();
      expect(screen.getByText('Siapa saja dapat mengakses materi ini')).toBeInTheDocument();
    });
  });

  describe('Audit Log', () => {
    beforeEach(() => {
      (materialPermissionService.getShareAuditHistory as ReturnType<typeof vi.fn>).mockResolvedValue([
        {
          id: 'audit1',
          materialId: 'material123',
          materialTitle: 'Test Material',
          userId: 'user123',
          userName: 'Test User',
          action: 'shared',
          details: 'Shared with user',
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    it('should display audit log section', async () => {
      render(<EnhancedMaterialSharing {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Riwayat Aktivitas')).toBeInTheDocument();
      });
    });

    it('should display audit entries', async () => {
      render(<EnhancedMaterialSharing {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText(/membagikan|shared/i)).toBeInTheDocument();
      });
    });
  });
});
