import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Task, TaskAssignment, TaskContact, Volunteer, VolunteerMatch } from '../../models';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';
import { AgentService } from '../../core/ai/agent.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { combineLatest, filter, of, switchMap } from 'rxjs';
import type { User, TaskAssignmentStatus } from '../../models';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="detail-container" *ngIf="task">
      <header class="header">
        <div class="header-main">
          <span class="id">#TSK-{{ task.id.slice(0, 4).toUpperCase() }}</span>
          <h2 mat-dialog-title>{{ task.title }}</h2>
        </div>
        <button mat-icon-button (click)="close()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <mat-dialog-content>
        <div class="badges">
          <span class="badge priority" [ngClass]="task.priority">{{ task.priority }}</span>
          <span class="badge category">{{ task.category }}</span>
          <span class="badge status" [ngClass]="task.status">{{ task.status }}</span>
        </div>

        <section class="info-section">
          <h3>Description</h3>
          <p class="description">{{ task.description }}</p>
        </section>

        <section class="info-section">
          <h3>Location</h3>
          <div class="location">
            <mat-icon>location_on</mat-icon>
            <span>{{ task.locationName }}</span>
          </div>
        </section>

        <section class="info-section">
          <h3>Progress ({{ task.progress }}%)</h3>
          <mat-progress-bar mode="determinate" [value]="task.progress" [color]="getProgressColor()"></mat-progress-bar>
        </section>

        <section class="info-section" *ngIf="canAssign()">
          <h3>Deployed Task Force</h3>
          <div class="volunteers-list">
            <div *ngFor="let a of acceptedAssignments()" class="volunteer-pill">
              <mat-icon>person</mat-icon>
              <span>{{ a.volunteerId }}</span>
            </div>
            <div *ngIf="acceptedAssignments().length === 0" class="empty-state">
              No volunteers accepted yet.
            </div>
          </div>
        </section>

        <section class="info-section" *ngIf="myAssignment()">
          <h3>Your Request</h3>
          <div class="request-row">
            <span class="badge status" [ngClass]="myAssignment()!.status">{{ myAssignment()!.status }}</span>

            <div class="request-actions" *ngIf="myAssignment()!.status === 'pending'">
              <button mat-stroked-button color="primary" (click)="respond('accepted')" [disabled]="actionLoading()">Accept</button>
              <button mat-stroked-button color="warn" (click)="respond('declined')" [disabled]="actionLoading()">Decline</button>
            </div>
          </div>
        </section>

        <section class="info-section" *ngIf="canSeeContacts()">
          <h3>Contact</h3>

          <div class="contact-card" *ngIf="taskContact() as c; else missingContact">
            <div class="contact-block">
              <div class="contact-title">Primary</div>
              <div class="contact-name">{{ c.primary.name }}</div>
              <div class="contact-links">
                <a *ngIf="c.primary.phone" [href]="'tel:' + c.primary.phone" class="contact-link">Call</a>
                <a *ngIf="c.primary.whatsapp" [href]="whatsAppLink(c.primary.whatsapp)" target="_blank" rel="noopener" class="contact-link">WhatsApp</a>
              </div>
            </div>

            <div class="contact-block" *ngIf="c.fallback">
              <div class="contact-title">NGO Fallback</div>
              <div class="contact-name">{{ c.fallback.name }}</div>
              <div class="contact-links">
                <a *ngIf="c.fallback.phone" [href]="'tel:' + c.fallback.phone" class="contact-link">Call</a>
                <a *ngIf="c.fallback.whatsapp" [href]="whatsAppLink(c.fallback.whatsapp)" target="_blank" rel="noopener" class="contact-link">WhatsApp</a>
              </div>
            </div>
          </div>
          <ng-template #missingContact>
            <div class="empty-state">Contact details not configured for this task.</div>
          </ng-template>
        </section>

        <section class="info-section" *ngIf="canAssign()">
          <h3>Volunteer Requests</h3>
          <div class="requests-list">
            <div class="request-item" *ngFor="let a of assignments()">
              <div class="request-meta">
                <mat-icon>person</mat-icon>
                <span class="request-vol">{{ a.volunteerId }}</span>
              </div>
              <span class="badge status" [ngClass]="a.status">{{ a.status }}</span>
            </div>
            <div class="empty-state" *ngIf="assignments().length === 0">No requests sent yet.</div>
          </div>

          <div class="ai-matches" *ngIf="matches().length > 0">
            <h4 class="subhead">AI Suggested</h4>
            <div class="match-row" *ngFor="let m of matches()">
              <div class="match-main">
                <div class="match-id">{{ m.volunteerId }}</div>
                <div class="match-reason">{{ m.reason }}</div>
              </div>
              <button mat-stroked-button color="primary" (click)="sendRequest(m.volunteerId)" [disabled]="actionLoading()">
                Request
              </button>
            </div>
          </div>
        </section>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button *ngIf="task.status === 'pending'" (click)="updateStatus('active')">
          Start Operation
        </button>
        <button mat-stroked-button *ngIf="task.status === 'active'" (click)="updateStatus('completed')">
          Complete Operation
        </button>
        <button mat-flat-button color="primary" class="match-btn" *ngIf="canAssign()" (click)="runMatch()" [disabled]="actionLoading()">
          <mat-icon>smart_toy</mat-icon>
          AI Match Volunteers
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .detail-container { padding: 12px; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .header-main h2 { margin: 0; font-family: var(--font-display); color: var(--color-primary); }
    .id { font-size: 12px; color: var(--color-text-hint); font-weight: 600; }
    
    .badges { display: flex; gap: 8px; margin-bottom: 24px; }
    .badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 20px;
    }
    .priority.critical { background: var(--color-danger-light); color: var(--color-danger); }
    .status.active { background: var(--color-primary-light); color: var(--color-primary); }
    .status.completed { background: var(--color-success-light); color: var(--color-success); }
    
    .info-section { margin-bottom: 24px; }
    .info-section h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
    }
    .description { font-size: 14px; line-height: 1.6; color: var(--color-text-primary); }
    .location { display: flex; align-items: center; gap: 8px; color: var(--color-text-secondary); }
    
    .volunteers-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .volunteer-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
    }
    .volunteer-pill mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .empty-state { font-size: 13px; color: var(--color-text-hint); font-style: italic; }

    .request-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .request-actions { display: flex; gap: 8px; }

    .requests-list { display: flex; flex-direction: column; gap: 8px; }
    .request-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      background: var(--color-surface);
    }
    .request-meta { display: flex; align-items: center; gap: 8px; color: var(--color-text-secondary); }
    .request-vol { font-weight: 600; color: var(--color-text-primary); }

    .ai-matches { margin-top: 12px; }
    .subhead { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; color: var(--color-text-secondary); letter-spacing: 0.05em; }
    .match-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      background: var(--color-card);
      margin-bottom: 8px;
    }
    .match-id { font-weight: 700; font-size: 12px; color: var(--color-text-primary); }
    .match-reason { font-size: 12px; color: var(--color-text-secondary); line-height: 1.35; }

    .contact-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      background: var(--color-card);
    }
    .contact-title { font-size: 11px; text-transform: uppercase; color: var(--color-text-secondary); letter-spacing: 0.05em; }
    .contact-name { font-size: 14px; font-weight: 700; color: var(--color-text-primary); margin-top: 2px; }
    .contact-links { display: flex; gap: 10px; margin-top: 6px; }
    .contact-link {
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      color: var(--color-primary);
      background: var(--color-primary-light);
      padding: 6px 10px;
      border-radius: 10px;
      border: 1px solid var(--color-border);
    }

    .match-btn {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-mid));
      color: white;
      border-radius: 9px;
    }
  `]
})
export class TaskDetailComponent {
  private firestore = inject(FirestoreService);
  private dialogRef = inject(MatDialogRef<TaskDetailComponent>);
  private auth = inject(AuthService);
  private agent = inject(AgentService);
  private snackBar = inject(MatSnackBar);
  data = inject(MAT_DIALOG_DATA);
  task: Task = this.data.task;

  private user$ = this.auth.currentUser$.pipe(filter((u): u is User | null => u !== undefined));
  readonly user = toSignal(this.user$, { initialValue: null });

  readonly actionLoading = signal(false);
  readonly matches = signal<VolunteerMatch[]>([]);

  private readonly isAssignerRole = (u: User | null): boolean => {
    if (!u) return false;
    return u.role === 'field_lead' || u.role === 'ngo_admin' || u.role === 'ngo_founder' || u.role === 'super_admin';
  };

  readonly canAssign = computed(() => this.isAssignerRole(this.user()));

  // Coordinators/Admins can see all assignments for a task; volunteers cannot (rules would deny).
  readonly assignments = toSignal(
    this.user$.pipe(
      switchMap((u) => (this.isAssignerRole(u) ? this.firestore.getTaskAssignmentsForTask(this.task.id) : of([] as TaskAssignment[]))),
    ),
    { initialValue: [] as TaskAssignment[] },
  );

  // Volunteers only read their own deterministic assignment doc.
  private myAssignment$ = this.user$.pipe(
    switchMap((u) => (u ? this.firestore.getTaskAssignment(this.task.id, u.uid) : of(undefined))),
  );

  readonly myAssignment = toSignal(this.myAssignment$, { initialValue: undefined });

  readonly acceptedAssignments = computed(() => this.assignments().filter((a) => a.status === 'accepted'));

  readonly canSeeContacts = computed(() => {
    const u = this.user();
    if (!u) return false;
    if (this.isAssignerRole(u)) return true;
    return this.myAssignment()?.status === 'accepted';
  });

  readonly taskContact = toSignal(
    combineLatest([this.user$, this.myAssignment$]).pipe(
      switchMap(([u, a]) => {
        if (!u) return of(undefined);
        if (this.isAssignerRole(u) || a?.status === 'accepted') {
          return this.firestore.getTaskContact(this.task.id);
        }
        return of(undefined);
      }),
    ),
    { initialValue: undefined },
  );

  close() {
    this.dialogRef.close();
  }

  getProgressColor(): string {
    if (this.task.status === 'completed') return 'accent';
    return 'primary';
  }

  async updateStatus(status: 'pending' | 'active' | 'completed') {
    try {
      const u = this.user();
      await this.firestore.updateTask(this.task.id, { 
        status,
        progress: status === 'completed' ? 100 : (status === 'active' ? 10 : 0),
        completedAt: status === 'completed' ? Timestamp.fromDate(new Date()) : undefined
      });
      
      await this.firestore.logActivity({
        type: status === 'completed' ? 'task_resolved' : 'task_updated',
        text: status === 'completed' ? 
          `Operation <b>${this.task.title}</b> successfully resolved.` : 
          `Operation <b>${this.task.title}</b> shifted to In Progress.`,
        dotClass: status === 'completed' ? 'bg-success' : 'bg-warning',
        userId: u?.uid || 'system'
      });

      this.task.status = status;
      if (status === 'completed') this.task.progress = 100;
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  async runMatch() {
    const u = this.user();
    if (!this.isAssignerRole(u)) return;

    this.actionLoading.set(true);
    try {
      const volunteers = await new Promise<Volunteer[]>((resolve, reject) => {
        const sub = this.firestore.getAvailableVolunteers().subscribe({
          next: (v) => {
            resolve(v);
            sub.unsubscribe();
          },
          error: (e) => {
            reject(e);
            sub.unsubscribe();
          },
        });
      });

      const res = await this.agent.matchVolunteers(this.task, volunteers);
      this.matches.set(res);
      this.snackBar.open('AI suggestions updated.', 'OK', { duration: 2500 });
    } catch (e) {
      console.error('AI match failed', e);
      this.snackBar.open('AI match failed.', 'OK', { duration: 3000 });
    } finally {
      this.actionLoading.set(false);
    }
  }

  async sendRequest(volunteerId: string) {
    const u = this.user();
    if (!this.isAssignerRole(u) || !u) return;

    this.actionLoading.set(true);
    try {
      await this.firestore.createTaskAssignmentRequests({
        taskId: this.task.id,
        volunteerIds: [volunteerId],
        requestedBy: u.uid,
        region: u.region,
      });
      this.snackBar.open('Request sent.', 'OK', { duration: 2500 });
    } catch (e) {
      console.error('Send request failed', e);
      this.snackBar.open('Failed to send request.', 'OK', { duration: 3000 });
    } finally {
      this.actionLoading.set(false);
    }
  }

  async respond(status: Exclude<TaskAssignmentStatus, 'pending' | 'cancelled'>) {
    const u = this.user();
    if (!u) return;

    this.actionLoading.set(true);
    try {
      await this.firestore.respondToTaskAssignment({
        taskId: this.task.id,
        volunteerId: u.uid,
        status,
      });

      if (status === 'accepted') {
        await this.firestore.addVolunteerToTask(this.task.id, u.uid);
        this.snackBar.open('Accepted. Contact unlocked.', 'OK', { duration: 3000 });
      } else {
        this.snackBar.open('Declined.', 'OK', { duration: 2500 });
      }
    } catch (e) {
      console.error('Respond failed', e);
      this.snackBar.open('Failed to update request.', 'OK', { duration: 3000 });
    } finally {
      this.actionLoading.set(false);
    }
  }

  whatsAppLink(phone: string): string {
    const normalized = phone.replace(/\s+/g, '');
    return `https://wa.me/${encodeURIComponent(normalized)}`;
  }
}
