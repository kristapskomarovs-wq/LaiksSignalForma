import { Component, inject, OnInit, signal } from '@angular/core';
import { UserDataService } from '../services/user-data';
import { AutoModel } from '../shop/shop_model';
import { form, FormField, min } from '@angular/forms/signals';
import { AdminService } from '../services/admin-service';

@Component({
  selector: 'app-shop-admin',
  imports: [FormField],
  templateUrl: './shop-admin.html',
  styleUrl: './shop-admin.css',
})
export class ShopAdmin{

  adminService = inject(AdminService);

  autoSignal = signal<AutoModel>({ 
  model: '',
  year: 0, 
  color: '', 
  milage: 0, 
  price: 0, 
  quantity: 0 });
  
  autosForm = form(this.autoSignal, (e) => {
    min(e.price, 0,{ message: 'Cena nedrīkst būt negatīva' });
    min(e.milage, 0,{ message: 'Nobraukums nedrīkst būt negatīvs' });
    min(e.year, 1886,{ message: 'Gads nedrīkst būt agrāks par 1886' });
    min(e.quantity, 0,{ message: 'Daudzums nedrīkst būt negatīvs' });
  });

  onSubmit(){
    this.adminService.addAuto(this.autosForm().value()).subscribe({
      next: (r) => {
        if(r.status === 201){
          alert('Auto successfully added to the database!');
          this.autosForm().reset();
  }
},
      error: (err) => {
        console.error('Error adding auto:', err);
        alert('An error occurred while adding the auto. Please try again later.');
      }
    });
  }
}