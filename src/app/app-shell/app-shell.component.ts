import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatToolbarModule],
  template: `
    <div class="shell-container">
      <!-- Top App Bar -->
      <mat-toolbar color="primary" class="top-bar card-shadow">
        <span class="logo">Sahaay</span>
        <span class="spacer"></span>
        <button mat-icon-button aria-label="Notifications">
          <mat-icon>notifications</mat-icon>
        </button>
        <button mat-icon-button aria-label="User Profile">
          <mat-icon>account_circle</mat-icon>
        </button>
      </mat-toolbar>

      <!-- Main Content Area -->
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>

      <!-- Bottom Navigation for Mobile-first -->
      <div class="bottom-nav glass-panel">
        <a routerLink="/home" routerLinkActive="active-link" class="nav-item">
          <mat-icon>dashboard</mat-icon>
          <span>Home</span>
        </a>
        <a routerLink="/needs-map" routerLinkActive="active-link" class="nav-item">
          <mat-icon>map</mat-icon>
          <span>Map</span>
        </a>
        <a routerLink="/tasks" routerLinkActive="active-link" class="nav-item">
          <mat-icon>assignment</mat-icon>
          <span>Tasks</span>
        </a>
        <a routerLink="/volunteers" routerLinkActive="active-link" class="nav-item">
          <mat-icon>people</mat-icon>
          <span>Volunteers</span>
        </a>
        <a routerLink="/insights" routerLinkActive="active-link" class="nav-item">
          <mat-icon>insights</mat-icon>
          <span>Insights</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .shell-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background-color: var(--color-surface);
    }
    .top-bar {
      z-index: 10;
      background-color: var(--color-primary);
      color: white;
    }
    .logo {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--screen-pad);
      padding-bottom: 80px; /* space for bottom nav */
    }
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 65px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding-bottom: env(safe-area-inset-bottom);
      z-index: 100;
      border-top-left-radius: var(--radius-card);
      border-top-right-radius: var(--radius-card);
    }
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: var(--color-text-hint);
      font-size: 0.75rem;
      font-weight: 500;
      transition: all 0.2s ease;
      padding: 8px;
      min-width: 60px;
    }
    .nav-item mat-icon {
      margin-bottom: 2px;
      transition: transform 0.2s ease;
    }
    .active-link {
      color: var(--color-primary);
    }
    .active-link mat-icon {
      transform: translateY(-2px);
      color: var(--color-primary-mid);
    }
  `]
})
export class AppShellComponent {}
