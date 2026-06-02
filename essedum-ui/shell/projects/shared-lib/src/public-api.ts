export * from './lib/auth/auth.service';
export * from './lib/auth/auth.tokens';
export * from './lib/events/event-bus.service';
export * from './lib/events/event-contracts';
export * from './lib/state/workspace.service';
export * from './lib/http/api-config.token';
export * from './lib/http/auth.interceptor';
export * from './lib/shared-lib.module';

// DTOs consolidated from the 4 MFEs (previously byte-duplicated copies)
export * from './lib/dto';

// UI primitives consolidated from the 4 MFEs (previously byte-duplicated copies)
export * from './lib/ui/shared-lib-ui.module';
export * from './lib/ui/aip-card/aip-card.component';
export * from './lib/ui/aip-delete-confirmation/aip-delete-confirmation.component';
export * from './lib/ui/aip-empty-state/aip-empty-state.component';
export * from './lib/ui/aip-header/aip-header.component';
export * from './lib/ui/aip-loading/aip-loading.component';
export * from './lib/ui/aip-pagination/aip-pagination.component';
export * from './lib/ui/aip-snackbar-custom/aip-snackbar-custom.component';
export * from './lib/ui/confirm-delete-dialog/confirm-delete-dialog.component';
export * from './lib/ui/pagination/pagination.component';
export * from './lib/ui/pipes/first-character.pipe';
export * from './lib/ui/pipes/highlight.pipe';
export * from './lib/ui/pipes/string-utils.pipes';
export * from './lib/ui/pipes/seconds-to-time.pipe';
export * from './lib/state/tags.service';

// Relocated MFE features (formerly duplicated in each MFE):
// - Services god-object + its direct dependencies (encKey, type stubs, streaming, snackbar)
// - TagsComponent (depends on Services + TagsService)
export * from './lib/legacy/services/service';
export * from './lib/legacy/services/encKey';
export * from './lib/legacy/services/dash-constant.service';
export * from './lib/legacy/sharedModule/services/adapter-service';
export * from './lib/legacy/apps/app';
export * from './lib/legacy/dataset/datasets';
export * from './lib/legacy/datasource/datasource';
export * from './lib/legacy/streaming-services/streaming-service';
export * from './lib/legacy/sharedModule/services/aip-snackbar-custom.service';
export * from './lib/legacy/tags/tags.component';
