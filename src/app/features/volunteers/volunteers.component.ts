import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { toSignal } from '@angular/core/rxjs-interop';
import { VolunteerCardComponent } from '../../shared/components/volunteer-card/volunteer-card.component';
import { Volunteer, VolunteerMatch, Task } from '../../models';
import { AgentService } from '../../core/ai/agent.service';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { SearchService } from '../../core/ui/search.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AddVolunteerComponent } from '../../modals/add-volunteer/add-volunteer.component';
import { VolunteerProfileComponent } from '../../modals/volunteer-profile/volunteer-profile.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { computed } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../models';

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatChipsModule, 
    VolunteerCardComponent, 
    MatDialogModule,
    MatTabsModule,
    MatSnackBarModule,
    SkeletonLoaderComponent
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">Operational Force</h1>
          <p class="page-subtitle">Manage volunteers and applicants for ward coordination.</p>
        </div>
        <button mat-fab class="add-button" color="primary" (click)="openAddVolunteer()" *ngIf="auth.hasPermission('promote_volunteer')">
          <mat-icon>person_add</mat-icon>
        </button>
      </header>

      <mat-tab-group class="custom-tabs" (selectedTabChange)="onTabChange($event)">
        <mat-tab label="Verified Volunteers">
          <div class="tab-content">
            <div class="ai-action-card" *ngIf="showMatcher() && auth.hasPermission('assign_task')">
              <div class="ai-header">
                <mat-icon class="sparkle">magic_button</mat-icon>
                <h3>AI MatchAgent</h3>
              </div>
              <p>Find the best volunteers for urgent missions based on skills, proximity, and rating.</p>
              <button mat-flat-button color="primary" (click)="runMatch()">
                <mat-icon>neurology</mat-icon> Run Matching Agent
              </button>
            </div>

            <div class="volunteer-list">
              <h3 class="section-title">Verified Directory</h3>
              @if (isLoading()) {
                <app-skeleton-loader variant="volunteer-card" [count]="4"></app-skeleton-loader>
              } @else {
                <app-volunteer-card 
                  *ngFor="let vol of filteredVolunteers()" 
                  [volunteer]="vol"
                  [match]="getMatchFor(vol.id)"
                  (cardClick)="handleVolunteerClick($event)">
                </app-volunteer-card>
                
                <div class="empty-state" *ngIf="filteredVolunteers().length === 0">
                  <mat-icon>no_accounts</mat-icon>
                  <p>No verified volunteers in this sector.</p>
                </div>
              }
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Pending Verification" *ngIf="auth.hasPermission('approve_volunteer')">
          <div class="tab-content">
            <div class="applicant-list">
              <div class="applicant-card" *ngFor="let app of applicants()">
                <div class="app-info">
                  <div class="app-avatar">{{ app.displayName.charAt(0) }}</div>
                  <div>
                    <h4>{{ app.displayName }}</h4>
                    <p>{{ app.email }} • {{ app.phone || 'No phone' }}</p>
                    <div class="skill-tags">
                      <span class="tag" *ngFor="let s of app.skills">{{ s }}</span>
                    </div>
                  </div>
                </div>
                <div class="app-actions">
                  <button mat-icon-button color="primary" matTooltip="Approve" (click)="approve(app)">
                    <mat-icon fontSet="material-symbols-rounded">check_circle</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" matTooltip="Shortlist" (click)="shortlist(app)">
                    <mat-icon fontSet="material-symbols-rounded">phone_forwarded</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" matTooltip="Reject" (click)="reject(app)">
                    <mat-icon fontSet="material-symbols-rounded">cancel</mat-icon>
                  </button>
                </div>
              </div>

              <div class="empty-state" *ngIf="filteredApplicants().length === 0">
                <mat-icon>verified</mat-icon>
                <p>Queue is clear! All applicants have been reviewed.</p>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
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
    
    .ai-action-card {
      background: linear-gradient(135deg, var(--color-primary-light), var(--color-card));
      border: 1px solid var(--color-primary);
      border-radius: var(--radius-card);
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(29, 158, 117, 0.1);
    }
    .ai-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .ai-header h3 {
      margin: 0;
      font-family: var(--font-display);
      color: var(--color-primary);
    }
    .sparkle {
      color: var(--color-warning);
    }
    .ai-action-card p {
      margin: 0 0 16px;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
    
    .tab-content {
      padding: 24px 0;
    }
    .custom-tabs ::ng-deep .mat-mdc-tab-header {
      --mdc-tab-indicator-active-indicator-color: var(--color-primary);
      --mat-tab-header-active-label-text-color: var(--color-primary);
    }
    
    .applicant-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .applicant-card {
      background: var(--color-card);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid var(--color-border);
      transition: all 0.2s ease;
    }
    .applicant-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-color: var(--color-primary-mid);
    }
    .app-info {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .app-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--color-primary-light);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.2rem;
    }
    .app-info h4 { margin: 0; font-size: 1rem; }
    .app-info p { margin: 2px 0 0; font-size: 0.8rem; color: var(--color-text-secondary); }
    .skill-tags { display: flex; gap: 4px; margin-top: 8px; }
    .tag { font-size: 0.7rem; background: var(--color-surface); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--color-border); }
    .app-actions { display: flex; gap: 8px; }
  `]
})
export class VolunteersComponent implements OnInit {
  private agentService = inject(AgentService);
  protected auth = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private searchService = inject(SearchService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  user = toSignal(this.auth.currentUser$);
  volunteers = toSignal(this.firestoreService.getAllVolunteers(), { initialValue: [] });
  applicants = toSignal(this.firestoreService.getApplicants(), { initialValue: [] });
  
  searchTerm = this.searchService.searchTerm;
  matches = signal<VolunteerMatch[]>([]);
  showMatcher = signal<boolean>(true);
  selectedTab = signal<number>(0);
  isLoading = signal<boolean>(true);

  constructor() {
    setTimeout(() => this.isLoading.set(false), 2000);
  }

  filteredVolunteers = computed(() => {
    let all = this.volunteers();
    const currentUser = this.user();
    
    // Filter by region if not super_admin
    if (currentUser && currentUser.role !== 'super_admin' && currentUser.region) {
      all = all.filter(v => v.region === currentUser.region);
    }

    const search = this.searchTerm().toLowerCase();
    if (!search) return all;
    return all.filter(v => 
      v.name.toLowerCase().includes(search) || 
      v.skills.some(s => s.toLowerCase().includes(search))
    );
  });

  filteredApplicants = computed(() => {
    let all = this.applicants();
    const currentUser = this.user();
    
    // Filter by region if not super_admin
    if (currentUser && currentUser.role !== 'super_admin' && currentUser.region) {
      all = all.filter(a => a.region === currentUser.region);
    }
    return all;
  });

  onTabChange(event: any) {
    this.selectedTab.set(event.index);
  }

  async approve(user: User) {
    try {
      await this.firestoreService.updateUserRole(user.uid, 'volunteer', 'approved');
      this.snackBar.open(`${user.displayName} is now a verified volunteer!`, 'OK', { duration: 3000 });
      await this.firestoreService.logActivity({
        type: 'volunteer_approved',
        text: `Verified volunteer: ${user.displayName}`,
        userId: user.uid,
        userName: user.displayName
      });
    } catch (e) {
      this.snackBar.open('Approval failed', 'OK', { duration: 3000 });
    }
  }

  async shortlist(user: User) {
    try {
      await this.firestoreService.updateUserRole(user.uid, 'applicant', 'shortlisted');
      this.snackBar.open(`${user.displayName} has been shortlisted for onboarding.`, 'OK', { duration: 3000 });
      await this.firestoreService.logActivity({
        type: 'volunteer_shortlisted',
        text: `Shortlisted applicant: ${user.displayName}`,
        userId: user.uid,
        userName: user.displayName
      });
    } catch (e) {
      this.snackBar.open('Shortlisting failed', 'OK', { duration: 3000 });
    }
  }

  async reject(user: User) {
    try {
      await this.firestoreService.updateUserRole(user.uid, 'applicant', 'rejected');
      this.snackBar.open(`Application rejected for ${user.displayName}`, 'OK', { duration: 3000 });
      await this.firestoreService.logActivity({
        type: 'volunteer_rejected',
        text: `Rejected applicant: ${user.displayName}`,
        userId: user.uid,
        userName: user.displayName
      });
    } catch (e) {
      this.snackBar.open('Rejection failed', 'OK', { duration: 3000 });
    }
  }

  ngOnInit() {
  }

  openAddVolunteer() {
    this.dialog.open(AddVolunteerComponent, {
      width: '500px',
      disableClose: true
    });
  }

  handleVolunteerClick(volunteer: Volunteer) {
    this.dialog.open(VolunteerProfileComponent, {
      width: '500px',
      data: { volunteer }
    });
  }

  getMatchFor(volunteerId: string): VolunteerMatch | undefined {
    return this.matches().find(m => m.volunteerId === volunteerId);
  }

  async runMatch() {
    // In a real app, this would use a selected Task.
    const mockTask: Task = {
      id: 'mock', title: 'Medical emergency', category: 'medical', priority: 'critical', 
      volunteerIds: [], status: 'pending', progress: 0, dueAt: new Date() as any, 
      createdBy: 'sys', createdAt: new Date() as any, recurring: false, attachmentUrls: [],
      description: 'Need first aid immediately', locationLat: 19.0380, locationLng: 72.8538, locationName: 'Dharavi'
    };
    
    // Use the backend AI agent
    try {
      // NOTE: This will fail until backend configuration (agents.go) is set with real Vertex IDs
      const result = await this.agentService.matchVolunteers(mockTask, this.volunteers());
      if (result && result.length > 0) {
        this.matches.set(result);
      }
    } catch (e) {
      console.error("AI Match failed (expected if backend isn't configured)", e);
      // Fallback for demonstration
      this.matches.set([
        {
          volunteerId: 'v1',
          reason: 'Aisha is 1.2km away with First Aid skills and is currently available.',
          confidenceScore: 0.95,
          estimatedArrival: '10 mins',
          skillMatchTags: ['First Aid', 'Proximity']
        }
      ]);
    }
  }
}
