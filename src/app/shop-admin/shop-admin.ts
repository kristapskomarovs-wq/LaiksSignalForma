import { Component, inject, OnInit } from '@angular/core';
import { UserDataService } from '../services/user-data';

@Component({
  selector: 'app-shop-admin',
  imports: [],
  templateUrl: './shop-admin.html',
  styleUrl: './shop-admin.css',
})
export class ShopAdmin{

  userDataService = inject(UserDataService);
  }
