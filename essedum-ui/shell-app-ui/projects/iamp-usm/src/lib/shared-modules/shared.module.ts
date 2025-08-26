import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedMaterialModule } from "./material/material.module";
import { DeleteComponent } from "./confirm-delete/delete.component";
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";
import { AipFilterRolesComponent } from "./aip-filter-roles/aip-filter-roles.component";
import { FormsModule } from "@angular/forms";

@NgModule({
 imports: [CommonModule, SharedMaterialModule, FormsModule],
 declarations: [DeleteComponent, ConfirmationDialogComponent, AipFilterRolesComponent],
 providers: [],
 exports: [SharedMaterialModule, AipFilterRolesComponent, FormsModule],
//  entryComponents: [DeleteComponent, ConfirmationDialogComponent],
})
export class SharedModule {}
