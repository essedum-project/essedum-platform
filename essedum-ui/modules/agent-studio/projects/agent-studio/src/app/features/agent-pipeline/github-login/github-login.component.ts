import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-github-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './github-login.component.html',
    styleUrl: './github-login.component.scss'
})
export class GithubLoginComponent {
  @Output() loginSuccess = new EventEmitter<any>();
  @Output() loginCancel = new EventEmitter<void>();

  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  loginError = '';
  data = { alias: '', description: '' }; // For template compatibility

  constructor(
    private fb: FormBuilder,
    public dialogRef?: MatDialogRef<GithubLoginComponent>
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = '';

      // Simulate GitHub login API call
      setTimeout(() => {
        const formValue = this.loginForm.value;
        
        // Mock validation - replace with actual GitHub API integration
        if (formValue.username && formValue.password) {
          const userData = {
            username: formValue.username,
            password:formValue.password,
            token: 'githubtoken-' + formValue.username + '-' + Date.now(),
           
          };
          
          this.loginSuccess.emit(userData);
          this.dialogRef?.close(userData);
        } else {
          this.loginError = 'Invalid credentials. Please try again.';
        }
        
        this.isLoading = false;
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.loginCancel.emit();
    this.dialogRef?.close();
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  forgotPassword() {
    // Implement forgot password functionality
    window.open('https://github.com/password_reset', '_blank');
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (field?.hasError('minlength')) {
      return 'Password must be at least 6 characters long';
    }
    
    return '';
  }
}
