import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material modules used by the consolidated UI primitives.
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Consolidated UI primitives — previously duplicated byte-for-byte in every MFE.
import { AipCardComponent } from './aip-card/aip-card.component';
import { AipDeleteConfirmationComponent } from './aip-delete-confirmation/aip-delete-confirmation.component';
import { AipEmptyStateComponent } from './aip-empty-state/aip-empty-state.component';
import { AipHeaderComponent } from './aip-header/aip-header.component';
import { AipLoadingComponent } from './aip-loading/aip-loading.component';
import { AipPaginationComponent } from './aip-pagination/aip-pagination.component';
import { AipSnackbarCustomComponent } from './aip-snackbar-custom/aip-snackbar-custom.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { PaginationComponent } from './pagination/pagination.component';
import { FirstCharacterPipe } from './pipes/first-character.pipe';
import { HighlightPipe, HighlightSearchPipe } from './pipes/highlight.pipe';
import { StringToJSON, FilterPipe } from './pipes/string-utils.pipes';
import { SecondsToTimePipe } from './pipes/seconds-to-time.pipe';

// Tags component — depends on the relocated Services + TagsService. Lives in legacy/.
import { TagsComponent } from '../legacy/tags/tags.component';

const PUBLIC_DECLARATIONS = [
  AipCardComponent,
  AipDeleteConfirmationComponent,
  AipEmptyStateComponent,
  AipHeaderComponent,
  AipLoadingComponent,
  AipPaginationComponent,
  AipSnackbarCustomComponent,
  ConfirmDeleteDialogComponent,
  PaginationComponent,
  FirstCharacterPipe,
  HighlightPipe,
  HighlightSearchPipe,
  StringToJSON,
  FilterPipe,
  SecondsToTimePipe,
  TagsComponent,
];

@NgModule({
  declarations: PUBLIC_DECLARATIONS,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  exports: PUBLIC_DECLARATIONS,
})
export class SharedLibUiModule {}
