import React from 'react';
import { UserRole, UserExtraRole, AccessResult } from '../types/permissions';
import { permissionService } from '../services/permissionService';

export interface RouteConfig {
  path: string;
  requiredPermission?: string;
  requiredRole?: UserRole;
  public?: boolean;
}

export interface ProtectedRouteProps {
  config: RouteConfig;
  userRole: UserRole | null;
  userExtraRole: UserExtraRole | null;
  children: React.ReactNode;
  onAccessDenied?: (result: AccessResult) => void;
}

export class RouteProtectionService {
  private routes: RouteConfig[] = [];

  /**
   * Register route configuration
   */
  registerRoute(config: RouteConfig): void {
    this.routes.push(config);
  }

  /**
   * Check if user can access a specific route
   */
  canAccessRoute(
    userRole: UserRole | null,
    userExtraRole: UserExtraRole | null,
    path: string,
    context?: {
      userId?: string;
      ip?: string;
      userAgent?: string;
    }
  ): AccessResult {
    if (!userRole) {
      return {
        granted: false,
        reason: 'User not authenticated'
      };
    }

    const routeConfig = this.routes.find(route => 
      route.path === path || this.pathMatches(route.path, path)
    );

    if (!routeConfig) {
      // Default behavior: allow access if route is not configured
      return {
        granted: true
      };
    }

    if (routeConfig.public) {
      return {
        granted: true
      };
    }

    if (routeConfig.requiredRole && routeConfig.requiredRole !== userRole) {
      return {
        granted: false,
        reason: `Route requires role: ${routeConfig.requiredRole}`
      };
    }

    if (routeConfig.requiredPermission) {
      return permissionService.hasPermission(
        userRole,
        userExtraRole,
        routeConfig.requiredPermission,
        context
      );
    }

    return {
      granted: true
    };
  }

  /**
   * Get all routes user can access
   */
  getAccessibleRoutes(
    userRole: UserRole | null,
    userExtraRole: UserExtraRole | null
  ): RouteConfig[] {
    if (!userRole) {
      return this.routes.filter(route => route.public);
    }

    return this.routes.filter(route => {
      if (route.public) return true;
      if (route.requiredRole && route.requiredRole !== userRole) return false;
      if (route.requiredPermission) {
        const result = permissionService.hasPermission(userRole, userExtraRole, route.requiredPermission);
        return result.granted;
      }
      return true;
    });
  }

  /**
   * Simple path matching (supports basic wildcards)
   */
  private pathMatches(routePath: string, actualPath: string): boolean {
    if (routePath === '*') return true;
    if (routePath.endsWith('*')) {
      const prefix = routePath.slice(0, -1);
      return actualPath.startsWith(prefix);
    }
    return routePath === actualPath;
  }

  /**
   * Register default routes for the application
   */
  registerDefaultRoutes(): void {
    // Public routes
    this.registerRoute({ path: '/', public: true });
    this.registerRoute({ path: '/login', public: true });
    this.registerRoute({ path: '/ppdb', public: true });

    // Admin routes
    this.registerRoute({ 
      path: '/admin', 
      requiredRole: 'admin',
      requiredPermission: 'system.admin'
    });
    this.registerRoute({ 
      path: '/admin/users*', 
      requiredRole: 'admin',
      requiredPermission: 'users.read'
    });
    this.registerRoute({ 
      path: '/admin/editor', 
      requiredRole: 'admin',
      requiredPermission: 'content.update'
    });

    // Teacher routes
    this.registerRoute({ 
      path: '/teacher', 
      requiredRole: 'teacher',
      requiredPermission: 'content.read'
    });
    this.registerRoute({ 
      path: '/teacher/grades', 
      requiredRole: 'teacher',
      requiredPermission: 'academic.grades'
    });

    // Student routes
    this.registerRoute({ 
      path: '/student', 
      requiredRole: 'student',
      requiredPermission: 'content.read'
    });
    this.registerRoute({ 
      path: '/student/library', 
      requiredRole: 'student',
      requiredPermission: 'student.library'
    });

    // Parent routes
    this.registerRoute({ 
      path: '/parent', 
      requiredRole: 'parent',
      requiredPermission: 'parent.monitor'
    });

    // Special role routes
    this.registerRoute({ 
      path: '/inventory', 
      requiredPermission: 'inventory.manage'
    });
    this.registerRoute({ 
      path: '/osis', 
      requiredPermission: 'osis.events'
    });
  }
}

export const routeProtectionService = new RouteProtectionService();