import { Component, EventEmitter, Inject, OnInit, Output } from "@angular/core";
import { SharedMaterialModule } from "../../../shared-modules/material/material.module";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { SecretService } from "../../../services/secret.service";
import { MessageService } from "../../../services/message.service";

@Component({
  selector: "lib-secret-add",
  standalone: true,
  imports: [SharedMaterialModule],
  templateUrl: "./secret-add.component.html",
  styleUrl: "./secret-add.component.css",
})
export class SecretAddComponent implements OnInit {
  edit: boolean = false;
  view: boolean = false;
  secret: any;
  key: string = "";
  keyId: any;
  passcode: string = "";
  showPass: boolean;
  hidePass: boolean = true;
  title: string;
  showLoader: boolean;
  showCreate: boolean = false;
  hidePassword: boolean = true;
  clearLabel = "Clear";

  @Output() secretModelClosed = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<SecretAddComponent>,
    public dialog: MatDialog,
    private secretsService: SecretService,
    public messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    if (this.data.edit) {
      this.edit = this.data.edit;
      this.showCreate = true;
      this.showLoader = true;
      this.key = this.data.secret.key;
      this.passcode = this.data.passcode;
    }

    if (this.data.view) {
      this.view = this.data.view;
      this.key = this.data.secret.key;
      this.passcode = this.data.passcode;
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  closeSecretAddDialog(): void {
    const openDialogs = this.dialog.openDialogs;
    for (const dialog of openDialogs) {
      if (dialog.componentInstance instanceof SecretAddComponent) {
        dialog.close();
        this.dialogRef.afterClosed().subscribe(() => {
          this.secretModelClosed.emit();
        });
      }
    }
  }

  onCreate() {
    this.secretsService.createKey(this.key, this.passcode).subscribe(
      (res) => {
        this.messageService.messageNotification(`Successfully created`);
        this.closeSecretAddDialog();
      },
      (err) => {
        console.log(err);
        this.messageService.messageNotification(`error  ${err} `,"error");
      }
    );
  }

  onUpdate() {
    this.secretsService
      .updateKey(this.key, this.passcode)
      .subscribe((res: any) => {
        this.messageService.messageNotification("Updated Successfully");
        this.closeSecretAddDialog();
        this.hideValue();
      });
  }

  getValue() {
    this.hidePass = false;
    this.showPass = true;
  }

  hideValue() {
    this.hidePass = true;
    this.showPass = false;
  }

  clearWave() {
    this.key = "";
    this.passcode = "";
  }
}
