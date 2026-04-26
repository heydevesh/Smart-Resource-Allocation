import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Task, Volunteer } from '../../models';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    RelativeTimePipe
  ],
  template: `
    <div class="detail-container" *ngIf="task">
      <header class="header">
        <div class="header-main">
          <span class="id">#TSK-{{ task.id.slice(0, 4).toUpperCase() }}</span>
          <h2 mat-dialog-title>{{ task.title }}</h2>
        </div>
        <button mat-icon-button (click)="close()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <mat-dialog-content>
        <div class="badges">
          <span class="badge priority" [ngClass]="task.priority">{{ task.priority }}</span>
          <span class="badge category">{{ task.category }}</span>
          <span class="badge status" [ngClass]="task.status">{{ task.status }}</span>
        </div>

        <section class="info-section">
          <h3>Description</h3>
          <p class="description">{{ task.description }}</p>
        </section>

        <section class="info-section">
          <h3>Location</h3>
          <div class="location">
            <mat-icon>location_on</mat-icon>
            <span>{{ task.locationName }}</span>
          </div>
        </section>

        <section class="info-section">
          <h3>Progress ({{ task.progress }}%)</h3>
          <mat-progress-bar mode="determinate" [value]="task.progress" [color]="getProgressColor()"></mat-progress-bar>
        </section>

        <section class="info-section">
          <h3>Deployed Task Force</h3>
          <div class="volunteers-list">
            <div *ngFor="let id of task.volunteerIds" class="volunteer-pill">
              <mat-icon>person</mat-icon>
              <span>{{ id }}</span>
            </div>
            <div *ngIf="task.volunteerIds.length === 0" class="empty-state">
              No volunteers assigned yet.
            </div>
          </div>
        </section>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button *ngIf="task.status === 'pending'" (click)="updateStatus('active')">
          Start Operation
        </button>
        <button mat-stroked-button *ngIf="task.status === 'active'" (click)="updateStatus('completed')">
          Complete Operation
        </button>
        <button mat-flat-button color="primary" class="match-btn">
          <mat-icon>smart_toy</mat-icon>
          AI Match Volunteers
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .detail-container { padding: 12px; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .header-main h2 { margin: 0; font-family: var(--font-display); color: var(--color-primary); }
    .id { font-size: 12px; color: var(--color-text-hint); font-weight: 600; }
    
    .badges { display: flex; gap: 8px; margin-bottom: 24px; }
    .badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 20px;
    }
    .priority.critical { background: var(--color-danger-light); color: var(--color-danger); }
    .status.active { background: var(--color-primary-light); color: var(--color-primary); }
    .status.completed { background: var(--color-success-light); color: var(--color-success); }
    
    .info-section { margin-bottom: 24px; }
    .info-section h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
    }
    .description { font-size: 14px; line-height: 1.6; color: var(--color-text-primary); }
    .location { display: flex; align-items: center; gap: 8px; color: var(--color-text-secondary); }
    
    .volunteers-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .volunteer-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
    }
    .volunteer-pill mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .empty-state { font-size: 13px; color: var(--color-text-hint); font-style: italic; }

    .match-btn {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-mid));
      color: white;
      border-radius: 9px;
    }
  `]
})
export class TaskDetailComponent {
  private firestore = inject(FirestoreService);
  private dialogRef = inject(MatDialogRef<TaskDetailComponent>);
  data = inject(MAT_DIALOG_DATA);
  task: Task = this.data.task;

  close() {
    this.dialogRef.close();
  }

  getProgressColor(): string {
    if (this.task.status === 'completed') return 'accent';
    return 'primary';
  }

  async updateStatus(status: 'pending' | 'active' | 'completed') {
    try {
      await this.firestore.updateTask(this.task.id, { 
        status,
        progress: status === 'completed' ? 100 : (status === 'active' ? 10 : 0),
        completedAt: status === 'completed' ? new Date() as any : null
      });
      
      await this.firestore.logActivity({
        type: status === 'completed' ? 'task_resolved' : 'task_updated',
        text: status === 'completed' ? 
          `Operation <b>${this.task.title}</b> successfully resolved.` : 
          `Operation <b>${this.task.title}</b> shifted to In Progress.`,
        dotClass: status === 'completed' ? 'bg-success' : 'bg-warning',
        userId: 'admin' // Placeholder
      });

      this.task.status = status;
      if (status === 'completed') this.task.progress = 100;
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }
}
