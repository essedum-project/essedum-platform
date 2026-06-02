import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MfeErrorBoundaryComponent } from './mfe-error-boundary.component';

// Synthetic NgModule used by buildRoutes() as the loadChildren fallback when a
// remote's remoteEntry.js fails to load. The error component takes the entire
// child route so the user still sees a useful UI inside the host layout.
const routes: Routes = [{ path: '**', component: MfeErrorBoundaryComponent }];

@NgModule({
  declarations: [MfeErrorBoundaryComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [MfeErrorBoundaryComponent],
})
export class MfeErrorBoundaryModule {}
