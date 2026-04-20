import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FirestoreService } from '../../core/firebase/firestore.service';

@Component({
  selector: 'app-add-volunteer',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatSelectModule, 
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="font-serif text-2xl text-primary">Register New Volunteer</h2>
    <mat-dialog-content class="pt-4">
      <form [formGroup]="volunteerForm" class="flex flex-col gap-4">
        <mat-form-field appearance="outline">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Aisha Khan">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Phone Number</mat-label>
          <input matInput formControlName="phone" placeholder="e.g. +91 98765 43210">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Skills</mat-label>
          <mat-select formControlName="skills" multiple>
            <mat-option value="Medical">Medical</mat-option>
            <mat-option value="Logistics">Logistics</mat-option>
            <mat-option value="Translation">Translation</mat-option>
            <mat-option value="First Aid">First Aid</mat-option>
            <mat-option value="Teaching">Teaching</mat-option>
            <mat-option value="Construction">Construction</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Latitude</mat-label>
            <input matInput type="number" formControlName="lat">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Longitude</mat-label>
            <input matInput type="number" formControlName="lng">
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="pb-6 px-6">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="volunteerForm.invalid" (click)="onSubmit()">
        Register Volunteer
      </button>
    </mat-dialog-actions>
  `
})
export class AddVolunteerComponent {
  private fb = inject(FormBuilder);
  private firestore = inject(FirestoreService);
  private dialogRef = inject(MatDialogRef<AddVolunteerComponent>);

  volunteerForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    skills: [[] as string[], Validators.required],
    lat: [19.0444, Validators.required],
    lng: [72.8501, Validators.required]
  });

  onCancel() {
    this.dialogRef.close();
  }

  async onSubmit() {
    if (this.volunteerForm.valid) {
      const data = this.volunteerForm.value;
      await this.firestore.addVolunteer(data as any);
      await this.firestore.logActivity({
        type: 'volunteer_joined',
        text: `<b>${data.name}</b> joined the volunteer force.`,
        dotClass: 'bg-primary',
        userId: 'admin' // Placeholder
      });
      this.dialogRef.close(true);
    }
  }
}
