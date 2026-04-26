import { Injectable, signal, OnDestroy } from '@angular/core';

/**
 * Monitors the network connectivity state for the PWA.
 * Provides a reactive signal that components can use to show
 * offline banners, disable network-dependent features, or
 * queue operations for later sync.
 */
@Injectable({ providedIn: 'root' })
export class ConnectivityService implements OnDestroy {
  /** True when the browser reports an active network connection */
  isOnline = signal<boolean>(navigator.onLine);

  /** Timestamp of the last detected connectivity change */
  lastStatusChange = signal<Date>(new Date());

  /** Number of times the connection has been lost during this session */
  disconnectCount = signal<number>(0);

  private onlineHandler = () => this.updateStatus(true);
  private offlineHandler = () => this.updateStatus(false);

  constructor() {
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }

  private updateStatus(online: boolean): void {
    const wasOnline = this.isOnline();
    this.isOnline.set(online);
    this.lastStatusChange.set(new Date());

    if (wasOnline && !online) {
      this.disconnectCount.update(c => c + 1);
      console.warn('ConnectivityService: Device went offline');
    }

    if (!wasOnline && online) {
      console.info('ConnectivityService: Connection restored');
    }
  }

  /** Check if there's a real internet connection (not just LAN) */
  async checkRealConnectivity(): Promise<boolean> {
    if (!navigator.onLine) return false;

    try {
      const response = await fetch('https://www.gstatic.com/generate_204', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
      });
      return true;
    } catch {
      return false;
    }
  }
}
