import { Routes } from '@angular/router';
import { Home } from './shared/presentation/views/home/home';

// import { Profile } from './iam/presentation/views/profile/profile';
// import { Support } from './patients/presentation/views/support/support';
// import { Patients } from './patients/presentation/views/patients/patients';
// import { Notifications } from './notifications/presentation/views/notifications/notifications';

import { Plans } from './suscription/presentation/views/plans/plans';

const baseTitle = 'Vital Care';
const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);

export const routes: Routes = [
  { path: 'home', component: Home, title: `${baseTitle} - Home` },
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // { path: 'patients', component: Patients },
  // { path: 'support', component: Support },
  // { path: 'profile', component: Profile },
  // { path: 'notification', component: Notifications },

  { path: 'plans', component: Plans },
  { path: '**', loadComponent: pageNotFound, title: `${baseTitle} - Page Not Found` },
];
