import { Component } from '@angular/core';

// Top-level layout for the admin-console remote — just a content host. The
// host shell's sidebar provides navigation (the admin screens are flattened
// into it), so there is no in-remote tab bar.
@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  standalone: false,
})
export class ShellComponent {}
