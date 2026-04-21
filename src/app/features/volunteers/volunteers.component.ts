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
import { AddVolunteerComponent } from '../../modals/add-volunteer/add-volunteer.component';
import { VolunteerProfileComponent } from '../../modals/volunteer-profile/volunteer-profile.component';
import { computed } from '@angular/core';

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatChipsModule, VolunteerCardComponent, MatDialogModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">Volunteers</h1>
          <p class="page-subtitle">Coordinate your field force.</p>
        </div>
        <button mat-fab class="add-button" color="primary" (click)="openAddVolunteer()">
          <mat-icon>how_to_reg</mat-icon>
        </button>
      </header>

      <div class="ai-action-card" *ngIf="showMatcher()">
        <div class="ai-header">
          <mat-icon class="sparkle">magic_button</mat-icon>
          <h3>AI Smart Match</h3>
        </div>
        <p>Select a task to find the best volunteers based on skills, location, and availability.</p>
        <button mat-flat-button color="primary" (click)="runMatch()">
          <mat-icon>neurology</mat-icon> Run Matching Agent
        </button>
      </div>

      <div class="volunteer-list">
        <h3 class="section-title">Directory</h3>
        <app-volunteer-card 
          *ngFor="let vol of filteredVolunteers()" 
          [volunteer]="vol"
          [match]="getMatchFor(vol.id)"
          (cardClick)="handleVolunteerClick($event)">
        </app-volunteer-card>
        
        <div class="empty-state" *ngIf="filteredVolunteers().length === 0">
          <mat-icon>no_accounts</mat-icon>
          <p>No volunteers found in the directory.</p>
        </div>
      </div>
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
      background: linear-gradient(135deg, var(--color-primary-light), white);
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
    
    .section-title {
      font-family: var(--font-ui);
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 16px;
      color: var(--color-text-primary);
    }
    .volunteer-list {
      display: flex;
      flex-direction: column;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      color: var(--color-text-hint);
      text-align: center;
    }
    .empty-state mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
  `]
})
export class VolunteersComponent implements OnInit {
  private agentService = inject(AgentService);
  private firestoreService = inject(FirestoreService);
  private searchService = inject(SearchService);
  private dialog = inject(MatDialog);
  
  volunteers = toSignal(this.firestoreService.getAllVolunteers(), { initialValue: [] });
  searchTerm = this.searchService.searchTerm;
  matches = signal<VolunteerMatch[]>([]);
  showMatcher = signal<boolean>(true);

  filteredVolunteers = computed(() => {
    const all = this.volunteers();
    const search = this.searchTerm().toLowerCase();
    if (!search) return all;
    return all.filter(v => 
      v.name.toLowerCase().includes(search) || 
      v.skills.some(s => s.toLowerCase().includes(search))
    );
  });

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
