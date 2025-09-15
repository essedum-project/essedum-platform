import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, Subject } from "rxjs";

@Injectable()
export class MessageService {
 constructor(private snackBar: MatSnackBar) {}

 private messageSource = new Subject<any>();

 messageSource$ = this.messageSource.asObservable();

 info(message: string, action: string) {
  this.snackBar.open(message, action, {
   duration: 5000,
  });
 }

 error(message: string, action: string) {
  this.snackBar.open(message, action, {
   duration: 10000,
  });
 }
}
