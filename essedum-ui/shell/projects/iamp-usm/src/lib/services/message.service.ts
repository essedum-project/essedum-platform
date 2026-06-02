import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CustomSnackbarService } from "../shared-modules/services/custom-snackbar.service";

@Injectable({
  providedIn: "root",
})
export class MessageService {
  constructor(private snackBar: MatSnackBar, private customSnackbar: CustomSnackbarService) { }

  private messageSource = new Subject<any>();

  messageSource$ = this.messageSource.asObservable();

  info(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  error(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 8000,
    });
  }

  message(resp: any, msg?: any) {
    console.log(resp);
    if (resp.status == 200) {
      let message = {
        message: msg,
        button: false,
        type: "success",
        successButton: "Ok",
        errorButton: "Cancel",
      };
      this.snackBar.open(message.message, message.successButton, {
        duration: 5000,
        horizontalPosition: "center",
        verticalPosition: "top",
        panelClass: "",
      });
    } else {
      let message = {
        message: resp,
        button: false,
        type: "error",
        successButton: "Ok",
        errorButton: "Cancel",
      };
      this.snackBar.open(message.message, message.errorButton, {
        duration: 5000,
        horizontalPosition: "center",
        verticalPosition: "top",
        panelClass: "",
      });
    }
  }

  messageNotification(msg: any, msgtype: any = "success") {
    // Use the new custom snackbar service for better styling
    if (msgtype === "success") {
      this.customSnackbar.success(msg);
    } else if (msgtype === "error") {
      this.customSnackbar.error(msg);
    } else if (msgtype === "warning") {
      this.customSnackbar.warning(msg);
    } else {
      this.customSnackbar.info(msg);
    }
  }
}
