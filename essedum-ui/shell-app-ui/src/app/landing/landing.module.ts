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
// import {
//   BadgeModule, ButtonModule, CardModule, ListModule, PopoverModule, NavigationModule, ToggleMenuModule,
//   NotificationModule,
//   TabGroupModule,
//   AccordionModule,
//   CheckboxModule,
//   SelectModule,
//   SpinnerModule
// } from 'leds-lib';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { OverflowModule } from 'leds-lib';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
// import { ChipListModule } from 'leds-lib';
import { ReactiveFormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
// import { InputFieldModule } from 'leds-lib';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MessageService } from '../services/message.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { AppNavigationComponent } from './app-navigation/app-navigation.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { SidebarComponent } from './sidebar/sidebar.component';
import { VersionInfoComponent } from './version-info/version-info.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from "@angular/material/tooltip";
import { StaticLandingComponent } from './static-landing/static-landing.component';
import { NotificationMenuComponent } from './notification-menu/notification-menu.component';
// import { ChatbotModule, MessagingModule, RatingModule, PanelModule } from 'leds-lib';
// import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormioModule } from '@formio/angular';
import { MyProfileComponent } from "./my-profile/my-profile.component";
import { DialogModule } from "primeng/dialog"
// import { ChatbotComponentAIP } from '../chatbot/chatbot.component';
// import { ChatApiComponent } from '../chat-api/chat-api.component';
// import { ChatbotServices } from '../chatbot/chatbot.service';
@NgModule({
  declarations: [
    LandingComponent,
    AppMenuComponent,
    AppHomeComponent,
    AppNavigationComponent,
    SidebarComponent,
    VersionInfoComponent,
    StaticLandingComponent,
    NotificationMenuComponent,
    MyProfileComponent,
    // ChatbotComponentAIP,
    // ChatApiComponent
  ],
  imports: [
    MatCardModule,
    // BadgeModule,
    // ButtonModule,
    // CardModule,
    MatDialogModule,
    // NavigationModule,
    // ListModule,
    // PopoverModule,
    ReactiveFormsModule,
    MatTabsModule,
    // ChipListModule,
    MatChipsModule,
    MatInputModule,
    // InputFieldModule,
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
    // ToggleMenuModule,
    // NotificationModule,
    // TabGroupModule,
    // AccordionModule,
    // CheckboxModule,
    // SelectModule,
    // ChatbotModule,
    // MessagingModule,
    // RatingModule,
    // PanelModule,
    // OverflowModule,
    NgbModule,
    // SpinnerModule,
    MatProgressBarModule,
    // PerfectScrollbarModule,
    InlineSVGModule.forRoot(),
    FormioModule,
    DialogModule,
    InlineSVGModule.forRoot()

  ],
  providers: [
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: CommonAppInterceptorService, multi: true },
    MessageService,
    // ChatbotServices
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingModule { }
