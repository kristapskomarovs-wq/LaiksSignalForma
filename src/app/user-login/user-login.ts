import { Component, inject, input, signal } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ErrorValidation } from '../error-validation/error-validation';
import { UserDataService } from '../services/user-data';
import { UserRegService } from '../services/user-reg-service';
import { UserLoginModel } from './user-login.model';

@Component({
  selector: 'app-user-login',
  imports: [ErrorValidation, FormField],
  templateUrl: './user-login.html',
  styleUrl: './user-login.css',
})
export class UserLogin {
  userRegService = inject(UserRegService);
  userDataService = inject(UserDataService);
  router = inject(Router);
  fromMain = input.required<FieldTree<UserLoginModel>>();

  isRegistered = signal<boolean>(false);
  show = signal<boolean>(false);

  saveUser() {
    this.userRegService.saveUser(this.fromMain()().value()).subscribe({
      next: (r) => {
        if (r.status === 201) {
          this.userDataService.setUserData({
            id: r.body!,
            email: this.fromMain()().value().email,
          });

          this.router.navigateByUrl('/shop');
        } else {
          alert('Registration failed. Please try again.');
        }
      },
    });
  }
  onSignIn() {
    this.userRegService.signIn(this.fromMain()().value()).subscribe({
      next: (r) => {
        if (r.status === 200) {
          this.userDataService.setUserData({
            id: r.body!,
            email: this.fromMain()().value().email,
          });
          this.router.navigateByUrl('/shop');
        } else {
          this.fromMain()().reset({
            email: this.fromMain()().value().email,
            password: '',
            confirmPassword: '',
          });
          alert('Sign in failed. Please check your credentials and try again.');
        }
      },
    });
  }

  onEmailInput() {
    this.userRegService.checkEmailExists(this.fromMain().email().value()).subscribe({
      next: (r) => {
        if (r.status === 200) {
          this.isRegistered.set(r.body!);
          this.show.set(true);
        }
      },
      error: (e) => {
        console.error('Error checking email existence', e);
      },
    });
  }
}