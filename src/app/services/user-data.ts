import { Injectable, signal } from '@angular/core';

import { UserDataShopModel } from '../user-login/user-login.model';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
 

  setUserData(data: UserDataShopModel): void {
    sessionStorage.setItem('userData', JSON.stringify(data));
  }

  getUserData(): UserDataShopModel {
    const raw = sessionStorage.getItem('userData');
    if (!raw) {
      return { id: 0, email: '' };
    }

    try {
      return JSON.parse(raw) as UserDataShopModel;
    } catch {
      sessionStorage.removeItem('userData');
      return { id: 0, email: '' };
    }
  }

  // clearUserData(): void {
  //   sessionStorage.removeItem('userData');
  // }
}