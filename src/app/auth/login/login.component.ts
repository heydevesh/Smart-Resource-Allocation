import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
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

          <!-- Clerk Auth Container -->
          <div class="clerk-container">
            <div #clerkHost class="clerk-host"></div>
          </div>
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
      max-width: 440px;
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
      padding: 32px 32px 16px;
    }

    .brand-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px; height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #005147, #0a6b5e);
      color: #ffffff;
      margin-bottom: 12px;
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

    .clerk-container {
      padding: 0 16px 24px;
      display: flex;
      justify-content: center;
      min-height: 380px;
    }

    .clerk-host {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .login-footer {
      text-align: center;
      margin-top: 16px;
      font-size: 0.75rem;
      color: #6f7976;
    }
  `]
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);

  @ViewChild('clerkHost') clerkHost?: ElementRef<HTMLDivElement>;
  private authSub?: Subscription;

  ngOnInit() {
    this.authSub = this.auth.currentUser$.subscribe(user => {
      if (user) {
        if (user.isRegistered) {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/register']);
        }
      }
    });
  }

  async ngAfterViewInit() {
    await this.auth.ready;
    if (this.clerkHost?.nativeElement && this.auth.clerkInstance) {
      this.auth.clerkInstance.mountSignIn(this.clerkHost.nativeElement, {
        routing: 'hash',
        appearance: {
          variables: {
            colorPrimary: '#005147',
            colorBackground: '#ffffff',
            borderRadius: '0.75rem',
            fontFamily: 'Inter, sans-serif',
          },
          elements: {
            card: 'shadow-none border-none p-0 bg-transparent',
            rootBox: 'w-full',
          }
        }
      });
    }
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
    if (this.clerkHost?.nativeElement && this.auth.clerkInstance) {
      this.auth.clerkInstance.unmountSignIn(this.clerkHost.nativeElement);
    }
  }
}
