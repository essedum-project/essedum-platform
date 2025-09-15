import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CustomSnackbarComponent, SnackbarData } from '../custom-snackbar/custom-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class CustomSnackbarService {

  constructor(private snackBar: MatSnackBar) {}

  private show(data: SnackbarData, config?: MatSnackBarConfig) {
    const defaultConfig: MatSnackBarConfig = {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [`snackbar-${data.type}`],
      data: data
    };

    const snackBarConfig = { ...defaultConfig, ...config };
    
    return this.snackBar.openFromComponent(CustomSnackbarComponent, snackBarConfig);
  }

  success(message: string, action?: string, config?: MatSnackBarConfig) {
    return this.show({
      message,
      type: 'success',
      action: action || 'OK',
      showAction: !!action
    }, config);
  }

  error(message: string, action?: string, config?: MatSnackBarConfig) {
    return this.show({
      message,
      type: 'error',
      action: action || 'OK',
      showAction: !!action
    }, config);
  }

  warning(message: string, action?: string, config?: MatSnackBarConfig) {
    return this.show({
      message,
      type: 'warning',
      action: action || 'OK',
      showAction: !!action
    }, config);
  }

  info(message: string, action?: string, config?: MatSnackBarConfig) {
    return this.show({
      message,
      type: 'info',
      action: action || 'OK',
      showAction: !!action
    }, config);
  }

  // Method to handle response objects like in the original messageService
  handleResponse(resp: any, successMsg?: string, config?: MatSnackBarConfig) {
    if (resp?.status === 200) {
      if (resp.body.length === 0) {
        this.success(successMsg || 'Operation completed successfully', undefined, config);
      } else if (
        resp.body.status === 'FAILURE' ||
        (resp.body[0] && resp.body[0].status === 'FAILURE')
      ) {
        let failMsg = '';
        if (resp.body.status === 'FAILURE') {
          failMsg = resp.body.details[0].message;
        } else if (resp.body[0] && resp.body[0].status === 'FAILURE') {
          failMsg = resp.body[0].message;
        } else {
          failMsg = 'Operation failed';
        }
        this.error(failMsg, undefined, config);
      } else {
        this.success(successMsg || resp.body.status, undefined, config);
      }
    } else if (resp.text === 'success') {
      this.success('Tags Updated Successfully', undefined, config);
    } else {
      const errorMsg = resp.error || resp.message || 'An error occurred';
      this.error(errorMsg, undefined, config);
    }
  }

  dismiss() {
    this.snackBar.dismiss();
  }
}
