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
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "../../shared-modules/shared.module";
import { UsersService } from "../../services/users.service";
import { NgxPaginationModule } from "ngx-pagination";
import { HelperService } from "../../services/helper.service";
import { MessageService } from "../../services/message.service";
import { AuthService } from "../../services/auth.service";
import { NgBusyModule } from "ng-busy";
import { UserConfigurationComponent } from "../../entities/user-configuration/user-configuration.component";
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { encKey } from "../../models/encKey";

@NgModule({
  declarations: [UserConfigurationComponent],
  imports: [
    SharedModule,
    FormsModule,
    RouterModule,
    NgxPaginationModule,
    NgbPaginationModule,
    NgBusyModule
  ],
  exports: [],
  providers: [UsersService, HelperService, MessageService, AuthService,encKey],
})
export class UsersModule { }
