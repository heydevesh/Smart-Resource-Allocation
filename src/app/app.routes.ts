import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { permissionGuard } from './core/auth/role.guard';
import { AppShellComponent } from './app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: "auth",
    loadComponent: () =>
      import("./auth/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./auth/register/register.component").then((m) => m.RegisterComponent),
  },
  {
    path: "",
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: "home",
        canActivate: [permissionGuard('view_home')],
        loadComponent: () =>
          import("./features/home/home.component").then((m) => m.HomeComponent),
      },
      {
        path: "needs-map",
        canActivate: [permissionGuard('view_map')],
        loadComponent: () =>
          import("./features/needs-map/needs-map.component").then(
            (m) => m.NeedsMapComponent,
          ),
      },
      {
        path: "tasks",
        canActivate: [permissionGuard('view_tasks')],
        loadComponent: () =>
          import("./features/tasks/tasks.component").then(
            (m) => m.TasksComponent,
          ),
      },
      {
        path: 'volunteers',
        canActivate: [permissionGuard(['view_team_profiles', 'view_all_volunteers'])],
        loadComponent: () =>
          import('./features/volunteers/volunteers.component').then(
            (m) => m.VolunteersComponent,
          ),
      },
      {
        path: 'resource-vault',
        canActivate: [permissionGuard('view_inventory')],
        loadComponent: () =>
          import('./features/resource-vault/resource-vault.component').then(
            (m) => m.ResourceVaultComponent,
          ),
      },
      {
        path: 'ngo-registry',
        canActivate: [permissionGuard('view_registry')],
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
        path: 'insights',
        canActivate: [permissionGuard(['view_insights_own', 'view_insights_team', 'view_insights_ngo'])],
        loadComponent: () =>
          import("./features/insights/insights.component").then(
            (m) => m.InsightsComponent,
          ),
      },
      {
        path: 'verification-status',
        canActivate: [permissionGuard('view_application_status')],
        loadComponent: () =>
          import('./features/verification-status/verification-status.component').then(
            (m) => m.VerificationStatusComponent,
          ),
      },
      { path: "", redirectTo: "home", pathMatch: "full" },
    ],
  },

  // ── Error pages (outside AppShell, no auth guard) ─────────────
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/errors/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];

