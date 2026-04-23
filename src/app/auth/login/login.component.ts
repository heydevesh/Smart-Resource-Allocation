import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatSnackBarModule,
    MatCheckboxModule
  ],
  template: `
    <div class="login-page">
      <!-- Ambient background blobs -->
      <div class="ambient-blob blob-1"></div>
      <div class="ambient-blob blob-2"></div>
      <div class="ambient-blob blob-3"></div>

      <main class="login-main">
        <div class="login-card">

          <!-- Brand Header -->
          <div class="brand-header">
            <div class="brand-icon">
              <mat-icon fontSet="material-symbols-rounded"
                        style="font-variation-settings: 'FILL' 1, 'wght' 300;">volunteer_activism</mat-icon>
            </div>
            <h1 class="brand-name">Sahaay</h1>
            <p class="brand-tagline">Humanitarian Coordination Platform</p>
          </div>

          <!-- Auth Form -->
          <form class="auth-form" (ngSubmit)="loginWithEmail()">
            <!-- Email -->
            <div class="field-group">
              <label class="field-label" for="email">Email address</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <mat-icon fontSet="material-symbols-rounded"
                            style="font-variation-settings: 'FILL' 0, 'wght' 300;">mail</mat-icon>
                </span>
                <input id="email"
                       type="email"
                       name="email"
                       [(ngModel)]="email"
                       placeholder="coordinator&#64;example.com"
                       required
                       class="auth-input"
                       autocomplete="email">
              </div>
            </div>

            <!-- Password -->
            <div class="field-group">
              <div class="label-row">
                <label class="field-label" for="password">Password</label>
                <a class="forgot-link" href="javascript:void(0)">Forgot password?</a>
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <mat-icon fontSet="material-symbols-rounded"
                            style="font-variation-settings: 'FILL' 0, 'wght' 300;">lock</mat-icon>
                </span>
                <input [type]="showPassword() ? 'text' : 'password'"
                       id="password"
                       name="password"
                       [(ngModel)]="password"
                       placeholder="••••••••"
                       required
                       class="auth-input"
                       autocomplete="current-password">
                <button type="button" class="toggle-pw" (click)="showPassword.set(!showPassword())">
                  <mat-icon fontSet="material-symbols-rounded"
                            style="font-variation-settings: 'FILL' 0, 'wght' 300;">
                    {{ showPassword() ? 'visibility_off' : 'visibility' }}
                  </mat-icon>
                </button>
              </div>
            </div>

            <!-- Remember Me -->
            <div class="remember-row">
              <mat-checkbox color="primary" class="remember-check">
                <span class="remember-text">Remember me</span>
              </mat-checkbox>
            </div>

            <!-- Sign In Button -->
            <button type="submit" class="sign-in-btn" [disabled]="loading">
              @if (loading) {
                <span class="btn-spinner"></span>
                Signing in...
              } @else {
                Sign In
              }
            </button>

            <!-- Divider -->
            <div class="auth-divider">
              <span>Or continue with</span>
            </div>

            <!-- Google -->
            <button type="button" class="google-btn" (click)="loginWithGoogle()" [disabled]="loading">
              <svg viewBox="0 0 24 24" width="18" height="18" class="google-icon">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </form>

          <!-- Demo Accounts removed for security -->
        </div>

        <!-- Footer -->
        <p class="login-footer">© 2024 Sahaay — Empowering Communities</p>
      </main>
    </div>
  `,
  styles: [`
    /* ===== Page Layout ===== */
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f3;
      position: relative;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }

    /* ===== Ambient Background Blobs ===== */
    .ambient-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.25;
      pointer-events: none;
    }
    .blob-1 {
      width: 420px; height: 420px;
      background: #85d5c5;
      top: -120px; left: -80px;
    }
    .blob-2 {
      width: 320px; height: 320px;
      background: #68dbae;
      bottom: -60px; right: -40px;
    }
    .blob-3 {
      width: 200px; height: 200px;
      background: #ffb59e;
      top: 40%; right: 10%;
      opacity: 0.15;
    }

    /* ===== Main Container ===== */
    .login-main {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 400px;
      padding: 24px;
    }

    /* ===== Card ===== */
    .login-card {
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow:
        0 4px 32px rgba(26, 28, 28, 0.06),
        0 1px 4px rgba(26, 28, 28, 0.04);
      border: 1px solid rgba(190, 201, 197, 0.10);
    }

    /* ===== Brand Header ===== */
    .brand-header {
      text-align: center;
      padding: 40px 32px 24px;
    }

    .brand-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px; height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #005147, #0a6b5e);
      color: #ffffff;
      margin-bottom: 16px;
      box-shadow: 0 4px 16px rgba(10, 107, 94, 0.25);
    }
    .brand-icon mat-icon {
      font-size: 28px;
      width: 28px; height: 28px;
    }

    .brand-name {
      margin: 0;
      font-family: 'DM Serif Display', 'Noto Serif', serif;
      font-size: 1.85rem;
      font-weight: 400;
      color: #005147;
      letter-spacing: -0.02em;
    }

    .brand-tagline {
      margin: 4px 0 0;
      font-size: 0.7rem;
      font-weight: 400;
      color: #6f7976;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    /* ===== Form ===== */
    .auth-form {
      padding: 0 32px 32px;
    }

    .field-group {
      margin-bottom: 18px;
    }

    .field-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 500;
      color: rgba(26, 28, 28, 0.8);
      margin-bottom: 6px;
    }

    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .forgot-link {
      font-size: 0.7rem;
      font-weight: 500;
      color: #006c4e;
      text-decoration: none;
      transition: color 0.2s;
    }
    .forgot-link:hover {
      color: #005147;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      display: flex;
      align-items: center;
      pointer-events: none;
      color: rgba(111, 121, 118, 0.7);
    }
    .input-icon mat-icon {
      font-size: 20px;
      width: 20px; height: 20px;
    }

    .auth-input {
      width: 100%;
      padding: 11px 12px 11px 42px;
      border: none;
      border-radius: 10px;
      background: rgba(232, 232, 231, 0.45);
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      font-weight: 300;
      color: #1a1c1c;
      outline: none;
      transition: all 0.2s ease;
    }
    .auth-input::placeholder {
      color: rgba(111, 121, 118, 0.55);
    }
    .auth-input:focus {
      background: #ffffff;
      box-shadow: 0 0 0 2px rgba(10, 107, 94, 0.2);
    }

    .toggle-pw {
      position: absolute;
      right: 8px;
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(111, 121, 118, 0.6);
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 6px;
      transition: color 0.2s;
    }
    .toggle-pw:hover { color: #005147; }
    .toggle-pw mat-icon { font-size: 20px; width: 20px; height: 20px; }

    /* ===== Remember Me ===== */
    .remember-row {
      margin-bottom: 20px;
    }
    .remember-check {
      --mdc-checkbox-selected-icon-color: #005147;
      --mdc-checkbox-selected-hover-icon-color: #0a6b5e;
    }
    .remember-text {
      font-size: 0.75rem;
      font-weight: 300;
      color: rgba(62, 73, 70, 0.8);
    }

    /* ===== Sign In Button ===== */
    .sign-in-btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, #005147, #0a6b5e);
      color: #ffffff;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.25s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      letter-spacing: 0.01em;
    }
    .sign-in-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(10, 107, 94, 0.3);
    }
    .sign-in-btn:active:not(:disabled) {
      transform: translateY(0);
    }
    .sign-in-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ===== Divider ===== */
    .auth-divider {
      display: flex;
      align-items: center;
      margin: 22px 0;
    }
    .auth-divider::before,
    .auth-divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid rgba(190, 201, 197, 0.2);
    }
    .auth-divider span {
      padding: 0 14px;
      font-size: 0.7rem;
      font-weight: 300;
      color: rgba(111, 121, 118, 0.55);
    }

    /* ===== Google Button ===== */
    .google-btn {
      width: 100%;
      padding: 11px;
      border: 1px solid rgba(190, 201, 197, 0.3);
      border-radius: 10px;
      background: #ffffff;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      font-weight: 300;
      color: rgba(26, 28, 28, 0.8);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .google-btn:hover:not(:disabled) {
      background: #f3f4f3;
      border-color: rgba(190, 201, 197, 0.5);
    }
    .google-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .google-icon { flex-shrink: 0; }

    /* ===== Demo Accounts ===== */
    .demo-section {
      padding: 4px 32px 24px;
    }

    .demo-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 0.7rem;
      font-weight: 300;
      color: rgba(62, 73, 70, 0.45);
      padding: 6px;
      transition: color 0.2s;
    }
    .demo-toggle:hover { color: rgba(62, 73, 70, 0.8); }
    .demo-toggle mat-icon {
      font-size: 18px; width: 18px; height: 18px;
      transition: transform 0.3s ease;
    }
    .demo-toggle mat-icon.rotated {
      transform: rotate(180deg);
    }

    .demo-list {
      margin-top: 10px;
      animation: fadeInDown 0.25s ease;
    }

    .demo-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 9px 12px;
      background: rgba(243, 244, 243, 0.6);
      border: 1px solid rgba(190, 201, 197, 0.1);
      border-radius: 8px;
      margin-bottom: 6px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: all 0.2s;
    }
    .demo-row:hover {
      background: rgba(161, 242, 225, 0.12);
      border-color: rgba(10, 107, 94, 0.15);
    }

    .demo-role {
      font-size: 0.75rem;
      font-weight: 400;
      color: #1a1c1c;
    }

    .demo-email {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.65rem;
      color: rgba(111, 121, 118, 0.7);
    }

    .demo-hint {
      text-align: center;
      font-size: 0.65rem;
      font-weight: 300;
      color: rgba(111, 121, 118, 0.5);
      margin: 10px 0 0;
    }
    .demo-hint code {
      background: rgba(232, 232, 231, 0.5);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.65rem;
      color: #005147;
    }

    /* ===== Footer ===== */
    .login-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.6rem;
      font-weight: 300;
      color: rgba(62, 73, 70, 0.35);
      letter-spacing: 0.05em;
    }

    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ===== Responsive ===== */
    @media (max-width: 480px) {
      .login-main { padding: 16px; }
      .brand-header { padding: 32px 24px 20px; }
      .auth-form { padding: 0 24px 24px; }
      .demo-section { padding: 4px 24px 20px; }
    }

    /* ===== Dark Theme ===== */
    :host-context(.dark-theme) .login-page {
      background: #1a1c1c;
    }
    :host-context(.dark-theme) .login-card {
      background: #2f3130;
      border-color: rgba(190, 201, 197, 0.06);
      box-shadow: 0 4px 32px rgba(0, 0, 0, 0.3);
    }
    :host-context(.dark-theme) .brand-name { color: #85d5c5; }
    :host-context(.dark-theme) .brand-tagline { color: rgba(241, 241, 240, 0.5); }
    :host-context(.dark-theme) .field-label { color: rgba(241, 241, 240, 0.7); }
    :host-context(.dark-theme) .forgot-link { color: #68dbae; }
    :host-context(.dark-theme) .auth-input {
      background: rgba(62, 73, 70, 0.35);
      color: #f1f1f0;
    }
    :host-context(.dark-theme) .auth-input::placeholder { color: rgba(190, 201, 197, 0.4); }
    :host-context(.dark-theme) .auth-input:focus {
      background: rgba(62, 73, 70, 0.55);
      box-shadow: 0 0 0 2px rgba(133, 213, 197, 0.25);
    }
    :host-context(.dark-theme) .google-btn {
      background: rgba(62, 73, 70, 0.3);
      border-color: rgba(190, 201, 197, 0.12);
      color: rgba(241, 241, 240, 0.8);
    }
    :host-context(.dark-theme) .google-btn:hover { background: rgba(62, 73, 70, 0.5); }
    :host-context(.dark-theme) .demo-row {
      background: rgba(62, 73, 70, 0.25);
      border-color: rgba(190, 201, 197, 0.06);
    }
    :host-context(.dark-theme) .demo-row:hover {
      background: rgba(133, 213, 197, 0.08);
    }
    :host-context(.dark-theme) .demo-role { color: #f1f1f0; }
    :host-context(.dark-theme) .demo-email { color: rgba(190, 201, 197, 0.5); }
    :host-context(.dark-theme) .ambient-blob { opacity: 0.08; }
    :host-context(.dark-theme) .toggle-pw { color: rgba(190, 201, 197, 0.5); }
    :host-context(.dark-theme) .toggle-pw:hover { color: #85d5c5; }
    :host-context(.dark-theme) .remember-text { color: rgba(241, 241, 240, 0.6); }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  email = '';
  password = '';
  loading = false;
  showPassword = signal(false);
  demoOpen = signal(false);

  async loginWithEmail() {
    if (!this.email || !this.password) {
      this.snackBar.open('Please enter both email and password', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    try {
      const result = await this.auth.loginWithEmail(this.email, this.password);
      // Check if user has completed registration
      const exists = await this.auth.checkUserExists(result.user.uid);
      if (!exists) {
        this.router.navigate(['/register']);
      } else {
        this.router.navigate(['/home']);
      }
    } catch (e: any) {
      console.error(e);
      let msg = 'Authentication failed. Please check your credentials.';
      if (e.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      }
      this.snackBar.open(msg, 'Close', { duration: 4000 });
    } finally {
      this.loading = false;
    }
  }

  async loginWithGoogle() {
    this.loading = true;
    try {
      const result = await this.auth.loginWithGoogle();
      // loginWithGoogle already creates initial doc if new
      const exists = await this.auth.checkUserExists(result.user.uid);
      if (!exists) {
        this.router.navigate(['/register']);
      } else {
        this.router.navigate(['/home']);
      }
    } catch (e: any) {
      console.error(e);
      this.snackBar.open('Google sign-in failed.', 'Close', { duration: 4000 });
    } finally {
      this.loading = false;
    }
  }
}
