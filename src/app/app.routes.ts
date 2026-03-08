import { Routes } from '@angular/router';
import { MainPage } from './main-page/main-page';

export const routes: Routes = [
    { path:'', component: MainPage, title:'User registration' },
    {path:'shop', loadComponent: () => import('./shop/shop').then(m => m.Shop), title:'Shop'},
    {path:'**', redirectTo:''}
];
