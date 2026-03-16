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
    return this.http.post<void>('/api/v1/addauto', auto, {
      observe: 'response',
    });
  }

  public updateAuto(auto: AutoModel): Observable<HttpResponse<void>> {
    return this.http.put<void>(`/api/v1/updateauto/${auto.id}`, auto, {
      observe: 'response',
    });
  }

  public deleteAuto(id: number): Observable<HttpResponse<void>> {
    return this.http.delete<void>(`/api/v1/deleteauto/${id}`, {
      observe: 'response',
    });
  }
}
