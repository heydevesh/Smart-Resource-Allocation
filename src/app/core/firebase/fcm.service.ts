import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { FirestoreService } from './firestore.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { take, filter } from 'rxjs';

export interface FcmNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  receivedAt: Date;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class FcmService implements OnDestroy {
  private messaging = inject(Messaging);
  private auth = inject(AuthService);
  private firestore = inject(FirestoreService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  currentToken = signal<string | null>(null);
  unreadCount = signal<number>(0);
  notifications = signal<FcmNotification[]>([]);
  permissionStatus = signal<NotificationPermission>('default');

  private tokenRefreshInterval: ReturnType<typeof setInterval> | null = null;
  private readonly TOKEN_REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  private readonly MAX_NOTIFICATIONS_CACHED = 50;

  async init() {
    try {
      // Check current permission state
      this.permissionStatus.set(Notification.permission);

      if (Notification.permission === 'denied') {
        console.warn('FCM: Notification permission denied by user.');
        return;
      }

      const permission = await Notification.requestPermission();
      this.permissionStatus.set(permission);

      if (permission === 'granted') {
        await this.fetchAndStoreToken();
        this.scheduleTokenRefresh();
      }

      this.listenForMessages();
      this.loadCachedNotifications();
    } catch (e) {
      console.error('FCM: Initialization failed', e);
    }
  }

  ngOnDestroy() {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
    }
  }

  /** Request permission again if previously denied or dismissed */
  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      this.permissionStatus.set(permission);

      if (permission === 'granted') {
        await this.fetchAndStoreToken();
        this.scheduleTokenRefresh();
        return true;
      }
      return false;
    } catch (e) {
      console.error('FCM: Permission request failed', e);
      return false;
    }
  }

  /** Fetch FCM token and persist to Firestore user profile */
  private async fetchAndStoreToken(): Promise<void> {
    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey
      });

      if (token) {
        const previousToken = this.currentToken();
        this.currentToken.set(token);

        // Only update Firestore if token actually changed
        if (token !== previousToken) {
          this.saveTokenToUser(token);
        }
      }
    } catch (e) {
      console.error('FCM: Failed to fetch token', e);

      // Handle token retrieval errors — often caused by expired SW registration
      if ((e as any)?.code === 'messaging/token-unsubscribe-failed') {
        console.warn('FCM: Token expired, attempting re-registration...');
        await this.unregisterAndRetry();
      }
    }
  }

  /** Unregister stale service workers and retry token fetch */
  private async unregisterAndRetry(): Promise<void> {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.active?.scriptURL.includes('firebase-messaging-sw')) {
          await reg.unregister();
        }
      }
      // Wait briefly for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.fetchAndStoreToken();
    } catch (e) {
      console.error('FCM: Re-registration failed', e);
    }
  }

  /** Periodically refresh the FCM token to prevent expiry */
  private scheduleTokenRefresh(): void {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
    }
    this.tokenRefreshInterval = setInterval(() => {
      this.fetchAndStoreToken();
    }, this.TOKEN_REFRESH_INTERVAL_MS);
  }

  /** Save FCM token to the authenticated user's Firestore profile */
  private saveTokenToUser(token: string): void {
    this.auth.currentUser$.pipe(
      filter(user => user !== undefined),
      take(1)
    ).subscribe(user => {
      if (user && user.uid) {
        this.firestore.updateUserProfile(user.uid, { fcmToken: token });
      }
    });
  }

  /** Listen for foreground push messages and route them */
  listenForMessages(): void {
    onMessage(this.messaging, (payload) => {
      console.log('FCM: Foreground message received:', payload);

      const notification: FcmNotification = {
        id: `fcm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: payload.notification?.title || 'Sahaay Notification',
        body: payload.notification?.body || '',
        data: payload.data as Record<string, string> | undefined,
        receivedAt: new Date(),
        read: false
      };

      // Add to notification stack
      this.addNotification(notification);

      // Show snackbar with action routing
      const snackRef = this.snackBar.open(
        `${notification.title}: ${notification.body}`,
        this.getActionLabel(payload.data),
        {
          duration: 8000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['notification-snackbar', this.getUrgencyClass(payload.data)]
        }
      );

      // Handle snackbar action click — navigate to relevant screen
      snackRef.onAction().subscribe(() => {
        this.handleNotificationAction(payload.data as Record<string, string>);
        this.markAsRead(notification.id);
      });
    });
  }

  /** Add a notification to the in-memory cache */
  private addNotification(notification: FcmNotification): void {
    const current = this.notifications();
    const updated = [notification, ...current].slice(0, this.MAX_NOTIFICATIONS_CACHED);
    this.notifications.set(updated);
    this.unreadCount.update(c => c + 1);
    this.persistNotificationsToStorage(updated);
  }

  /** Mark a notification as read */
  markAsRead(notificationId: string): void {
    const updated = this.notifications().map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notifications.set(updated);
    this.unreadCount.set(updated.filter(n => !n.read).length);
    this.persistNotificationsToStorage(updated);
  }

  /** Mark all notifications as read */
  markAllAsRead(): void {
    const updated = this.notifications().map(n => ({ ...n, read: true }));
    this.notifications.set(updated);
    this.unreadCount.set(0);
    this.persistNotificationsToStorage(updated);
  }

  /** Clear all notifications */
  clearAll(): void {
    this.notifications.set([]);
    this.unreadCount.set(0);
    localStorage.removeItem('sahaay-notifications');
  }

  /** Route the user to the appropriate screen based on notification data */
  private handleNotificationAction(data?: Record<string, string>): void {
    if (!data) return;

    const screen = data['screen'];
    const needId = data['needId'];
    const taskId = data['taskId'];

    switch (screen) {
      case 'needs-map':
        this.router.navigate(['/needs-map'], needId ? { queryParams: { highlight: needId } } : {});
        break;
      case 'tasks':
        this.router.navigate(['/tasks'], taskId ? { queryParams: { focus: taskId } } : {});
        break;
      case 'volunteers':
        this.router.navigate(['/volunteers']);
        break;
      case 'insights':
        this.router.navigate(['/insights']);
        break;
      default:
        this.router.navigate(['/home']);
    }
  }

  /** Get action button label based on notification type */
  private getActionLabel(data?: Record<string, string>): string {
    const screen = data?.['screen'];
    switch (screen) {
      case 'needs-map': return 'View Map';
      case 'tasks': return 'View Task';
      case 'volunteers': return 'View';
      case 'insights': return 'Open';
      default: return 'View';
    }
  }

  /** Get CSS class for urgency-based styling */
  private getUrgencyClass(data?: Record<string, string>): string {
    const urgency = data?.['urgency'];
    switch (urgency) {
      case 'critical': return 'notification-critical';
      case 'high': return 'notification-high';
      default: return 'notification-default';
    }
  }

  /** Load cached notifications from localStorage */
  private loadCachedNotifications(): void {
    try {
      const cached = localStorage.getItem('sahaay-notifications');
      if (cached) {
        const parsed: FcmNotification[] = JSON.parse(cached).map((n: any) => ({
          ...n,
          receivedAt: new Date(n.receivedAt)
        }));
        this.notifications.set(parsed);
        this.unreadCount.set(parsed.filter(n => !n.read).length);
      }
    } catch {
      // Silently ignore corrupted cache
      localStorage.removeItem('sahaay-notifications');
    }
  }

  /** Persist notifications to localStorage for offline access */
  private persistNotificationsToStorage(notifications: FcmNotification[]): void {
    try {
      localStorage.setItem('sahaay-notifications', JSON.stringify(notifications));
    } catch {
      // localStorage might be full — trim older notifications
      const trimmed = notifications.slice(0, 20);
      localStorage.setItem('sahaay-notifications', JSON.stringify(trimmed));
    }
  }
}
