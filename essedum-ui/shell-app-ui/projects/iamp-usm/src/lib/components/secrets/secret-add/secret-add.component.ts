import { Component, Inject, OnInit } from "@angular/core";
import { SharedMaterialModule } from "../../../shared-modules/material/material.module";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";

@Component({
  selector: "lib-secret-add",
  standalone: true,
  imports: [SharedMaterialModule],
  templateUrl: "./secret-add.component.html",
  styleUrl: "./secret-add.component.css",
})
export class SecretAddComponent implements OnInit {
  edit: boolean = false;
  description:string='test1';

  constructor(
    public dialogRef: MatDialogRef<SecretAddComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.edit = false;
  }

  closeSecretAddDialog(): void {
    const openDialogs = this.dialog.openDialogs;
    for (const dialog of openDialogs) {
      if (dialog.componentInstance instanceof SecretAddComponent) {
        dialog.close();
      }
    }
  }
}
