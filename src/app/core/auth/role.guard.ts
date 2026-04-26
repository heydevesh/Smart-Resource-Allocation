import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { filter, map } from 'rxjs/operators';
import { UserRole, Permission } from '../../models';

/**
 * Guard that checks if the user has one of the allowed roles.
 */
export const roleGuard = (allowedRoles: UserRole[]) => {
  return () => {
    const router = inject(Router);
    return inject(AuthService).currentUser$.pipe(
      filter(user => user !== undefined),
      map(user =>
        (user && allowedRoles.includes(user.role)) ||
        router.createUrlTree(['/auth'])
      )
    );
  };
};

/**
 * Guard that checks if the user has a specific permission or any one of a list of permissions.
 * - Unauthenticated users → /auth
 * - Applicants (pending review) → /verification-status
 * - Authenticated users without the required permission → /unauthorized (403)
 */
export const permissionGuard = (permissions: Permission | Permission[]) => {
  return () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

    return authService.currentUser$.pipe(
      filter(user => user !== undefined),
      map(user => {
        if (user) {
          const hasAny = requiredPermissions.some(p => authService.hasPermission(p));
          if (hasAny) return true;

          // Applicants haven't been approved yet — send to status page
          if (user.role === 'applicant') {
            return router.createUrlTree(['/verification-status']);
          }

          // Authenticated but insufficient role → 403
          return router.createUrlTree(['/unauthorized']);
        }

        // Not logged in → login page
        return router.createUrlTree(['/auth']);
      })
    );
  };
};