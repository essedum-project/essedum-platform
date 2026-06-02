import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApisService } from "../../services/apis.service";
import { AppOAuthService } from "../../core/auth.service";

@Component({
  selector: 'app-inactivity-popup',
  templateUrl: './inactivity-popup.component.html',
  styleUrls: ['./inactivity-popup.component.scss']
})
export class InactivityPopupComponent {
  countdown: number;
  sessionStatus: string = 'active';
  private static countDownInterval: any = null;
  @Output() countdownCompletedEvent = new EventEmitter<void>();
  themeColor: string;

  constructor(public dialogRef: MatDialogRef<InactivityPopupComponent>,
    private apisService: ApisService,
    private appOAuthService: AppOAuthService,
    @Inject(MAT_DIALOG_DATA) public data: { countDownTime: number }) {
    if (sessionStorage.getItem('theme') && sessionStorage.getItem('theme') !== '') {
      this.themeColor = '#0052cc'; //setting to default theme color
    }
    this.countdown = data.countDownTime;
    this.startCountdown();
  }

  startCountdown() {
    InactivityPopupComponent.countDownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(InactivityPopupComponent.countDownInterval);
        this.sessionStatus = 'inactive';
        //revoking token
        this.apisService.revoke().subscribe(() => {
          console.log("jwtToken revoked from backend")
        })
        this.appOAuthService.stopAutomaticRefresh();
        this.countdownCompletedEvent.emit();
      }
    }, 1000);
  }

  keepAlive() {
    clearInterval(InactivityPopupComponent.countDownInterval);
    this.dialogRef.close('keepAlive');
  }

}
