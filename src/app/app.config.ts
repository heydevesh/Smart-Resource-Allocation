import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { initializeAppCheck, ReCaptchaV3Provider, provideAppCheck } from '@angular/fire/app-check';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { getApp } from '@angular/fire/app';
import { environment } from '../environments/environment';

const firebaseConfig = {
  projectId: "sahaay-18eb3",
  appId: "1:193319651907:web:cbee5cdc37caed816362f6",
  storageBucket: "sahaay-18eb3.firebasestorage.app",
  apiKey: "AIzaSyABkk7cr5LBBpkN7zd8fIx_P38q3LtAhY4",
  authDomain: "sahaay-18eb3.firebaseapp.com",
  messagingSenderId: "193319651907",
  measurementId: "G-X12M3Q4G1Z"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAppCheck(() => {
      // Use the debug token for local development to prevent 403 errors
      if (!environment.production) {
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = '0060f66b-c7f0-4dd5-9f51-2c5178fa8869';
      }
      const provider = new ReCaptchaV3Provider(environment.recaptchaSiteKey);
      return initializeAppCheck(getApp(), { provider, isTokenAutoRefreshEnabled: true });
    }),
    provideAuth(() => getAuth()),
    provideFirestore(() => {
      const app = getApp();
      return initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    }),
    provideFunctions(() => {
      const fns = getFunctions(getApp(), 'us-west1');
      fns.customDomain = 'https://us-west1-sahaay-493113.cloudfunctions.net';
      return fns;
    }),
    provideStorage(() => getStorage()),
    provideMessaging(() => getMessaging()),
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-rounded' } }
  ]
};
