import { Component, inject, input, signal } from '@angular/core';
import { UserLoginModel } from './user-login.model';
import { FieldTree, FormField,} from '@angular/forms/signals';
import { ErrorValidation } from "../error-validation/error-validation";
import { UserRegService } from '../services/user-reg-service';
import { UserDataService } from '../services/user-data';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-login',
  imports: [ErrorValidation, FormField],
  templateUrl: './user-login.html',
  styleUrl: './user-login.css',
})
export class UserLogin {

  userRegService = inject(UserRegService)
  userDataService = inject(UserDataService)
  router = inject(Router)
  fromMain = input.required<FieldTree<UserLoginModel>>();
  
  isRegistered = signal<boolean>(false);
  show = signal<boolean>(false);

  saveUser() {
    this.userRegService.saveUser(this.fromMain()().value()).subscribe({
      next: (r) => {
        if (r.status === 201) {
          this.userDataService.userData.set({
            id: r.body!,
            email: this.fromMain()().value().email,
      
          });
          this.router.navigateByUrl('/shop');
        }
        else {
          alert('Registration failed. Please try again.');
        }

    }  });
  }
  onSignIn() {
    this.userRegService.signIn(this.fromMain()().value()).subscribe({
      next: (r) => {
        if (r.status === 200) {
          this.userDataService.userData.set({
            id: r.body!,
            email: this.fromMain()().value().email,
          });
          this.router.navigateByUrl('/shop');
        }
        else {
          alert('Sign in failed. Please try again.');
        }
      },
      error: (err) => {
        this.fromMain().email().value.set('');
        this.fromMain().password().value.set('');
        console.error('Error signing in:', err);
        alert('An error occurred while signing in. Please try again later.');
      }
    });
  }

  onEmailInput() {

   this.userRegService.checkEmailExists(this.fromMain().email().value()).subscribe({
    next: (r) => {
      this.isRegistered.set(r.body!);
      this.show.set(true);
     },
     error: (err) => {
      console.error('Error checking email existence:', err);
      alert('An error occurred while checking the email. Please try again later.');
     }
    });
  }
}
