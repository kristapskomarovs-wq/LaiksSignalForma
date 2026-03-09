import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserDataService } from '../services/user-data';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userDataService = inject(UserDataService);
  const isAdmin: boolean = userDataService.getUserData().email.toLowerCase() === 'admin@gmail.com';
  if (isAdmin) {
    return true;
  }

  return router.createUrlTree(['/shop']);
};