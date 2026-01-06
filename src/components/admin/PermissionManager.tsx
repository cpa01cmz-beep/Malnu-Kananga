import React, { useState, useEffect, useCallback } from 'react';
import { Permission, UserRole, UserExtraRole, AuditLog } from '../../types/permissions';
import { permissionService } from '../../services/permissionService';
import { PERMISSIONS, ROLE_PERMISSION_MATRIX } from '../../config/permissions';

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

  const _togglePermission = (_permissionId: string) => {
    // This would typically update a backend configuration
    onShowToast('Permission updates require backend configuration', 'info');
  };

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Permission Management System
        </h2>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'permissions'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              User Permissions
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'matrix'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Role Matrix
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audit'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Audit Logs
            </button>
          </nav>
        </div>

        {activeTab === 'permissions' && (
          <div className="space-y-4">
            {/* Role Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                >
                  <option value="admin">Administrator</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Extra Role
                </label>
                <select
                  value={selectedExtraRole || ''}
                  onChange={(e) => setSelectedExtraRole(e.target.value as UserExtraRole)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                >
                  <option value="">None</option>
                  <option value="staff">Staff</option>
                  <option value="osis">OSIS</option>
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={validateRoleCombination}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Validate
                </button>
                <button
                  onClick={exportPermissionMatrix}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Export
                </button>
              </div>
            </div>

            {/* Current Permissions */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
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
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                All Permissions Overview
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Permission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {allPermissions.map((permission) => {
                      const status = getPermissionStatus(permission);
                      return (
                        <tr key={permission.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                            {permission.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {permission.resource}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {permission.action}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              status === 'granted'
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                            }`}>
                              {status}
                            </span>
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
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Role-Permission Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Permission Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Key Permissions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(ROLE_PERMISSION_MATRIX).map(([role, permissions]) => (
                    <tr key={role}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                        {role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {permissions.length}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="max-w-xs">
                          {permissions.slice(0, 3).map(permId => {
                            const perm = PERMISSIONS[permId];
                            return perm ? (
                              <span key={permId} className="inline-block bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-xs mr-1 mb-1">
                                {perm.name}
                              </span>
                            ) : null;
                          })}
                          {permissions.length > 3 && (
                            <span className="text-xs text-gray-400">+{permissions.length - 3} more</span>
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
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Recent Audit Logs (Last 24 hours)
              </h3>
              <button
                onClick={loadAuditLogs}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {auditLogs.slice(0, 50).map((log, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {log.userRole}
                        {log.userExtraRole && ` (${log.userExtraRole})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.granted
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                        }`}>
                          {log.granted ? 'Granted' : 'Denied'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {auditLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No audit logs found for the last 24 hours
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionManager;