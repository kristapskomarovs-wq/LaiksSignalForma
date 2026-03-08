import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserLoginModel } from '../user-login/user-login.model';

@Injectable({
  providedIn: 'root',
})
export class UserRegService {
  http =inject(HttpClient);

  path: string = 'http://localhost:8088/api/v1'

  public saveUser(userLogin: UserLoginModel) : Observable<HttpResponse<number>> {
    return this.http.post<number>(`${this.path}/saveuser`, userLogin, {
      observe: 'response',
    });
  }
  
  public checkEmailExists(email: string): Observable<HttpResponse<boolean>> {
    return this.http.get<boolean>(`http://localhost:8088/api/v1/checkemail/${encodeURIComponent(email)}`, {
  
      observe: 'response',
    });

}
public signIn(userLogin: UserLoginModel): Observable<HttpResponse<number>> {
  return this.http.post<number>(`${this.path}/signin`, userLogin, {
    observe: 'response',
  });
}
}
