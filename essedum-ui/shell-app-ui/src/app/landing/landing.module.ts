import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { LandingComponent } from './landing.component';
import { AppMenuComponent } from './app-menu/app-menu.component';
import { LandingRoutingModule } from './landing-routing.module';
import { AppFooterModule } from './app-footer/app-footer.module';
import { AppHomeComponent } from './app-home/app-home.component';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { CommonAppInterceptorService } from '../services/common-app-interceptor.service';
import { MatCardModule } from '@angular/material/card';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MessageService } from '../services/message.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { AppNavigationComponent } from './app-navigation/app-navigation.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MyProfileComponent } from "./my-profile/my-profile.component";
import { DialogModule } from "primeng/dialog"
@NgModule({
  declarations: [
    LandingComponent,
    AppMenuComponent,
    AppHomeComponent,
    AppNavigationComponent,
    SidebarComponent,
    MyProfileComponent,
  ],
  imports: [
    MatCardModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatChipsModule,
    MatInputModule,
    CommonModule,
    LandingRoutingModule,
    AppFooterModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatFormFieldModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    HttpClientModule,
    HttpClientXsrfModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatTooltipModule,
    NgbModule,
    MatProgressBarModule,
    InlineSVGModule.forRoot(),
    DialogModule,
    InlineSVGModule.forRoot()

  ],
  providers: [
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: CommonAppInterceptorService, multi: true },
    MessageService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingModule { }
