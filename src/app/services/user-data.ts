import { Injectable, signal } from '@angular/core';

import { UserDataShopModel } from '../user-login/user-login.model';


@Injectable({
  providedIn: 'root',
})
export class UserDataService {

  userData = signal<UserDataShopModel>({
    id: 0,
    email: '',
    

   
  });
  
}
