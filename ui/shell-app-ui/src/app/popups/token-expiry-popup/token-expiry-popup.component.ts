import { Component, OnInit, Output, EventEmitter, Inject, NgModule } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from "@angular/material/card";
import { AppOAuthService } from "../../core/auth.service";

@Component({
  selector: 'app-token-expiry-popup',
  templateUrl: './token-expiry-popup.component.html',
  styleUrls: ['./token-expiry-popup.component.scss']
})
export class TokenExpiryPopupComponent implements OnInit {
  @Output() resetTimerEvent = new EventEmitter<void>();
  tokenStatus: string;
  timer: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TokenExpiryPopupComponent>,
    private appOAuthService: AppOAuthService,
  ) {
    this.tokenStatus = data.tokenStatus;
    this.timer = data.timeLeft;
  }

  ngOnInit(): void {
    let countdown = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      }
      if (this.timer <= 0) {
        clearInterval(countdown);
        this.updateTokenStatus("expired");
      }
    }, 1000);
  }

  refreshSession() {
    window.location.reload();
  }

  logout() {
    this.appOAuthService.logoutAndClearSession();

  }

  updateTokenStatus(status: string) {
    this.tokenStatus = status;
  }
}
