import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedMaterialModule } from "./material/material.module";
import { DeleteComponent } from "./confirm-delete/delete.component";
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";
import { AipFilterRolesComponent } from "./aip-filter-roles/aip-filter-roles.component";
import { FormsModule } from "@angular/forms";
import { CustomSnackbarModule } from "./custom-snackbar/custom-snackbar.module";

@NgModule({
  imports: [
    CommonModule,
    SharedMaterialModule,
    FormsModule,
    CustomSnackbarModule,
  ],
  declarations: [
    DeleteComponent,
    ConfirmationDialogComponent,
    AipFilterRolesComponent,
  ],
  providers: [],
  exports: [
    SharedMaterialModule,
    AipFilterRolesComponent,
    CustomSnackbarModule,
    FormsModule,
  ],

  //  entryComponents: [DeleteComponent, ConfirmationDialogComponent],
})
export class SharedModule {}
