import { Component, signal } from '@angular/core';
import { MainPageModel } from './main_page_model';
import { createUserLoginForm, validateUserLoginForm } from '../user-login/user-login.model';
import { form, validate } from '@angular/forms/signals';
import { UserLogin } from "../user-login/user-login";


@Component({
  selector: 'app-main-page',
  imports: [UserLogin,],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage {

mainSignal = signal({
  userLogin: createUserLoginForm()(),
  

});

mainForm=form(this.mainSignal, (v) => {
  validateUserLoginForm(v.userLogin);
  
});

}