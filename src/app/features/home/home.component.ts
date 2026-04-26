import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Need, Task, VolunteerMatch, Activity } from '../../models';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { AuthService } from '../../core/auth/auth.service';
import { AgentService } from '../../core/ai/agent.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NeedBottomSheetComponent } from '../../shared/components/need-bottom-sheet/need-bottom-sheet.component';
import { ReportNeedComponent } from '../../modals/report-need/report-need.component';
import { AddVolunteerComponent } from '../../modals/add-volunteer/add-volunteer.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatBottomSheetModule,
    MatDialogModule,
    SkeletonLoaderComponent
  ],
  template: `
    <div class="page-wrapper">
      <!-- Background Blur Effects -->
      <div class="bg-blur-1"></div>
      <div class="bg-blur-2"></div>

      <main class="content-area">
        <!-- Hero Section -->
        <header class="hero-section">
          <div class="hero-content">
            <h1 class="greeting">Good morning, {{ firstName() }}</h1>
            <p class="status-pulse">
              <span class="pulse-dot"></span>
              Mumbai Ward 4 Command Center is <strong>operational</strong>.
              {{ criticalCount() }} critical incidents require attention.
            </p>
            <div class="ai-briefing glass-panel">
              <mat-icon class="sparkle" fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">auto_awesome</mat-icon>
              @if (aiLoading()) {
                <app-skeleton-loader variant="paragraph" width="100%"></app-skeleton-loader>
              } @else {
                <p>{{ aiNarrative() }}</p>
              }
            </div>
          </div>
        </header>

        <!-- Stats Horizon -->
        <section class="stats-horizon">
          @if (isLoading()) {
            <app-skeleton-loader variant="stat-card" [count]="4"></app-skeleton-loader>
          } @else {
            <div class="stat-card glass-panel" *ngFor="let stat of stats()">
              <div class="stat-icon" [ngClass]="stat.color">
                <mat-icon>{{ stat.icon }}</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-label">{{ stat.label }}</span>
                <h3 class="stat-value">{{ stat.value }}</h3>
              </div>
            </div>
          }
        </section>

        <!-- Dashboard Grid -->
        <div class="dashboard-grid">
          <!-- Main Feed Column -->
          <div class="feed-column">
            <div class="section-header">
              <h2>Needs Requiring Action</h2>
              <a routerLink="/needs-map" class="link-btn">View All</a>
            </div>

            <div class="needs-feed glass-panel">
              @if (isLoading()) {
                <app-skeleton-loader variant="need-row" [count]="3"></app-skeleton-loader>
              } @else if (recentNeeds().length > 0) {
                <div *ngFor="let need of recentNeeds() | slice:0:3"
                     class="need-row"
                     (click)="onNeedClick(need)">
                  <div class="urgency-indicator" [ngClass]="need.urgency"></div>
                  <div class="category-icon" [ngClass]="need.urgency">
                    <mat-icon>{{ getCategoryIcon(need.category) }}</mat-icon>
                  </div>
                  <div class="need-details">
                    <div class="title-row">
                      <h4>{{ need.title }}</h4>
                      <span class="urgency-tag" [ngClass]="need.urgency">{{ need.urgency }}</span>
                    </div>
                    <p class="meta-info">
                      <mat-icon>location_on</mat-icon> {{ need.locationName }}
                      <span class="dot-sep">•</span>
                      <mat-icon>schedule</mat-icon> {{ getTimeAgo(need.reportedAt) }}
                    </p>
                  </div>
                  <div class="need-action">
                    <button mat-flat-button class="assign-btn" (click)="onAssignClick($event, need)">Assign</button>
                  </div>
                </div>
              } @else {
                <div class="empty-feed">
                  <mat-icon fontSet="material-symbols-rounded">verified</mat-icon>
                  <p>Regional perimeter secured. No pending alerts.</p>
                </div>
              }
            </div>

            <!-- Quick Action Grid -->
            <div class="section-header mt-8">
              <h2>Operational Tools</h2>
            </div>
            <div class="action-grid">
              <button class="action-card glass-panel" (click)="reportNeed()">
                <mat-icon class="red" fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">campaign</mat-icon>
                <span>Report Need</span>
              </button>
              <button class="action-card glass-panel" (click)="addVolunteer()">
                <mat-icon class="green" fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">group_add</mat-icon>
                <span>Recruit Volunteer</span>
              </button>
              <button class="action-card glass-panel" routerLink="/insights">
                <mat-icon class="yellow" fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">auto_awesome</mat-icon>
                <span>AI Insights</span>
              </button>
              <button class="action-card glass-panel" routerLink="/tasks">
                <mat-icon class="blue" fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">task</mat-icon>
                <span>Task Board</span>
              </button>
            </div>
          </div>

          <!-- Intelligence Column -->
          <div class="intel-column">
            <div class="section-header">
              <h2>Intelligence</h2>
            </div>

            @if (isLoading()) {
              <app-skeleton-loader variant="card" [count]="1"></app-skeleton-loader>
            } @else if (latestMatch()) {
              <div class="intel-card glass-panel highlight">
                <div class="intel-header">
                  <mat-icon class="sparkle" fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">auto_awesome</mat-icon>
                  <h3>AI Match Ready</h3>
                </div>
                <p class="intel-reason">{{ latestMatch()?.reason }}</p>

                <div class="intel-metrics">
                  <div class="metric-row">
                    <span>Alignment</span>
                    <span class="primary">{{ Math.round((latestMatch()?.confidenceScore || 0) * 100) }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="fill" [style.width.%]="(latestMatch()?.confidenceScore || 0) * 100"></div>
                  </div>
                </div>

                <button mat-flat-button color="primary" class="review-btn" (click)="reviewMatch()">Review Matches</button>
              </div>
            }

            <div class="section-header mt-8">
              <h2>Recent Activity</h2>
            </div>
            <div class="activity-log glass-panel">
              @if (isLoading()) {
                <app-skeleton-loader variant="card" [count]="3"></app-skeleton-loader>
              } @else {
                <div class="activity-item" *ngFor="let activity of recentActivities()">
                  <div class="activity-dot" [ngClass]="activity.dotClass"></div>
                  <div class="activity-content">
                    <p [innerHTML]="activity.text"></p>
                    <span class="activity-time">{{ activity.timestamp?.toDate() | date:'shortTime' }}</span>
                  </div>
                </div>
                <div *ngIf="recentActivities().length === 0" class="empty-log">
                  <p>No recent operational logs.</p>
                </div>
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .page-wrapper {
      position: relative;
      height: 100%;
      width: 100%;
      background: var(--color-surface);
    }

    .bg-blur-1 {
      position: absolute;
      top: -100px;
      right: -100px;
      width: 400px;
      height: 400px;
      background: var(--color-primary-light);
      filter: blur(100px);
      opacity: 0.5;
      z-index: 0;
    }

    .bg-blur-2 {
      position: absolute;
      bottom: 100px;
      left: -100px;
      width: 300px;
      height: 300px;
      background: var(--color-info-light);
      filter: blur(100px);
      opacity: 0.4;
      z-index: 0;
    }

    .content-area {
      position: relative;
      z-index: 1;
      height: 100%;
      padding: 40px var(--screen-pad);
      padding-bottom: 100px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .hero-section {
      margin-bottom: 40px;
    }

    .greeting {
      font-size: 3rem;
      font-family: var(--font-display);
      margin: 0;
      letter-spacing: -0.02em;
      color: var(--color-text-primary);
    }

    .status-pulse {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--color-text-secondary);
      font-size: 1.1rem;
      margin-top: 12px;
    }

    .pulse-dot {
      width: 10px;
      height: 10px;
      background: var(--color-success);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(22, 163, 74, 0); }
      100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
    }

    .ai-briefing {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 16px;
      margin-top: 20px;
      max-width: 800px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.4);

      mat-icon { color: var(--color-warning); font-size: 20px; width: 20px; height: 20px; margin-top: 2px; }
      p { margin: 0; font-size: 0.95rem; line-height: 1.5; color: var(--color-text-secondary); }
    }

    .stats-horizon {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 48px;
    }

    .stat-card {
      padding: 24px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        &.red { background: var(--color-danger-light); color: var(--color-danger); }
        &.green { background: var(--color-primary-light); color: var(--color-primary); }
        &.yellow { background: var(--color-warning-light); color: var(--color-warning); }
        &.blue { background: var(--color-info-light); color: var(--color-info); }
      }

      .stat-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-hint); letter-spacing: 0.05em; }
      .stat-value { font-size: 1.8rem; font-family: var(--font-display); margin: 0; color: var(--color-text-primary); }
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
    }

    @media (max-width: 1024px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 20px;
      h2 { font-size: 1.5rem; color: var(--color-text-primary); }
      .link-btn { color: var(--color-primary); font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 4px; font-size: 0.9rem; }
    }

    .needs-feed {
      border-radius: 24px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
    }

    .need-row {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 16px;
      border-radius: 18px;
      margin-bottom: 8px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.4);
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.8);
        transform: translateX(4px);
      }

      .urgency-indicator {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        &.critical { background: var(--color-danger); }
        &.high { background: var(--color-warning); }
        &.medium { background: var(--color-info); }
        &.low { background: var(--color-text-hint); }
      }

      .category-icon {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-surface);
        &.critical { color: var(--color-danger); background: var(--color-danger-light); }
        &.high { color: var(--color-warning); background: var(--color-warning-light); }
      }
    }

    .need-details {
      flex: 1;
      .title-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 4px;
        h4 { margin: 0; font-size: 1.1rem; }
      }
      .urgency-tag {
        font-size: 0.65rem;
        font-weight: 800;
        text-transform: uppercase;
        padding: 2px 8px;
        border-radius: 4px;
        &.critical { background: var(--color-danger); color: white; }
        &.high { background: var(--color-warning); color: white; }
        &.medium { background: var(--color-info); color: white; }
        &.low { background: var(--color-text-hint); color: white; }
      }
      .meta-info {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        mat-icon { font-size: 16px; width: 16px; height: 16px; }
        .dot-sep { margin: 0 4px; }
      }
    }

    .assign-btn {
      border-radius: 12px;
      background: var(--color-primary) !important;
      font-weight: 600;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .action-card {
      border: none;
      padding: 24px;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);

      &:hover {
        transform: scale(1.02);
        background: rgba(255, 255, 255, 0.9);
      }

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        &.red { color: var(--color-danger); }
        &.green { color: var(--color-success); }
        &.yellow { color: var(--color-warning); }
        &.blue { color: var(--color-info); }
      }
      span { font-weight: 600; color: var(--color-text-primary); font-size: 0.9rem; }
    }

    .intel-card {
      padding: 24px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      &.highlight {
        background: linear-gradient(135deg, rgba(10, 107, 94, 0.1), rgba(37, 99, 235, 0.1));
        border: 1px solid var(--color-primary-mid);
      }
      .intel-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        h3 { margin: 0; font-size: 1.1rem; color: var(--color-primary); }
        .sparkle { color: var(--color-warning); }
      }
      .intel-reason { font-size: 0.95rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 20px; }
      .metric-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        font-weight: 700;
        margin-bottom: 6px;
      }
      .progress-bar {
        height: 6px;
        background: var(--color-border);
        border-radius: 3px;
        .fill { height: 100%; background: var(--color-primary); border-radius: 3px; }
      }
      .review-btn { width: 100%; margin-top: 24px; border-radius: 12px; font-weight: 600; }
    }

    .activity-log {
      border-radius: 24px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
    }
    .activity-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
    }
    .activity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 6px;
      &.needs { background: var(--color-danger); }
      &.tasks { background: var(--color-warning); }
      &.volunteers { background: var(--color-success); }
    }
    .activity-content {
      p { margin: 0; font-size: 0.9rem; color: var(--color-text-primary); }
      .activity-time { font-size: 0.75rem; color: var(--color-text-hint); }
    }

    .mt-8 { margin-top: 32px; }

    .empty-feed, .empty-log {
      padding: 32px;
      text-align: center;
      color: var(--color-text-hint);
      mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5; }
      p { margin: 0; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private firestore = inject(FirestoreService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private bottomSheet = inject(MatBottomSheet);
  private dialog = inject(MatDialog);
  private agentService = inject(AgentService);

  user = toSignal(this.auth.currentUser$);
  recentNeeds = toSignal(this.firestore.getOpenNeeds(), { initialValue: [] });
  availableVolunteers = toSignal(this.firestore.getAvailableVolunteers(), { initialValue: [] });
  activeTasks = toSignal(this.firestore.getActiveTasks(), { initialValue: [] });
  allTasks = toSignal(this.firestore.getAllTasks(), { initialValue: [] });
  recentActivities = toSignal(this.firestore.getRecentActivities(5), { initialValue: [] });

  criticalCount = computed(() => this.recentNeeds().filter(n => n.urgency === 'critical').length);
  resolvedTodayCount = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.allTasks().filter(t => t.status === 'completed' && t.completedAt && t.completedAt.toDate() >= today).length;
  });

  stats = computed(() => [
    { label: 'Open Needs', value: this.recentNeeds().length, icon: 'notification_important', color: 'red' },
    { label: 'Volunteers', value: this.availableVolunteers().length, icon: 'volunteer_activism', color: 'green' },
    { label: 'In Progress', value: this.activeTasks().length, icon: 'pending_actions', color: 'yellow' },
    { label: 'Resolved (24h)', value: this.resolvedTodayCount(), icon: 'verified', color: 'blue' }
  ]);

  latestMatch = signal<VolunteerMatch | null>(null);
  aiNarrative = signal<string>('Analyzing regional patterns...');
  isLoading = signal<boolean>(true);
  aiLoading = signal<boolean>(true);
  Math = Math;

  ngOnInit() {
    // Auto-clear loading once first Firestore data arrives or after timeout
    setTimeout(() => this.isLoading.set(false), 2500);

    // Simulate AI match after delay
    setTimeout(() => {
      this.latestMatch.set({
        volunteerId: 'vol-123',
        reason: 'System found 3 volunteer medics within 1km of the Sion Hospital Outpost restock request.',
        confidenceScore: 0.92,
        estimatedArrival: '10 mins',
        skillMatchTags: ['Medical', 'Emergency']
      });
    }, 1500);

    // Generate AI Narrative
    this.generateAiNarrative();
  }

  async generateAiNarrative() {
    this.aiLoading.set(true);
    try {
      const response = await this.agentService.narrateReport({
        needs: this.recentNeeds().length,
        tasks: this.activeTasks().length,
        volunteers: this.availableVolunteers().length,
        resolved: this.resolvedTodayCount()
      } as any);

      if (typeof response === 'object' && response !== null && 'narrative' in response) {
        this.aiNarrative.set((response as any).narrative);
      } else if (typeof response === 'string') {
        this.aiNarrative.set(response);
      }
    } catch {
      this.aiNarrative.set('Ready for missions in Dharavi and Kurla.');
    } finally {
      this.aiLoading.set(false);
    }
  }

  firstName = computed(() => this.user()?.displayName?.split(' ')[0] || 'Rahul');

  getTimeAgo(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      food: 'restaurant',
      medical: 'medical_services',
      water: 'water_drop',
      shelter: 'home',
      education: 'school',
      other: 'help_outline'
    };
    return icons[category] || 'help_outline';
  }

  reviewMatch() { this.router.navigate(['/tasks']); }

  onNeedClick(need: Need) {
    this.bottomSheet.open(NeedBottomSheetComponent, { data: { need } });
  }

  onAssignClick(event: Event, need: Need) {
    event.stopPropagation();
    this.onNeedClick(need);
  }

  reportNeed() {
    this.dialog.open(ReportNeedComponent, {
      width: '650px',
      maxWidth: '90vw',
      panelClass: 'glass-dialog'
    });
  }

  addVolunteer() {
    this.dialog.open(AddVolunteerComponent, {
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'glass-dialog'
    });
  }
}

