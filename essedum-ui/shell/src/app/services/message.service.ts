
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable()
export class MessageService {
 constructor(private snackBar: MatSnackBar) {}

 private messageSource = new Subject<any>();

 messageSource$ = this.messageSource.asObservable();

 info(message: string, action: string) {
  this.snackBar.open(message, action, {
   duration: 3000, //2000
  });
 }

 error(message: string, action: string) {
  this.snackBar.open(message, action, {
   duration: 5000, //8000
  });
 }

 Success(message: string, action: string) {
    this.snackBar.open(message, action, {
     duration: 5000, //8000
    });
   }
}
