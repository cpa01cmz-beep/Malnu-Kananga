# Permission Validator Skill

## Description
Validate and ensure proper permission checks throughout the MA Malnu Kananga application, following role-based access control patterns.

## Instructions

When asked to validate or add permissions:

1. **Permission Configuration**: Update `src/config/permissions.ts`
   ```typescript
   // src/config/permissions.ts
   export const PERMISSIONS = {
     // Existing permissions...
     
     // New permission
     FEATURE_VIEW: 'feature:view',
     FEATURE_CREATE: 'feature:create',
     FEATURE_UPDATE: 'feature:update',
     FEATURE_DELETE: 'feature:delete',
   } as const;
   
   export const ROLE_PERMISSIONS: Record<string, string[]> = {
     admin: Object.values(PERMISSIONS),
     teacher: [
       PERMISSIONS.FEATURE_VIEW,
       PERMISSIONS.FEATURE_CREATE,
     ],
     student: [
       PERMISSIONS.FEATURE_VIEW,
     ],
     // Add more roles as needed
   };
   
   export const FEATURE_ROUTES: Record<string, string[]> = {
     '/feature': [PERMISSIONS.FEATURE_VIEW],
     '/feature/create': [PERMISSIONS.FEATURE_CREATE],
     '/feature/edit': [PERMISSIONS.FEATURE_UPDATE],
     '/feature/delete': [PERMISSIONS.FEATURE_DELETE],
   };
   ```

2. **Permission Service**: Update `src/services/permissionService.ts`
   ```typescript
   // src/services/permissionService.ts
   import { PERMISSIONS, ROLE_PERMISSIONS } from '../config/permissions';
   import { STORAGE_KEYS } from '../constants';
   
   export const hasPermission = (permission: string): boolean => {
     const userData = localStorage.getItem(STORAGE_KEYS.USERS);
     if (!userData) return false;
     
     const users = JSON.parse(userData);
     const currentUser = users.find((u: any) => u.is_current_user);
     
     if (!currentUser) return false;
     
     const userPermissions = ROLE_PERMISSIONS[currentUser.role] || [];
     return userPermissions.includes(permission);
   };
   
   export const hasAnyPermission = (permissions: string[]): boolean => {
     return permissions.some(permission => hasPermission(permission));
   };
   
   export const hasAllPermissions = (permissions: string[]): boolean => {
     return permissions.every(permission => hasPermission(permission));
   };
   
   export const canAccessRoute = (route: string): boolean => {
     const routePermissions = FEATURE_ROUTES[route];
     if (!routePermissions || routePermissions.length === 0) return true;
     
     return hasAnyPermission(routePermissions);
   };
   
   export const checkPermission = (permission: string, callback: () => void): void => {
     if (hasPermission(permission)) {
       callback();
     } else {
       console.warn(`Permission denied: ${permission}`);
     }
   };
   ```

3. **Component Permission Check**:
   ```typescript
   // In React component
   import { hasPermission, PERMISSIONS } from '../services/permissionService';
   
   const FeatureComponent: React.FC = () => {
     if (!hasPermission(PERMISSIONS.FEATURE_VIEW)) {
       return <AccessDenied />;
     }
     
     return (
       <div>
         {/* Feature content */}
         {hasPermission(PERMISSIONS.FEATURE_CREATE) && (
           <Button onClick={handleCreate}>Create</Button>
         )}
         
         {hasPermission(PERMISSIONS.FEATURE_UPDATE) && (
           <Button onClick={handleEdit}>Edit</Button>
         )}
         
         {hasPermission(PERMISSIONS.FEATURE_DELETE) && (
           <Button onClick={handleDelete} variant="danger">Delete</Button>
         )}
       </div>
     );
   };
   ```

4. **Route Protection**:
   ```typescript
   // In route configuration
   import { canAccessRoute } from '../services/permissionService';
   
   const ProtectedRoute: React.FC<{ path: string; children: React.ReactNode }> = ({ 
     path, children 
   }) => {
     if (!canAccessRoute(path)) {
       return <Navigate to="/unauthorized" />;
     }
     
     return <>{children}</>;
   };
   ```

5. **Backend Permission Check** (in worker.js):
   ```javascript
   // In Cloudflare Worker
   app.get('/api/feature', async (c) => {
     const auth = c.get('auth');
     if (!auth) {
       return c.json({ success: false, message: 'Unauthorized' }, 401);
     }
     
     // Check permission
     const hasPermission = ROLE_PERMISSIONS[auth.role]?.includes('feature:view');
     if (!hasPermission) {
       return c.json({ success: false, message: 'Forbidden' }, 403);
     }
     
     // Proceed with request
     const data = await c.env.DB.prepare('SELECT * FROM features').all();
     return c.json({ success: true, data });
   });
   ```

6. **Permission Validation Checklist**:
   - [ ] Permission defined in `PERMISSIONS` constants
   - [ ] Permission added to `ROLE_PERMISSIONS` for appropriate roles
   - [ ] Route added to `FEATURE_ROUTES` if applicable
   - [ ] Frontend component checks permission before rendering
   - [ ] Backend endpoint validates permission
   - [ ] API endpoint has proper auth check
   - [ ] Error handling for unauthorized access
   - [ ] User feedback for denied access
   - [ ] Tests for permission checks
   - [ ] Documentation updated

7. **Common Permission Patterns**:
   
   **View Only**:
   ```typescript
   if (hasPermission(PERMISSIONS.FEATURE_VIEW)) {
     return <FeatureView />;
   }
   ```
   
   **Action Based**:
   ```typescript
   const handleAction = () => {
     if (!hasPermission(PERMISSIONS.FEATURE_ACTION)) {
       toast.error('You do not have permission to perform this action');
       return;
     }
     // Proceed with action
   };
   ```
   
   **Conditional Rendering**:
   ```typescript
   {hasPermission(PERMISSIONS.FEATURE_ADMIN) && (
     <AdminPanel />
   )}
   ```

8. **Testing Permissions**:
   ```typescript
   // permissionService.test.ts
   import { describe, it, expect, beforeEach, vi } from 'vitest';
   import { hasPermission, hasAnyPermission, hasAllPermissions } from './permissionService';
   
   describe('permissionService', () => {
     beforeEach(() => {
       localStorage.clear();
       localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
         { id: '1', role: 'admin', is_current_user: true },
         { id: '2', role: 'student', is_current_user: false },
       ]));
     });
     
     it('should grant admin all permissions', () => {
       expect(hasPermission('feature:view')).toBe(true);
       expect(hasPermission('feature:delete')).toBe(true);
     });
     
     it('should check any permission', () => {
       expect(hasAnyPermission(['feature:view', 'feature:create'])).toBe(true);
       expect(hasAnyPermission(['feature:delete'])).toBe(true);
     });
     
     it('should check all permissions', () => {
       expect(hasAllPermissions(['feature:view', 'feature:create'])).toBe(true);
       expect(hasAllPermissions(['feature:view', 'feature:delete'])).toBe(true);
     });
   });
   ```

9. **Best Practices**:
   - Define permissions at constant level
   - Use descriptive permission names (resource:action)
   - Group permissions by resource
   - Grant least privilege necessary
   - Document permission requirements
   - Test permission checks thoroughly
   - Handle denied access gracefully
   - Log permission violations
   - Review permissions regularly

10. **Common Roles and Permissions**:
    - **admin**: All permissions
    - **teacher**: View/create content, manage students
    - **student**: View content, submit assignments
    - **parent**: View child's information
    - **staff**: Limited admin access
    - **osis**: Student organization features
    - **wakasek**: Vice principal features
    - **kepsek**: Principal features

## Examples

See existing permission patterns:
- `src/config/permissions.ts` - Permission definitions
- `src/services/permissionService.ts` - Permission checking logic
- Look for existing components using permission checks

## Notes

- Always check permissions on both frontend and backend
- Frontend checks are for UX, backend for security
- Use TypeScript to prevent permission typos
- Keep permission logic centralized
- Document complex permission rules
- Consider permission inheritance
- Test with different user roles
