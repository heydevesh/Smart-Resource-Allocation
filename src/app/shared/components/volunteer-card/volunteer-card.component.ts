import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Volunteer, VolunteerMatch } from '../../../models';
import { ConfidenceBadgeComponent } from '../confidence-badge/confidence-badge.component';

@Component({
  selector: 'app-volunteer-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, ConfidenceBadgeComponent],
  template: `
    <div class="card" (click)="cardClick.emit(volunteer())">
      <div class="card-header">
        <div class="user-info">
          <div class="avatar">
            {{ volunteer().name.charAt(0) }}
          </div>
          <div>
            <h3 class="name">{{ volunteer().name }}</h3>
            <div class="rating">
              <mat-icon>star</mat-icon> {{ volunteer().rating.toFixed(1) }}
            </div>
          </div>
        </div>
        <span class="status-badge" [ngClass]="volunteer().available ? 'available' : 'busy'">
          {{ volunteer().available ? 'Available' : 'Busy' }}
        </span>
      </div>
      
      <div class="skills">
        <span class="skill-chip" *ngFor="let skill of volunteer().skills | slice:0:3">{{ skill }}</span>
        <span class="skill-chip more" *ngIf="volunteer().skills.length > 3">+{{ volunteer().skills.length - 3 }}</span>
      </div>
      
      <div class="match-info" *ngIf="match()">
        <div class="match-header">
          <app-confidence-badge [score]="match()!.confidenceScore"></app-confidence-badge>
          <span class="eta"><mat-icon>directions_run</mat-icon> ETA: {{ match()!.estimatedArrival }}</span>
        </div>
        <p class="match-reason">{{ match()!.reason }}</p>
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
      margin-bottom: var(--card-gap);
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-primary-light);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 1.25rem;
    }
    .name {
      margin: 0;
      font-size: 1rem;
      font-family: var(--font-display);
    }
    .rating {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 0.8rem;
      color: var(--color-warning);
      margin-top: 2px;
    }
    .rating mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .status-badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: var(--radius-badge);
      text-transform: uppercase;
      font-weight: 600;
    }
    .available { background: var(--color-success-light); color: var(--color-success); }
    .busy { background: var(--color-border); color: var(--color-text-secondary); }
    
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }
    .skill-chip {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      padding: 2px 8px;
      border-radius: var(--radius-badge);
      font-size: 0.75rem;
    }
    .skill-chip.more {
      background: none;
      border: none;
      font-weight: 500;
    }
    
    .match-info {
      background: var(--color-surface);
      border-radius: 8px;
      padding: 12px;
      margin-top: 12px;
      border: 1px solid var(--color-border);
    }
    .match-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .eta {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      color: var(--color-text-primary);
      font-weight: 500;
    }
    .eta mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .match-reason {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }
  `]
})
export class VolunteerCardComponent {
  volunteer = input.required<Volunteer>();
  match = input<VolunteerMatch>();
  cardClick = output<Volunteer>();
}
