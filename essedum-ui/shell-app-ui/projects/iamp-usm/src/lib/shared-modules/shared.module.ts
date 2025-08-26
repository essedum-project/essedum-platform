import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedMaterialModule } from "./material/material.module";
import { DeleteComponent } from "./confirm-delete/delete.component";
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";
import { CustomSnackbarModule } from "./custom-snackbar/custom-snackbar.module";

@NgModule({
 imports: [CommonModule, SharedMaterialModule, CustomSnackbarModule],
 declarations: [DeleteComponent, ConfirmationDialogComponent],
 providers: [],
 exports: [SharedMaterialModule, CustomSnackbarModule],
//  entryComponents: [DeleteComponent, ConfirmationDialogComponent],
})
export class SharedModule {}
