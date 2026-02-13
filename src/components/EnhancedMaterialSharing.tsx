import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UsersIcon } from './icons/UsersIcon';
import { ShareIcon, ShieldIcon, XMarkIcon, ClockIcon } from './icons/MaterialIcons';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UserIcon } from './icons/UserIcon';
import { LockIcon } from './icons/LockIcon';
import { ELibrary, UserRole, UserExtraRole } from '../types';
import { USER_ROLES, msToDays } from '../constants';
import { materialPermissionService, MaterialShareAudit as ShareAudit } from '../services/materialPermissionService';
import { logger } from '../utils/logger';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import Modal from './ui/Modal';
import SearchInput from './ui/SearchInput';
import ConfirmationDialog from './ui/ConfirmationDialog';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { HEIGHT_CLASSES } from '../config/heights';

interface EnhancedMaterialSharingProps {
  material: ELibrary;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onSharingUpdate?: () => void;
  currentUserId: string;
  currentUserRole: UserRole;
  currentUserExtraRole?: UserExtraRole;
  currentUserName: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  extraRole?: UserExtraRole;
}

interface ShareAnalytics {
  totalViews: number;
  totalDownloads: number;
  uniqueUsers: number;
  topUser: {
    userId: string;
    userName: string;
    accessCount: number;
  } | null;
}

const EnhancedMaterialSharing: React.FC<EnhancedMaterialSharingProps> = ({
  material,
  onShowToast,
  onSharingUpdate,
  currentUserId,
  currentUserRole,
  currentUserExtraRole,
  currentUserName,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [sharingMode, setSharingMode] = useState<'users' | 'roles' | 'public'>('users');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [selectedExtraRoles, setSelectedExtraRoles] = useState<UserExtraRole[]>([]);
  const [permission, setPermission] = useState<'view' | 'edit' | 'admin'>('view');
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [auditLog, setAuditLog] = useState<ShareAudit[]>([]);
  const [analytics, setAnalytics] = useState<ShareAnalytics | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToRevoke, setUserToRevoke] = useState<User | null>(null);

  const permissionSummary = useMemo(
    () => materialPermissionService.getPermissionSummary(material),
    [material]
  );

  const fetchUsers = useCallback(async () => {
    try {
      const mockUsers: User[] = [
        { id: 'user1', name: 'Ahmad Wijaya', email: 'ahmad@school.com', role: 'teacher' },
        { id: 'user2', name: 'Siti Nurhaliza', email: 'siti@school.com', role: 'teacher' },
        { id: 'user3', name: 'Budi Santoso', email: 'budi@school.com', role: 'teacher', extraRole: 'wakasek' },
        { id: 'user4', name: 'Dewi Lestari', email: 'dewi@school.com', role: 'teacher' },
        { id: 'user5', name: 'Eko Prasetyo', email: 'eko@school.com', role: 'teacher' },
        { id: 'user6', name: 'Fitri Handayani', email: 'fitri@school.com', role: 'student' },
        { id: 'user7', name: 'Gunawan', email: 'gunawan@school.com', role: 'student' },
        { id: 'user8', name: 'Hartono', email: 'hartono@school.com', role: 'parent' },
        { id: 'user9', name: 'Indah Permata', email: 'indah@school.com', role: 'parent' },
        { id: 'user10', name: 'Joko Susilo', email: 'joko@school.com', role: 'student', extraRole: 'osis' },
      ];

      const filteredUsers = mockUsers.filter(u => u.id !== currentUserId);
      setUsers(filteredUsers);
    } catch (err) {
      logger.error('Error fetching users:', err);
    }
  }, [currentUserId]);

  const fetchAuditLog = useCallback(async () => {
    try {
      const auditData = await materialPermissionService.getShareAuditHistory(material.id, 20);
      setAuditLog(auditData);
    } catch (err) {
      logger.error('Error fetching audit log:', err);
    }
  }, [material.id]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const mockAnalytics: ShareAnalytics = {
        totalViews: material.downloadCount * 2 || 0,
        totalDownloads: material.downloadCount || 0,
        uniqueUsers: permissionSummary.userCount + permissionSummary.roleCount,
        topUser: permissionSummary.userCount > 0 ? {
          userId: 'user1',
          userName: 'Ahmad Wijaya',
          accessCount: 15,
        } : null,
      };
      setAnalytics(mockAnalytics);
    } catch (err) {
      logger.error('Error fetching analytics:', err);
    }
  }, [material.downloadCount, permissionSummary]);

  useEffect(() => {
    fetchUsers();
    fetchAuditLog();
    fetchAnalytics();
  }, [fetchUsers, fetchAuditLog, fetchAnalytics]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const isNotOwner = user.id !== material.uploadedBy;
    const isNotAlreadyShared = !material.sharePermissions?.some(p => p.userId === user.id);
    return matchesSearch && isNotOwner && isNotAlreadyShared;
  });

  const handleShare = async () => {
    const validation = materialPermissionService.validateShareRequest({
      materialId: material.id,
      targetUsers: sharingMode === 'users' ? selectedUsers : undefined,
      targetRoles: sharingMode === 'roles' ? selectedRoles : undefined,
      targetExtraRoles: sharingMode === 'roles' ? selectedExtraRoles : undefined,
      isPublic: sharingMode === 'public',
      permission,
      expiresAt: expirationEnabled ? expirationDate : undefined,
    });

    if (!validation.valid) {
      onShowToast(validation.error || 'Validasi gagal', 'error');
      return;
    }

    setLoading(true);
    try {
      await materialPermissionService.logShareAudit({
        materialId: material.id,
        materialTitle: material.title,
        userId: currentUserId,
        userName: currentUserName,
        action: sharingMode === 'public' ? 'link_generated' : 'shared',
        details: sharingMode === 'users'
          ? `Dibagikan ke ${selectedUsers.length} pengguna dengan izin ${permission}`
          : sharingMode === 'roles'
          ? `Dibagikan ke ${selectedRoles.length + selectedExtraRoles.length} peran dengan izin ${permission}`
          : `Dibagikan ke publik`,
      });

      setSelectedUsers([]);
      setSelectedRoles([]);
      setSelectedExtraRoles([]);
      setShowShareModal(false);
      onShowToast(`Materi berhasil dibagikan`, 'success');
      onSharingUpdate?.();
      fetchAuditLog();
      fetchAnalytics();
    } catch (err) {
      logger.error('Error sharing material:', err);
      onShowToast('Gagal membagikan materi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = (user: User) => {
    setUserToRevoke(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmRevoke = async () => {
    if (!userToRevoke) return;

    const result = await materialPermissionService.revokeAccess(
      material.id,
      userToRevoke.id,
      currentUserId,
      currentUserName
    );

    if (result.success) {
      onShowToast('Akses materi berhasil dicabut', 'success');
      onSharingUpdate?.();
      fetchAuditLog();
      fetchAnalytics();
    } else {
      onShowToast(result.error || 'Gagal mencabut akses', 'error');
    }

    setIsDeleteDialogOpen(false);
    setUserToRevoke(null);
  };

  const canUserShare = materialPermissionService.canShare(
    material,
    currentUserId,
    currentUserRole,
    currentUserExtraRole
  );

  const getPermissionIcon = (perm: 'admin' | 'edit' | 'view') => {
    switch (perm) {
      case 'admin':
        return <ShieldIcon className="w-4 h-4 text-red-500" />;
      case 'edit':
        return <UsersIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <ShareIcon className="w-4 h-4 text-green-500" />;
    }
  };

  const getPermissionLabel = (perm: 'admin' | 'edit' | 'view') => {
    return materialPermissionService.formatPermissionName(perm);
  };

  const getExpirationDays = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const days = Math.ceil(msToDays(new Date(expiresAt).getTime() - new Date().getTime()));
    return days;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const availableRoles: UserRole[] = ['teacher', 'student', 'parent'];
  const availableExtraRoles: UserExtraRole[] = ['staff', 'osis', 'wakasek', 'kepsek'];

  return (
    <div className="enhanced-material-sharing">
      <div className="space-y-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <ShareIcon className="w-5 h-5" />
                Pengaturan Berbagi
              </h4>
              <div className="flex gap-2">
                {analytics && (
                  <IconButton
                    onClick={() => setShowAnalyticsModal(true)}
                    icon={<ChartBarIcon className="w-5 h-5" />}
                    variant="ghost"
                    className="text-neutral-500 hover:text-blue-500"
                    ariaLabel="Lihat analitik"
                  />
                )}
                {canUserShare && (
                  <Button
                    onClick={() => setShowShareModal(true)}
                    size="sm"
                    variant="blue-solid"
                  >
                    + Bagikan
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {permissionSummary.publicAccess && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <ShareIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Dibagikan ke Publik
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Siapa saja dapat mengakses materi ini
                    </p>
                  </div>
                  <Badge variant="success" size="sm">Publik</Badge>
                </div>
              )}

              {material.sharePermissions && material.sharePermissions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Berbagi dengan Peran ({permissionSummary.roleCount})
                  </p>
                  {material.sharePermissions
                    .filter(p => p.role)
                    .map((perm, idx) => (
                      <div key={`role-${idx}`} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getPermissionIcon(perm.permission)}
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              {perm.role === USER_ROLES.TEACHER ? 'Guru' : perm.role === USER_ROLES.STUDENT ? 'Siswa' : 'Orang Tua'}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {getPermissionLabel(perm.permission)}
                              {perm.expiresAt && ` • ${getExpirationDays(perm.expiresAt)} hari lagi`}
                            </p>
                          </div>
                        </div>
                        <Badge variant={perm.permission === 'admin' ? 'error' : perm.permission === 'edit' ? 'warning' : 'success'} size="sm">
                          {getPermissionLabel(perm.permission)}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}

              {material.sharePermissions && material.sharePermissions.filter(p => p.userId).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Berbagi dengan Pengguna ({permissionSummary.userCount})
                  </p>
                  {material.sharePermissions
                    .filter(p => p.userId)
                    .map((perm, idx) => {
                      const user = users.find(u => u.id === perm.userId);
                      return (
                        <div key={`user-${idx}`} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getPermissionIcon(perm.permission)}
                            <div>
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                {user?.name || `User ${perm.userId}`}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {getPermissionLabel(perm.permission)}
                                {perm.expiresAt && ` • ${getExpirationDays(perm.expiresAt)} hari lagi`}
                              </p>
                            </div>
                          </div>
                          {canUserShare && (
                            <IconButton
                              onClick={() => user && handleRevoke(user)}
                              icon={<XMarkIcon className="w-4 h-4" />}
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                              ariaLabel="Batasi akses"
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {!permissionSummary.publicAccess && !permissionSummary.userCount && !permissionSummary.roleCount && (
                <div className="text-center py-8">
                  <LockIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Materi belum dibagikan
                  </p>
                  {canUserShare && (
                    <Button
                      onClick={() => setShowShareModal(true)}
                      variant="blue-solid"
                      size="sm"
                      className="mt-3"
                    >
                      Mulai Berbagi
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {auditLog.length > 0 && (
          <Card>
            <div className="p-4">
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Riwayat Aktivitas
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {auditLog.slice(0, 5).map((audit, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm p-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded">
                    <UserIcon className="w-4 h-4 text-neutral-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-neutral-900 dark:text-white">
                        <span className="font-medium">{audit.userName}</span>
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {audit.action === 'shared' && ' membagikan'}
                          {audit.action === 'accessed' && ' mengakses'}
                          {audit.action === 'downloaded' && ' mengunduh'}
                          {audit.action === 'revoked' && ' mencabut akses'}
                          {audit.action === 'link_generated' && ' membuat tautan publik'}
                        </span>
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {audit.details}
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                        {formatDate(audit.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        size="lg"
        className={`${HEIGHT_CLASSES.MODAL.FULL} flex flex-col`}
        showCloseButton={false}
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Bagikan Materi
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                "{material.title}"
              </p>
            </div>
            <IconButton
              onClick={() => setShowShareModal(false)}
              icon={<XMarkIcon className="w-5 h-5" />}
              variant="ghost"
              ariaLabel="Tutup modal bagikan"
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Mode Berbagi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['users', 'roles', 'public'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSharingMode(mode)}
                  className={`p-4 rounded-lg border-2 transition-colors text-center ${
                    sharingMode === mode
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                  }`}
                >
                  {mode === 'users' && <UserIcon className="w-6 h-6 mx-auto mb-2 text-neutral-600 dark:text-neutral-400" />}
                  {mode === 'roles' && <UsersIcon className="w-6 h-6 mx-auto mb-2 text-neutral-600 dark:text-neutral-400" />}
                  {mode === 'public' && <ShareIcon className="w-6 h-6 mx-auto mb-2 text-neutral-600 dark:text-neutral-400" />}
                  <p className="text-xs font-medium text-neutral-900 dark:text-white">
                    {mode === 'users' && 'Pengguna Spesifik'}
                    {mode === 'roles' && 'Berdasarkan Peran'}
                    {mode === 'public' && 'Publik'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {sharingMode === 'users' && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Pilih Pengguna</h4>
              <div className="mb-4">
                <SearchInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari berdasarkan nama atau email..."
                  size="sm"
                  fullWidth
                />
              </div>
              <div className="max-h-64 overflow-y-auto border border-neutral-200 dark:border-neutral-600 rounded-lg">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer border-b border-neutral-100 dark:border-neutral-600 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-neutral-300 dark:border-neutral-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
                      </div>
                      <Badge variant="info" size="sm">{user.role}</Badge>
                    </label>
                  ))
                ) : (
                  <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
                    {searchTerm ? 'Tidak ada pengguna yang cocok' : 'Tidak ada pengguna tersedia'}
                  </div>
                )}
              </div>
            </div>
          )}

          {sharingMode === 'roles' && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Pilih Peran</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Peran Utama</p>
                  <div className="flex flex-wrap gap-2">
                    {availableRoles.map((role) => (
                      <label
                        key={role}
                        className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedRoles.includes(role)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRoles([...selectedRoles, role]);
                            } else {
                              setSelectedRoles(selectedRoles.filter(r => r !== role));
                            }
                          }}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {role === USER_ROLES.TEACHER ? 'Guru' : role === USER_ROLES.STUDENT ? 'Siswa' : 'Orang Tua'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Peran Tambahan</p>
                  <div className="flex flex-wrap gap-2">
                    {availableExtraRoles.map((role) => (
                      <label
                        key={role}
                        className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedExtraRoles.includes(role)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedExtraRoles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedExtraRoles([...selectedExtraRoles, role]);
                            } else {
                              setSelectedExtraRoles(selectedExtraRoles.filter(r => r !== role));
                            }
                          }}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {role?.toUpperCase() || ''}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Izin Akses
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['view', 'edit', 'admin'] as const).map((perm) => (
                <button
                  key={perm}
                  onClick={() => setPermission(perm)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    permission === perm
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                  }`}
                >
                  <div className="flex justify-center mb-2">{getPermissionIcon(perm)}</div>
                  <p className="text-xs font-medium text-neutral-900 dark:text-white text-center">
                    {getPermissionLabel(perm)}
                  </p>
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {materialPermissionService.getPermissionDescription(permission)}
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={expirationEnabled}
                onChange={(e) => setExpirationEnabled(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-600"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Batasi waktu akses
              </span>
            </label>

            {expirationEnabled && (
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-2 w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            )}
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-2 flex-shrink-0">
          <Button
            onClick={() => setShowShareModal(false)}
            variant="ghost"
          >
            Batal
          </Button>
          <Button
            onClick={handleShare}
            disabled={
              (sharingMode === 'users' && selectedUsers.length === 0) ||
              (sharingMode === 'roles' && selectedRoles.length === 0 && selectedExtraRoles.length === 0) ||
              loading
            }
            isLoading={loading}
          >
            {loading ? 'Membagikan...' : 'Bagikan Materi'}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        size="md"
        className="flex flex-col"
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Analitik Berbagi
          </h3>
        </div>
        <div className="p-6">
          {analytics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Tampilan</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analytics.totalViews}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">Total Unduhan</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{analytics.totalDownloads}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Pengguna Unik</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{analytics.uniqueUsers}</p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Total Izin</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{permissionSummary.totalPermissions}</p>
                </div>
              </div>

              {analytics.topUser && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Pengguna Paling Aktif</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">{analytics.topUser.userName}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {analytics.topUser.accessCount} kali akses
                      </p>
                    </div>
                    <UserIcon className="w-8 h-8 text-neutral-400" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Batasi Akses Pengguna"
        message={`Batasi akses materi dari ${userToRevoke?.name}?`}
        type="warning"
        confirmText="Batasi"
        cancelText="Batal"
        onConfirm={confirmRevoke}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setUserToRevoke(null);
        }}
      />
    </div>
  );
};

export default EnhancedMaterialSharing;
