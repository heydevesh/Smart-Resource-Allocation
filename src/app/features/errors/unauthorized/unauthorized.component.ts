import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-page">
      <div class="error-backdrop">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
      </div>

      <div class="error-card">
        <!-- Animated lock -->
        <div class="error-icon-wrap">
          <span class="material-symbols-rounded error-icon">lock</span>
          <div class="icon-ring ring-1"></div>
          <div class="icon-ring ring-2"></div>
        </div>

        <div class="error-code">403</div>
        <h1 class="error-title">Access Restricted</h1>
        <p class="error-desc">
          You don't have permission to view this page.
          This area is reserved for higher-level roles within your organisation.
        </p>

        <!-- Role badge -->
        <div class="role-badge" *ngIf="currentRole">
          <span class="material-symbols-rounded badge-icon">badge</span>
          <span>Your role: <strong>{{ roleLabel }}</strong></span>
        </div>

        <div class="error-actions">
          <button class="btn-primary" (click)="goHome()">
            <span class="material-symbols-rounded">home</span>
            Back to Dashboard
          </button>
          <button class="btn-ghost" (click)="goBack()">
            <span class="material-symbols-rounded">arrow_back</span>
            Go Back
          </button>
        </div>

        <!-- Help text -->
        <div class="help-text">
          Need access? Contact your NGO Admin or Founder to request elevated permissions.
        </div>

        <div class="error-footer">
          <span class="material-symbols-rounded logo-icon">volunteer_activism</span>
          <span class="logo-text">Sahaay</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-surface, #fafaf9);
      position: relative;
      overflow: hidden;
      padding: 24px;
    }

    /* Animated blobs */
    .error-backdrop { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.10;
      animation: drift 12s ease-in-out infinite alternate;
    }
    .blob-1 {
      width: 500px; height: 500px;
      background: var(--color-danger, #dc2626);
      top: -100px; right: -80px;
      animation-delay: 0s;
    }
    .blob-2 {
      width: 350px; height: 350px;
      background: var(--color-warning, #d97706);
      bottom: -80px; left: -60px;
      animation-delay: -5s;
    }
    .blob-3 {
      width: 220px; height: 220px;
      background: var(--color-primary, #0a6b5e);
      top: 45%; left: 10%;
      animation-delay: -9s;
    }
    @keyframes drift {
      from { transform: translate(0, 0) scale(1); }
      to   { transform: translate(30px, 20px) scale(1.08); }
    }

    /* Card */
    .error-card {
      position: relative; z-index: 1;
      background: var(--color-card, #fff);
      border: 1px solid var(--color-border, #e5e3df);
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 24px 80px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04);
      animation: cardIn 0.5s cubic-bezier(.22,.68,0,1.2) both;
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(24px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Icon with pulsing rings */
    .error-icon-wrap {
      width: 80px; height: 80px;
      position: relative;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
    }
    .error-icon-wrap::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      border-radius: 20px;
    }
    .error-icon {
      font-size: 38px;
      color: var(--color-danger, #dc2626);
      position: relative; z-index: 1;
      animation: iconPop 0.6s 0.15s cubic-bezier(.22,.68,0,1.4) both;
    }
    @keyframes iconPop {
      from { opacity: 0; transform: scale(0.5) rotate(-20deg); }
      to   { opacity: 1; transform: scale(1) rotate(0deg); }
    }

    .icon-ring {
      position: absolute;
      border-radius: 50%;
      border: 2px solid rgba(220, 38, 38, 0.25);
      animation: ringPulse 2.5s ease-out infinite;
    }
    .ring-1 { width: 100px; height: 100px; animation-delay: 0s; }
    .ring-2 { width: 130px; height: 130px; animation-delay: 0.7s; }
    @keyframes ringPulse {
      0%   { transform: scale(0.8); opacity: 0.6; }
      100% { transform: scale(1.5); opacity: 0; }
    }

    /* Code */
    .error-code {
      font-family: var(--font-display, 'DM Serif Display', serif);
      font-size: 96px;
      line-height: 1;
      font-weight: 700;
      background: linear-gradient(135deg, #dc2626, #ef4444);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
      letter-spacing: -4px;
    }

    .error-title {
      font-family: var(--font-display, 'DM Serif Display', serif);
      font-size: 24px;
      color: var(--color-text-primary, #111110);
      margin: 0 0 12px;
    }

    .error-desc {
      font-family: var(--font-ui, 'Inter', sans-serif);
      font-size: 15px;
      color: var(--color-text-secondary, #6b6965);
      line-height: 1.6;
      margin: 0 0 20px;
    }

    /* Role badge */
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--color-warning-light, #fef3c7);
      color: var(--color-warning, #d97706);
      border: 1.5px solid #fde68a;
      border-radius: 20px;
      padding: 6px 14px;
      font-family: var(--font-ui, 'Inter', sans-serif);
      font-size: 13px;
      margin-bottom: 28px;
    }
    .badge-icon { font-size: 16px; }

    /* Actions */
    .error-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .btn-primary {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--color-primary, #0a6b5e);
      color: #fff;
      border: none;
      border-radius: var(--radius-button, 8px);
      padding: 13px 24px;
      font-family: var(--font-ui, 'Inter', sans-serif);
      font-size: 15px; font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
      box-shadow: 0 4px 16px rgba(10,107,94,0.3);
    }
    .btn-primary:hover {
      background: var(--color-primary-mid, #1d9e75);
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(10,107,94,0.4);
    }
    .btn-primary:active { transform: translateY(0); }

    .btn-ghost {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: transparent;
      color: var(--color-text-secondary, #6b6965);
      border: 1.5px solid var(--color-border, #e5e3df);
      border-radius: var(--radius-button, 8px);
      padding: 12px 24px;
      font-family: var(--font-ui, 'Inter', sans-serif);
      font-size: 15px; font-weight: 500;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s, background 0.2s;
    }
    .btn-ghost:hover {
      border-color: var(--color-primary, #0a6b5e);
      color: var(--color-primary, #0a6b5e);
      background: var(--color-primary-light, #e8f5f2);
    }

    .btn-primary .material-symbols-rounded,
    .btn-ghost .material-symbols-rounded { font-size: 18px; }

    /* Help text */
    .help-text {
      font-family: var(--font-ui, 'Inter', sans-serif);
      font-size: 13px;
      color: var(--color-text-hint, #a8a5a0);
      line-height: 1.5;
      margin-bottom: 28px;
      padding: 12px 16px;
      background: var(--color-surface, #fafaf9);
      border-radius: 10px;
      border: 1px solid var(--color-border, #e5e3df);
    }

    /* Footer branding */
    .error-footer {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      font-family: var(--font-ui, 'Inter', sans-serif);
      font-size: 13px;
    }
    .logo-icon { font-size: 16px; color: var(--color-primary, #0a6b5e); }
    .logo-text { font-weight: 600; color: var(--color-primary, #0a6b5e); }

    @media (max-width: 480px) {
      .error-card { padding: 36px 24px; }
      .error-code { font-size: 72px; }
    }
  `]
})
export class UnauthorizedComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  get currentRole() {
    return this.authService.currentUser?.role;
  }

  get roleLabel(): string {
    const roleMap: Record<string, string> = {
      applicant:   'Applicant (Pending)',
      volunteer:   'Volunteer',
      field_lead:  'Field Lead',
      ngo_admin:   'NGO Admin',
      ngo_founder: 'NGO Founder',
      super_admin: 'Super Admin',
    };
    return roleMap[this.currentRole ?? ''] ?? this.currentRole ?? 'Unknown';
  }

  goHome() { this.router.navigate(['/home']); }
  goBack() { history.back(); }
}
