import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReportNeedComponent } from '../modals/report-need/report-need.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth/auth.service';
import { SearchService } from '../core/ui/search.service';
import { FcmService } from '../core/firebase/fcm.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AiChatComponent } from '../shared/components/ai-chat/ai-chat.component';
import { OfflineBannerComponent } from '../shared/components/offline-banner/offline-banner.component';

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
    MatDialogModule,
    MatMenuModule,
    MatSidenavModule,
    AiChatComponent,
    OfflineBannerComponent
  ],
  template: `
    <app-offline-banner></app-offline-banner>
    <mat-sidenav-container class="shell-wrapper">
      <mat-sidenav #chatSidenav mode="over" position="end" class="chat-sidenav">
        <app-ai-chat></app-ai-chat>
      </mat-sidenav>

      <mat-sidenav-content class="shell-content">
        <!-- Side Navigation -->
        <nav class="sidebar">
          <div class="sidebar-header">
            <h1 class="logo">Sahaay</h1>
            <p class="ward-label">MUMBAI WARD - 4</p>
          </div>

          <ul class="nav-list">
            @if (auth.hasPermission('view_home')) {
              <li>
                <a routerLink="/home" routerLinkActive="active" class="nav-link">
                  <mat-icon fontSet="material-symbols-rounded">space_dashboard</mat-icon>
                  <span>Command Center</span>
                </a>
              </li>
            }
            @if (auth.hasPermission('view_map')) {
              <li>
                <a routerLink="/needs-map" routerLinkActive="active" class="nav-link">
                  <mat-icon fontSet="material-symbols-rounded">map</mat-icon>
                  <span>Crisis Map</span>
                </a>
              </li>
            }
            @if (auth.hasPermission('view_tasks')) {
              <li>
                <a routerLink="/tasks" routerLinkActive="active" class="nav-link">
                  <mat-icon fontSet="material-symbols-rounded">task</mat-icon>
                  <span>Task Force</span>
                </a>
              </li>
            }
            @if (auth.hasPermission('view_all_volunteers') || auth.hasPermission('view_team_profiles')) {
              <li>
                <a routerLink="/volunteers" routerLinkActive="active" class="nav-link">
                  <mat-icon fontSet="material-symbols-rounded">group</mat-icon>
                  <span>Volunteers</span>
                </a>
              </li>
            }
            @if (auth.hasPermission('view_registry')) {
              <li>
                <a routerLink="/ngo-registry" routerLinkActive="active" class="nav-link">
                  <mat-icon fontSet="material-symbols-rounded">volunteer_activism</mat-icon>
                  <span>NGO Registry</span>
                </a>
              </li>
            }
            @if (auth.hasPermission('view_inventory')) {
              <li>
                <a routerLink="/resource-vault" routerLinkActive="active" class="nav-link">
                  <mat-icon fontSet="material-symbols-rounded">inventory_2</mat-icon>
                  <span>Resource Vault</span>
                </a>
              </li>
            }
            @if (auth.hasPermission('view_insights_own') || auth.hasPermission('view_insights_team') || auth.hasPermission('view_insights_ngo')) {
              <li>
                <a routerLink="/insights" routerLinkActive="active" class="nav-link">
                  <mat-icon fontSet="material-symbols-rounded">insights</mat-icon>
                  <span>Insights</span>
                </a>
              </li>
            }
            @if (auth.hasPermission('view_application_status')) {
              <li>
                <a routerLink="/verification-status" routerLinkActive="active" class="nav-link">
                  <mat-icon fontSet="material-symbols-rounded">verified_user</mat-icon>
                  <span>Status</span>
                </a>
              </li>
            }
            <li>
              <a routerLink="/settings" routerLinkActive="active" class="nav-link">
                <mat-icon fontSet="material-symbols-rounded">settings</mat-icon>
                <span>Settings</span>
              </a>
            </li>
          </ul>

          <div class="sidebar-footer">
            @if (auth.hasPermission('create_need')) {
              <button mat-flat-button class="urgent-report-btn" (click)="openReportNeed()">
                <mat-icon fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">add_alert</mat-icon>
                Urgent Report
              </button>
            }
            <a class="help-link">
              <mat-icon fontSet="material-symbols-rounded">help_outline</mat-icon>
              <span>Help Center</span>
            </a>
            <div class="org-logo-section">
              <div class="org-avatar">OL</div>
              <div>
                <p class="org-name">Organization Logo</p>
              </div>
            </div>
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
              <button mat-icon-button class="action-btn" (click)="chatSidenav.toggle()">
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
            @if (auth.hasPermission('view_home')) {
              <a routerLink="/home" routerLinkActive="active" class="bottom-nav-item">
                <mat-icon fontSet="material-symbols-rounded">space_dashboard</mat-icon>
                <span>Home</span>
              </a>
            }
            @if (auth.hasPermission('view_map')) {
              <a routerLink="/needs-map" routerLinkActive="active" class="bottom-nav-item">
                <mat-icon fontSet="material-symbols-rounded">map</mat-icon>
                <span>Map</span>
              </a>
            }
            @if (auth.hasPermission('view_tasks')) {
              <a routerLink="/tasks" routerLinkActive="active" class="bottom-nav-item">
                <mat-icon fontSet="material-symbols-rounded">task</mat-icon>
                <span>Tasks</span>
              </a>
            }
            @if (auth.hasPermission('view_inventory')) {
              <a routerLink="/resource-vault" routerLinkActive="active" class="bottom-nav-item">
                <mat-icon fontSet="material-symbols-rounded">inventory_2</mat-icon>
                <span>Vault</span>
              </a>
            }
            <a routerLink="/settings" routerLinkActive="active" class="bottom-nav-item">
              <mat-icon fontSet="material-symbols-rounded">settings</mat-icon>
              <span>Settings</span>
            </a>
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell-wrapper {
      height: 100vh;
      width: 100vw;
      background-color: var(--color-surface);
    }
    
    .chat-sidenav {
      width: 400px;
      max-width: 100vw;
      border-left: 1px solid var(--color-border);
    }

    .shell-content {
      display: flex;
      height: 100%;
      overflow: hidden;
    }


    /* Sidebar Styles */
    .sidebar {
      width: 260px;
      height: 100%;
      background-color: #f9f9f8;
      border-right: 1px solid rgba(0, 81, 71, 0.1);
      display: flex;
      flex-direction: column;
      padding: 32px 16px;
      z-index: 50;
    }

    .sidebar-header {
      padding: 0 16px;
      margin-bottom: 24px;
    }

    .logo {
      font-family: var(--font-display), serif;
      font-size: 32px;
      margin: 0;
      color: var(--color-primary, #005147);
      font-weight: 900;
      letter-spacing: -0.02em;
    }

    .ward-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--color-on-surface-variant, #3e4946);
      letter-spacing: 0.15em;
      margin-top: 4px;
      text-transform: uppercase;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      text-decoration: none;
      color: var(--color-on-surface-variant, #3e4946);
      font-size: 11px;
      font-weight: 600;
      transition: all 0.15s ease;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .nav-link mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .nav-link:hover {
      background-color: var(--color-card);
      color: var(--color-primary, #005147);
    }

    .nav-link.active {
      background: linear-gradient(90deg, var(--color-primary, #005147), var(--color-primary-container, #0a6b5e));
      color: white;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(0, 81, 71, 0.15);
      transform: scale(1.02);
    }

    .nav-link.active mat-icon {
      font-variation-settings: 'FILL' 1;
    }

    .sidebar-footer {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid var(--color-outline-variant, #bec9c5);
    }

    .urgent-report-btn {
      background: linear-gradient(135deg, var(--color-primary, #005147), var(--color-primary-container, #0a6b5e));
      color: white !important;
      border-radius: 10px;
      height: 44px;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 12px 32px rgba(0, 81, 71, 0.15);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      mat-icon { font-size: 20px; }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 16px 40px rgba(0, 81, 71, 0.2);
      }
    }

    .help-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-on-surface-variant, #3e4946);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: var(--color-card);
        color: var(--color-primary, #005147);
      }

      mat-icon { font-size: 20px; }
    }

    .org-logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 10px;
      background: var(--color-card);
      box-shadow: 0 2px 8px rgba(0, 81, 71, 0.06);

      .org-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--color-primary-fixed, #a1f2e1), var(--color-primary-fixed-dim, #85d5c5));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 800;
        color: var(--color-on-primary-fixed, #00201b);
      }

      .org-name {
        font-size: 11px;
        font-weight: 700;
        color: var(--color-primary, #005147);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
      }
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
      background-color: var(--color-card);
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
      border: 2px solid var(--color-card);
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
      height: 68px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98));
      backdrop-filter: blur(16px);
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-top: 1px solid var(--color-outline-variant, #bec9c5);
      box-shadow: 0 -4px 20px rgba(0, 81, 71, 0.08);
      z-index: 100;
      padding-bottom: max(0px, env(safe-area-inset-bottom));
    }

    .bottom-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      text-decoration: none;
      color: var(--color-on-surface-variant, #3e4946);
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.15s ease;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        transition: all 0.15s ease;
      }

      &:hover {
        background: rgba(0, 81, 71, 0.05);
        color: var(--color-primary, #005147);
      }
    }

    .bottom-nav-item.active {
      color: var(--color-primary, #005147);

      mat-icon {
        font-variation-settings: 'FILL' 1;
        transform: scale(1.1);
      }
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
  protected auth = inject(AuthService);
  private dialog = inject(MatDialog);
  protected searchService = inject(SearchService);
  private fcm = inject(FcmService);
  user = toSignal(this.auth.currentUser$);

  constructor() {
    this.fcm.init();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchService.setSearchTerm(input.value);
  }

  openReportNeed() {
    this.dialog.open(ReportNeedComponent, {
      width: '650px',
      maxWidth: '90vw',
      disableClose: true,
      panelClass: 'glass-dialog'
    });
  }
}


