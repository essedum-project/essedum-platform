import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppFooterComponent } from './app-footer.component';
import { ButtonModule, FooterModule } from 'leds-lib';

@NgModule({
  declarations: [
    AppFooterComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    FooterModule
  ],
  exports: [
    AppFooterComponent
  ]
})
export class AppFooterModule { }
