import { Routes } from '@angular/router';
import { Notifications } from './notifications/presentation/views/notifications/notifications';
import { Home } from './shared/presentation/views/home/home';

const baseTitle = 'Vital Care';
const pageNotFound = () => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);

export const routes: Routes = [
  { path: 'home', component: Home, title: `${baseTitle} - Home` },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'patients', loadComponent: pageNotFound },
  { path: 'plans', loadComponent: pageNotFound },
  { path: 'support', loadComponent: pageNotFound },
  { path: 'profile', loadComponent: pageNotFound },
  { path: 'notification', component: Notifications },
  { path: '**', loadComponent: pageNotFound, title: `${baseTitle} - Page Not Found` },
];