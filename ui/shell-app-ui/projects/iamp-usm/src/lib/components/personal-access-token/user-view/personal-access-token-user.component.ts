import { Clipboard } from '@angular/cdk/clipboard';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { PersonalAccessTokenService } from '../../../services/personal-acess-token.service';
import { ConfirmRegenerateDialogComponent } from '../../../support/confirm-regenerate-dialog.component';
import { ConfirmRevokeDialogComponent } from '../../../support/confirm-revoke-dialog.component';
import { ChatbotServices } from 'src/app/chatbot/chatbot.service';
@Component({
  selector: 'app-personal-access-token-user',
  templateUrl: './personal-access-token-user.component.html',
  styleUrls: ['./personal-access-token-usercomponent.scss']
})
export class PersonalAccessTokenUserComponent implements OnInit {

  userDetails: any;
  generateNewTokenFlag: boolean = false;
  editExpiryDateFlag: boolean = false;
  optionsList: string[] = ["Never", "Yes"];
  selectedOption: string = "Never";
  chooseExpireDateFlag: boolean = false;
  isTokenPresent: boolean = false;
  personalAccessToken: string;
  tokenExpireDate: Date;
  tokenCreatedDate: Date;
  tokenUpdatedDate: Date;
  minDate: Date;
  dateChoosen: Date;
  disableClick: Boolean = false;
  isNeverExpiryRequired: Boolean = false;
  isNeverExpiryRequiredKey: string = "usm.user.personal-access-token.never-expiry-required";

  constructor(
    private personalAccessTokenService: PersonalAccessTokenService,
    private usmServices: ChatbotServices,
    private clipboard: Clipboard,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.userDetails = JSON.parse(localStorage.getItem('user'));
    this.fetchPersonalAccessTokenDetails();
    this.minDate = new Date();
    this.dateChoosen = new Date();
    this.checkIsNeverExpiryRequired();
  }

  checkIsNeverExpiryRequired() {
    this.usmServices.getConstantByKey(this.isNeverExpiryRequiredKey).subscribe((response) => {
      if (response.body) {
        if (['true', 'yes'].includes(response.body.toLowerCase())) {
          this.isNeverExpiryRequired = true;
          this.optionChange("Never");
        } else {
          this.isNeverExpiryRequired = false;
          this.optionChange("Yes");
        }
      } else {
        this.isNeverExpiryRequired = false;
        this.optionChange("Yes");
      }
    });
  }

  fetchPersonalAccessTokenDetails() {
    this.personalAccessTokenService.fetchPersonalAccessTokenDetails(this.userDetails.id)
      .subscribe(res => {
        if (res && res.access_token) {
          this.isTokenPresent = true;
          this.personalAccessToken = res.access_token;
          this.tokenExpireDate = res.expires_on;
          this.tokenCreatedDate = res.created_on;
          this.tokenUpdatedDate = res.last_modified_on;
          if (this.tokenExpireDate || this.tokenCreatedDate || this.tokenUpdatedDate) {
            let timezoneOffset = new Date().getTimezoneOffset();
            if (this.tokenCreatedDate)
              this.tokenCreatedDate = new Date(new Date(this.tokenCreatedDate).getTime() - timezoneOffset * 60 * 1000);
            if (this.tokenExpireDate)
              this.tokenExpireDate = new Date(new Date(this.tokenExpireDate).getTime() - timezoneOffset * 60 * 1000);

            if (this.tokenUpdatedDate)
              this.tokenUpdatedDate = new Date(new Date(this.tokenUpdatedDate).getTime() - timezoneOffset * 60 * 1000);
          }

        }
      }, error => {
        this.personalAccessTokenService.messageNotificaionService('error', error);
      });

  }

  generateNewTokenForm() {
    this.generateNewTokenFlag = true;
    this.isTokenPresent = false;
  }

  editPersonalAccessTokenForm() {
    if (!this.disableClick) {
      this.editExpiryDateFlag = true;
      this.disableClick = true;
      if (this.tokenExpireDate || !this.isNeverExpiryRequired) {
        this.optionChange("Yes");
        this.dateChoosen = this.tokenExpireDate;
      }
    }
  }

  cancelEditPersonalAccessToken() {
    this.editExpiryDateFlag = false;
    this.disableClick = false;
  }

  editPersonalAccessToken() {
    this.dateChoosen.setHours(23, 59, 59, 999);
    let tokenDetails = {
      "userId": this.userDetails.id,
      "dateOfExpiry": this.dateChoosen,
      "expire": this.selectedOption,
      "action": "change-expiry-date"
    }

    this.personalAccessTokenService.createPersonalAccessToken(tokenDetails)
      .subscribe(res => {
        this.personalAccessTokenService.messageNotificaionService('success', "Personal Access Token Expiry Updated Successfully");
        this.generateNewTokenFlag = false;
        this.cancelEditPersonalAccessToken();
        this.ngOnInit();
      }, error => { this.personalAccessTokenService.messageNotificaionService('error', error); });
  }

  copyPersonalAccessToken() {
    this.clipboard.copy(this.personalAccessToken);
    this.personalAccessTokenService.messageNotificaionService('success', "Personal Access Token Copied");
  }

  generateNewToken() {
    this.dateChoosen.setHours(23, 59, 59, 999);
    let tokenDetails = {
      "userId": this.userDetails.id,
      "dateOfExpiry": this.dateChoosen,
      "expire": this.selectedOption,
      "action": "generate-new-token"
    }
    this.personalAccessTokenService.createPersonalAccessToken(tokenDetails)
      .subscribe(res => {
        this.personalAccessTokenService.messageNotificaionService('success', "Personal Access Token Created Successfully");
        this.generateNewTokenFlag = false;
        this.ngOnInit();
      }, error => { this.personalAccessTokenService.messageNotificaionService('error', error); });
  }

  regeneratePersonalAccessToken() {
    const dialogRef = this.dialog.open(ConfirmRegenerateDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        let tokenDetails = {
          "userId": this.userDetails.id,
          "action": "re-generate-new-token"
        }
        this.personalAccessTokenService.createPersonalAccessToken(tokenDetails)
          .subscribe(res => {
            this.personalAccessTokenService.messageNotificaionService('success', "Personal Access Token Regenerated Successfully");
            if (res && res.body && res.body.access_token)
              this.personalAccessToken = res.body.access_token;
            this.ngOnInit();
          }, error => { this.personalAccessTokenService.messageNotificaionService('error', error); });
      }
    });
  }

  revokePersonalAccessToken() {
    const dialogRef = this.dialog.open(ConfirmRevokeDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.personalAccessTokenService.revokePersonalAccessToken(this.userDetails.id)
          .subscribe(res => {
            this.personalAccessTokenService.messageNotificaionService('success', "Done!  Personal Access Token Revoked");
            this.generateNewTokenFlag = false;
            this.isTokenPresent = false;
            this.ngOnInit();
          }, error => { this.personalAccessTokenService.messageNotificaionService('error', error); });
      }
    });
  }

  optionChange(option) {
    this.selectedOption = option;
    if (this.selectedOption == "Yes") {
      this.chooseExpireDateFlag = true;
    } else {
      this.chooseExpireDateFlag = false;
    }
  }

  dateChange(date) {
    this.dateChoosen = date;
  }

}
