import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { StorageService } from '../../core/firebase/storage.service';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/ui/theme.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, MatSlideToggleModule, 
    MatButtonModule, MatInputModule, MatFormFieldModule, 
    FormsModule, MatSnackBarModule
  ],
  template: `
    <div class="page-header">
      <div class="header-content">
        <p class="subtitle">Command Center • Mumbai</p>
        <h1 class="title">Settings</h1>
      </div>
    </div>

    <div class="settings-container">
      <section class="settings-section">
        <h2 class="section-title">Account</h2>
        <div class="account-card" *ngIf="user() as u">
          <div class="user-info">
            <img [src]="u.photoURL || 'https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=' + u.displayName" alt="Profile">
            <div>
              <h3>{{ u.displayName || 'Unknown User' }}</h3>
              <p>{{ (u.role === 'ngo_founder' ? 'NGO Founder' : (u.role === 'ngo_admin' ? 'NGO Admin' : u.role)) | titlecase }} <span *ngIf="u.region">• {{ u.region }}</span></p>
            </div>
          </div>
          <button mat-stroked-button color="warn" class="logout-btn" (click)="signOut()">
            <mat-icon>logout</mat-icon>
            Sign Out
          </button>
        </div>
      </section>

      <!-- Organization Settings for NGO Admin/Founder -->
      <section class="settings-section" *ngIf="user()?.role === 'ngo_founder' || user()?.role === 'ngo_admin'">
        <h2 class="section-title">Organization Profile</h2>
        <div class="settings-list">
          <div class="setting-item" style="flex-direction: column; align-items: stretch; gap: 16px;">
            <div class="setting-info" style="align-items: center; justify-content: space-between; width: 100%;">
              <div style="display: flex; gap: 20px; align-items: center;">
                <img [src]="user()?.ngoLogoUrl || 'https://ui-avatars.com/api/?background=1d9e75&color=fff&name=' + (user()?.ngoAffiliation || 'NGO')" alt="Org Logo" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; border: 1px solid var(--color-border);">
                <div>
                  <h3>Organization Logo</h3>
                  <p>Upload a new logo for your organization.</p>
                </div>
              </div>
              <button mat-stroked-button (click)="fileInput.click()" [disabled]="isUploadingLogo()">
                <mat-icon>upload</mat-icon> {{ isUploadingLogo() ? 'Uploading...' : 'Upload' }}
              </button>
              <input type="file" #fileInput hidden accept="image/*" (change)="onLogoSelected($event)">
            </div>
          </div>
          
          <div class="setting-item" style="flex-direction: column; align-items: stretch; gap: 16px;">
            <div class="setting-info">
              <mat-icon>corporate_fare</mat-icon>
              <div>
                <h3>Organization Name</h3>
                <p>The display name of your NGO across the platform.</p>
              </div>
            </div>
            <div style="display: flex; gap: 16px; margin-top: 8px;">
              <mat-form-field appearance="outline" style="flex: 1; margin-bottom: -16px;">
                <mat-label>Organization Name</mat-label>
                <input matInput [(ngModel)]="editOrgName">
              </mat-form-field>
              <button mat-flat-button class="save-org-btn" (click)="saveOrgName()" [disabled]="isSavingOrgName() || !editOrgName || editOrgName === user()?.ngoAffiliation">
                Save
              </button>
            </div>
          </div>
        </div>
      </section>

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
            <mat-slide-toggle [checked]="isDarkMode" (change)="toggleTheme()"></mat-slide-toggle>
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
      background-color: var(--color-card);
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
      background-color: var(--color-card);
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
      border: 1px solid var(--color-border);
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

    .save-org-btn {
      height: 56px;
      border-radius: 8px;
      background: var(--color-primary);
      color: white;
    }
    
    .save-org-btn:disabled {
      background: var(--color-border);
      color: var(--color-text-hint);
    }
  `]
})
export class SettingsComponent {
  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private storageService = inject(StorageService);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private snackBar = inject(MatSnackBar);

  user = toSignal(this.authService.currentUser$);
  isDarkMode = this.themeService.theme() === 'dark';

  editOrgName = '';
  isUploadingLogo = signal(false);
  isSavingOrgName = signal(false);

  constructor() {
    this.authService.currentUser$.subscribe(u => {
      if (u) {
        this.editOrgName = u.ngoAffiliation || '';
      }
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.theme() === 'dark';
  }

  async signOut() {
    await this.authService.signOut();
    this.router.navigate(['/auth']);
  }

  async onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    const u = this.user();
    if (file && u) {
      if (file.size > 2 * 1024 * 1024) {
        this.snackBar.open('File must be under 2MB', 'OK', { duration: 3000 });
        return;
      }

      this.isUploadingLogo.set(true);
      try {
        const path = `org_logos/${u.uid}_${Date.now()}_${file.name}`;
        const url = await this.storageService.uploadPhoto(file, path);
        await this.firestoreService.updateUserProfile(u.uid, { ngoLogoUrl: url });
        this.snackBar.open('Organization logo updated successfully!', 'OK', { duration: 3000 });
      } catch (error) {
        console.error('Failed to upload logo', error);
        this.snackBar.open('Failed to upload logo. Please try again.', 'OK', { duration: 3000 });
      } finally {
        this.isUploadingLogo.set(false);
      }
    }
  }

  async saveOrgName() {
    const u = this.user();
    if (u && this.editOrgName && this.editOrgName !== u.ngoAffiliation) {
      this.isSavingOrgName.set(true);
      try {
        await this.firestoreService.updateUserProfile(u.uid, { ngoAffiliation: this.editOrgName });
        this.snackBar.open('Organization name updated successfully!', 'OK', { duration: 3000 });
      } catch (error) {
        console.error('Failed to update org name', error);
        this.snackBar.open('Failed to update organization name.', 'OK', { duration: 3000 });
      } finally {
        this.isSavingOrgName.set(false);
      }
    }
  }
}
