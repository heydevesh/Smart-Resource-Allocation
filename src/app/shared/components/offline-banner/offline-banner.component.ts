import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ConnectivityService } from '../../../core/services/connectivity.service';

/**
 * A non-intrusive offline status banner that slides in from the top
 * when the user loses network connectivity, and auto-hides when restored.
 * 
 * Usage: Place <app-offline-banner></app-offline-banner> in app.component.html
 */
@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="offline-banner" [class.visible]="!connectivity.isOnline()" [class.restored]="showRestored">
      @if (!connectivity.isOnline()) {
        <mat-icon>cloud_off</mat-icon>
        <span class="message">You're offline — changes will sync when connection is restored</span>
        <div class="pulse-ring"></div>
      } @else if (showRestored) {
        <mat-icon>cloud_done</mat-icon>
        <span class="message">Connection restored — syncing data</span>
      }
    </div>
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 10px 20px;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: var(--font-ui, 'Inter', sans-serif);
      color: white;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      transform: translateY(-100%);
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                  background 0.3s ease;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
    }

    .offline-banner.visible {
      transform: translateY(0);
    }

    .offline-banner.restored {
      transform: translateY(0);
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      animation: slideUpOut 0.4s ease 2s forwards;
    }

    @keyframes slideUpOut {
      to { transform: translateY(-100%); }
    }

    mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .message {
      letter-spacing: 0.01em;
    }

    .pulse-ring {
      width: 8px;
      height: 8px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      animation: offlinePulse 1.5s ease infinite;
    }

    @keyframes offlinePulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5); }
      70% { box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
    }
  `]
})
export class OfflineBannerComponent {
  connectivity = inject(ConnectivityService);
  showRestored = false;

  private wasOffline = false;

  constructor() {
    // Watch for online → show "restored" banner briefly
    setInterval(() => {
      const online = this.connectivity.isOnline();
      if (this.wasOffline && online) {
        this.showRestored = true;
        setTimeout(() => {
          this.showRestored = false;
        }, 2500);
      }
      this.wasOffline = !online;
    }, 1000);
  }
}
