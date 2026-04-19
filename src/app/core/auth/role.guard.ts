import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { UserRole } from '../../models';

export const roleGuard = (allowedRoles: UserRole[]) => {
  const router = inject(Router);
  return inject(AuthService).currentUser$.pipe(
    map(user => 
      (user && allowedRoles.includes(user.role)) || 
      router.createUrlTree(['/auth']) // or unauthorized
    )
  );
};