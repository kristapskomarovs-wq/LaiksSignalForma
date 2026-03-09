import { Routes } from '@angular/router';
import { MainPage } from './main-page/main-page';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
    { path:'', component: MainPage, title:'User registration' },
    {path:'shop', loadComponent: () => import('./shop/shop').then(m => m.Shop), title:'Shop'},
    {path : 'admin', loadComponent: () => import('./shop-admin/shop-admin').then(m => m.ShopAdmin),
         title:'Admin', canActivate: [adminGuard]},
    {path:'**', redirectTo:''}
];
