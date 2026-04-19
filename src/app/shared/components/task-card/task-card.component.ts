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
    <div class="card" (click)="cardClick.emit(task())">
      <div class="card-header">
        <span class="category-badge" [ngClass]="task().category">{{ task().category }}</span>
        <span class="priority-badge" [ngClass]="task().priority">{{ task().priority }}</span>
      </div>
      <h3 class="card-title">{{ task().title }}</h3>
      <div class="card-meta">
        <span><mat-icon>location_on</mat-icon> {{ task().locationName }}</span>
        <span><mat-icon>schedule</mat-icon> Due {{ task().dueAt | relativeTime }}</span>
      </div>
      
      <div class="progress-container" *ngIf="task().progress > 0">
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="task().progress"></div>
        </div>
        <span class="progress-text">{{ task().progress }}%</span>
      </div>
      
      <div class="card-footer">
        <div class="volunteers">
          <mat-icon>people</mat-icon> {{ task().volunteerIds.length }} assigned
        </div>
        <span class="status" [ngClass]="task().status">{{ task().status }}</span>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: var(--color-card);
      border-radius: var(--radius-card);
      padding: var(--card-pad-v) var(--card-pad-h);
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border: 1px solid var(--color-border);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .category-badge, .priority-badge, .status {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: var(--radius-badge);
      text-transform: uppercase;
      font-weight: 600;
    }
    .category-badge { background: var(--color-info-light); color: var(--color-info); }
    .priority-badge.high, .priority-badge.critical { background: var(--color-danger-light); color: var(--color-danger); }
    .priority-badge.medium { background: var(--color-warning-light); color: var(--color-warning); }
    .priority-badge.low { background: var(--color-success-light); color: var(--color-success); }
    
    .card-title {
      margin: 0 0 8px;
      font-size: 1rem;
      font-family: var(--font-display);
    }
    .card-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      margin-bottom: 12px;
    }
    .card-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .card-meta mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .progress-container {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .progress-bar {
      flex: 1;
      height: 6px;
      background: var(--color-border);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--color-primary);
      transition: width 0.3s ease;
    }
    .progress-text {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--color-text-secondary);
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--color-border);
      padding-top: 8px;
      font-size: 0.8rem;
    }
    .volunteers {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--color-text-secondary);
    }
    .volunteers mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .status.active { color: var(--color-primary); }
    .status.pending { color: var(--color-warning); }
    .status.completed { color: var(--color-success); }
    .status.escalated { color: var(--color-danger); }
  `]
})
export class TaskCardComponent {
  task = input.required<Task>();
  cardClick = output<Task>();
}
