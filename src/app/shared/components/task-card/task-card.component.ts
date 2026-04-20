import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Task } from '../../../models';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RelativeTimePipe],
  template: `
    <div class="card" 
         [class.overdue]="isOverdue()"
         [ngClass]="task().status"
         (click)="cardClick.emit(task())">
      <div class="status-border" [style.background-color]="getStatusColor()"></div>
      
      <div class="card-header">
        <span class="task-id">#TSK-{{ task().id.slice(0, 4).toUpperCase() }}</span>
        <span class="priority-badge" [ngClass]="task().priority">
          <mat-icon *ngIf="isOverdue()">timer</mat-icon>
          {{ isOverdue() ? 'OVERDUE' : task().priority }}
        </span>
      </div>

      <h4 class="card-title">{{ task().title }}</h4>

      <div class="card-meta">
        <div class="meta-item">
          <mat-icon>location_on</mat-icon>
          <span class="truncate">{{ task().locationName }}</span>
        </div>
        <div class="meta-item" *ngIf="task().category">
          <mat-icon>category</mat-icon>
          <span>{{ task().category }}</span>
        </div>
      </div>

      <div class="progress-section" *ngIf="task().status !== 'pending' && task().status !== 'completed'">
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="task().progress" [style.background-color]="getStatusColor()"></div>
        </div>
      </div>

      <div class="card-footer">
        <div class="assignee">
          <ng-container *ngIf="task().volunteerIds.length > 0; else unassigned">
            <div class="avatar-stack">
              <div class="avatar" *ngFor="let id of task().volunteerIds.slice(0, 3)">
                {{ id.slice(0, 1).toUpperCase() }}
              </div>
              <div class="avatar-more" *ngIf="task().volunteerIds.length > 3">
                +{{ task().volunteerIds.length - 3 }}
              </div>
            </div>
            <span class="assignee-text">{{ task().volunteerIds.length }} assigned</span>
          </ng-container>
          <ng-template #unassigned>
            <div class="unassigned-badge">Unassigned</div>
          </ng-template>
        </div>
        
        <span class="time-meta">
          {{ task().status === 'completed' ? 'Closed' : 'Due' }} {{ (task().completedAt || task().dueAt) | relativeTime }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: var(--color-surface-container-lowest, #ffffff);
      border-radius: 14px;
      padding: 16px;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      border: 1px solid var(--color-border);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .card:hover {
      background: var(--color-surface-container-high, #f5f5f5);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .status-border {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .task-id {
      font-size: 11px;
      font-weight: 500;
      color: var(--color-text-secondary);
      background: var(--color-surface-container);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .priority-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 8px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .priority-badge mat-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }

    .priority-badge.high, .priority-badge.critical {
      background: rgba(220, 38, 38, 0.1);
      color: var(--color-danger);
    }

    .priority-badge.medium {
      background: rgba(217, 119, 6, 0.1);
      color: var(--color-warning);
    }

    .priority-badge.low {
      background: rgba(22, 163, 74, 0.1);
      color: var(--color-success);
    }

    .card.overdue .priority-badge {
      background: var(--color-danger);
      color: white;
    }

    .card-title {
      margin: 0 0 12px;
      font-family: var(--font-ui);
      font-size: 14px;
      font-weight: 600;
      line-height: 1.4;
      color: var(--color-text-primary);
    }

    .card-meta {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    .meta-item mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: var(--color-text-hint);
    }

    .progress-section {
      margin-bottom: 16px;
    }

    .progress-bar {
      height: 6px;
      background: var(--color-border);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 12px;
      border-top: 1px solid var(--color-border);
    }

    .assignee {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .avatar-stack {
      display: flex;
      align-items: center;
    }

    .avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      border: 2px solid white;
      font-size: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: -8px;
    }

    .avatar:first-child {
      margin-left: 0;
    }

    .avatar-more {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--color-surface-container-high);
      color: var(--color-text-secondary);
      border: 2px solid white;
      font-size: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: -8px;
    }

    .assignee-text {
      font-size: 12px;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .unassigned-badge {
      font-size: 11px;
      color: var(--color-text-secondary);
      background: var(--color-surface-container);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .time-meta {
      font-size: 11px;
      color: var(--color-text-hint);
    }

    /* Status specific styles */
    .card.completed {
      opacity: 0.8;
    }

    .card.completed .card-title {
      text-decoration: line-through;
      color: var(--color-text-hint);
    }
  `]
})
export class TaskCardComponent {
  task = input.required<Task>();
  cardClick = output<Task>();

  isOverdue(): boolean {
    const task = this.task();
    if (task.status === 'completed') return false;
    return task.dueAt.toDate() < new Date();
  }

  getStatusColor(): string {
    const task = this.task();
    if (this.isOverdue()) return 'var(--color-danger)';
    
    switch (task.status) {
      case 'pending': return 'var(--color-warning)';
      case 'active': 
      case 'in_progress': return 'var(--color-primary)';
      case 'completed': return 'var(--color-success)';
      default: return 'var(--color-border)';
    }
  }
}
