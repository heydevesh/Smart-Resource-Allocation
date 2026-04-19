import { Injectable, inject } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { environment } from '../../../environments/environment'; // assuming environment is configured

@Injectable({ providedIn: 'root' })
export class FcmService {
  private messaging = inject(Messaging);

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(this.messaging, { vapidKey: environment.vapidKey });
        console.log('FCM Token:', token);
        // Save token to user profile
        return token;
      }
    } catch (e) {
      console.error('Failed to get FCM token', e);
    }
    return null;
  }

  listenForMessages() {
    onMessage(this.messaging, (payload) => {
      console.log('Message received. ', payload);
      // Handle foreground messages here (e.g., show a snackbar)
    });
  }
}
