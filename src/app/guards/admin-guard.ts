import { CanActivateFn, Router } from '@angular/router';
import { UserDataService } from '../services/user-data';
import { inject } from '@angular/core';



export const adminGuard: CanActivateFn = (route, state) => 
{ 
  const router = inject(Router);
  const userData = inject(UserDataService);
  const currentUser = userData.userData();
  const isAdmin= currentUser.email === 'admin@gmail.com';
  if (isAdmin) {
    return true;
  } else {
    return router.navigateByUrl('/shop');
  }
};
