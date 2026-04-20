import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Volunteer } from '../../models';

@Component({
  selector: 'app-volunteer-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="profile-container" *ngIf="volunteer">
      <header class="header">
        <div class="avatar">
          <mat-icon>person</mat-icon>
        </div>
        <div class="header-info">
          <h2 mat-dialog-title>{{ volunteer.name }}</h2>
          <span class="phone">{{ volunteer.phone }}</span>
        </div>
        <button mat-icon-button (click)="close()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <mat-dialog-content>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="value">{{ volunteer.tasksCompleted }}</span>
            <span class="label">Missions</span>
          </div>
          <div class="stat-card">
            <span class="value">{{ volunteer.rating }}</span>
            <span class="label">Rating</span>
          </div>
          <div class="stat-card">
            <span class="value">{{ volunteer.totalHours }}h</span>
            <span class="label">Contributed</span>
          </div>
        </div>

        <section class="info-section">
          <h3>Skills & Expertise</h3>
          <mat-chip-set>
            <mat-chip *ngFor="let skill of volunteer.skills">{{ skill }}</mat-chip>
          </mat-chip-set>
        </section>

        <section class="info-section">
          <h3>Languages</h3>
          <div class="languages">
            <span *ngFor="let lang of volunteer.languages" class="lang-tag">{{ lang }}</span>
          </div>
        </section>

        <section class="info-section">
          <h3>Achievement Badges</h3>
          <div class="badges-row">
            <div *ngFor="let badge of volunteer.badges" class="badge-icon" [title]="badge">
              <mat-icon color="primary">workspace_premium</mat-icon>
              <span>{{ badge }}</span>
            </div>
            <div *ngIf="volunteer.badges.length === 0" class="empty-msg">No badges earned yet.</div>
          </div>
        </section>

        <mat-divider></mat-divider>

        <section class="info-section mt-4">
          <div class="status-row">
            <span class="label">Availability Status</span>
            <span class="status-pill" [class.available]="volunteer.available">
              {{ volunteer.available ? 'Ready for Deployment' : 'Busy / Offline' }}
            </span>
          </div>
        </section>

        <mat-divider></mat-divider>

        <section class="info-section mt-4">
          <h3>Recent Activity</h3>
          <div class="activities-list">
            <div *ngFor="let activity of activities() | async" class="activity-item">
              <mat-icon class="activity-icon">history</mat-icon>
              <div class="activity-content">
                <p class="activity-desc">{{ activity.description }}</p>
                <span class="activity-time">{{ activity.timestamp.toDate() | date:'medium' }}</span>
              </div>
            </div>
            <div *ngIf="(activities() | async)?.length === 0" class="empty-msg">No recent activity recorded.</div>
          </div>
        </section>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button color="warn">Report Issue</button>
        <button mat-flat-button color="primary">Assign Mission</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .profile-container { padding: 8px; }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--color-primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary);
    }
    .avatar mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .header-info h2 { margin: 0; font-family: var(--font-display); line-height: 1.2; }
    .phone { font-size: 14px; color: var(--color-text-secondary); }
    .close-btn { position: absolute; top: 8px; right: 8px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--color-surface);
      padding: 12px;
      border-radius: 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
    }
    .stat-card .value { font-size: 18px; font-weight: 700; color: var(--color-primary); }
    .stat-card .label { font-size: 10px; color: var(--color-text-hint); text-transform: uppercase; }

    .info-section { margin-bottom: 24px; }
    .info-section h3 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-text-secondary);
      margin-bottom: 12px;
    }
    .lang-tag {
      display: inline-block;
      padding: 2px 8px;
      background: #f0f0f0;
      border-radius: 4px;
      font-size: 12px;
      margin-right: 8px;
    }
    .badges-row { display: flex; flex-wrap: wrap; gap: 16px; }
    .badge-icon { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .badge-icon span { font-size: 10px; font-weight: 600; }
    
    .status-row { display: flex; justify-content: space-between; align-items: center; }
    .status-pill {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
      background: #fee2e2;
      color: #991b1b;
    }
    .status-pill.available {
      background: var(--color-success-light);
      color: var(--color-success);
    }
    .mt-4 { margin-top: 16px; }
    .empty-msg { font-size: 12px; color: var(--color-text-hint); font-style: italic; }

    .activities-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .activity-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .activity-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--color-text-hint);
      margin-top: 2px;
    }
    .activity-desc {
      font-size: 13px;
      margin: 0;
      color: var(--color-text-primary);
    }
    .activity-time {
      font-size: 11px;
      color: var(--color-text-hint);
    }
  `]
})
export class VolunteerProfileComponent {
  private dialogRef = inject(MatDialogRef<VolunteerProfileComponent>);
  private firestore = inject(FirestoreService);
  
  volunteer: Volunteer = inject(MAT_DIALOG_DATA).volunteer;
  activities = signal(this.firestore.getVolunteerActivities(this.volunteer.id));

  close() {
    this.dialogRef.close();
  }
}
