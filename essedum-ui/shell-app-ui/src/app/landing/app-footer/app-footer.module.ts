import { NgModule ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppFooterComponent } from './app-footer.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    AppFooterComponent
  ],
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  exports: [
    AppFooterComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppFooterModule { }
