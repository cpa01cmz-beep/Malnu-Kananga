import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, UserExtraRole } from '../types';
import { STORAGE_KEYS } from '../constants';
import { authService } from '../services/authService';
import { usersAPI } from '../services/apiService';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useCanAccess } from '../hooks/useCanAccess';
import { unifiedNotificationManager } from '../services/unifiedNotificationManager';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
import Card from './ui/Card';
import PageHeader from './ui/PageHeader';
import { CameraIcon } from './icons/CameraIcon';
import { SaveIcon } from './icons/SaveIcon';
import { LockIcon } from './icons/LockIcon';
import AccessDenied from './AccessDenied';

interface UserProfileEditorProps {
  userId?: string;
  onShowToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserProfileEditorContent: React.FC<UserProfileEditorProps> = ({ userId, onShowToast }) => {
  const { user: currentUser } = useCanAccess();
  const { errorState, handleAsyncError, clearError } = useErrorHandler();

  const [user, setUser] = useState<import('../types').User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    dateOfBirth: '',
    avatar: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordError, setPasswordError] = useState('');

  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = currentUser?.id === targetUserId;
  const canEditProfile = isOwnProfile || currentUser?.role === 'admin';

  const fetchUser = useCallback(async () => {
    if (!targetUserId) return;

    setIsLoading(true);
    clearError();

    const result = await handleAsyncError(
      () => usersAPI.getById(targetUserId),
      {
        operation: 'fetchUser',
        component: 'UserProfileEditor',
        fallbackMessage: 'Gagal memuat profil pengguna'
      }
    );

    if (result && result.success && result.data) {
      setUser(result.data);
      setFormData({
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone || '',
        address: result.data.address || '',
        bio: result.data.bio || '',
        dateOfBirth: result.data.dateOfBirth || '',
        avatar: result.data.avatar || '',
      });
    }
    setIsLoading(false);
  }, [targetUserId, clearError, handleAsyncError]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: keyof PasswordChangeForm, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    setPasswordError('');
  };

  const validatePasswordForm = (): boolean => {
    if (!passwordForm.currentPassword) {
      setPasswordError('Password saat ini harus diisi');
      return false;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setPasswordError('Password baru minimal 8 karakter');
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Password baru tidak cocok dengan konfirmasi');
      return false;
    }
    return true;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditProfile || !targetUserId) return;

    setIsSaving(true);
    clearError();

    try {
      const result = await handleAsyncError(
        () => authService.updateProfile(targetUserId, formData),
        {
          operation: 'saveProfile',
          component: 'UserProfileEditor',
          fallbackMessage: 'Gagal menyimpan profil'
        }
      );

      if (result && result.success && result.data) {
        setUser(result.data);

        if (isOwnProfile) {
          const updatedUser = { ...currentUser, ...result.data };
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        }

        await unifiedNotificationManager.showLocalNotification({
          id: `profile-update-${Date.now()}`,
          type: 'system',
          title: 'Profil Berhasil Diperbarui',
          body: `${result.data.name} telah diperbarui`,
          icon: '✅',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'normal',
          targetUsers: [targetUserId]
        });

        onShowToast?.('Profil berhasil diperbarui', 'success');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile || !targetUserId) return;

    if (!validatePasswordForm()) return;

    setIsSaving(true);
    clearError();

    try {
      const result = await handleAsyncError(
        () => authService.changePassword(targetUserId, passwordForm.currentPassword, passwordForm.newPassword),
        {
          operation: 'changePassword',
          component: 'UserProfileEditor',
          fallbackMessage: 'Gagal mengubah password'
        }
      );

      if (result && result.success) {
        await unifiedNotificationManager.showLocalNotification({
          id: `password-change-${Date.now()}`,
          type: 'system',
          title: 'Password Berhasil Diubah',
          body: 'Password Anda telah berhasil diubah',
          icon: '🔐',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high',
          targetUsers: [targetUserId]
        });

        setIsPasswordModalOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        onShowToast?.('Password berhasil diubah', 'success');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeVariant = (role: UserRole): string => {
    return role === 'admin' ? 'secondary' : role === 'teacher' ? 'info' : 'neutral';
  };

  const getExtraRoleBadgeVariant = (extraRole: UserExtraRole | undefined): string => {
    if (!extraRole) return 'neutral';
    return extraRole === 'staff' ? 'info' :
           extraRole === 'osis' ? 'warning' :
           extraRole === 'wakasek' ? 'secondary' :
           extraRole === 'kepsek' ? 'error' : 'neutral';
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Memuat Profil..."
        />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="animate-fade-in">
      <PageHeader
        title="Edit Profil"
      />
        <Card className="p-8 text-center">
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">Profil pengguna tidak ditemukan</p>
          <Button onClick={() => window.history.back()}>Kembali</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">
        <PageHeader
          title="Ganti Password"
        />

      {errorState.hasError && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
          <p className="text-red-700 dark:text-red-300 mb-2">{errorState.feedback?.message}</p>
        </Card>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-shrink-0">
              <div className="relative group">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={`${formData.name}'s avatar`}
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-neutral-700 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {formData.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {canEditProfile && (
                  <button
                    type="button"
                    className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    aria-label="Ganti foto profil"
                  >
                    <CameraIcon className="w-8 h-8 text-white" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={getRoleBadgeVariant(user.role)} size="md">
                  {user.role}
                </Badge>
                {user.extraRole && (
                  <Badge variant={getExtraRoleBadgeVariant(user.extraRole)} size="md">
                    {user.extraRole}
                  </Badge>
                )}
              </div>

              <Input
                id="profile-name"
                label="Nama Lengkap"
                name="name"
                required
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!canEditProfile}
                fullWidth
                autoComplete="name"
              />

              <Input
                id="profile-email"
                label="Email"
                name="email"
                type="email"
                required
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!canEditProfile}
                fullWidth
                autoComplete="email"
                helperText="Email tidak dapat diubah untuk menghindari kehilangan akses"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="profile-phone"
              label="Nomor Telepon"
              name="phone"
              type="tel"
              customType="phone"
              inputMask="phone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!canEditProfile}
              fullWidth
              autoComplete="tel"
            />

            <Input
              id="profile-dob"
              label="Tanggal Lahir"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              disabled={!canEditProfile}
              fullWidth
            />
          </div>

          <Textarea
            id="profile-address"
            label="Alamat"
            name="address"
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            disabled={!canEditProfile}
            fullWidth
            rows={2}
            autoComplete="street-address"
          />

          <Textarea
            id="profile-bio"
            label="Bio"
            name="bio"
            value={formData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            disabled={!canEditProfile}
            fullWidth
            rows={3}
            maxLength={500}
            helperText="Maksimal 500 karakter"
          />
        </Card>

        <div className="flex flex-wrap gap-3 justify-end">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
            >
              Batal
            </Button>
          )}
          
          {isOwnProfile && (
            <Button
              type="button"
              variant="secondary"
              icon={<LockIcon className="w-5 h-5" />}
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Ubah Password
            </Button>
          )}

          {canEditProfile && (
            <Button
              type="submit"
              variant="primary"
              icon={<SaveIcon className="w-5 h-5" />}
              isLoading={isSaving}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
            </Button>
          )}
        </div>
      </form>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordError('');
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }}
        title="Ubah Password"
        size="md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {passwordError}
            </div>
          )}

          {errorState.hasError && (
            <p className="text-sm text-red-600 dark:text-red-400">{errorState.feedback?.message}</p>
          )}

          <Input
            id="current-password"
            label="Password Saat Ini"
            name="currentPassword"
            type="password"
            required
            value={passwordForm.currentPassword}
            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
            fullWidth
            autoComplete="current-password"
          />

          <Input
            id="new-password"
            label="Password Baru"
            name="newPassword"
            type="password"
            required
            value={passwordForm.newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            fullWidth
            autoComplete="new-password"
            helperText="Minimal 8 karakter"
          />

          <Input
            id="confirm-password"
            label="Konfirmasi Password Baru"
            name="confirmPassword"
            type="password"
            required
            value={passwordForm.confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            fullWidth
            autoComplete="new-password"
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPasswordError('');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
              fullWidth
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              fullWidth
            >
              {isSaving ? 'Mengubah...' : 'Ubah Password'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const UserProfileEditor: React.FC<UserProfileEditorProps> = (props) => {
  const { user: currentUser } = useCanAccess();
  const targetUserId = props.userId || currentUser?.id;
  const isOwnProfile = currentUser?.id === targetUserId;

  if (!isOwnProfile && currentUser?.role !== 'admin') {
    return (
      <AccessDenied
        onBack={props.onBack}
        requiredPermission="users.update"
        message="Anda tidak memiliki izin untuk melihat profil pengguna lain"
      />
    );
  }

  return <UserProfileEditorContent {...props} />;
};

export default UserProfileEditor;