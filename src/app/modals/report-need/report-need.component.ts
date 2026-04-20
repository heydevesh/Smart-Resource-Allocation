import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { StorageService } from '../../core/firebase/storage.service';
import { GeolocationService } from '../../core/maps/geolocation.service';
import { Timestamp } from '@angular/fire/firestore';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-report-need',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './report-need.component.html',
  styleUrl: './report-need.component.scss'
})
export class ReportNeedComponent {
  private fb = inject(FormBuilder);
  private firestore = inject(FirestoreService);
  private storage = inject(StorageService);
  private geo = inject(GeolocationService);
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  public dialogRef = inject(MatDialogRef<ReportNeedComponent>);

  reportForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['other', Validators.required],
    urgency: ['medium', Validators.required],
    locationName: ['Detecting location...', Validators.required]
  });

  isDetectingLocation = false;
  isUploading = false;
  currentCoords: { lat: number; lng: number } | null = null;
  selectedPhoto: File | null = null;
  photoPreview: string | null = null;

  constructor() {
    this.detectLocation();
  }

  async detectLocation() {
    this.isDetectingLocation = true;
    try {
      const pos = await this.geo.getCurrentPosition();
      this.currentCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      
      this.reportForm.patchValue({
        locationName: `MUM-WARD-${Math.floor(Math.random() * 24) + 1} (${this.currentCoords.lat.toFixed(4)}, ${this.currentCoords.lng.toFixed(4)})`
      });
    } catch (error) {
      console.error('Location error:', error);
      this.reportForm.patchValue({ locationName: 'Location detection failed. Please enter manually.' });
    } finally {
      this.isDetectingLocation = false;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedPhoto = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    if (this.reportForm.valid && this.currentCoords) {
      this.isUploading = true;
      const formValue = this.reportForm.value;
      
      let photoUrl = '';
      if (this.selectedPhoto) {
        try {
          const path = `needs/${Date.now()}_${this.selectedPhoto.name}`;
          photoUrl = await this.storage.uploadPhoto(this.selectedPhoto, path);
        } catch (error) {
          console.error('Upload error:', error);
        }
      }

      const newNeed = {
        title: formValue.title!,
        description: formValue.description!,
        category: formValue.category as any,
        urgency: formValue.urgency as any,
        lat: this.currentCoords.lat,
        lng: this.currentCoords.lng,
        locationName: formValue.locationName!,
        reportedAt: Timestamp.now(),
        reportedBy: this.auth.currentUser?.uid || 'anonymous',
        status: 'open' as const,
        assignedVolunteers: [],
        photoUrl
      };

      try {
        await this.firestore.addNeed(newNeed);
        this.snackBar.open('Crisis report submitted successfully. Intelligence team notified.', 'Dismiss', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(true);
      } catch (error) {
        this.snackBar.open('Failed to submit report. Please check your connection.', 'Retry');
      } finally {
        this.isUploading = false;
      }
    }
  }
}
