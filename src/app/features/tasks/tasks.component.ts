import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TaskCardComponent } from '../../shared/components/task-card/task-card.component';
import { Task } from '../../models';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatButtonToggleModule, TaskCardComponent],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">Tasks</h1>
          <p class="page-subtitle">Manage operations and deployments.</p>
        </div>
        <button mat-fab class="add-button" color="primary">
          <mat-icon>add</mat-icon>
        </button>
      </header>

      <div class="controls">
        <mat-button-toggle-group [value]="filter()" (change)="filter.set($event.value)" class="custom-toggle">
          <mat-button-toggle value="active">Active</mat-button-toggle>
          <mat-button-toggle value="pending">Pending</mat-button-toggle>
          <mat-button-toggle value="completed">Completed</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <div class="task-list">
        <app-task-card *ngFor="let task of filteredTasks()" [task]="task"></app-task-card>
        
        <div class="empty-state" *ngIf="filteredTasks().length === 0">
          <mat-icon>assignment_turned_in</mat-icon>
          <p>No {{ filter() }} tasks found.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: var(--screen-pad);
      padding-bottom: 80px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .page-title {
      margin: 0;
      font-family: var(--font-display);
      font-size: 2rem;
      color: var(--color-text-primary);
    }
    .page-subtitle {
      margin: 4px 0 0;
      font-family: var(--font-ui);
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }
    .controls {
      margin-bottom: 24px;
      overflow-x: auto;
    }
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      color: var(--color-text-hint);
      text-align: center;
    }
    .empty-state mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    ::ng-deep .custom-toggle.mat-button-toggle-group {
      border-radius: 20px;
      border: 1px solid var(--color-border);
      box-shadow: none;
    }
    ::ng-deep .custom-toggle .mat-button-toggle-checked {
      background-color: var(--color-primary-light);
      color: var(--color-primary);
      font-weight: 500;
    }
  `]
})
export class TasksComponent {
  private firestore = inject(FirestoreService);
  
  tasks = toSignal(this.firestore.getAllTasks(), { initialValue: [] });
  filter = signal<string>('active');

  get filteredTasks() {
    return () => {
      const allTasks = this.tasks() || [];
      return allTasks.filter(t => t.status === this.filter());
    };
  }
}
