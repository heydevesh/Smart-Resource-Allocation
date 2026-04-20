import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FirestoreService } from '../../core/firebase/firestore.service';

@Component({
  selector: 'app-add-volunteer',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="modal-header">
      <h2 mat-dialog-title>Register New Volunteer</h2>
    </div>
    
    <mat-dialog-content>
      <form [formGroup]="volunteerForm" class="flex flex-col gap-4 py-4">
        <mat-form-field appearance="outline">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter volunteer name">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Phone Number</mat-label>
          <input matInput formControlName="phone" placeholder="+91 xxxxx xxxxx">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Skills</mat-label>
          <mat-select formControlName="skills" multiple>
            <mat-option value="Medical">Medical</mat-option>
            <mat-option value="Food Distribution">Food Distribution</mat-option>
            <mat-option value="Logistics">Logistics</mat-option>
            <mat-option value="Rescue">Rescue</mat-option>
            <mat-option value="Communication">Communication</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="volunteerForm.invalid" (click)="onSubmit()">
        Register Volunteer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .modal-header {
      padding: 24px 24px 0;
      h2 { margin: 0; font-family: var(--font-display); }
    }
    mat-dialog-content {
      min-width: 400px;
    }
  `]
})
export class AddVolunteerComponent {
  private fb = inject(FormBuilder);
  private firestore = inject(FirestoreService);
  private dialogRef = inject(MatDialogRef<AddVolunteerComponent>);

  volunteerForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern('^[0-9+ ]{10,15}$')]],
    skills: [[], Validators.required]
  });

  onCancel() {
    this.dialogRef.close();
  }

  async onSubmit() {
    if (this.volunteerForm.valid) {
      const volunteerData = {
        ...this.volunteerForm.value,
        available: true,
        rating: 5.0,
        tasksCompleted: 0,
        totalHours: 0,
        active: true,
        lat: 19.0443, // Default to Dharavi
        lng: 72.8550
      };
      
      // Note: In a real app, we'd add this to Firestore
      console.log('Adding volunteer:', volunteerData);
      this.dialogRef.close(volunteerData);
    }
  }
}
