import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MessageService } from "./services/message.service";
import { CommonModule } from "@angular/common";
import { DashConstantService } from './services/dash-constant.service';
import { ProjectService } from './services/project.service';
import { UserProjectRoleService } from './services/user-project-role.service';
import { DeleteComponent } from './components/delete.component';
import { MatDialogModule } from "@angular/material/dialog";
import { RoleService } from './services/role.service';
import { UsersService } from './services/users.service';
import { CustomErrorHandlerService } from './services/custom-error-handler.service';
import { HelperService } from './services/helper.service';
import { LeapTelemetryService } from "./telemetry-util/telemetry.service";
import {encKey} from "./services/encKey";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
    ],
    declarations: [
        DeleteComponent
    ],
    providers: [
        MessageService,
        DashConstantService,
        ProjectService,
        UserProjectRoleService,
        RoleService,
        UsersService,
        CustomErrorHandlerService,
        HelperService,
        LeapTelemetryService,
        encKey
    ],
    entryComponents: [DeleteComponent]
})
export class CommonLibModule {
}

