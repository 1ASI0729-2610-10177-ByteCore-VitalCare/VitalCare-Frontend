import { Routes } from '@angular/router';
import { Home } from './shared/presentation/views/home/home';
import { Patients } from './patients/presentation/views/patients/patients';
import { Plans } from './suscription/presentation/views/plans/plans';
import { Notifications } from './notifications/presentation/views/notifications/notifications';
import { authGuard, guestGuard } from './iam/application/guards/auth.guard';
import { Login } from './iam/presentation/views/login/login';
import { ResetPassword } from './iam/presentation/views/reset-password/reset-password';

// import { Profile } from './iam/presentation/views/profile/profile';
// import { Support } from './patients/presentation/views/support/support';

const baseTitle = 'Vital Care';
const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFoundComponent);

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
    title: `${baseTitle} - Login`,
  },
  {
    path: 'reset-password',
    component: ResetPassword,
    title: `${baseTitle} - Reset Password`,
  },
  {
    path: 'home',
    component: Home,
    canActivate: [authGuard],
    title: `${baseTitle} - Home`,
    children: [
      { path: 'patients', component: Patients, title: `${baseTitle} - Patients` },
      { path: 'plans', component: Plans, title: `${baseTitle} - Plans` },
      { path: 'notification', component: Notifications, title: `${baseTitle} - Notifications` },
      // { path: 'support', component: Support },
      // { path: 'profile', component: Profile },
    ]
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'patients', redirectTo: 'home/patients', pathMatch: 'full' },
  { path: 'plans', redirectTo: 'home/plans', pathMatch: 'full' },
  { path: 'notification', redirectTo: 'home/notification', pathMatch: 'full' },
  // { path: 'support', redirectTo: 'home/support', pathMatch: 'full' },
  // { path: 'profile', redirectTo: 'home/profile', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `${baseTitle} - Page Not Found` },
];
