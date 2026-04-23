import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Centralized error handler for Firebase/Firestore operations.
 * Maps Firebase error codes to user-friendly messages and
 * provides consistent snackbar feedback.
 */
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private snackBar = inject(MatSnackBar);

  /** Handle a Firebase error and show a user-friendly message */
  handleError(error: any, context?: string): void {
    const message = this.getErrorMessage(error);
    const fullMessage = context ? `${context}: ${message}` : message;

    console.error(`[ErrorHandler] ${fullMessage}`, error);

    this.snackBar.open(fullMessage, 'Dismiss', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /** Show a success message */
  handleSuccess(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /** Show an info/warning message */
  handleWarning(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 4000,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /** Map Firebase error codes to human-readable messages */
  private getErrorMessage(error: any): string {
    if (!error) return 'An unexpected error occurred';

    const code = error.code || error.message || '';

    // Firebase Auth errors
    const authErrors: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'This email is already registered',
      'auth/weak-password': 'Password must be at least 6 characters',
      'auth/invalid-email': 'Please enter a valid email address',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/network-request-failed': 'Network error — check your connection',
      'auth/popup-closed-by-user': 'Sign-in was cancelled',
      'auth/requires-recent-login': 'Please sign in again to continue',
      'auth/invalid-phone-number': 'Please enter a valid phone number',
      'auth/invalid-verification-code': 'Invalid OTP code',
      'auth/code-expired': 'OTP has expired — please request a new one',
    };

    // Firestore errors
    const firestoreErrors: Record<string, string> = {
      'permission-denied': 'You don\'t have permission for this action',
      'not-found': 'The requested resource was not found',
      'already-exists': 'This record already exists',
      'failed-precondition': 'Operation cannot be performed in the current state',
      'resource-exhausted': 'Too many requests — please try again later',
      'unavailable': 'Service temporarily unavailable — try again shortly',
      'deadline-exceeded': 'Request timed out — please try again',
      'cancelled': 'Operation was cancelled',
      'data-loss': 'Data could not be saved — please try again',
      'unauthenticated': 'Your session has expired — please sign in again',
    };

    // Storage errors
    const storageErrors: Record<string, string> = {
      'storage/unauthorized': 'Not authorized to access this file',
      'storage/canceled': 'Upload was cancelled',
      'storage/unknown': 'An unknown storage error occurred',
      'storage/object-not-found': 'File not found',
      'storage/quota-exceeded': 'Storage quota exceeded',
      'storage/retry-limit-exceeded': 'Upload failed after multiple retries',
      'storage/invalid-checksum': 'File was corrupted during upload',
    };

    return authErrors[code]
      || firestoreErrors[code]
      || storageErrors[code]
      || error.message
      || 'An unexpected error occurred';
  }
}
