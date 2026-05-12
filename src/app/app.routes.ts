import { Routes } from '@angular/router';
/*import { Profile } from './iam/presentation/views/profile/profile';
import { Plans } from './suscription/presentation/views/plans/plans';
import { Support } from './patients/presentation/views/support/support';*/
import { Patients } from './patients/presentation/views/patients/patients';
/*import { Notifications } from './notifications/presentation/views/notifications/notifications';*/
import {Home} from './shared/presentation/views/home/home';

const baseTitle = 'Vital Care';
const pageNotFound = () => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);


export const routes: Routes = [
  {
    path: 'home',
    component: Home,
    title: `${baseTitle} - Home`,
    children: [
      { path: 'patients', component: Patients, title: `${baseTitle} - Patients` },
      /*{ path: 'plans', component: Plans },
        { path: 'support', component: Support },
        { path: 'profile', component: Profile },
        { path: 'notification', component: Notifications },*/
    ]
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'patients', redirectTo: 'home/patients', pathMatch: 'full' },
/*  { path: 'plans', redirectTo: 'home/plans', pathMatch: 'full' },
  { path: 'support', redirectTo: 'home/support', pathMatch: 'full' },
  { path: 'profile', redirectTo: 'home/profile', pathMatch: 'full' },
  { path: 'notification', redirectTo: 'home/notification', pathMatch: 'full' },*/
  { path: '**',       loadComponent: pageNotFound,  title: `${baseTitle} - Page Not Found` },
];
