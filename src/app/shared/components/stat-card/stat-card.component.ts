import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="stat-card">
      <div class="stat-header">
        <mat-icon class="stat-icon">{{ icon() }}</mat-icon>
      </div>
      <div class="stat-content">
        <p class="stat-value" [ngClass]="colorClass()">{{ value() }}</p>
        <h3 class="stat-title">{{ title() }}</h3>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--color-card);
      border-radius: var(--radius-card);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-width: 100px;
      height: 90px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid var(--color-border);
      box-sizing: border-box;
    }
    .stat-header {
      display: flex;
      justify-content: flex-end;
      width: 100%;
    }
    .stat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--color-text-hint);
    }
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      margin: 0;
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: bold;
      line-height: 1.2;
    }
    .stat-title {
      margin: 4px 0 0;
      font-family: var(--font-ui);
      font-size: 11px;
      color: var(--color-text-secondary);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    /* Text Colors for Values */
    .color-primary { color: var(--color-primary); }
    .color-warning { color: var(--color-warning); }
    .color-danger { color: var(--color-danger); }
    .color-success { color: var(--color-success); }
    .color-info { color: var(--color-info); }
  `]
})
export class StatCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  icon = input.required<string>();
  colorClass = input<string>('color-primary');
}
