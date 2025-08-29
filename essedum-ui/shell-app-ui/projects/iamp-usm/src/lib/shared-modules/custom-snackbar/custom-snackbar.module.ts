import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CustomSnackbarComponent } from './custom-snackbar.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    CustomSnackbarComponent
  ],
  exports: [
    CustomSnackbarComponent
  ]
})
export class CustomSnackbarModule { }
