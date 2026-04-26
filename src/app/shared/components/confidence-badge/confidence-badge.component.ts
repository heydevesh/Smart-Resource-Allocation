import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confidence-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="badge" [ngClass]="getConfidenceClass()">
      {{ (score() * 100).toFixed(0) }}% Match
    </div>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: var(--radius-badge);
      font-family: var(--font-ui);
      font-size: 0.75rem;
      font-weight: 600;
    }
    .high {
      background: var(--color-success-light);
      color: var(--color-success);
    }
    .medium {
      background: var(--color-warning-light);
      color: var(--color-warning);
    }
    .low {
      background: var(--color-danger-light);
      color: var(--color-danger);
    }
  `]
})
export class ConfidenceBadgeComponent {
  score = input.required<number>();

  getConfidenceClass(): string {
    const val = this.score();
    if (val >= 0.8) return 'high';
    if (val >= 0.5) return 'medium';
    return 'low';
  }
}
