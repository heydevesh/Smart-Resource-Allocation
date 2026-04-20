import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReportNeedComponent } from '../modals/report-need/report-need.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth/auth.service';
import { SearchService } from '../core/ui/search.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatDialogModule
  ],
  template: `
    <div class="shell-wrapper">
      <!-- Side Navigation -->
      <nav class="sidebar">
        <div class="sidebar-header">
          <div class="logo">Sahaay Sentinel</div>
          <div class="user-brief">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUml2sqpUG8_ntDjxazoKw8YmbxygwzfMS5fVWpEhj1qqE92DjxZiImLEPFlsdiIj5qg7ls3Jprame7OSJRj7mGw0nNtn0Ftk3EFW5SvjtTXH5KjxYUkKPPvSkqfRNvqYldI3ZaPxEOIdjEbybjEqf367gYj4xDoQBSNQRP-vXXrVg6akRcU1Vn-iMJEixSGY820gTYhvG_rzMc24E4LZqocU-T8VqryfhfJYRYqTzERQsrscPEyi6CgKCFAaN4QtNs6Ihu8XN9Pan" alt="Admin">
            <div class="user-text">
              <span class="name">Command & Compassion</span>
              <span class="role">Vanguard Access</span>
            </div>
          </div>
        </div>

        <ul class="nav-list">
          <li>
            <a routerLink="/needs-map" routerLinkActive="active" class="nav-link">
              <mat-icon>explore</mat-icon>
              <span>Crisis Map</span>
            </a>
          </li>
          <li>
            <a routerLink="/tasks" routerLinkActive="active" class="nav-link">
              <mat-icon>list_alt</mat-icon>
              <span>Task Force</span>
            </a>
          </li>
          <li>
            <a routerLink="/volunteers" routerLinkActive="active" class="nav-link">
              <mat-icon>diversity_3</mat-icon>
              <span>NGO Registry</span>
            </a>
          </li>
          <li>
            <a routerLink="/insights" routerLinkActive="active" class="nav-link">
              <mat-icon>insights</mat-icon>
              <span>Insights</span>
            </a>
          </li>
        </ul>

        <div class="sidebar-footer">
          <button mat-flat-button class="urgent-report-btn" (click)="openReportNeed()">
            Urgent Report
          </button>
          <a class="help-link">
            <mat-icon>help_outline</mat-icon>
            <span>Help Center</span>
          </a>
        </div>
      </nav>

      <!-- Main Content Container -->
      <div class="main-container">
        <!-- Top App Bar (Visible on all screens) -->
        <header class="top-bar">
          <div class="search-bar">
            <mat-icon>search</mat-icon>
            <input 
              type="text" 
              placeholder="Search across Dharavi grid..."
              [value]="searchService.searchTerm()"
              (input)="onSearch($event)">
          </div>
          
          <div class="top-actions">
            <button mat-icon-button class="action-btn">
              <mat-icon>notifications</mat-icon>
              <span class="notification-badge"></span>
            </button>
            <button mat-icon-button class="action-btn">
              <mat-icon class="ai-spark">colors_spark</mat-icon>
            </button>
            <div class="profile-avatar">
              <img [src]="user()?.photoURL || 'https://i.pravatar.cc/150?u=sahaay'" alt="Profile">
            </div>
          </div>
        </header>

        <!-- Dynamic Page Content -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>


        <!-- Mobile Bottom Nav -->
        <div class="bottom-nav hidden-desktop">
          <a routerLink="/home" routerLinkActive="active" class="bottom-nav-item">
            <mat-icon>dashboard</mat-icon>
            <span>Home</span>
          </a>
          <a routerLink="/needs-map" routerLinkActive="active" class="bottom-nav-item">
            <mat-icon>explore</mat-icon>
            <span>Map</span>
          </a>
          <a routerLink="/tasks" routerLinkActive="active" class="bottom-nav-item">
            <mat-icon>list_alt</mat-icon>
            <span>Tasks</span>
          </a>
          <a routerLink="/volunteers" routerLinkActive="active" class="bottom-nav-item">
            <mat-icon>diversity_3</mat-icon>
            <span>NGO</span>
          </a>
          <a routerLink="/insights" routerLinkActive="active" class="bottom-nav-item">
            <mat-icon>insights</mat-icon>
            <span>Insights</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shell-wrapper {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background-color: var(--color-surface);
    }

    /* Sidebar Styles */
    .sidebar {
      width: 260px;
      height: 100%;
      background-color: #f9f9f8;
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      padding: 32px 16px;
      z-index: 50;
    }

    .sidebar-header {
      padding: 0 16px;
      margin-bottom: 40px;
    }

    .logo {
      font-family: var(--font-display);
      font-size: 32px;
      margin: 0;
      color: var(--color-primary);
      font-weight: 900;
    }

    .ward-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-secondary);
      letter-spacing: 1px;
      margin-top: 4px;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      flex-grow: 1;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      border-radius: 12px;
      text-decoration: none;
      color: var(--color-text-secondary);
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s ease;
      margin-bottom: 4px;
    }

    .nav-link mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .nav-link:hover {
      background-color: white;
      color: var(--color-primary);
    }

    .nav-link.active {
      background-color: white;
      color: var(--color-primary);
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    .sidebar-footer {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 24px;
    }

    .urgent-report-btn {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-mid));
      color: white !important;
      border-radius: 10px;
      height: 48px;
      font-weight: 600;
    }

    .help-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      font-size: 13px;
      color: var(--color-text-secondary);
      text-decoration: none;
    }

    /* Main Container Styles */
    .main-container {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    .top-bar {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      background-color: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--color-border);
      z-index: 40;
    }

    .search-bar {
      display: flex;
      align-items: center;
      background-color: var(--color-surface-container-low);
      border-radius: 10px;
      padding: 8px 16px;
      width: 400px;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    .search-bar:focus-within {
      background-color: white;
      border-color: var(--color-primary-mid);
      box-shadow: 0 0 0 4px var(--color-primary-light);
    }

    .search-bar mat-icon {
      color: var(--color-text-hint);
      margin-right: 8px;
    }

    .search-bar input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 14px;
      width: 100%;
      color: var(--color-text-primary);
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .action-btn {
      color: var(--color-text-secondary);
      position: relative;
    }

    .notification-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 8px;
      height: 8px;
      background-color: var(--color-danger);
      border-radius: 50%;
      border: 2px solid white;
    }

    .ai-spark {
      color: #742fe5;
    }

    .profile-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid var(--color-primary-light);
    }

    .profile-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .page-content {
      flex-grow: 1;
      overflow-y: auto;
      padding: 32px;
    }

    /* Bottom Nav (Mobile) */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 65px;
      background-color: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-top: 1px solid var(--color-border);
      z-index: 100;
      padding-bottom: env(safe-area-inset-bottom);
    }

    .bottom-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: var(--color-text-hint);
      font-size: 10px;
      font-weight: 600;
    }

    .bottom-nav-item.active {
      color: var(--color-primary);
    }

    /* Responsive Queries */
    @media (max-width: 768px) {
      .hidden-mobile { display: none !important; }
      .top-bar { padding: 0 16px; }
      .search-bar { width: auto; flex-grow: 1; margin-right: 12px; }
      .page-content { padding: 16px; padding-bottom: 80px; }
    }

    @media (min-width: 769px) {
      .hidden-desktop { display: none !important; }
    }
  `]
})
export class AppShellComponent {
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);
  protected searchService = inject(SearchService);
  user = toSignal(this.auth.currentUser$);

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchService.setSearchTerm(input.value);
  }

  openReportNeed() {
    this.dialog.open(ReportNeedComponent, {
      width: '500px',
      disableClose: true
    });
  }
}

