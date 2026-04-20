import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  success(message: string) {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      panelClass: ['success-snackbar']
    });
  }

  error(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      ...this.defaultConfig,
      panelClass: ['error-snackbar']
    });
  }

  info(message: string) {
    this.snackBar.open(message, 'OK', {
      ...this.defaultConfig,
      panelClass: ['info-snackbar']
    });
  }

  warning(message: string) {
    this.snackBar.open(message, 'Understand', {
      ...this.defaultConfig,
      panelClass: ['warning-snackbar']
    });
  }
}
