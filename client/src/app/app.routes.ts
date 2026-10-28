import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'requests' },
  {
    path: 'requests',
    title: 'Service requests | Service Requests',
    loadComponent: () => import('./pages/request-list/request-list').then((m) => m.RequestList),
  },
  {
    path: 'requests/new',
    title: 'Submit a request | Service Requests',
    loadComponent: () => import('./pages/request-form/request-form').then((m) => m.RequestForm),
  },
  {
    path: 'requests/:id',
    title: 'Request details | Service Requests',
    loadComponent: () => import('./pages/request-detail/request-detail').then((m) => m.RequestDetail),
  },
  { path: '**', redirectTo: 'requests' },
];
