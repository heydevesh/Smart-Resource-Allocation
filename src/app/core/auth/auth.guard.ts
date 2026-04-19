import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

export const authGuard = () => {
  const router = inject(Router);
  return inject(AuthService).currentUser$.pipe(
    map(user => !!user || router.createUrlTree(['/auth']))
  );
};
