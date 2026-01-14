import React, { useState, useEffect, useCallback } from 'react';
import { Permission, UserRole, UserExtraRole, AuditLog } from '../../types/permissions';
import { permissionService } from '../../services/permissionService';
import { PERMISSIONS, ROLE_PERMISSION_MATRIX } from '../../config/permissions';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Tab from '../ui/Tab';
import Card from '../ui/Card';
import Select from '../ui/Select';

interface PermissionManagerProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ onShowToast }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [selectedExtraRole, setSelectedExtraRole] = useState<UserExtraRole | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'permissions' | 'audit' | 'matrix'>('permissions');

  const loadPermissions = useCallback(() => {
    const userPermissions = permissionService.getUserPermissions(selectedRole, selectedExtraRole);
    setRolePermissions(userPermissions);
    setAllPermissions(permissionService.getAllPermissions());
  }, [selectedRole, selectedExtraRole]);

  const loadAuditLogs = useCallback(() => {
    const logs = permissionService.getAuditLogs({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    });
    setAuditLogs(logs);
  }, []);

  useEffect(() => {
    loadPermissions();
    loadAuditLogs();
  }, [loadPermissions, loadAuditLogs]);

  const exportPermissionMatrix = () => {
    const matrix = {
      [selectedRole]: rolePermissions.map(p => p.id),
      ...(selectedExtraRole && { [`${selectedRole}-${selectedExtraRole}`]: rolePermissions.map(p => p.id) })
    };
    
    const blob = new Blob([JSON.stringify(matrix, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permission-matrix-${selectedRole}-${selectedExtraRole || 'none'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    onShowToast('Permission matrix exported', 'success');
  };

  const validateRoleCombination = () => {
    const isValid = permissionService.isValidRoleCombination(selectedRole, selectedExtraRole);
    onShowToast(
      isValid ? 'Role combination is valid' : 'Role combination is invalid',
      isValid ? 'success' : 'error'
    );
  };

  const getPermissionStatus = (permission: Permission) => {
    return rolePermissions.some(p => p.id === permission.id) ? 'granted' : 'denied';
  };

  return (
    <div className="space-y-6">
      <Card padding="lg" className="bg-white dark:bg-neutral-800">
        <h2 className="text-2xl font-bold mb-4 text-neutral-800 dark:text-neutral-200">
          Permission Management System
        </h2>

        <Tab
          variant="border"
          color="blue"
          options={[
            { id: 'permissions', label: 'User Permissions' },
            { id: 'matrix', label: 'Role Matrix' },
            { id: 'audit', label: 'Audit Logs' },
          ]}
          activeTab={activeTab}
          onTabChange={(tabId: string) => setActiveTab(tabId as 'permissions' | 'audit' | 'matrix')}
          className="mb-6"
        />

        {activeTab === 'permissions' && (
          <div className="space-y-4">
            {/* Role Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select
                  label="User Role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  options={[
                    { value: 'admin', label: 'Administrator' },
                    { value: 'teacher', label: 'Teacher' },
                    { value: 'student', label: 'Student' },
                    { value: 'parent', label: 'Parent' }
                  ]}
                />
              </div>

              <div>
                <Select
                  label="Extra Role"
                  value={selectedExtraRole || 'none'}
                  onChange={(e) => setSelectedExtraRole(e.target.value === 'none' ? null : e.target.value as UserExtraRole)}
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'staff', label: 'Staff' },
                    { value: 'osis', label: 'OSIS' }
                  ]}
                />
              </div>

              <div className="flex items-end space-x-2">
                <Button
                  onClick={validateRoleCombination}
                  size="sm"
                >
                  Validate
                </Button>
                <Button
                  onClick={exportPermissionMatrix}
                  size="sm"
                  variant="success"
                >
                  Export
                </Button>
              </div>
            </div>

            {/* Current Permissions */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-neutral-800 dark:text-neutral-200">
                Current Permissions ({rolePermissions.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {rolePermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3"
                  >
                    <div className="font-medium text-green-800 dark:text-green-300">
                      {permission.name}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {permission.resource}.{permission.action}
                    </div>
                    <div className="text-xs text-green-500 dark:text-green-400 mt-1">
                      {permission.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Permissions Overview */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-neutral-800 dark:text-neutral-200">
                All Permissions Overview
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                        Permission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                   <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                     {allPermissions.map((permission) => {
                       const status = getPermissionStatus(permission);
                       return (
                         <tr key={permission.id}>
                           <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-200">
                             {permission.name}
                           </td>
                           <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                             {permission.resource}
                           </td>
                           <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                             {permission.action}
                           </td>
                           <td className="px-6 py-4">
                             <Badge variant={status === 'granted' ? 'success' : 'error'}>
                               {status}
                             </Badge>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matrix' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Role-Permission Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Permission Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Key Permissions
                    </th>
                  </tr>
                </thead>
                 <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                   {Object.entries(ROLE_PERMISSION_MATRIX).map(([role, permissions]) => (
                     <tr key={role}>
                       <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-neutral-200">
                         {role}
                       </td>
                       <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                         {permissions.length}
                       </td>
                       <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                         <div className="max-w-full sm:max-w-xs">
                           {permissions.slice(0, 3).map(permId => {
                             const perm = PERMISSIONS[permId];
                             return perm ? (
                               <span key={permId} className="inline-block bg-neutral-100 dark:bg-neutral-700 rounded px-2 py-1 text-xs mr-1 mb-1">
                                 {perm.name}
                               </span>
                             ) : null;
                           })}
                           {permissions.length > 3 && (
                             <span className="text-xs text-neutral-400">+{permissions.length - 3} more</span>
                           )}
                         </div>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Recent Audit Logs (Last 24 hours)
              </h3>
              <Button
                onClick={loadAuditLogs}
                size="sm"
              >
                Refresh
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                 <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                   {auditLogs.slice(0, 50).map((log, index) => (
                     <tr key={index}>
                       <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                         {new Date(log.timestamp).toLocaleString()}
                       </td>
                       <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-200">
                         {log.userRole}
                         {log.userExtraRole && ` (${log.userExtraRole})`}
                       </td>
                       <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                         {log.resource}
                       </td>
                       <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                         {log.action}
                       </td>
                       <td className="px-6 py-4">
                         <Badge variant={log.granted ? 'success' : 'error'}>
                           {log.granted ? 'Granted' : 'Denied'}
                         </Badge>
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
              {auditLogs.length === 0 && (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  No audit logs found for the last 24 hours
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PermissionManager;