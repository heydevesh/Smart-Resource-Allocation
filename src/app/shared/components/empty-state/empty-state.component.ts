import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
      <h3 class="empty-title">{{ title() }}</h3>
      <p class="empty-message">{{ message() }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: var(--color-text-secondary);
    }
    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: var(--color-text-hint);
    }
    .empty-title {
      font-family: var(--font-display);
      font-size: 1.25rem;
      margin: 0 0 8px;
      color: var(--color-text-primary);
    }
    .empty-message {
      font-family: var(--font-ui);
      font-size: 0.875rem;
      margin: 0 0 16px;
      max-width: 300px;
    }
  `]
})
export class EmptyStateComponent {
  icon = input<string>('inbox');
  title = input<string>('No data found');
  message = input<string>('There is nothing to display here at the moment.');
}
