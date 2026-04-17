import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

imports: [
  provideFirebaseApp(() => initializeApp(environment.firebase)),
  provideFirestore(() => getFirestore())
]