import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { effect } from '@angular/core';
import { NgoRegistryService } from '../../core/ngo/ngo-registry.service';

@Component({
  selector: 'app-verification-status',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    RouterLink, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  template: `
    <div class="container">
      <div class="status-card" [ngClass]="user()?.verificationStatus || 'pending'">
        <div class="icon-header">
          <div class="icon-blob" [ngClass]="user()?.verificationStatus || 'pending'">
            <mat-icon fontSet="material-symbols-rounded">
              {{ getStatusIcon(user()?.verificationStatus) }}
            </mat-icon>
          </div>
        </div>
        
        @if (isProfileIncomplete()) {
          <h2 class="title">{{ isNgo() ? 'Complete NGO Onboarding' : 'Complete Your Profile' }}</h2>
          <p class="description">
            Namaste <strong>{{ user()?.displayName }}</strong>. To process your {{ isNgo() ? 'NGO registration' : 'application' }}, please provide a few more details.
          </p>

          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="profile-form">
            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone" placeholder="+91 XXXXX XXXXX">
              <mat-icon matPrefix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Ward / Region</mat-label>
              <mat-select formControlName="region">
                <mat-option value="Dharavi">Dharavi</mat-option>
                <mat-option value="Kurla">Kurla</mat-option>
                <mat-option value="Govandi">Govandi</mat-option>
                <mat-option value="Bhandup">Bhandup</mat-option>
              </mat-select>
              <mat-icon matPrefix>location_on</mat-icon>
            </mat-form-field>

            @if (!isNgo()) {
              <mat-form-field appearance="outline">
                <mat-label>Primary Skills (Comma separated)</mat-label>
                <input matInput formControlName="skills" placeholder="Medical, Logistics, Driving">
                <mat-icon matPrefix>construction</mat-icon>
              </mat-form-field>
            }

            <mat-form-field appearance="outline">
              <mat-label>{{ isNgo() ? 'Admin ID Proof (Aadhaar)' : 'ID Proof URL' }}</mat-label>
              <input matInput formControlName="idProofUrl" placeholder="Link to document photo">
              <mat-icon matPrefix>badge</mat-icon>
            </mat-form-field>

            <button mat-flat-button color="primary" class="submit-btn" [disabled]="profileForm.invalid || loading()">
              {{ loading() ? 'Saving...' : 'Submit Profile' }}
            </button>
          </form>
        } @else {
          @switch (user()?.verificationStatus) {
            @case ('shortlisted') {
              <h2 class="title">{{ isNgo() ? 'Initial Review Passed' : "You're Shortlisted!" }}</h2>
              <p class="description">
                @if (isNgo()) {
                  Great news, <strong>{{ user()?.displayName }}</strong>! Your NGO profile has passed our initial screening. Our partnerships team will reach out for a verification visit.
                } @else {
                  Great news, <strong>{{ user()?.displayName }}</strong>! Your profile has been shortlisted. Our coordinator will contact you shortly for a brief onboarding call.
                }
              </p>
            }
            @case ('rejected') {
              <h2 class="title">Application Status</h2>
              <p class="description">
                Namaste <strong>{{ user()?.displayName }}</strong>. Thank you for your interest in Sahaay. At this time, we are unable to proceed with your {{ isNgo() ? 'NGO registration' : 'application' }}.
              </p>
            }
            @case ('approved') {
              <h2 class="title">{{ isNgo() ? 'Organization Verified!' : 'Welcome to the Team!' }}</h2>
              <p class="description">
                @if (isNgo()) {
                  Congratulations! Your organization is now a verified partner on Sahaay. You can now start posting needs and managing missions.
                } @else {
                  Congratulations, <strong>{{ user()?.displayName }}</strong>! You are now a verified Sahaay volunteer. You can now access the full dashboard.
                }
              </p>
              <button mat-flat-button color="primary" class="go-btn" routerLink="/home">
                Go to Dashboard
              </button>
            }
            @default {
              <h2 class="title">{{ isNgo() ? 'NGO Registry Under Review' : 'Application Under Review' }}</h2>
              <p class="description">
                Namaste, <strong>{{ user()?.displayName }}</strong>. Your application to {{ isNgo() ? 'register your NGO' : 'join Sahaay as a verified volunteer' }} is being processed by our {{ isNgo() ? 'platform administrators' : 'NGO coordinators' }}.
              </p>
            }
          }

          <div class="steps" *ngIf="user()?.verificationStatus !== 'rejected'">
            <div class="step completed">
              <mat-icon>check_circle</mat-icon>
              <div class="step-content">
                <h3>Identity Verification</h3>
                <p>{{ isNgo() ? 'Founder identity verified' : 'Phone OTP verified successfully' }}</p>
              </div>
            </div>
            
            <div class="step" [ngClass]="{'completed': isCompleted('profile'), 'active': isActive('profile')}">
              <mat-icon>{{ getStepIcon('profile') }}</mat-icon>
              <div class="step-content">
                <h3>{{ isNgo() ? 'NGO Profile & Branding' : 'Profile Review' }}</h3>
                <p>{{ isNgo() ? 'Reviewing NGO certificates and mission' : 'A coordinator is reviewing your skills and documents' }}</p>
              </div>
            </div>

            <div class="step" [ngClass]="{'completed': isCompleted('onboarding'), 'active': isActive('onboarding'), 'pending': isPending('onboarding')}">
              <mat-icon>{{ getStepIcon('onboarding') }}</mat-icon>
              <div class="step-content">
                <h3>{{ isNgo() ? 'Partnership Activation' : 'Onboarding Call' }}</h3>
                <p>{{ isNgo() ? 'Final verification for platform access' : 'Shortlisted candidates will receive a call' }}</p>
              </div>
            </div>
          </div>
        }

        <div class="info-box" *ngIf="user()?.verificationStatus !== 'rejected' && user()?.verificationStatus !== 'approved' && !isProfileIncomplete()">
          <mat-icon>info</mat-icon>
          <p>This process usually takes {{ isNgo() ? '2-3 business days' : '24-48 hours' }}. You will receive {{ isNgo() ? 'an email' : 'an SMS' }} alert once approved.</p>
        </div>

        <button mat-stroked-button class="logout-btn" (click)="auth.signOut()">
          Sign Out
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      padding: 24px;
    }
    .status-card {
      background: var(--color-card);
      padding: 40px;
      border-radius: 24px;
      box-shadow: 0 12px 40px rgba(0, 81, 71, 0.08);
      max-width: 480px;
      width: 100%;
      text-align: center;
      border: 1px solid rgba(0, 81, 71, 0.05);
      transition: all 0.3s ease;
    }
    .status-card.rejected { border-top: 4px solid #dc2626; }
    .status-card.approved { border-top: 4px solid #16a34a; }
    .status-card.shortlisted { border-top: 4px solid #ffb300; }

    .icon-header {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }
    .icon-blob {
      width: 80px;
      height: 80px;
      border-radius: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      rotate: -10deg;
      transition: all 0.3s ease;
    }
    .icon-blob.pending { background: var(--color-warning-light); color: var(--color-warning); }
    .icon-blob.shortlisted { background: var(--color-warning-light); color: var(--color-warning); animation: pulse 2s infinite; }
    .icon-blob.approved { background: var(--color-success-light); color: var(--color-success); rotate: 0deg; }
    .icon-blob.rejected { background: var(--color-danger-light); color: var(--color-danger); rotate: 0deg; }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .icon-blob mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }
    .title {
      font-family: var(--font-display);
      font-size: 28px;
      color: var(--color-primary);
      margin-bottom: 12px;
    }
    .description {
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: left;
      margin-bottom: 24px;
    }
    .submit-btn {
      height: 48px;
      border-radius: 12px;
      font-weight: 700;
      margin-top: 16px;
    }
    .steps {
      text-align: left;
      margin-bottom: 32px;
    }
    .step {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }
    .step mat-icon {
      margin-top: 4px;
    }
    .step.completed { color: var(--color-success); }
    .step.active { color: var(--color-warning); }
    .step.pending { color: var(--color-outline-variant); }
    .step-content h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
    }
    .step-content p {
      margin: 2px 0 0;
      font-size: 13px;
      opacity: 0.8;
    }
    .info-box {
      background: var(--color-success-light);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      text-align: left;
    }
    .info-box mat-icon { color: var(--color-success); font-size: 20px; }
    .info-box p { margin: 0; font-size: 12px; color: var(--color-success); line-height: 1.5; }
    
    .go-btn {
      width: 100%;
      height: 48px;
      border-radius: 12px;
      font-weight: 700;
      margin-bottom: 16px;
      background: var(--color-primary);
      color: white;
    }

    .logout-btn {
      width: 100%;
      height: 48px;
      border-radius: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
    }
  `]
})
export class VerificationStatusComponent {
  protected auth = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private ngoRegistryService = inject(NgoRegistryService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  
  user = toSignal(this.auth.currentUser$);
  profileForm: FormGroup;
  loading = signal(false);

  constructor() {
    this.profileForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+]{10,13}$/)]],
      region: ['', Validators.required],
      skills: [''], // Validators added dynamically
      idProofUrl: ['', Validators.required]
    });

    // Effect to handle form pre-population and dynamic validation
    effect(() => {
      const u = this.user();
      if (!u) return;

      // Update validators based on role
      if (this.isNgo()) {
        this.profileForm.get('skills')?.clearValidators();
      } else {
        this.profileForm.get('skills')?.setValidators([Validators.required]);
      }
      this.profileForm.get('skills')?.updateValueAndValidity();

      // Pre-populate form
      this.profileForm.patchValue({
        phone: u.phone || '',
        region: u.region || '',
        skills: u.skills?.join(', ') || '',
        idProofUrl: u.idProofUrl || ''
      }, { emitEvent: false });
    });
  }

  isNgo(): boolean {
    return this.user()?.role === 'ngo_founder' || this.user()?.role === 'ngo_admin';
  }

  isProfileIncomplete(): boolean {
    const u = this.user();
    if (!u || u.verificationStatus === 'rejected') return false;
    
    // If it's a new registration, it might be 'ngo_founder'/'ngo_admin' but with incomplete profile
    if (this.isNgo()) {
      return !u.phone || !u.region;
    }

    if (u.role !== 'applicant') return false;
    return !u.phone || !u.skills || u.skills.length === 0 || !u.region;
  }

  async saveProfile() {
    if (this.profileForm.invalid) return;
    
    const u = this.user();
    if (!u) return;

    this.loading.set(true);
    try {
      const formValue = this.profileForm.value;
      const profileData: any = {
        phone: formValue.phone,
        region: formValue.region,
        idProofUrl: formValue.idProofUrl
      };

      if (!this.isNgo()) {
        profileData.skills = formValue.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }
      
      await this.firestoreService.updateUserProfile(u.uid, profileData);

      // If NGO Founder, also update the NGO primary contact info
      if (this.isNgo() && u.ngoId) {
        await this.ngoRegistryService.updateProfile(u.ngoId, {
          primaryContact: {
            name: u.displayName || '',
            email: u.email || '',
            phone: profileData.phone,
            designation: 'Founder'
          },
          operatingRegions: [profileData.region]
        });
      }
      
      this.snackBar.open('Profile updated and submitted for review!', 'OK', { duration: 3000 });
    } catch (e) {
      this.snackBar.open('Error saving profile. Please try again.', 'OK', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'approved': return 'verified';
      case 'rejected': return 'cancel';
      case 'shortlisted': return 'notification_important';
      default: return 'verified_user';
    }
  }

  isCompleted(step: string): boolean {
    const status = this.user()?.verificationStatus;
    if (step === 'profile') return status === 'shortlisted' || status === 'approved';
    if (step === 'onboarding') return status === 'approved';
    return false;
  }

  isActive(step: string): boolean {
    const status = this.user()?.verificationStatus;
    if (step === 'profile') return status === 'pending';
    if (step === 'onboarding') return status === 'shortlisted';
    return false;
  }

  isPending(step: string): boolean {
    const status = this.user()?.verificationStatus;
    if (step === 'onboarding') return status === 'pending';
    return false;
  }

  getStepIcon(step: string): string {
    if (this.isCompleted(step)) return 'check_circle';
    if (this.isActive(step)) return 'hourglass_empty';
    return 'radio_button_unchecked';
  }
}

