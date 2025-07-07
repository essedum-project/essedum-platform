import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AipModule } from './aip.module';
import { AipComponent } from './aip.component';



@NgModule({
  declarations: [],

  imports: [BrowserModule, BrowserAnimationsModule,AipModule],
  providers: [],
  bootstrap: [AipComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
