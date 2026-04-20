import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSlideToggleModule, MatButtonModule],
  template: `
    <div class="page-header">
      <div class="header-content">
        <p class="subtitle">Command Center • Mumbai</p>
        <h1 class="title">Settings</h1>
      </div>
    </div>

    <div class="settings-container">
      <section class="settings-section">
        <h2 class="section-title">Notifications</h2>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <mat-icon>notifications_active</mat-icon>
              <div>
                <h3>Critical Need Alerts</h3>
                <p>Get notified immediately when a critical need is reported in your ward.</p>
              </div>
            </div>
            <mat-slide-toggle [checked]="true"></mat-slide-toggle>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <mat-icon>group_add</mat-icon>
              <div>
                <h3>Volunteer Applications</h3>
                <p>Notifications for new NGO volunteer registrations.</p>
              </div>
            </div>
            <mat-slide-toggle [checked]="true"></mat-slide-toggle>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">Appearance</h2>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <mat-icon>dark_mode</mat-icon>
              <div>
                <h3>Dark Mode</h3>
                <p>Switch between light and dark themes.</p>
              </div>
            </div>
            <mat-slide-toggle></mat-slide-toggle>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <mat-icon>map</mat-icon>
              <div>
                <h3>Default Map View</h3>
                <p>Start with heatmap enabled on Crisis Map.</p>
              </div>
            </div>
            <mat-slide-toggle [checked]="true"></mat-slide-toggle>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">Account</h2>
        <div class="account-card">
          <div class="user-info">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUml2sqpUG8_ntDjxazoKw8YmbxygwzfMS5fVWpEhj1qqE92DjxZiImLEPFlsdiIj5qg7ls3Jprame7OSJRj7mGw0nNtn0Ftk3EFW5SvjtTXH5KjxYUkKPPvSkqfRNvqYldI3ZaPxEOIdjEbybjEqf367gYj4xDoQBSNQRP-vXXrVg6akRcU1Vn-iMJEixSGY820gTYhvG_rzMc24E4LZqocU-T8VqryfhfJYRYqTzERQsrscPEyi6CgKCFAaN4QtNs6Ihu8XN9Pan" alt="Profile">
            <div>
              <h3>Rahul Deshmukh</h3>
              <p>Regional Coordinator • Ward 4</p>
            </div>
          </div>
          <button mat-stroked-button color="warn" class="logout-btn">
            <mat-icon>logout</mat-icon>
            Sign Out
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 48px;
    }

    .subtitle {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }

    .title {
      font-family: var(--font-display);
      font-size: 48px;
      margin: 0;
      color: var(--color-text-primary);
    }

    .settings-container {
      max-width: 800px;
      display: flex;
      flex-direction: column;
      gap: 48px;
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 24px;
      margin-bottom: 20px;
      color: var(--color-text-primary);
    }

    .settings-list {
      background-color: white;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      border: 1px solid var(--color-border);
    }

    .setting-item {
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      display: flex;
      gap: 20px;
      align-items: flex-start;
    }

    .setting-info mat-icon {
      color: var(--color-primary);
      margin-top: 2px;
    }

    .setting-info h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .setting-info p {
      margin: 0;
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    .account-card {
      background-color: white;
      border-radius: 14px;
      padding: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      border: 1px solid var(--color-border);
    }

    .user-info {
      display: flex;
      gap: 24px;
      align-items: center;
    }

    .user-info img {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-info h3 {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 700;
    }

    .user-info p {
      margin: 0;
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    .logout-btn {
      border-radius: 8px !important;
    }
  `]
})
export class SettingsComponent {}
