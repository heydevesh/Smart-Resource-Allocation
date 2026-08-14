import { Injectable, inject, OnDestroy } from '@angular/core';
import { Clerk } from '@clerk/clerk-js';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

type UserResource = NonNullable<Clerk['user']>;
import { map } from 'rxjs/operators';
import { User, UserRole, Permission } from '../../models';
import { Firestore, doc, docData, getDoc, setDoc, DocumentData } from '@angular/fire/firestore';
import { Auth as FirebaseAuth, signInWithCustomToken, signOut as firebaseSignOut } from '@angular/fire/auth';
import { getPermissionsForRole } from './permissions';
import { environment } from '../../../environments/environment';

/**
 * Clerk-backed auth service.
 *
 * Clerk is the source of truth for the user-facing session. Firebase Auth is
 * kept purely as an internal bridge so Firestore security rules (which only
 * understand Firebase identity) keep working: the Clerk session JWT is
 * exchanged for a Firebase custom token by the `ExchangeFirebaseToken` Go
 * function, then `signInWithCustomToken` establishes a Firebase session whose
 * UID equals the Clerk user ID.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private firebaseAuth = inject(FirebaseAuth);
  private firestore = inject(Firestore);

  private clerk: Clerk | null = null;
  private clerkReady: Promise<void> | null = null;

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private currentUserSubject = new BehaviorSubject<User | null | undefined>(undefined);
  currentUser$ = this.currentUserSubject.asObservable();

  /** true when a user has just signed in but has no Firestore profile yet */
  private _isNewUser = false;
  get isNewUser(): boolean { return this._isNewUser; }

  get currentUser(): User | null {
    const val = this.currentUserSubject.value;
    return val === undefined ? null : val;
  }

  /** Raw Clerk instance — used to mount Clerk's UI components (SignIn, UserButton). */
  get clerkInstance(): Clerk | null { return this.clerk; }

  /** Resolves once Clerk has loaded and the initial auth state has been emitted. */
  get ready(): Promise<void> {
    this.initClerk();
    return this.clerkReady!;
  }

  constructor() {
    this.initClerk();
  }

  private initClerk(): void {
    if (this.clerkReady) return;

    this.clerkReady = (async () => {
      this.clerk = new Clerk(environment.clerkPublishableKey);
      await this.clerk.load();

      this.clerk.addListener(({ user }) => {
        this.onClerkUserChange(user);
      });

      // Emit the initial state synchronously after load.
      this.onClerkUserChange(this.clerk.user);
    })().catch((err) => {
      console.error('[Auth] Clerk failed to load', err);
      this.currentUserSubject.next(null);
    });
  }

  private onClerkUserChange(clerkUser: UserResource | null | undefined): void {
    if (!clerkUser) {
      this._isNewUser = false;
      this.currentUserSubject.next(null);
      return;
    }
    this.establishFirebaseSession(clerkUser).catch((err) => {
      console.error('[Auth] Firebase bridge failed', err);
    });
  }

  /**
   * Bridges the Clerk session into Firebase so Firestore rules work:
   * exchange Clerk JWT → Firebase custom token → signInWithCustomToken.
   * The custom-token UID equals the Clerk user ID, keeping `users/{uid}`
   * document ids aligned across providers.
   */
  private async establishFirebaseSession(clerkUser: UserResource): Promise<void> {
    const sessionToken = await this.clerk?.session?.getToken();
    if (!sessionToken) {
      throw new Error('No Clerk session token available');
    }

    const customToken = await this.exchangeFirebaseToken(sessionToken);
    await signInWithCustomToken(this.firebaseAuth, customToken);

    // Keep `users/{uid}` doc in sync with the identity provider.
    await this.createInitialUserDoc(
      clerkUser.id,
      clerkUser.primaryEmailAddress?.emailAddress || '',
      clerkUser.fullName || '',
      clerkUser.imageUrl
    );

    this.subscribeToProfile(clerkUser);
  }

  private subscribeToProfile(clerkUser: UserResource): void {
    docData(doc(this.firestore, `users/${clerkUser.id}`)).pipe(
      map(userData => this.mapFirestoreProfile(clerkUser, userData))
    ).subscribe(user => {
      this.currentUserSubject.next(user);
    });
  }

  private mapFirestoreProfile(clerkUser: UserResource, userData: Record<string, any> | undefined): User | null {
    if (!userData || !userData['isRegistered']) {
      // User exists in Clerk but has no complete Firestore profile yet.
      this._isNewUser = true;
      return {
        uid: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        displayName: clerkUser.fullName || '',
        photoURL: clerkUser.imageUrl || '',
        role: 'applicant' as UserRole,
        permissions: getPermissionsForRole('applicant'),
        verificationStatus: 'pending',
        isRegistered: false
      } as User;
    }

    this._isNewUser = false;
    const role = userData['role'] || 'applicant';
    return {
      uid: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || userData['email'] || '',
      displayName: userData['displayName'] || clerkUser.fullName || 'Unknown',
      photoURL: userData['photoURL'] || clerkUser.imageUrl || '',
      role: role,
      permissions: getPermissionsForRole(role),
      region: userData['region'],
      verificationStatus: userData['verificationStatus'] || 'pending',
      phone: userData['phone'],
      skills: userData['skills'],
      idProofUrl: userData['idProofUrl'],
      availability: userData['availability'],
      aadhaarNumber: userData['aadhaarNumber'],
      faceVerified: userData['faceVerified'],
      facePhotoUrl: userData['facePhotoUrl'],
      languages: userData['languages'],
      dateOfBirth: userData['dateOfBirth'],
      gender: userData['gender'],
      address: userData['address'],
      ngoAffiliation: userData['ngoAffiliation'],
      ngoLogoUrl: userData['ngoLogoUrl'],
      fcmToken: userData['fcmToken'],
      isRegistered: true
    } as User;
  }

  /**
   * Calls the Go `ExchangeFirebaseToken` function with the Clerk session JWT
   * as a Bearer token and returns the minted Firebase custom token.
   */
  private async exchangeFirebaseToken(clerkJwt: string): Promise<string> {
    const baseUrl = `https://${environment.functionsRegion}-${environment.vertexAiProject}.cloudfunctions.net`;
    const res = await fetch(`${baseUrl}/ExchangeFirebaseToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clerkJwt}`,
      },
      body: JSON.stringify({ data: {} }),
    });
    if (!res.ok) {
      throw new Error(`Token exchange failed (${res.status})`);
    }
    const json = await res.json();
    return json.customToken ?? json.result?.customToken;
  }

  /** Current Clerk session JWT — sent to Go functions as a Bearer token. */
  async getSessionToken(): Promise<string | null> {
    return this.clerk?.session?.getToken() ?? null;
  }

  /** Check if a Firestore user doc exists for the given UID */
  async checkUserExists(uid: string): Promise<boolean> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    const snapshot = await getDoc(userDoc);
    return snapshot.exists() && snapshot.data()?.['isRegistered'] === true;
  }

  /** Create initial Firestore doc for a new user (minimal, before registration) */
  async createInitialUserDoc(uid: string, email: string, displayName: string, photoURL?: string): Promise<void> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    const snapshot = await getDoc(userDoc);
    if (!snapshot.exists()) {
      await setDoc(userDoc, {
        uid,
        email,
        displayName: displayName || '',
        photoURL: photoURL || '',
        role: 'applicant',
        verificationStatus: 'pending',
        isRegistered: false,
        createdAt: new Date()
      });
    }
  }

  async signOut() {
    this._isNewUser = false;
    await firebaseSignOut(this.firebaseAuth).catch(() => {});
    await this.clerk?.signOut();
    this.currentUserSubject.next(null);
  }

  hasPermission(permission: Permission): boolean {
    const user = this.currentUser;
    if (!user) return false;
    return user.permissions?.includes(permission) || false;
  }
}
