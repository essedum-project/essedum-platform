import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  DataPipelineCfg,
  TrainingJobCfg,
  emptyDataPipelineCfg,
  emptyTrainingJobCfg,
} from './pipeline-options.constants';

// In-memory state for the in-progress wizard. Scoped per dialog instance via
// providedIn:'any' so opening two wizard dialogs concurrently would create two
// isolated services (Angular DI quirk: providedIn:'any' uses module-level singleton
// for eager modules but lazy-scopes for lazy modules). For strict isolation, the
// wizards add this service to their component-level `providers` array.
@Injectable({ providedIn: 'any' })
export class WizardStateService {
  readonly dataCfg$     = new BehaviorSubject<DataPipelineCfg>(emptyDataPipelineCfg());
  readonly trainingCfg$ = new BehaviorSubject<TrainingJobCfg>(emptyTrainingJobCfg());

  patchData(partial: Partial<DataPipelineCfg>): void {
    this.dataCfg$.next({ ...this.dataCfg$.value, ...partial });
  }

  patchTraining(partial: Partial<TrainingJobCfg>): void {
    this.trainingCfg$.next({ ...this.trainingCfg$.value, ...partial });
  }

  resetData(): void { this.dataCfg$.next(emptyDataPipelineCfg()); }
  resetTraining(): void { this.trainingCfg$.next(emptyTrainingJobCfg()); }

  get data(): DataPipelineCfg { return this.dataCfg$.value; }
  get training(): TrainingJobCfg { return this.trainingCfg$.value; }
}
