import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';

// Routing
import { EntryRoutingModule } from './entry-routing.module';

// Shell
import { ShellComponent } from '../shell/shell.component';

// Features
import { OverviewComponent } from '../features/overview/overview.component';
import { TenancyComponent } from '../features/tenancy/tenancy.component';
import { ProvisionDialogComponent } from '../features/tenancy/provision-dialog/provision-dialog.component';
import { AccessComponent } from '../features/access/access.component';
import { GrantRoleDialogComponent } from '../features/access/grant-role-dialog/grant-role-dialog.component';
import { PublishingComponent } from '../features/publishing/publishing.component';
import { DraftDialogComponent } from '../features/publishing/draft-dialog/draft-dialog.component';
import { CatalogComponent } from '../features/catalog/catalog.component';
import { ApprovalsComponent } from '../features/approvals/approvals.component';
import { AuditComponent } from '../features/audit/audit.component';
import { IdentitySyncComponent } from '../features/identity-sync/identity-sync.component';
import { MenuConfigurationComponent } from '../features/menu-configuration/menu-configuration.component';
import { MenuItemDialogComponent } from '../features/menu-configuration/menu-item-dialog/menu-item-dialog.component';

@NgModule({
  declarations: [
    ShellComponent,
    OverviewComponent,
    TenancyComponent,
    ProvisionDialogComponent,
    AccessComponent,
    GrantRoleDialogComponent,
    PublishingComponent,
    DraftDialogComponent,
    CatalogComponent,
    ApprovalsComponent,
    AuditComponent,
    IdentitySyncComponent,
    MenuConfigurationComponent,
    MenuItemDialogComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatTooltipModule,
    MatDialogModule,
    EntryRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EntryModule {}
