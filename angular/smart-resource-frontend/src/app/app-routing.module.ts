import { Routes } from '@angular/router';
import { AddNeedComponent } from '../app/pages/add-need.component';
import { DashboardComponent } from '../app/pages/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'add', component: AddNeedComponent }
];