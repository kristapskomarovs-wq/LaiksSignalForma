import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AllAutosModel, AutoModel } from '../shop/shop_model';

@Injectable({
  providedIn: 'root',
})
export class AutosService {
  http = inject(HttpClient);

  public getAllAutos() {
    return this.http.get<AutoModel[]>('/api/v1/getallautos', {
      observe: 'response',
    });
  }
  
}
