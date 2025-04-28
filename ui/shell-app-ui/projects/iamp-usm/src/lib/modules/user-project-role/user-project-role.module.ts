//
// Copyright © 2016-2017 Infosys Limited, Bangalore, India. All Rights Reserved.
// * Except for any open source software components embedded in this
// * Infosys proprietary software program (Program), this Program is protected
// * by copyright laws, international treaties and other pending or existing
// * intellectual property rights in India, the United States and other countries.
// * Except as expressly permitted, any unauthorized reproduction, storage,
// * transmission in any form or by any means (including without limitation
// * electronic, mechanical, printing, photocopying, recording or otherwise),
// * or any distribution of this Program, or any portion of it,
// * may result in severe civil and criminal penalties, and
// * will be prosecuted to the maximum extent possible under the law.
// Template pack-angular:web/src/app/modules/entity.module.ts.e.vm
//

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

//material module
import { SharedModule } from "../../shared-modules/shared.module";

// //prime-ng2
// import { FileUploadModule } from 'primeng/primeng';
// import { ConfirmationService } from 'primeng/primeng';

// //ng2 bootstrap
// import { BsDropdownModule } from 'ng2-bootstrap/dropdown';
// import { DatepickerModule } from 'ng2-bootstrap';
// import { TimepickerModule } from 'ng2-bootstrap';

//  UserProjectRole ...
import { UserProjectRoleService } from "../../services/user-project-role.service";
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { HelperService } from "../../services/helper.service";
import { MessageService } from "../../services/message.service";
import { AuthService } from "../../services/auth.service";
import { NgxPaginationModule } from "ngx-pagination";
import { MatPaginatorModule } from "@angular/material/paginator";
import { UserProjectRoleListComponent } from "../../entities/user-project-role/user-project-role-list.component";
import { NgBusyModule } from "ng-busy";
//one to many relation

@NgModule({
    declarations: [UserProjectRoleListComponent],
    imports: [
        //material
        SharedModule,

        //angular
        FormsModule,
        
        RouterModule,
        // CommonModule,

        //ng2 bootstrap
        // BsDropdownModule.forRoot(),
        // TimepickerModule.forRoot(),
        NgxPaginationModule,
        MatPaginatorModule,
        NgBusyModule,
        NgxMatSelectSearchModule
        //prime-ng
        // FileUploadModule
    ],
    exports: [
        UserProjectRoleListComponent,
        NgxPaginationModule,
        MatPaginatorModule,
    ],
    providers: [
        UserProjectRoleService,
        // ConfirmationService,
        HelperService,
        MessageService,
        AuthService,
    ],
    // entryComponents: [UserProjectRoleListComponent],
})
export class UserProjectRoleModule { }
