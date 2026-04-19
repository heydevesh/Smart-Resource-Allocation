import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo">
          <mat-icon>volunteer_activism</mat-icon>
          <h1>Sahaay</h1>
        </div>
        <p class="subtitle">NGO Coordination & Real-time Needs Map</p>
        
        <div class="actions">
          <button mat-flat-button color="primary" class="full-width" (click)="login()">
            <mat-icon>login</mat-icon> Sign in with Google
          </button>
          <button mat-stroked-button class="full-width mt-2" (click)="loginAsAdmin()">
            Sign in as Demo Admin
          </button>
        </div>
        
        <p class="terms">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-surface);
      padding: 24px;
    }
    .login-card {
      background: var(--color-card);
      padding: 40px;
      border-radius: var(--radius-card);
      box-shadow: 0 8px 24px rgba(0,0,0,0.05);
      width: 100%;
      max-width: 400px;
      text-align: center;
      border: 1px solid var(--color-border);
    }
    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: var(--color-primary);
      margin-bottom: 8px;
    }
    .logo mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
    h1 {
      margin: 0;
      font-family: var(--font-display);
      font-size: 2.5rem;
    }
    .subtitle {
      color: var(--color-text-secondary);
      font-family: var(--font-ui);
      margin-bottom: 40px;
    }
    .full-width {
      width: 100%;
      padding: 24px 0;
      font-size: 1.1rem;
    }
    .mt-2 {
      margin-top: 16px;
    }
    .terms {
      margin-top: 32px;
      font-size: 0.75rem;
      color: var(--color-text-hint);
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  async login() {
    try {
      await this.auth.loginWithGoogle();
      this.router.navigate(['/home']);
    } catch (e) {
      console.error(e);
      // Fallback for development if Firebase is not connected yet
      this.loginAsAdmin();
    }
  }

  loginAsAdmin() {
    this.auth.setMockAdmin();
    this.router.navigate(['/home']);
  }
}
