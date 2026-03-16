import { Component, inject, OnInit, signal } from '@angular/core';
import { UserDataService } from '../services/user-data';
import { AllAutosModel, AutoModel } from '../shop/shop_model';
import { applyEach, form, FormField, min, required } from '@angular/forms/signals';
import { AdminService } from '../services/admin-service';
import { AutosService } from '../services/autos-service';

@Component({
  selector: 'app-shop-admin',
  imports: [FormField],
  templateUrl: './shop-admin.html',
  styleUrl: './shop-admin.css',
})
export class ShopAdmin implements OnInit {
 

  adminService = inject(AdminService);
  autosService = inject(AutosService);
  // autoSignal = signal<AutoModel>({ 
  // model: '',
  // year: 0, 
  // color: '', 
  // milage: 0, 
  // price: 0, 
  // quantity: 0 });

  allAutosSignal = signal<AllAutosModel>({ allAutos: [] });
  
  ngOnInit(): void {
    this.allAutos();
  }

  autosForm = form(this.allAutosSignal, (e) => {
    applyEach(e.allAutos, (b) => {
      min(b.model, 3, {message: 'Model must be at least 3 characters long'});
      min(b.year, 1886, {message: 'Year must be 1886 or later'});
      min(b.color, 3, {message: 'Color must be at least 3 characters long'});
      min(b.milage, 0, {message: 'Mileage must be 0 or more'});
      min(b.price, 0, {message: 'Price must be 0 or more'});
      min(b.quantity, 0, {message: 'Quantity must be 0 or more'});
    });
  });

  allAutos() {
    this.autosService.getAllAutos().subscribe({
      next: (autos) => {
        this.allAutosSignal.set({ allAutos: autos.body ?? [] });
        this.allAutosSignal.update((current) =>
           ({ allAutos: 
            [...current.allAutos, { model: '', year: 0, color: '', milage: 0, price: 0, quantity: 0, imageUrl: '' }] })
        );
      },
      error: (err) => {
        console.error('Error fetching autos:', err);
        alert('An error occurred while fetching autos. Please try again later.');
      }
    });

  }

  onSubmit(index: number) {
  this.adminService.addAuto(this.autosForm().value().allAutos[index]).subscribe({
    next: (r) => {
      if (r.status === 200) {
        this.allAutos(); // re-fetch: gives the new auto its id (flips button) and appends a fresh empty row
      }
    },
    error: (err) => {
      console.error('Error adding auto:', err);
      alert('An error occurred while adding the auto. Please try again later.');
    }
  });
}

onUpdate(index: number) {
  const id = this.allAutosSignal().allAutos[index].id;
  if (!id) return;

  const auto = { ...this.autosForm().value().allAutos[index], id };
  console.log('Sending update:', auto);

  this.adminService.updateAuto(auto).subscribe({
    next: (r) => {
      if (r.status === 200) {
        alert('Auto veiksmīgi atjaunināts! ✅');
      }
    },
    error: (err) => {
      console.error('Error updating auto:', err);
      alert(`Update failed: ${err.status} ${err.statusText}\n${JSON.stringify(err.error)}`);
    }
  });
}

onDelete(index: number) {
  const id = this.allAutosSignal().allAutos[index].id;
  if (!id) return;

  if (!confirm('Vai tiešām vēlaties dzēst šo auto?')) return;

  this.adminService.deleteAuto(id).subscribe({
    next: (r) => {
      if (r.status === 200) {
        alert('Auto veiksmīgi dzēsts! 🗑️');
        this.allAutos(); // re-fetch the list
      }
    },
    error: (err) => {
      console.error('Error deleting auto:', err);
      alert(`Dzēšana neizdevās: ${err.status} ${err.statusText}`);
    }
  });
}
}