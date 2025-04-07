import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedMaterialModule } from "./material/material.module";
import { DeleteComponent } from "./confirm-delete/delete.component";
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";

@NgModule({
 imports: [CommonModule, SharedMaterialModule],
 declarations: [DeleteComponent, ConfirmationDialogComponent],
 providers: [],
 exports: [SharedMaterialModule],
 entryComponents: [DeleteComponent, ConfirmationDialogComponent],
})
export class SharedModule {}
