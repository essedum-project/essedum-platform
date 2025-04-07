import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AipModule } from './aip.module';
import { AipComponent } from './aip.component';



@NgModule({
  declarations: [],

  imports: [BrowserModule, BrowserAnimationsModule,AipModule],
  providers: [],
  bootstrap: [AipComponent],
})
export class AppModule {}
