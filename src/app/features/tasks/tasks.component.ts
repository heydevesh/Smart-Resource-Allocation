import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateTaskComponent } from '../../modals/create-task/create-task.component';
import { TaskDetailComponent } from '../../modals/task-detail/task-detail.component';
import { TaskCardComponent } from '../../shared/components/task-card/task-card.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { Task } from '../../models';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { SearchService } from '../../core/ui/search.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';
import { GeolocationService } from '../../core/maps/geolocation.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, MatDialogModule, MatDividerModule, TaskCardComponent, SkeletonLoaderComponent],
  template: `
    <div class="board-wrapper">
      <div class="board-controls">
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-value">{{ getCount('pending') }}</span>
            <span class="stat-label">Open</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ getCount('active') }}</span>
            <span class="stat-label">In Progress</span>
          </div>
          <div class="stat-item">
            <span class="stat-value success">{{ getCount('completed') }}</span>
            <span class="stat-label">Resolved</span>
          </div>
        </div>

        <div class="filter-actions">
          <button mat-stroked-button [matMenuTriggerFor]="sortMenu" class="control-btn">
            <mat-icon>swap_vert</mat-icon>
            Sort: Urgency
          </button>
          <mat-menu #sortMenu="matMenu">
            <button mat-menu-item>Urgency (High to Low)</button>
            <button mat-menu-item>Date Created</button>
            <button mat-menu-item>Due Date</button>
          </mat-menu>

          <button mat-stroked-button [matMenuTriggerFor]="filterMenu" class="control-btn">
            <mat-icon>filter_list</mat-icon>
            Filters
            <span class="active-filters" *ngIf="activeFilterCount() > 0">({{ activeFilterCount() }})</span>
          </button>
          <mat-menu #filterMenu="matMenu" class="filter-menu">
            <div class="menu-section">
              <span class="section-label">Category</span>
              <div class="chip-row">
                <button mat-chip (click)="toggleCategory('medical')" [class.active]="categoryFilter() === 'medical'">Medical</button>
                <button mat-chip (click)="toggleCategory('food')" [class.active]="categoryFilter() === 'food'">Food</button>
                <button mat-chip (click)="toggleCategory('water')" [class.active]="categoryFilter() === 'water'">Water</button>
                <button mat-chip (click)="toggleCategory('shelter')" [class.active]="categoryFilter() === 'shelter'">Shelter</button>
              </div>
            </div>
            <div class="menu-section">
              <span class="section-label">Priority</span>
              <div class="chip-row">
                <button mat-chip (click)="togglePriority('critical')" [class.active]="priorityFilter() === 'critical'">Critical</button>
                <button mat-chip (click)="togglePriority('high')" [class.active]="priorityFilter() === 'high'">High</button>
                <button mat-chip (click)="togglePriority('medium')" [class.active]="priorityFilter() === 'medium'">Medium</button>
              </div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="clearFilters()">Clear All Filters</button>
          </mat-menu>

          <button *ngIf="auth.hasPermission('create_task')" mat-flat-button color="primary" class="deploy-btn" (click)="openCreateTask()">
            <mat-icon>assignment_add</mat-icon>
            Deploy Operation
          </button>
        </div>
      </div>

      <div class="kanban-board">
        <!-- Lane: Open -->
        <div class="lane">
          <div class="lane-header">
            <h3 class="lane-title">Open <span class="count">{{ getCount('pending') }}</span></h3>
            <button mat-icon-button class="more-btn"><mat-icon>more_vert</mat-icon></button>
          </div>
          <div class="lane-content">
            @if (isLoading()) {
              <app-skeleton-loader variant="task-card" [count]="2"></app-skeleton-loader>
            } @else {
              <app-task-card *ngFor="let task of getTasksByStatus('pending')" [task]="task" (cardClick)="openTaskDetail($event)"></app-task-card>
              <div class="empty-lane" *ngIf="getCount('pending') === 0">No open tasks</div>
            }
          </div>
        </div>

        <!-- Lane: Assigned -->
        <div class="lane">
          <div class="lane-header">
            <h3 class="lane-title">Assigned <span class="count">{{ getCount('active', 0) }}</span></h3>
            <button mat-icon-button class="more-btn" [matMenuTriggerFor]="assignedMenu"><mat-icon>more_vert</mat-icon></button>
            <mat-menu #assignedMenu="matMenu">
              <button mat-menu-item (click)="optimizeAssignedRoute()" [disabled]="isOptimizingRoute() || getCount('active', 0) < 2">
                <mat-icon [class.spin]="isOptimizingRoute()">route</mat-icon>
                <span>Optimize Route</span>
              </button>
            </mat-menu>
          </div>
          <div class="lane-content">
            @if (isLoading()) {
              <app-skeleton-loader variant="task-card" [count]="2"></app-skeleton-loader>
            } @else {
              <app-task-card *ngFor="let task of getTasksByStatus('active', 0)" [task]="task" (cardClick)="openTaskDetail($event)"></app-task-card>
              <div class="empty-lane" *ngIf="getCount('active', 0) === 0">No assigned tasks</div>
            }
          </div>
        </div>

        <!-- Lane: In Progress -->
        <div class="lane">
          <div class="lane-header">
            <h3 class="lane-title">In Progress <span class="count">{{ getCount('active', 1) }}</span></h3>
            <button mat-icon-button class="more-btn"><mat-icon>more_vert</mat-icon></button>
          </div>
          <div class="lane-content">
            <!-- AI Insight Card -->
            <div class="ai-insight-card" *ngIf="hasInsight()">
              <div class="insight-header">
                <mat-icon class="sparkle">magic_button</mat-icon>
                <span class="badge">AI Insight</span>
              </div>
              <h4 class="insight-title">Resource Bottleneck Detected</h4>
              <p class="insight-text">3 teams in Dharavi are waiting on transport. Reallocating Idle Fleet 4 could resolve in 15 mins.</p>
              <button class="insight-action">Review Suggestion</button>
            </div>

            @if (isLoading()) {
              <app-skeleton-loader variant="task-card" [count]="1"></app-skeleton-loader>
            } @else {
              <app-task-card *ngFor="let task of getTasksByStatus('active', 1)" [task]="task" (cardClick)="openTaskDetail($event)"></app-task-card>
              <div class="empty-lane" *ngIf="getCount('active', 1) === 0 && !hasInsight()">No tasks in progress</div>
            }
          </div>
        </div>

        <!-- Lane: Resolved -->
        <div class="lane resolved">
          <div class="lane-header">
            <h3 class="lane-title">Resolved <span class="count">{{ getCount('completed') }}</span></h3>
            <button mat-icon-button class="more-btn"><mat-icon>more_vert</mat-icon></button>
          </div>
          <div class="lane-content">
            @if (isLoading()) {
              <app-skeleton-loader variant="task-card" [count]="1"></app-skeleton-loader>
            } @else {
              <app-task-card *ngFor="let task of getTasksByStatus('completed')" [task]="task" (cardClick)="openTaskDetail($event)"></app-task-card>
              <div class="empty-lane" *ngIf="getCount('completed') === 0">No resolved tasks</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .board-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .board-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 4px;
      shrink-0: 0;
    }

    .stats-row {
      display: flex;
      gap: 32px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .stat-value.success { color: var(--color-success); }

    .stat-label {
      font-size: 12px;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
    }

    .control-btn {
      border-radius: 9px;
      font-size: 13px;
      border-color: rgba(0,0,0,0.1);
      background: var(--color-card);
    }

    .kanban-board {
      flex: 1;
      display: flex;
      gap: 20px;
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 8px; /* For scrollbar */
    }

    .lane {
      width: 300px;
      min-width: 300px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f1f3f1;
      border-radius: 16px;
      padding: 12px;
    }

    .lane.resolved {
      background: #f8faf8;
      opacity: 0.9;
    }

    .lane-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
    }

    .lane-title {
      margin: 0;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-secondary);
    }

    .lane-title .count {
      color: var(--color-text-hint);
      margin-left: 6px;
      font-weight: 500;
    }

    .lane-content {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 4px;
    }

    .lane-content::-webkit-scrollbar {
      width: 4px;
    }
    .lane-content::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.1);
      border-radius: 4px;
    }

    .empty-lane {
      padding: 32px 16px;
      text-align: center;
      color: var(--color-text-hint);
      font-size: 12px;
      border: 1px dashed var(--color-border);
      border-radius: 12px;
      background: rgba(0,0,0,0.02);
    }

    .ai-insight-card {
      background: linear-gradient(135deg, rgba(116, 47, 229, 0.08), rgba(10, 107, 94, 0.08));
      border: 1px solid rgba(116, 47, 229, 0.2);
      border-radius: 14px;
      padding: 16px;
      backdrop-filter: blur(8px);
    }

    .insight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .sparkle {
      color: #742fe5;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .badge {
      background: #742fe5;
      color: white;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 20px;
      text-transform: uppercase;
    }

    .insight-title {
      margin: 0 0 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .insight-text {
      margin: 0 0 10px;
      font-size: 11px;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    .insight-action {
      background: none;
      border: none;
      color: #742fe5;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
    }

    .active-filters {
      background: var(--color-primary);
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: 4px;
    }

    .filter-menu {
      padding: 12px;
      min-width: 280px;
    }

    .menu-section {
      padding: 8px 0;
    }

    .section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-text-secondary);
      display: block;
      margin-bottom: 8px;
    }

    .chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }

    .chip-row button {
      border: 1px solid var(--color-border);
      background: var(--color-card);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .chip-row button:hover {
      background: var(--color-surface);
    }

    .chip-row button.active {
      background: var(--color-primary-light);
      border-color: var(--color-primary);
      color: var(--color-primary);
      font-weight: 600;
    }

    .deploy-btn {
      background: var(--color-primary);
      color: white !important;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 600;
      padding: 0 16px;
    }

    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class TasksComponent implements OnInit {
  private firestore = inject(FirestoreService);
  private searchService = inject(SearchService);
  private dialog = inject(MatDialog);
  private geo = inject(GeolocationService);
  private snackBar = inject(MatSnackBar);
  auth = inject(AuthService);
  
  tasks = toSignal(this.firestore.getAllTasks(), { initialValue: [] });
  isLoading = signal<boolean>(true);
  isOptimizingRoute = signal<boolean>(false);
  optimizedTaskOrder = signal<string[]>([]);

  ngOnInit() {
    setTimeout(() => this.isLoading.set(false), 2000);
  }
  searchTerm = this.searchService.searchTerm;
  categoryFilter = signal<string | null>(null);
  priorityFilter = signal<string | null>(null);

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.categoryFilter()) count++;
    if (this.priorityFilter()) count++;
    return count;
  });

  filteredTasks = computed(() => {
    let all = this.tasks();
    const search = this.searchTerm().toLowerCase();
    const category = this.categoryFilter();
    const priority = this.priorityFilter();

    if (search) {
      all = all.filter(t => 
        t.title.toLowerCase().includes(search) || 
        t.description.toLowerCase().includes(search) ||
        t.locationName.toLowerCase().includes(search)
      );
    }

    if (category) {
      all = all.filter(t => t.category === category);
    }

    if (priority) {
      all = all.filter(t => t.priority === priority);
    }

    return all;
  });

  toggleCategory(cat: string) {
    this.categoryFilter.set(this.categoryFilter() === cat ? null : cat);
  }

  togglePriority(pri: string) {
    this.priorityFilter.set(this.priorityFilter() === pri ? null : pri);
  }

  clearFilters() {
    this.categoryFilter.set(null);
    this.priorityFilter.set(null);
  }

  getTasksByStatus(status: 'pending' | 'active' | 'completed', progressType?: 0 | 1) {
    let tasksList = this.filteredTasks().filter(t => {
      if (t.status !== status) return false;
      if (status === 'active' && progressType !== undefined) {
        return progressType === 0 ? (t.progress === 0) : (t.progress > 0);
      }
      return true;
    });

    if (status === 'active' && progressType === 0 && this.optimizedTaskOrder().length > 0) {
      const order = this.optimizedTaskOrder();
      tasksList.sort((a, b) => {
        const idxA = order.indexOf(a.id);
        const idxB = order.indexOf(b.id);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }
    return tasksList;
  }

  getCount(status: 'pending' | 'active' | 'completed', progressType?: 0 | 1) {
    return this.getTasksByStatus(status, progressType).length;
  }

  hasInsight() {
    return true;
  }

  openTaskDetail(task: Task) {
    this.dialog.open(TaskDetailComponent, {
      width: '600px',
      data: { task }
    });
  }

  openCreateTask() {
    this.dialog.open(CreateTaskComponent, {
      width: '500px',
      disableClose: true
    });
  }

  async optimizeAssignedRoute() {
    if (!window.google) {
      this.snackBar.open('Google Maps API not loaded.', 'OK', { duration: 3000 });
      return;
    }
    
    // Get unstarted assigned tasks without sorting by optimized order
    let unstartedActiveTasks = this.filteredTasks().filter(t => t.status === 'active' && t.progress === 0);
    
    if (unstartedActiveTasks.length < 2) {
      this.snackBar.open('Not enough assigned tasks to optimize.', 'OK', { duration: 3000 });
      return;
    }

    this.isOptimizingRoute.set(true);
    this.snackBar.open('Optimizing route with Google Maps...', '', { duration: 2000 });

    try {
      const currentLoc = await this.geo.getCurrentPosition();
      const directionsService = new google.maps.DirectionsService();
      
      const origin = new google.maps.LatLng(currentLoc.lat, currentLoc.lng);
      
      const allWaypoints = unstartedActiveTasks.map(t => ({
        location: new google.maps.LatLng(t.locationLat, t.locationLng),
        stopover: true
      }));

      directionsService.route({
        origin: origin,
        destination: origin,
        waypoints: allWaypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const order = result.routes[0].waypoint_order;
          const optimizedIds = order.map((idx: number) => unstartedActiveTasks[idx].id);
          this.optimizedTaskOrder.set(optimizedIds);
          this.snackBar.open('Route optimized successfully!', 'Dismiss', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to optimize route.', 'OK', { duration: 3000 });
        }
        this.isOptimizingRoute.set(false);
      });
    } catch (e) {
      console.error(e);
      this.snackBar.open('Error getting current location.', 'OK', { duration: 3000 });
      this.isOptimizingRoute.set(false);
    }
  }
}
