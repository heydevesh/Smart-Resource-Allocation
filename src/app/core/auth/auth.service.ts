import { Injectable, inject } from '@angular/core';
import { Auth, authState, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { User, UserRole, Permission } from '../../models';
import { Firestore, doc, docData, getDoc, setDoc } from '@angular/fire/firestore';
import { getPermissionsForRole } from './permissions';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

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

  constructor() {
    authState(this.auth).pipe(
      switchMap((user: FirebaseUser | null) => {
        if (user) {
          return docData(doc(this.firestore, `users/${user.uid}`)).pipe(
            map(userData => {
              if (!userData || !userData['isRegistered']) {
                // User exists in Firebase Auth but has no complete Firestore profile
                this._isNewUser = true;
                return {
                  uid: user.uid,
                  email: user.email || '',
                  displayName: user.displayName || '',
                  photoURL: user.photoURL || '',
                  role: 'applicant' as UserRole,
                  permissions: getPermissionsForRole('applicant'),
                  verificationStatus: 'pending',
                  isRegistered: false
                } as User;
              }

              this._isNewUser = false;
              const role = userData['role'] || 'applicant';
              return {
                uid: user.uid,
                email: user.email || '',
                displayName: userData['displayName'] || user.displayName || 'Unknown',
                photoURL: userData['photoURL'] || user.photoURL || '',
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
            })
          );
        } else {
          this._isNewUser = false;
          return of(null);
        }
      })
    ).subscribe(user => {
      this.currentUserSubject.next(user);
    });
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

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    // Create initial doc if user is new
    await this.createInitialUserDoc(
      result.user.uid,
      result.user.email || '',
      result.user.displayName || '',
      result.user.photoURL || ''
    );
    return result;
  }

  async loginWithEmail(email: string, pass: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const result = await signInWithEmailAndPassword(this.auth, normalizedEmail, pass);
    return result;
  }

  async registerWithEmail(email: string, pass: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const result = await createUserWithEmailAndPassword(this.auth, normalizedEmail, pass);
    await this.createInitialUserDoc(
      result.user.uid,
      result.user.email || '',
      result.user.displayName || '',
      result.user.photoURL || ''
    );
    return result;
  }

  async signOut() {
    this._isNewUser = false;
    await this.auth.signOut();
    this.currentUserSubject.next(null);
  }

  hasPermission(permission: Permission): boolean {
    const user = this.currentUser;
    if (!user) return false;
    return user.permissions?.includes(permission) || false;
  }
}
