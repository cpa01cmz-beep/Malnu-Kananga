import React from 'react';
import { UserRole, UserExtraRole } from '../types';
import { permissionService } from '../services/permissionService';
import AccessDenied from './AccessDenied';

interface PermissionGuardProps {
  userRole: UserRole;
  userExtraRole: UserExtraRole;
  requiredPermissions: string[];
  children: React.ReactNode;
  onBack?: () => void;
  message?: string;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  userRole,
  userExtraRole,
  requiredPermissions,
  children,
  onBack,
  message
}) => {
  // Check if user has any of the required permissions
  const hasPermission = requiredPermissions.some(permission => 
    permissionService.hasPermission(userRole, userExtraRole, permission).granted
  );

  if (!hasPermission) {
    return (
      <AccessDenied 
        onBack={onBack} 
        message={message || "You don't have permission to access this feature"} 
        requiredPermission={requiredPermissions.join(' or ')} 
      />
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;