import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { filter, map } from 'rxjs/operators';

export const authGuard = () => {
  const router = inject(Router);
  return inject(AuthService).currentUser$.pipe(
    filter(user => user !== undefined),
    map(user => {
      if (!user) return router.createUrlTree(['/auth']);
      // If user is authenticated but hasn't completed registration, redirect to register
      if (!user.isRegistered) return router.createUrlTree(['/register']);
      return true;
    })
  );
};
