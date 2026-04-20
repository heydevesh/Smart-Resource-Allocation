import { Injectable, inject } from '@angular/core';
import { Auth, authState, User as FirebaseUser, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User, UserRole } from '../../models';
import { Firestore, doc, docData } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  constructor() {
    authState(this.auth).pipe(
      switchMap((user: FirebaseUser | null) => {
        if (user) {
          return docData(doc(this.firestore, `users/${user.uid}`)).pipe(
            map(userData => ({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Unknown',
              role: (userData?.['role'] as UserRole) || 'volunteer',
              region: userData?.['region']
            } as User))
          );
        } else {
          return of(null);
        }
      })
    ).subscribe(user => this.currentUserSubject.next(user));
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async signOut() {
    await this.auth.signOut();
    this.currentUserSubject.next(null);
  }

  setMockAdmin() {
    const mock: User = {
      uid: 'mock-admin',
      email: 'admin@sahaay.org',
      displayName: 'Demo Admin',
      role: 'admin',
      region: 'Mumbai'
    };
    this.currentUserSubject.next(mock);
    // Also save to localStorage for session persistence if needed, 
    // but here we rely on BehaviorSubject for the demo.
  }
}
