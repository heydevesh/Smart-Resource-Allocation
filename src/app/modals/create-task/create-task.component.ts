import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { AuthService } from '../../core/auth/auth.service';
import { TaskContact } from '../../models';
import { Timestamp } from '@angular/fire/firestore';
import type { Task } from '../../models';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="modal-header">
      <h2 mat-dialog-title>Assign New Operation</h2>
      <button mat-icon-button (click)="close()" class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <form [formGroup]="taskForm" class="task-form">
        <mat-form-field appearance="outline">
          <mat-label>Operation Title</mat-label>
          <input matInput formControlName="title" placeholder="e.g. Medical Supply Drop">
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option value="medical">Medical</mat-option>
              <mat-option value="food">Food</mat-option>
              <mat-option value="education">Education</mat-option>
              <mat-option value="shelter">Shelter</mat-option>
              <mat-option value="water">Water</mat-option>
              <mat-option value="other">Other</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="low">Low</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="high">High</mat-option>
              <mat-option value="critical">Critical</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Location Name</mat-label>
          <input matInput formControlName="locationName" placeholder="e.g. Sector 4, Dharavi">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Detailed Objectives</mat-label>
          <textarea matInput formControlName="description" rows="4" placeholder="Describe the mission scope..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" 
              [disabled]="taskForm.invalid || loading" 
              (click)="submit()"
              class="submit-btn">
        {{ loading ? 'Deploying...' : 'Deploy Task' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
    }
    h2 { margin: 0; font-family: var(--font-display); color: var(--color-primary); }
    .task-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 16px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .form-row > * { flex: 1; }
    .submit-btn {
      background: var(--color-primary);
      color: white;
      border-radius: 9px;
      padding: 0 24px;
    }
    ::ng-deep .mat-mdc-dialog-container {
      border-radius: 16px !important;
    }
  `]
})
export class CreateTaskComponent {
  private fb = inject(FormBuilder);
  private firestore = inject(FirestoreService);
  private auth = inject(AuthService);
  private dialogRef = inject(MatDialogRef<CreateTaskComponent>);

  loading = false;

  taskForm = this.fb.group({
    title: ['', Validators.required],
    category: ['other', Validators.required],
    priority: ['medium', Validators.required],
    locationName: ['', Validators.required],
    description: ['', Validators.required],
    locationLat: [19.0443], // Default Dharavi
    locationLng: [72.8550]
  });

  async submit() {
    if (this.taskForm.valid) {
      this.loading = true;
      try {
        const user = this.auth.currentUser;
        const now = new Date();
        const v = this.taskForm.getRawValue();

        const safeCategory: Task['category'] =
          v.category === 'food' ||
          v.category === 'medical' ||
          v.category === 'education' ||
          v.category === 'shelter' ||
          v.category === 'water'
            ? v.category
            : 'other';

        const safePriority: Task['priority'] =
          v.priority === 'low' ||
          v.priority === 'medium' ||
          v.priority === 'high'
            ? v.priority
            : 'critical';

        const taskData: Partial<Task> = {
          title: v.title ?? '',
          category: safeCategory,
          priority: safePriority,
          locationName: v.locationName ?? '',
          description: v.description ?? '',
          locationLat: v.locationLat ?? 0,
          locationLng: v.locationLng ?? 0,
          createdBy: user?.uid || 'system',
          dueAt: Timestamp.fromDate(now),
          volunteerIds: [],
          progress: 0,
          status: 'pending',
          attachmentUrls: [],
          recurring: false,
        };

        const taskId = await this.firestore.addTask(taskData);

        // Contacts are stored separately and unlocked only after volunteer acceptance.
        if (user?.uid) {
          const contact: TaskContact = {
            id: taskId,
            taskId,
            primary: {
              name: user.displayName || 'Coordinator',
              phone: user.phone,
              whatsapp: user.phone,
            },
            createdBy: user.uid,
            createdAt: now,
            region: user.region,
          };
          await this.firestore.upsertTaskContact(contact);
        }
        await this.firestore.logActivity({
          type: 'task_created',
          text: `New operation <b>${taskData.title}</b> deployed in ${taskData.locationName}.`,
          dotClass: 'bg-info',
          userId: user?.uid || 'system'
        });
        this.dialogRef.close(true);
      } catch (error) {
        console.error('Error adding task:', error);
      } finally {
        this.loading = false;
      }
    }
  }

  close() {
    this.dialogRef.close();
  }
}
