import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { NeedCardComponent } from '../../shared/components/need-card/need-card.component';
import { TaskCardComponent } from '../../shared/components/task-card/task-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Need, Task, VolunteerMatch } from '../../models';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { AuthService } from '../../core/auth/auth.service';
import { AgentService } from '../../core/ai/agent.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    StatCardComponent, 
    NeedCardComponent, 
    TaskCardComponent,
    EmptyStateComponent,
    RouterLink
  ],
  template: `
    <div class="page-container">
      <!-- TOP BAR -->
      <header class="top-bar">
        <div class="logo-area">
          <span class="logo-text">Sahaay</span>
          <span class="logo-subtext">सहाय</span>
        </div>
        <div class="top-actions">
          <div class="notification-wrap">
            <mat-icon class="bell-icon">notifications_none</mat-icon>
            <span class="badge" *ngIf="criticalNeedsCount() > 0">{{ criticalNeedsCount() }}</span>
          </div>
          <div class="avatar">{{ userInitials() }}</div>
        </div>
      </header>

      <!-- GREETING SECTION -->
      <section class="greeting-section">
        <h1 class="greeting-title">Good morning, {{ firstName() }}</h1>
        <div class="alert-text" *ngIf="criticalNeedsCount() > 0">
          <span class="pulsing-dot"></span>
          <p>{{ criticalNeedsCount() }} critical needs in {{ user()?.region || 'your area' }} need immediate attention</p>
        </div>
      </section>

      <!-- STAT CARDS (Horizontal Scroll) -->
      <section class="stats-scroll-container">
        <div class="stats-scroll-track">
          <app-stat-card title="Open Needs" [value]="recentNeeds().length.toString() || '0'" icon="place" colorClass="color-primary"></app-stat-card>
          <app-stat-card title="Volunteers Active" [value]="availableVolunteers().length.toString() || '0'" icon="person" colorClass="color-info"></app-stat-card>
          <app-stat-card title="In Progress" [value]="activeTasks().length.toString() || '0'" icon="checklist" colorClass="color-warning"></app-stat-card>
          <app-stat-card title="Resolved Today" [value]="resolvedTodayCount().toString() || '0'" icon="check_circle" colorClass="color-success"></app-stat-card>
        </div>
      </section>
      
      <!-- AI MATCH CARD -->
      <section class="ai-match-section" *ngIf="latestMatch()">
        <div class="ai-match-card">
          <div class="ai-card-header">
            <div class="ai-badge">
              <mat-icon class="sparkle-icon">auto_awesome</mat-icon>
              <span>AI Match Ready</span>
            </div>
          </div>
          <p class="ai-main-text"><strong>MatchAgent</strong> matched a volunteer to a critical task.</p>
          <p class="ai-sub-text">Reason: {{ latestMatch()?.reason }}</p>
          <div class="confidence-bar-wrap">
            <div class="confidence-info">
              <span>Confidence Score</span>
              <span class="confidence-value">{{ (latestMatch()?.confidenceScore || 0) * 100 | number:'1.0-0' }}%</span>
            </div>
            <div class="progress-bg">
              <div class="progress-fill" [style.width.%]="(latestMatch()?.confidenceScore || 0) * 100"></div>
            </div>
          </div>
          <div class="ai-actions">
            <button mat-button class="btn-secondary" (click)="dismissMatch()">Dismiss</button>
            <button mat-flat-button class="btn-primary" (click)="reviewMatch()">Review Match</button>
          </div>
        </div>
      </section>

      <!-- CRITICAL NEEDS SECTION -->
      <section class="needs-section">
        <div class="section-header">
          <h2 class="section-title">Needs Requiring Action</h2>
          <a routerLink="/needs-map" class="view-all">View all &rarr;</a>
        </div>
        
        <div class="needs-list">
          <ng-container *ngIf="recentNeeds() && recentNeeds().length > 0; else noNeeds">
            <app-need-card 
              *ngFor="let need of recentNeeds() | slice:0:3" 
              [need]="need"
              (cardClick)="onNeedClick($event)">
            </app-need-card>
          </ng-container>
          <ng-template #noNeeds>
            <app-empty-state 
              icon="check_circle_outline" 
              title="All caught up" 
              message="No critical needs reported right now.">
            </app-empty-state>
          </ng-template>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page-container {
      padding: var(--screen-pad);
      padding-bottom: 80px; /* Space for bottom nav */
      background-color: var(--color-surface);
      min-height: 100vh;
      box-sizing: border-box;
    }

    /* TOP BAR */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .logo-area {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .logo-text {
      font-family: var(--font-display);
      font-size: 22px;
      color: var(--color-primary);
    }
    .logo-subtext {
      font-family: var(--font-ui);
      font-size: 14px;
      color: var(--color-text-hint);
    }
    .top-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .notification-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bell-icon {
      color: var(--color-text-secondary);
    }
    .badge {
      position: absolute;
      top: -2px;
      right: -4px;
      background-color: var(--color-danger);
      color: white;
      font-size: 10px;
      font-weight: 700;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 2px solid var(--color-surface);
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--color-primary-light);
      color: var(--color-primary);
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* GREETING SECTION */
    .greeting-section {
      margin-bottom: 24px;
    }
    .greeting-title {
      margin: 0 0 8px 0;
      font-family: var(--font-display);
      font-size: 24px;
      color: var(--color-text-primary);
    }
    .alert-text {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .alert-text p {
      margin: 0;
      font-family: var(--font-ui);
      font-size: 13px;
      color: var(--color-danger);
      font-weight: 500;
    }
    .pulsing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--color-danger);
      box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
    }

    /* STAT CARDS (Horizontal Scroll) */
    .stats-scroll-container {
      margin: 0 calc(-1 * var(--screen-pad)) 24px;
      padding: 0 var(--screen-pad);
      overflow-x: auto;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none;  /* IE and Edge */
    }
    .stats-scroll-container::-webkit-scrollbar {
      display: none;
    }
    .stats-scroll-track {
      display: inline-flex;
      gap: 12px;
      padding-bottom: 4px; /* for box-shadow */
    }

    /* AI MATCH CARD */
    .ai-match-section {
      margin-bottom: 24px;
    }
    .ai-match-card {
      background: linear-gradient(145deg, #ffffff, #fdfbf7);
      border-radius: var(--radius-card);
      padding: 16px;
      border: 1px solid var(--color-border);
      box-shadow: 0 2px 12px rgba(10, 107, 94, 0.08);
      position: relative;
      overflow: hidden;
    }
    .ai-card-header {
      margin-bottom: 12px;
    }
    .ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: linear-gradient(90deg, #f0fdf4, #e0f2fe);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      color: var(--color-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sparkle-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #0284c7;
    }
    .ai-main-text {
      font-size: 14px;
      line-height: 1.4;
      color: var(--color-text-primary);
      margin: 0 0 4px 0;
    }
    .ai-sub-text {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin: 0 0 16px 0;
    }
    .confidence-bar-wrap {
      margin-bottom: 16px;
    }
    .confidence-info {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 4px;
      color: var(--color-text-secondary);
      font-weight: 500;
    }
    .confidence-value {
      color: var(--color-success);
      font-weight: 700;
    }
    .progress-bg {
      height: 6px;
      background-color: var(--color-border);
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary), var(--color-success));
      border-radius: 4px;
    }
    .ai-actions {
      display: flex;
      gap: 12px;
    }
    .btn-secondary {
      flex: 1;
      border-radius: var(--radius-button);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
    }
    .btn-primary {
      flex: 1;
      border-radius: var(--radius-button);
      background-color: var(--color-primary);
      color: white;
    }

    /* CRITICAL NEEDS SECTION */
    .needs-section {
      margin-bottom: 24px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .section-title {
      margin: 0;
      font-family: var(--font-ui);
      font-size: 16px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .view-all {
      font-size: 13px;
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
    }
    .needs-list {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class HomeComponent implements OnInit {
  private firestore = inject(FirestoreService);
  private auth = inject(AuthService);
  private agentService = inject(AgentService);
  private router = inject(Router);
  
  user = toSignal(this.auth.currentUser$);
  recentNeeds = toSignal(this.firestore.getOpenNeeds(), { initialValue: [] });
  availableVolunteers = toSignal(this.firestore.getAvailableVolunteers(), { initialValue: [] });
  activeTasks = toSignal(this.firestore.getActiveTasks(), { initialValue: [] });
  allTasks = toSignal(this.firestore.getAllTasks(), { initialValue: [] });

  criticalNeedsCount = computed(() => this.recentNeeds().filter(n => n.urgency === 'critical').length);
  resolvedTodayCount = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.allTasks().filter(t => t.status === 'completed' && t.completedAt && t.completedAt.toDate() >= today).length;
  });

  latestMatch = signal<VolunteerMatch | null>(null);

  ngOnInit() {
    // Generate a mock match for demonstration purposes until full backend pipeline is wired
    setTimeout(() => {
      this.latestMatch.set({
        volunteerId: 'vol-123',
        reason: 'Priya Sharma has medical training and is 0.5km away.',
        confidenceScore: 0.92,
        estimatedArrival: '10 mins',
        skillMatchTags: ['Medical', 'Emergency']
      });
    }, 1500);
  }

  userInitials(): string {
    const name = this.user()?.displayName || 'RK';
    if (name === 'RK') return name;
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  firstName(): string {
    return this.user()?.displayName?.split(' ')[0] || 'Rahul';
  }

  dismissMatch() {
    this.latestMatch.set(null);
  }

  reviewMatch() {
    console.log('Reviewing match:', this.latestMatch());
    // In a real implementation, this would open a dialog or navigate to the task detail
    this.router.navigate(['/tasks']);
  }

  onNeedClick(need: Need) {
    console.log('Need clicked', need);
    // Could open a bottom sheet or modal
  }

  onTaskClick(task: Task) {
    console.log('Task clicked', task);
  }
}

