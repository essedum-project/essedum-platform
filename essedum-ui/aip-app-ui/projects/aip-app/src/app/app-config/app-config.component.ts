import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-app-config',
  templateUrl: './app-config.component.html',
  styleUrls: ['./app-config.component.scss'],
})
export class AppConfigComponent implements OnInit {
  ngOnInit(): void {
    console.log(this.configData);
  }

  @Input() configData: any;
  @Input() isauth = false;
  @Output() configDataChange = new EventEmitter();
  editIndex;
  editMode = false;
  pp: boolean = true;

  addConfig() {
    if (!this.isauth) {
      if (this.configData == undefined) this.configData = [];
      this.configData.push({ name: '', value: '' });
      this.editMode = true;
      this.editIndex = this.configData.length - 1;
      this.configDataChange.emit(this.configData);
    }
  }

  deleteConfig(i) {
    if (!this.isauth) {
      this.configData.splice(i, 1);
      return true;
    }
  }

  editConfig(i) {
    if (!this.isauth) {
      this.editIndex = i;
      this.editMode = true;
    }
  }

  togglePasswordVisibility(): void {
    const passwordInput = document.getElementById(
      'password'
    ) as HTMLInputElement | null;
    const toggleButton = document.getElementById('togglePassword');
    if (passwordInput && toggleButton) {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleButton.classList.toggle('fa-eye-slash', isPassword);
    }
  }
}
