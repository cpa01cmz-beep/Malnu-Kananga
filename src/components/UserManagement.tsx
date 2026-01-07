import React, { useState, useEffect } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CloseIcon } from './icons/CloseIcon';
import { User, UserRole, UserExtraRole } from '../types';
import Button from './ui/Button';
import { api } from '../services/apiService';
import { permissionService } from '../services/permissionService';
import { pushNotificationService } from '../services/pushNotificationService';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useFocusTrap } from '../hooks/useFocusTrap';
import LoadingSpinner from './ui/LoadingSpinner';
import PermissionGuard from './PermissionGuard';

interface UserManagementProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const UserManagementContent: React.FC<UserManagementProps> = ({ onBack, onShowToast }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { errorState, handleApiError, clearError } = useErrorHandler();

  const [searchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [isEditing, setIsEditing] = useState(false);
  const dialogRef = useFocusTrap({ isOpen: isModalOpen, onClose: () => setIsModalOpen(false) });

  // Get current user for permission checking
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem('malnu_user');
    return userJson ? JSON.parse(userJson) : null;
  };

  const authUser = getCurrentUser();
  const userRole = authUser?.role as UserRole || 'student';
  const userExtraRole = authUser?.extraRole as UserExtraRole;

  // Check permissions
  const canCreateUser = permissionService.hasPermission(userRole, userExtraRole, 'users.create').granted;
  const canUpdateUser = permissionService.hasPermission(userRole, userExtraRole, 'users.update').granted;
  const canDeleteUser = permissionService.hasPermission(userRole, userExtraRole, 'users.delete').granted;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    clearError();
    const result = await handleApiError(
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
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      if (window.confirm('Hapus pengguna ini?')) {
          const result = await handleApiError(
              () => api.users.delete(id),
              { 
                operation: 'deleteUser', 
                component: 'UserManagement',
                fallbackMessage: 'Gagal menghapus pengguna'
              }
          );
          
          if (result && result.success) {
              setUsers(prev => prev.filter(u => u.id !== id));
              onShowToast('Pengguna dihapus', 'success');
          }
      }
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
                await pushNotificationService.showLocalNotification({
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
                await pushNotificationService.showLocalNotification({
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
          await handleApiError(
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
                {errorState.message}
                <button onClick={fetchUsers} className="ml-4 underline hover:text-red-800">Coba lagi</button>
            </div>
        )}

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="overflow-x-auto">
                {isLoading ? (
                    <LoadingSpinner size="md" text="Memuat data pengguna..." className="py-12" />
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
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-700'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.extraRole ? (
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                user.extraRole === 'staff' ? 'bg-indigo-100 text-indigo-700' : 
                                                user.extraRole === 'osis' ? 'bg-orange-100 text-orange-700' :
                                                user.extraRole === 'wakasek' ? 'bg-purple-100 text-purple-700' :
                                                user.extraRole === 'kepsek' ? 'bg-red-100 text-red-700' :
                                                'bg-neutral-100 text-neutral-700'
                                            }`}>
                                                {user.extraRole === 'staff' ? 'Staff' : 
                                                 user.extraRole === 'osis' ? 'OSIS' :
                                                 user.extraRole === 'wakasek' ? 'Wakasek' :
                                                 user.extraRole === 'kepsek' ? 'Kepsek' :
                                                 user.extraRole}
                                            </span>
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
                                              aria-label={`Edit pengguna ${user.name}`}
                                            />
                                        )}
                                        {canDeleteUser && (
                                            <Button 
                                              variant="danger" 
                                              size="sm" 
                                              iconOnly 
                                              onClick={() => handleDeleteUser(user.id)} 
                                              icon={<TrashIcon />} 
                                              aria-label={`Hapus pengguna ${user.name}`}
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

        {isModalOpen && (
            <div className="fixed inset-0 bg-neutral-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)} role="presentation">
                <div ref={dialogRef} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-float w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
                    <div className="flex justify-between items-center p-5 border-b border-neutral-200 dark:border-neutral-700">
                        <h3 id="modal-title" className="text-lg font-bold text-neutral-900 dark:text-white">{isEditing ? 'Edit User' : 'Tambah User'}</h3>
                        <button onClick={() => setIsModalOpen(false)} aria-label="Tutup modal" className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500/50"><CloseIcon /></button>
                    </div>
                    <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                        {errorState.hasError && <p className="text-sm text-red-600 dark:text-red-400">{errorState.message}</p>}
                        <div>
                            <label htmlFor="user-name" className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Nama</label>
                            <input id="user-name" name="name" required value={currentUser.name} onChange={e => setCurrentUser({...currentUser, name: e.target.value})} className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 font-medium placeholder-neutral-400 dark:placeholder-neutral-500" autoComplete="name" />
                        </div>
                        <div>
                            <label htmlFor="user-email" className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Email</label>
                            <input id="user-email" name="email" required type="email" value={currentUser.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 font-medium placeholder-neutral-400 dark:placeholder-neutral-500" autoComplete="email" />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label htmlFor="user-role" className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Role Utama</label>
                                 <select
                                     id="user-role"
                                     name="role"
                                     value={currentUser.role}
                                     onChange={e => {
                                         const r = e.target.value as UserRole;
                                         setCurrentUser({...currentUser, role: r, extraRole: null});
                                     }}
                                     className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 font-medium"
                                 >
                                     <option value="student">Siswa</option>
                                     <option value="teacher">Guru</option>
                                     <option value="admin">Admin</option>
                                 </select>
                             </div>
                             <div>
                                 <label htmlFor="user-extrarole" className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Tugas Tambahan</label>
                                 <select
                                     id="user-extrarole"
                                     name="extraRole"
                                     value={currentUser.extraRole || ''}
                                     onChange={e => setCurrentUser({...currentUser, extraRole: (e.target.value as UserExtraRole) || undefined})}
                                     className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 font-medium"
                                     disabled={currentUser.role === 'admin'}
                                 >
                                     <option value="">- Tidak Ada -</option>
                                     {currentUser.role === 'teacher' && <option value="staff">Staff TU/Sarpras</option>}
                                     {currentUser.role === 'teacher' && <option value="wakasek">Wakasek</option>}
                                     {currentUser.role === 'teacher' && <option value="kepsek">Kepsek</option>}
                                     {currentUser.role === 'student' && <option value="osis">Pengurus OSIS</option>}
                                 </select>
                             </div>
                         </div>
                        <button type="submit" disabled={isSaving} className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 disabled:bg-neutral-400 dark:disabled:bg-neutral-600 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800">
                             {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

const UserManagement: React.FC<UserManagementProps> = (props) => {
  // Get current user for permission checking
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem('malnu_user');
    return userJson ? JSON.parse(userJson) : null;
  };

  const authUser = getCurrentUser();
  const userRole = authUser?.role as UserRole || 'student';
  const userExtraRole = authUser?.extraRole as UserExtraRole;

  return (
    <PermissionGuard
      userRole={userRole}
      userExtraRole={userExtraRole}
      requiredPermissions={['users.create', 'users.update', 'users.delete']}
      onBack={props.onBack}
      message="You don't have permission to manage users"
    >
      <UserManagementContent {...props} />
    </PermissionGuard>
  );
};

export default UserManagement;