import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { NeedCardComponent } from '../../shared/components/need-card/need-card.component';
import { TaskCardComponent } from '../../shared/components/task-card/task-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Need, Task, VolunteerMatch, Activity } from '../../models';
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
    <div class="flex flex-col flex-1 h-full w-full overflow-hidden bg-surface">
      <!-- Scrollable Content -->
      <main class="flex-1 overflow-y-auto p-8 pb-24">
        <!-- Greeting & Summary -->
        <div class="mb-12 max-w-7xl mx-auto">
          <h2 class="font-serif text-5xl font-normal tracking-tight text-on-surface mb-2">Good morning, {{ firstName() }}</h2>
          <p class="text-on-surface-variant text-lg">
            Mumbai Ward 4 Command Center is <span class="text-secondary font-medium">operational</span>. 
            {{ criticalNeedsCount() }} critical incidents require attention.
          </p>
        </div>

        <!-- Stat Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-7xl mx-auto">
          <!-- Stat 1 -->
          <div class="bg-surface-container-lowest p-6 rounded-[14px] flex flex-col justify-between h-32 relative overflow-hidden border border-outline-variant/15 shadow-sm">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
            <div class="flex justify-between items-start">
              <span class="text-on-surface-variant font-medium text-xs tracking-wide uppercase">Open Needs</span>
              <span class="material-symbols-outlined text-error">assignment_late</span>
            </div>
            <h3 class="font-serif text-4xl text-on-surface">{{ recentNeeds().length }}</h3>
          </div>
          
          <!-- Stat 2 -->
          <div class="bg-surface-container-lowest p-6 rounded-[14px] flex flex-col justify-between h-32 border border-outline-variant/15 shadow-sm">
            <div class="flex justify-between items-start">
              <span class="text-on-surface-variant font-medium text-xs tracking-wide uppercase">Volunteers</span>
              <span class="material-symbols-outlined text-primary">group</span>
            </div>
            <h3 class="font-serif text-4xl text-on-surface">{{ availableVolunteers().length }}</h3>
          </div>
          
          <!-- Stat 3 -->
          <div class="bg-surface-container-lowest p-6 rounded-[14px] flex flex-col justify-between h-32 border border-outline-variant/15 shadow-sm">
            <div class="flex justify-between items-start">
              <span class="text-on-surface-variant font-medium text-xs tracking-wide uppercase">In Progress</span>
              <span class="material-symbols-outlined text-warning">sync</span>
            </div>
            <h3 class="font-serif text-4xl text-on-surface">{{ activeTasks().length }}</h3>
          </div>
          
          <!-- Stat 4 -->
          <div class="bg-surface-container-lowest p-6 rounded-[14px] flex flex-col justify-between h-32 border border-outline-variant/15 shadow-sm">
            <div class="flex justify-between items-start">
              <span class="text-on-surface-variant font-medium text-xs tracking-wide uppercase">Resolved (Today)</span>
              <span class="material-symbols-outlined text-success">check_circle</span>
            </div>
            <h3 class="font-serif text-4xl text-on-surface">{{ resolvedTodayCount() }}</h3>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <!-- Left Column (Needs) -->
          <div class="lg:col-span-2 flex flex-col gap-6">
            <div class="flex justify-between items-baseline mb-2">
              <h3 class="font-serif text-2xl text-on-surface">Needs Requiring Action</h3>
              <a routerLink="/needs-map" class="text-primary font-medium text-sm hover:underline">View All</a>
            </div>
            
            <!-- List Container -->
            <div class="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-4">
              <ng-container *ngIf="recentNeeds() && recentNeeds().length > 0; else noNeeds">
                <div *ngFor="let need of recentNeeds() | slice:0:3" 
                     class="bg-surface-container-lowest rounded-[14px] p-5 relative flex items-center gap-5 shadow-sm border border-outline-variant/10 hover:border-primary/20 transition-all cursor-pointer"
                     (click)="onNeedClick(need)">
                  <div class="absolute left-0 top-4 bottom-4 w-1 rounded-r-sm" [ngClass]="getUrgencyColor(need.urgency)"></div>
                  <div class="p-3 rounded-xl shrink-0" [ngClass]="getCategoryBg(need.urgency)">
                    <span class="material-symbols-outlined">{{ getCategoryIcon(need.category) }}</span>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-1">
                      <h4 class="font-semibold text-on-surface text-lg">{{ need.title }}</h4>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" [ngClass]="getUrgencyBadgeClass(need.urgency)">
                        {{ need.urgency }}
                      </span>
                    </div>
                    <p class="text-on-surface-variant text-sm flex items-center gap-2">
                      <span class="material-symbols-outlined text-[16px]">location_on</span>
                      {{ need.locationName }} • Reported {{ need.reportedAt.toDate() | date:'shortTime' }}
                    </p>
                  </div>
                  <div class="shrink-0 ml-4">
                    <button mat-flat-button color="primary" class="rounded-lg text-sm" (click)="onAssignClick($event, need)">
                      Assign
                    </button>
                  </div>
                </div>
              </ng-container>
              
              <ng-template #noNeeds>
                <div class="p-12 text-center">
                  <span class="material-symbols-outlined text-5xl text-outline mb-4">task_alt</span>
                  <h4 class="text-on-surface font-medium">All caught up</h4>
                  <p class="text-on-surface-variant text-sm">No critical needs require immediate attention.</p>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Right Column (AI & Activity) -->
          <div class="lg:col-span-1 flex flex-col gap-8">
            <!-- AI Match Ready Card -->
            <div *ngIf="latestMatch()">
              <h3 class="font-serif text-2xl text-on-surface mb-4">Intelligence</h3>
              <div class="bg-primary-light/30 border border-primary/10 rounded-[14px] p-6 backdrop-blur-md relative overflow-hidden">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-info/10 rounded-full blur-3xl"></div>
                
                <div class="flex items-start gap-3 mb-4 relative z-10">
                  <span class="material-symbols-outlined text-primary mt-1" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
                  <div>
                    <h4 class="font-serif text-xl text-on-surface">AI Match Ready</h4>
                    <p class="text-on-surface-variant text-sm mt-1 leading-relaxed">{{ latestMatch()?.reason }}</p>
                  </div>
                </div>
                
                <div class="confidence-bar-wrap mb-4 relative z-10">
                  <div class="flex justify-between text-[11px] font-bold uppercase tracking-wider text-outline mb-1">
                    <span>Confidence</span>
                    <span class="text-primary">{{ (latestMatch()?.confidenceScore || 0) * 100 | number:'1.0-0' }}%</span>
                  </div>
                  <div class="h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full" [style.width.%]="(latestMatch()?.confidenceScore || 0) * 100"></div>
                  </div>
                </div>

                <button class="w-full bg-primary text-white font-medium py-2.5 rounded-lg text-sm hover:bg-primary-mid transition-colors relative z-10" (click)="reviewMatch()">
                  Review Matches
                </button>
              </div>
            </div>

            <!-- Recent Activity -->
            <div>
              <h3 class="font-serif text-2xl text-on-surface mb-4">Recent Activity</h3>
              <div class="bg-surface-container-lowest rounded-[14px] p-6 border border-outline-variant/15 flex flex-col gap-6 shadow-sm">
                <div class="flex gap-4" *ngFor="let activity of recentActivities()">
                  <div class="flex flex-col items-center">
                    <div class="w-2 h-2 rounded-full mt-1.5" [ngClass]="activity.dotClass"></div>
                    <div class="w-px h-full bg-outline-variant/30 my-1"></div>
                  </div>
                  <div class="pb-2">
                    <p class="text-sm text-on-surface" [innerHTML]="activity.text"></p>
                    <p class="text-xs text-outline mt-1">{{ activity.timestamp?.toDate() | date:'shortTime' }}</p>
                  </div>
                </div>
                <div *ngIf="recentActivities().length === 0" class="text-center py-8 text-outline text-sm">
                  No recent activities recorded.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .text-secondary { color: var(--color-primary-mid); }
    .bg-warning { background-color: var(--color-warning); }
    .text-warning { color: var(--color-warning); }
    .bg-error { background-color: var(--color-danger); }
    .text-error { color: var(--color-danger); }
    .bg-success { background-color: var(--color-success); }
    .text-success { color: var(--color-success); }
    .text-info { color: var(--color-info); }
    .bg-info { background-color: var(--color-info); }
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
  recentActivities = toSignal(this.firestore.getRecentActivities(5), { initialValue: [] });

  criticalNeedsCount = computed(() => this.recentNeeds().filter(n => n.urgency === 'critical').length);
  resolvedTodayCount = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.allTasks().filter(t => t.status === 'completed' && t.completedAt && t.completedAt.toDate() >= today).length;
  });

  latestMatch = signal<VolunteerMatch | null>(null);

  ngOnInit() {
    setTimeout(() => {
      this.latestMatch.set({
        volunteerId: 'vol-123',
        reason: 'System found 3 volunteer medics within 1km of the Sion Hospital Outpost restock request.',
        confidenceScore: 0.92,
        estimatedArrival: '10 mins',
        skillMatchTags: ['Medical', 'Emergency']
      });
    }, 1500);
  }

  firstName(): string {
    return this.user()?.displayName?.split(' ')[0] || 'Rahul';
  }

  getUrgencyColor(urgency: string): string {
    switch (urgency) {
      case 'critical': return 'bg-error';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-info';
      default: return 'bg-outline';
    }
  }

  getUrgencyBadgeClass(urgency: string): string {
    switch (urgency) {
      case 'critical': return 'bg-error-container text-on-error-container';
      case 'high': return 'bg-warning-light text-warning';
      case 'medium': return 'bg-info-light text-info';
      default: return 'bg-surface-container text-outline';
    }
  }

  getCategoryBg(urgency: string): string {
    return urgency === 'critical' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant';
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'food': return 'restaurant';
      case 'medical': return 'medical_services';
      case 'water': return 'water_drop';
      case 'shelter': return 'home';
      case 'education': return 'school';
      default: return 'help_outline';
    }
  }

  reviewMatch() {
    this.router.navigate(['/tasks']);
  }

  onNeedClick(need: Need) {
    console.log('Need clicked', need);
  }

  onAssignClick(event: Event, need: Need) {
    event.stopPropagation();
    console.log('Assign clicked for', need);
    this.router.navigate(['/tasks']);
  }
}

