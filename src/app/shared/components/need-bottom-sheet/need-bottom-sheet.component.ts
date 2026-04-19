import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Need } from '../../../models';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

@Component({
  selector: 'app-need-bottom-sheet',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RelativeTimePipe],
  template: `
    <div class="bottom-sheet-container">
      <div class="sheet-header">
        <h2 class="title">{{ data.need.title }}</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="badges">
        <span class="category-badge">{{ data.need.category }}</span>
        <span class="urgency-badge" [ngClass]="data.need.urgency">{{ data.need.urgency }}</span>
        <span class="status-badge" [ngClass]="data.need.status">{{ data.need.status }}</span>
      </div>

      <div class="section">
        <p class="description" *ngIf="data.need.summary"><strong>Summary:</strong> {{ data.need.summary }}</p>
        <p class="description"><strong>Details:</strong> {{ data.need.description }}</p>
        <p class="description" *ngIf="data.need.descriptionHindi"><strong>Hindi:</strong> {{ data.need.descriptionHindi }}</p>
      </div>

      <div class="meta-info">
        <div class="meta-item">
          <mat-icon>location_on</mat-icon>
          <span>{{ data.need.locationName }}</span>
        </div>
        <div class="meta-item">
          <mat-icon>schedule</mat-icon>
          <span>Reported {{ data.need.reportedAt | relativeTime }}</span>
        </div>
        <div class="meta-item" *ngIf="data.need.assignedVolunteers.length > 0">
          <mat-icon>group</mat-icon>
          <span>{{ data.need.assignedVolunteers.length }} volunteers assigned</span>
        </div>
      </div>

      <div class="actions">
        <button mat-stroked-button color="primary" class="action-btn">
          <mat-icon>directions</mat-icon> Get Route
        </button>
        <button mat-flat-button color="primary" class="action-btn" *ngIf="data.need.status === 'open'">
          <mat-icon>assignment_ind</mat-icon> Assign Volunteers
        </button>
      </div>
    </div>
  `,
  styles: [`
    .bottom-sheet-container {
      padding: 8px 16px 24px;
      font-family: var(--font-ui);
    }
    .sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .title {
      font-family: var(--font-display);
      margin: 0;
      font-size: 1.5rem;
      color: var(--color-text-primary);
    }
    .badges {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .category-badge, .urgency-badge, .status-badge {
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: var(--radius-badge);
      text-transform: uppercase;
      font-weight: 600;
    }
    .category-badge { background: var(--color-info-light); color: var(--color-info); }
    .urgency-badge.high, .urgency-badge.critical { background: var(--color-danger-light); color: var(--color-danger); }
    .urgency-badge.medium { background: var(--color-warning-light); color: var(--color-warning); }
    .urgency-badge.low { background: var(--color-success-light); color: var(--color-success); }
    .status-badge.open { border: 1px solid var(--color-danger); color: var(--color-danger); }
    .status-badge.assigned { border: 1px solid var(--color-primary); color: var(--color-primary); }
    
    .section {
      margin-bottom: 20px;
    }
    .description {
      font-size: 0.95rem;
      line-height: 1.5;
      color: var(--color-text-secondary);
      margin: 0 0 8px;
    }
    .description strong {
      color: var(--color-text-primary);
    }
    
    .meta-info {
      background: var(--color-surface);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
    .meta-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--color-primary-mid);
    }
    
    .actions {
      display: flex;
      gap: 12px;
    }
    .action-btn {
      flex: 1;
      border-radius: var(--radius-button);
    }
  `]
})
export class NeedBottomSheetComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { need: Need },
    private bottomSheetRef: MatBottomSheetRef<NeedBottomSheetComponent>
  ) {}

  close(): void {
    this.bottomSheetRef.dismiss();
  }
}
