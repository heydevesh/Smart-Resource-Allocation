import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: "auth",
    loadComponent: () =>
      import("./auth/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "",
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: "home",
        loadComponent: () =>
          import("./features/home/home.component").then((m) => m.HomeComponent),
      },
      {
        path: "needs-map",
        loadComponent: () =>
          import("./features/needs-map/needs-map.component").then(
            (m) => m.NeedsMapComponent,
          ),
      },
      {
        path: "tasks",
        loadComponent: () =>
          import("./features/tasks/tasks.component").then(
            (m) => m.TasksComponent,
          ),
      },
      {
        path: 'volunteers',
        loadComponent: () =>
          import('./features/volunteers/volunteers.component').then(
            (m) => m.VolunteersComponent,
          ),
      },
      {
        path: 'resource-vault',
        loadComponent: () =>
          import('./features/resource-vault/resource-vault.component').then(
            (m) => m.ResourceVaultComponent,
          ),
      },
      {
        path: 'ngo-registry',
        loadComponent: () =>
          import('./features/ngo-registry/ngo-registry.component').then(
            (m) => m.NgoRegistryComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then(
            (m) => m.SettingsComponent,
          ),
      },
      {
        path: "insights",
        loadComponent: () =>
          import("./features/insights/insights.component").then(
            (m) => m.InsightsComponent,
          ),
      },
      { path: "", redirectTo: "home", pathMatch: "full" },
    ],
  },
];
