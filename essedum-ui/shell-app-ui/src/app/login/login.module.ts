import { NgModule,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { LogoutComponent } from './logout/logout.component';
import { MessageService } from '../services/message.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { AppFooterModule } from "../landing/app-footer/app-footer.module";
@NgModule({
	declarations: [ LoginComponent, LogoutComponent ],
	imports: [
    CommonModule,
    LoginRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgbModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule,
    MatButtonModule,
    MatTabsModule,
    AppFooterModule
],
	providers: [ MessageService ],
	schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginModule {}
