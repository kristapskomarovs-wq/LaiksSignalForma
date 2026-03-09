import { Injectable, signal } from '@angular/core';

import { UserDataShopModel } from '../user-login/user-login.model';


@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  email() {
    throw new Error('Method not implemented.');
  }

  userData = signal<UserDataShopModel>({
    id: 0,
    email: '',
    

   
  });
  
}
