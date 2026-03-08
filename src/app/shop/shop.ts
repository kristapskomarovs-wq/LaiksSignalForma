import { Component, inject, OnInit, signal } from '@angular/core';
import { UserDataService } from '../services/user-data';
import { UserDataShopModel } from '../user-login/user-login.model';
import { AllAutosModel, AutoModel } from './shop_model';
import { form } from '@angular/forms/signals';
import { AutosService } from '../services/autos-service';

@Component({
  selector: 'app-shop',
  imports: [],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop implements OnInit {
  userDataService = inject(UserDataService);
  userData: UserDataShopModel = this.userDataService.userData();
  autosService = inject(AutosService);
  allAutosSignal = signal<AllAutosModel>({ allAutos: [] });
  autosForm = form(this.allAutosSignal);
       
  ngOnInit(): void {
    this.startShop();
    }
  

  startShop() {
    this.autosService.getAllAutos().subscribe({
      next: (r) => {
        if (r.status === 200) {
          console.log('Response received:', r.body!);
          this.allAutosSignal.set({ allAutos: (r.body as AutoModel[]) ?? [] });
          console.log(this.allAutosSignal().allAutos);
        }
      },
      error: (err) => {
        console.error('Error fetching autos:', err);
        alert('An error occurred while fetching autos. Please try again later.');
      }
    });
  }
}