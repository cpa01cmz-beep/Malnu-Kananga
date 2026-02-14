import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Badge from './Badge';
import Card from './Card';
import { Table, Thead, Tbody, Tr, Th, Td } from './Table';
import { Toggle } from './Toggle';
import Heading from './Heading';
import Alert from './Alert';
import { customRoleService, CustomRole, RoleTemplate } from '../../services/customRoleService';
import { twoFactorEnforcementService, UserRole } from '../../services/twoFactorEnforcementService';

interface RoleManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'roles' | 'templates' | 'matrix' | 'security';

const baseRoles = [
  { id: 'admin', name: 'Administrator', description: 'Full system access' },
  { id: 'teacher', name: 'Teacher', description: 'Teaching staff' },
  { id: 'student', name: 'Student', description: 'Student account' },
  { id: 'parent', name: 'Parent', description: 'Parent/Guardian' },
  { id: 'staff', name: 'Staff', description: 'Non-teaching staff' }
];

export const RoleManager: React.FC<RoleManagerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('roles');
  const [roles, setRoles] = useState<CustomRole[]>(customRoleService.getCustomRoles());
  const [templates] = useState<RoleTemplate[]>(customRoleService.getRoleTemplates());
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [twoFactorConfig, setTwoFactorConfig] = useState(twoFactorEnforcementService.getEnforcementConfig());
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(twoFactorConfig.requiredRoles);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseRoleId: 'teacher',
    permissions: [] as string[],
    inheritsFrom: [] as string[]
  });

  const categories = useMemo(() => customRoleService.getPermissionCategories(), []);
  const allPermissions = useMemo(() => customRoleService.getAllPermissions(), []);

  const resetForm = () => {
    setFormData({ name: '', description: '', baseRoleId: 'teacher', permissions: [], inheritsFrom: [] });
    setEditingRole(null);
    setIsCreating(false);
  };

  const handleCreateRole = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleEditRole = (role: CustomRole) => {
    setFormData({
      name: role.name,
      description: role.description,
      baseRoleId: role.baseRoleId || 'teacher',
      permissions: role.permissions,
      inheritsFrom: role.inheritsFrom || []
    });
    setEditingRole(role);
    setIsCreating(true);
  };

  const handleSaveRole = () => {
    if (!formData.name.trim()) return;

    if (editingRole) {
      customRoleService.updateCustomRole(editingRole.id, {
        name: formData.name,
        description: formData.description,
        baseRoleId: formData.baseRoleId,
        permissions: formData.permissions,
        inheritsFrom: formData.inheritsFrom
      });
    } else {
      customRoleService.createCustomRole({
        id: `custom_role_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        baseRoleId: formData.baseRoleId,
        permissions: formData.permissions,
        inheritsFrom: formData.inheritsFrom,
        createdBy: 'admin'
      });
    }
    setRoles(customRoleService.getCustomRoles());
    resetForm();
  };

  const handleDeleteRole = (roleId: string) => {
    if (customRoleService.deleteCustomRole(roleId)) {
      setRoles(customRoleService.getCustomRoles());
    }
  };

  const togglePermission = (permId: string) => {
    const perms = formData.permissions.includes(permId)
      ? formData.permissions.filter(p => p !== permId)
      : [...formData.permissions, permId];
    setFormData({ ...formData, permissions: perms });
  };

  const toggleInheritance = (parentId: string) => {
    const inherits = formData.inheritsFrom.includes(parentId)
      ? formData.inheritsFrom.filter(p => p !== parentId)
      : [...formData.inheritsFrom, parentId];
    setFormData({ ...formData, inheritsFrom: inherits });
  };

  const handleCreateFromTemplate = (template: RoleTemplate) => {
    customRoleService.createCustomRole({
      id: `custom_role_${Date.now()}`,
      name: `${template.name} (Custom)`,
      description: template.description,
      baseRoleId: template.baseRoleId,
      permissions: template.permissions,
      inheritsFrom: [],
      createdBy: 'admin'
    });
    setRoles(customRoleService.getCustomRoles());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Role Management"
      size="xl"
      className="max-h-[90vh] overflow-hidden flex flex-col"
    >
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        {(['roles', 'templates', 'matrix', 'security'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {tab === 'matrix' ? 'Permission Matrix' : tab === 'security' ? 'Keamanan' : tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'roles' && (
          <div>
            {!isCreating ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <Heading level={3}>Custom Roles</Heading>
                  <Button onClick={handleCreateRole} variant="primary" size="sm">
                    Create Role
                  </Button>
                </div>
                {roles.length === 0 ? (
                  <Alert variant="info">No custom roles created yet. Create one from scratch or use a template.</Alert>
                ) : (
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Description</Th>
                        <Th>Base Role</Th>
                        <Th>Permissions</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {roles.map(role => (
                        <Tr key={role.id}>
                          <Td>{role.name}</Td>
                          <Td>{role.description}</Td>
                          <Td>
                            <Badge variant="neutral">{role.baseRoleId}</Badge>
                          </Td>
                          <Td>{role.permissions.length} permissions</Td>
                          <Td>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEditRole(role)}>
                                Edit
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteRole(role.id)}>
                                Delete
                              </Button>
                            </div>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </>
            ) : (
              <div>
                <Heading level={3} className="mb-4">
                  {editingRole ? 'Edit Role' : 'Create New Role'}
                </Heading>
                <div className="space-y-4">
                  <Input
                    label="Role Name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Senior Teacher"
                  />
                  <Input
                    label="Description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this role"
                  />
                  <Select
                    label="Base Role"
                    value={formData.baseRoleId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, baseRoleId: e.target.value })}
                    options={baseRoles.map(r => ({ value: r.id, label: r.name }))}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Permission Inheritance</label>
                    <div className="flex flex-wrap gap-2">
                      {roles.filter(r => r.id !== editingRole?.id).map(role => (
                        <Toggle
                          key={role.id}
                          checked={formData.inheritsFrom.includes(role.id)}
                          onChange={() => toggleInheritance(role.id)}
                          label={role.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Permissions</label>
                    <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto border rounded p-2">
                      {categories.map(cat => (
                        <div key={cat}>
                          <Heading level={6} className="capitalize mb-2">{cat}</Heading>
                          <div className="space-y-1">
                            {allPermissions
                              .filter(p => p.resource === cat)
                              .map(perm => (
                                <Toggle
                                  key={perm.id}
                                  checked={formData.permissions.includes(perm.id)}
                                  onChange={() => togglePermission(perm.id)}
                                  label={perm.name}
                                />
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="secondary" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveRole}>
                      {editingRole ? 'Update' : 'Create'} Role
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div>
            <Heading level={3} className="mb-4">Role Templates</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <Card key={template.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Heading level={4}>{template.name}</Heading>
                    {template.isSystem && <Badge variant="info">System</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Base: {template.baseRoleId} • {template.permissions.length} permissions
                  </p>
                  <Button size="sm" variant="secondary" onClick={() => handleCreateFromTemplate(template)}>
                    Use Template
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'matrix' && (
          <div>
            <Heading level={3} className="mb-4">Permission Matrix</Heading>
            <div className="overflow-x-auto">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Permission</Th>
                    {baseRoles.map(r => (
                      <Th key={r.id} className="text-center">{r.name}</Th>
                    ))}
                    {roles.map(r => (
                      <Th key={r.id} className="text-center">{r.name} (Custom)</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {allPermissions.map(perm => (
                    <Tr key={perm.id}>
                      <Td className="font-mono text-xs">
                        {perm.id}
                        <p className="text-gray-500 text-xs">{perm.name}</p>
                      </Td>
                      {baseRoles.map(r => {
                        const perms = customRoleService.getEffectivePermissions(r.id, r.id);
                        return (
                          <Td key={r.id} className="text-center">
                            {perms.includes(perm.id) ? '✓' : '✗'}
                          </Td>
                        );
                      })}
                      {roles.map(r => {
                        const perms = customRoleService.getEffectivePermissions(r.id, r.baseRoleId || 'teacher');
                        return (
                          <Td key={r.id} className="text-center">
                            {perms.includes(perm.id) ? '✓' : '✗'}
                          </Td>
                        );
                      })}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <Heading level={3} className="mb-4">Two-Factor Authentication Enforcement</Heading>
            <Alert variant="info" className="mb-4">
              Require 2FA for specific roles to enhance account security. Users in enforced roles must enable 2FA to access the system.
            </Alert>
            
            <Card className="p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Heading level={4}>2FA Enforcement Status</Heading>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {twoFactorConfig.enabled 
                      ? `Enforced for: ${twoFactorEnforcementService.getRequiredRolesDisplay()}`
                      : 'Not enforced for any role'}
                  </p>
                </div>
                <Toggle
                  checked={twoFactorConfig.enabled}
                  onChange={(checked) => {
                    if (checked) {
                      twoFactorEnforcementService.enableEnforcement(selectedRoles, 'admin');
                    } else {
                      twoFactorEnforcementService.disableEnforcement('admin');
                    }
                    setTwoFactorConfig(twoFactorEnforcementService.getEnforcementConfig());
                  }}
                  label={twoFactorConfig.enabled ? 'Enabled' : 'Disabled'}
                />
              </div>
            </Card>

            <Card className="p-4">
              <Heading level={4} className="mb-4">Select Roles Requiring 2FA</Heading>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {twoFactorEnforcementService.getAvailableRoles().map(role => (
                  <label
                    key={role}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRoles.includes(role)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={(e) => {
                        const newRoles = e.target.checked
                          ? [...selectedRoles, role]
                          : selectedRoles.filter(r => r !== role);
                        setSelectedRoles(newRoles);
                        if (twoFactorConfig.enabled) {
                          twoFactorEnforcementService.enableEnforcement(newRoles, 'admin');
                          setTwoFactorConfig(twoFactorEnforcementService.getEnforcementConfig());
                        }
                      }}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium capitalize">{role}</span>
                    </div>
                    {selectedRoles.includes(role) && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </Card>

            {twoFactorConfig.lastUpdated && (
              <p className="text-xs text-gray-500 mt-4">
                Last updated: {new Date(twoFactorConfig.lastUpdated).toLocaleString()}
                {twoFactorConfig.updatedBy && ` by ${twoFactorConfig.updatedBy}`}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RoleManager;
