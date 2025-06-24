import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterUserComponent } from './register-user.component';
import { RegisterUserRoutingModule } from './register-user-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgBusyModule } from 'ng-busy';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [RegisterUserComponent],
  imports: [
    CommonModule,
    RegisterUserRoutingModule,
    NgBusyModule,
    MatAutocompleteModule,
    RouterModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    
  ]
})
export class RegisterUserModule { }
