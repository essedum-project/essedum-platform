import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private snackBar: MatSnackBar) {}

  private messageSource = new Subject<any>();

  messageSource$ = this.messageSource.asObservable();

  info(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  error(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
