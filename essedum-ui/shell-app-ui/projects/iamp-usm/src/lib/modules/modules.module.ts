import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DragScrollModule } from "ngx-drag-scroll";
import { FormsModule } from "@angular/forms";
import { NgBusyModule } from "ng-busy";

import { NgxPaginationModule } from "ngx-pagination";
import { MessageService } from "../services/message.service";

import { MatDialogModule } from "@angular/material/dialog";


@NgModule({
  imports: [
    CommonModule,
    DragScrollModule,
    NgBusyModule,  

    NgxPaginationModule,
    MatDialogModule
  
  ],
  declarations: [
    /*SidebarComponent
     */
  ],
  exports: [
    DragScrollModule,
    FormsModule, 
  ],
  providers: [MessageService],
})
export class ModulesModule { }
