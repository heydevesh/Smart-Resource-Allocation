import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';
import { environment } from './enviroments/enviroment';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),

    // 🔥 Firebase setup
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore())
  ]
}).catch(err => console.error(err));