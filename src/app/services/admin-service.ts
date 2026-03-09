import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AutoModel } from '../shop/shop_model';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  http = inject(HttpClient);

 public addAuto(auto: AutoModel) : Observable<HttpResponse<void>> {
    return this.http.post<void>('http://localhost:8088/api/v1/addauto', auto, {
      observe: 'response',
    });
  }
}
