import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { User, UserRole, UserExtraRole } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Badge from './ui/Badge';
import Modal from './ui/Modal';
import ConfirmationDialog from './ui/ConfirmationDialog';
import { api } from '../services/apiService';
import { unifiedNotificationManager } from '../services/unifiedNotificationManager';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useCanAccess } from '../hooks/useCanAccess';
import { TableSkeleton } from './ui/Skeleton';
import AccessDenied from './AccessDenied';

interface UserManagementProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const UserManagementContent: React.FC<UserManagementProps> = ({ onBack, onShowToast }) => {
  // ALL hooks first
  const { user: _user, canAccess } = useCanAccess();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { errorState, handleAsyncError, clearError } = useErrorHandler();

  const [searchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    clearError();
    const result = await handleAsyncError(
      () => api.users.getAll(),
      {
        operation: 'fetchUsers',
        component: 'UserManagement',
        fallbackMessage: 'Gagal memuat data pengguna'
      }
    );

    if (result && result.success && result.data) {
      setUsers(result.data);
    }
    setIsLoading(false);
  }, [clearError, handleAsyncError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Standardized permission checks - AFTER all hooks
  const canCreateUser = canAccess('users.create').canAccess;
  const canUpdateUser = canAccess('users.update').canAccess;
  const canDeleteUser = canAccess('users.delete').canAccess;

  const handleAddUser = () => {
      setCurrentUser({ role: 'student', status: 'active', extraRole: null });
      setIsEditing(false);
      setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
      setCurrentUser({ ...user });
      setIsEditing(true);
      setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    const result = await handleAsyncError(
      () => api.users.delete(userToDelete),
      {
        operation: 'deleteUser',
        component: 'UserManagement',
        fallbackMessage: 'Gagal menghapus pengguna'
      }
    );

    if (result && result.success) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete));
      onShowToast('Pengguna dihapus', 'success');
    }
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser.name || !currentUser.email) return;

      const userData = currentUser as User;
      if (userData.role === 'admin') userData.extraRole = null;
      if (userData.role === 'teacher' && userData.extraRole === 'osis') userData.extraRole = null;
      if (userData.role === 'student' && userData.extraRole === 'staff') userData.extraRole = null;
      if (userData.role === 'student' && (userData.extraRole === 'wakasek' || userData.extraRole === 'kepsek')) userData.extraRole = null;
      if (userData.role === 'parent' && userData.extraRole !== null) userData.extraRole = null;
      if (userData.role === 'student' && (userData.extraRole === 'wakasek' || userData.extraRole === 'kepsek')) userData.extraRole = null;
      if (userData.role === 'parent' && userData.extraRole !== null) userData.extraRole = null;

      try {
          setIsSaving(true);
          clearError();

          let response;
          if (isEditing) {
              const previousUserData = users.find(u => u.id === userData.id)!;
              const roleChanged = previousUserData.role !== userData.role || previousUserData.extraRole !== userData.extraRole;
              
              response = await api.users.update(userData.id!, userData);
              
              if (response.success && roleChanged) {
                // Send notification about role change
                await unifiedNotificationManager.showLocalNotification({
                  id: `role-change-${userData.id}-${Date.now()}`,
                  type: 'system',
                  title: 'Perubahan Hak Akses',
                  body: `Peran Anda telah diubah menjadi ${userData.role}${userData.extraRole ? ` (${userData.extraRole})` : ''}`,
                  icon: '🔐',
                  timestamp: new Date().toISOString(),
                  read: false,
                  priority: 'high',
                  targetUsers: [userData.id!],
                  data: {
                    action: 'login_required',
                    oldRole: previousUserData.role,
                    newRole: userData.role,
                    oldExtraRole: previousUserData.extraRole,
                    newExtraRole: userData.extraRole
                  }
                });
              }
          } else {
              response = await api.users.create(userData);
              
              if (response.success) {
                // Send welcome notification to new user
                await unifiedNotificationManager.showLocalNotification({
                  id: `welcome-${userData.id}-${Date.now()}`,
                  type: 'system',
                  title: 'Selamat Datang!',
                  body: `Akun Anda telah dibuat. Selamat menggunakan sistem MA Malnu Kananga.`,
                  icon: '👋',
                  timestamp: new Date().toISOString(),
                  read: false,
                  priority: 'normal',
                  targetUsers: [userData.id!],
                  data: {
                    action: 'welcome',
                    role: userData.role,
                    extraRole: userData.extraRole
                  }
                });
              }
          }

          if (response && response.success && response.data) {
              await fetchUsers();
              onShowToast(isEditing ? 'User diperbarui' : 'User ditambahkan', 'success');
              setIsModalOpen(false);
          }
      } catch (err) {
          await handleAsyncError(
            async () => { throw err; },
            {
              operation: 'saveUser',
              component: 'UserManagement',
              fallbackMessage: 'Gagal menyimpan pengguna'
            }
          );
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
                <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">← Kembali</Button>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Manajemen Pengguna</h2>
            </div>
            {canCreateUser && (
                <Button onClick={handleAddUser} icon={<PlusIcon className="w-5 h-5" />}>
                    <span className="hidden sm:inline">Tambah</span>
                </Button>
            )}
        </div>

        {errorState.hasError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
                {errorState.feedback?.message}
                <Button onClick={fetchUsers} variant="ghost" size="sm" aria-label="Coba lagi">
                    Coba lagi
                </Button>
            </div>
        )}

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="overflow-x-auto">
                {isLoading ? (
                    <TableSkeleton rows={8} cols={4} />
                ) : (
                    <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
                        <thead className="bg-neutral-50 dark:bg-neutral-700 text-xs uppercase font-semibold text-neutral-500 dark:text-neutral-400">
                            <tr>
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-6 py-4">Role Utama</th>
                                <th className="px-6 py-4">Tugas Tambahan</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                                        {user.name}
                                        <div className="text-xs text-neutral-500 font-normal">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={user.role === 'admin' ? 'purple' : user.role === 'teacher' ? 'info' : 'neutral'}
                                            size="sm"
                                        >
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.extraRole ? (
                                            <Badge
                                                variant={
                                                    user.extraRole === 'staff' ? 'indigo' : 
                                                    user.extraRole === 'osis' ? 'orange' :
                                                    user.extraRole === 'wakasek' ? 'purple' :
                                                    user.extraRole === 'kepsek' ? 'red' :
                                                    'neutral'
                                                }
                                                size="sm"
                                            >
                                                {user.extraRole === 'staff' ? 'Staff' : 
                                                 user.extraRole === 'osis' ? 'OSIS' :
                                                 user.extraRole === 'wakasek' ? 'Wakasek' :
                                                 user.extraRole === 'kepsek' ? 'Kepsek' :
                                                 user.extraRole}
                                            </Badge>
                                        ) : <span className="text-neutral-400">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {canUpdateUser && (
                                            <Button
                                              variant="info"
                                              size="sm"
                                              iconOnly
                                              onClick={() => handleEditUser(user)}
                                              icon={<PencilIcon />}
                                              ariaLabel={`Edit pengguna ${user.name}`}
                                            />
                                        )}
                                        {canDeleteUser && (
                                            <Button
                                              variant="danger"
                                              size="sm"
                                              iconOnly
                                              onClick={() => handleDeleteUser(user.id)}
                                              icon={<TrashIcon />}
                                              ariaLabel={`Hapus pengguna ${user.name}`}
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isEditing ? 'Edit User' : 'Tambah User'}
          size="md"
        >
          <form onSubmit={handleSaveUser} className="space-y-4">
            {errorState.hasError && <p className="text-sm text-red-600 dark:text-red-400">{errorState.feedback?.message}</p>}
            <Input
              id="user-name"
              label="Nama"
              name="name"
              required
              value={currentUser.name || ''}
              onChange={e => setCurrentUser({...currentUser, name: e.target.value})}
              autoComplete="name"
              fullWidth
            />
            <Input
              id="user-email"
              label="Email"
              name="email"
              required
              type="email"
              value={currentUser.email || ''}
              onChange={e => setCurrentUser({...currentUser, email: e.target.value})}
              autoComplete="email"
              fullWidth
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                id="user-role"
                label="Role Utama"
                name="role"
                value={currentUser.role}
                onChange={e => {
                  const r = e.target.value as UserRole;
                  setCurrentUser({...currentUser, role: r, extraRole: null});
                }}
                options={[
                  { value: 'student', label: 'Siswa' },
                  { value: 'teacher', label: 'Guru' },
                  { value: 'admin', label: 'Admin' },
                ]}
                fullWidth
              />
              <Select
                id="user-extrarole"
                label="Tugas Tambahan"
                name="extraRole"
                value={currentUser.extraRole || ''}
                onChange={e => setCurrentUser({...currentUser, extraRole: (e.target.value as UserExtraRole) || undefined})}
                options={[
                  { value: '', label: '- Tidak Ada -' },
                  ...(currentUser.role === 'teacher' ? [
                    { value: 'staff', label: 'Staff TU/Sarpras' },
                    { value: 'wakasek', label: 'Wakasek' },
                    { value: 'kepsek', label: 'Kepsek' },
                  ] : []),
                  ...(currentUser.role === 'student' ? [
                    { value: 'osis', label: 'Pengurus OSIS' },
                  ] : []),
                ]}
                disabled={currentUser.role === 'admin'}
                fullWidth
              />
            </div>
            <Button type="submit" fullWidth isLoading={isSaving}>
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </form>
        </Modal>

        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Hapus Pengguna"
          message="Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
          type="danger"
          confirmText="Hapus"
          cancelText="Batal"
          onConfirm={confirmDeleteUser}
          onCancel={() => {
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
          }}
        />
    </div>
  );
};

const UserManagement: React.FC<UserManagementProps> = (props) => {
  const { canAccessAny, user: _user } = useCanAccess();

  // Check if user has any user management permissions
  const userManagementAccess = canAccessAny([
    'users.create', 
    'users.update', 
    'users.delete',
    'users.read'
  ]);

  if (!userManagementAccess.canAccess) {
    return (
      <AccessDenied 
        onBack={props.onBack} 
        requiredPermission={userManagementAccess.requiredPermission}
        message="You don't have permission to manage users"
      />
    );
  }

  return <UserManagementContent {...props} />;
};

export default UserManagement;