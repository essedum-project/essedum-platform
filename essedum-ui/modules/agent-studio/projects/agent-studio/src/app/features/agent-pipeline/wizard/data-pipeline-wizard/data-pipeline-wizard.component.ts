import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Services } from '@essedum/shared-lib';
import { StreamingServices } from '@essedum/shared-lib';
import {
  DATA_PIPELINE_TYPES,
  FALLBACK_SLM_BASE_MODELS,
  TEACHER_MODELS,
  OUTPUT_FORMATS_BY_TYPE,
  PROBLEM_TYPES,
  EXECUTORS,
  SCHEDULE_PRESETS,
} from '../pipeline-options.constants';
import { GitLinkValue } from '../shared/git-link-step.component';

@Component({
  selector: 'app-data-pipeline-wizard-local',
  templateUrl: './data-pipeline-wizard.component.html',
  styleUrls: ['./data-pipeline-wizard.component.scss'],
})
export class DataPipelineWizardLocalComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;

  pipelineTypes = DATA_PIPELINE_TYPES;

  private allDatasources: any[] = [];
  private aliasToName = new Map<string, string>();
  private selectedDatasourceObj: any = null;
  private datasetItems: any[] = [];
  private selectedDatasetObj: any = null;
  outputContainers: string[] = [];
  outputContainersLoaded = false;
  connections: string[] = [];
  connectionsLoaded = false;
  datasets: string[] = [];
  datasetsLoaded = false;
  targetColumns: string[] = [];
  targetColumnsLoaded = false;
  private datasetRows: any[] = [];

  slmBaseModels = FALLBACK_SLM_BASE_MODELS;
  teacherModels = TEACHER_MODELS;
  problemTypes = PROBLEM_TYPES;
  executors = EXECUTORS;
  schedulePresets = SCHEDULE_PRESETS;

  identityForm: FormGroup;
  sourceForm: FormGroup;
  executionForm: FormGroup;
  gitLink: GitLinkValue = { repo: '', branch: 'main', filePath: '' };
  gitValid = false;

  creating = false;

  // Agent + Model pre-selection (auto-defaulted, user can change via settings gear)
  selectionDone = true;
  showSettings = false;
  selectedAgent: string | null = null;
  selectedModel: string | null = null;
  readonly agentOptions = [
    { label: 'Ollama', value: 'ollama' },
    { label: 'Azure OpenAI', value: 'azure_openai' },
    { label: 'Anthropic', value: 'anthropic' },
  ];
  readonly modelOptions = [
    { label: 'qwen3.6:27b', value: 'qwen3.6:27b' },
    { label: 'gemma4:latest', value: 'gemma4:latest' },
    { label: 'gpt-oss:latest', value: 'gpt-oss:latest' },
    { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
    { label: 'phi3:mini', value: 'phi3:mini' },
    { label: 'gemma3:latest', value: 'gemma3:latest' },
    { label: 'llama3:latest', value: 'llama3:latest' },
    { label: 'qwen3:4b', value: 'qwen3:4b' },
  ];

  onAgentSelect(agent: string): void { this.selectedAgent = agent; this.showSettings = false; }
  onModelSelect(model: string): void { this.selectedModel = model; this.showSettings = false; }
  toggleSettings(): void { this.showSettings = !this.showSettings; }

  private applyDefaultAgentModel(): void {
    const origin = window.location.origin || '';
    if (origin.includes('essedum.az.ad.idemo-ppc.com')) {
      this.selectedAgent = 'azure_openai';
      this.selectedModel = 'gpt-4o-mini';
    } else if (origin.includes('localhost') || origin.includes('essedum-lfn.infosys.com')) {
      this.selectedAgent = 'ollama';
      this.selectedModel = 'qwen3:4b';
    } else {
      this.selectedAgent = 'ollama';
      this.selectedModel = 'qwen3:4b';
    }
  }

  constructor(
    private fb: FormBuilder,
    private services: Services,
    public dialogRef: MatDialogRef<DataPipelineWizardLocalComponent>,
  ) {}

  ngOnInit(): void {
    this.applyDefaultAgentModel();

    this.identityForm = this.fb.group({
      pipelineType: ['feature-engineering', Validators.required],
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 _-]+$/)]],
      alias: ['', Validators.required],
      description: [''],
    });

    this.sourceForm = this.fb.group({
      outputContainer: [''],
      connection: [''],
      dataset: ['', Validators.required],
      problemType: ['classification'],
      targetCol: [''],
      baseModel: [''],
      teacherModel: [''],
      outputFormat: [''],
    });

    this.executionForm = this.fb.group({
      executor: ['py-job-executor', Validators.required],
      schedule: [''],
    });

    // Keep git file path in sync with name
    this.identityForm.get('name').valueChanges.subscribe(name => {
      if (name) {
        this.gitLink = { ...this.gitLink, filePath: `data-pipelines/${name}/pipeline.py` };
      }
    });

    // Cascade: outputContainer → connections
    this.sourceForm.get('outputContainer').valueChanges.subscribe(containerType => {
      this.sourceForm.patchValue({ connection: '', dataset: '', targetCol: '' }, { emitEvent: false });
      this.connections = [];
      this.datasets = [];
      this.targetColumns = [];
      this.connectionsLoaded = false;
      this.datasetsLoaded = false;
      if (containerType) {
        this.connections = this.allDatasources
          .filter(d => d.type === containerType)
          .map(d => d.alias || d.name)
          .filter(Boolean)
          .sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()));
        this.connectionsLoaded = true;
      }
    });

    // Cascade: connection → datasets
    this.sourceForm.get('connection').valueChanges.subscribe(connectionAlias => {
      this.sourceForm.patchValue({ dataset: '', targetCol: '' }, { emitEvent: false });
      this.datasets = [];
      this.targetColumns = [];
      this.datasetsLoaded = false;
      this.selectedDatasourceObj = null;
      this.datasetItems = [];
      this.selectedDatasetObj = null;
      if (connectionAlias) {
        this.selectedDatasourceObj = this.allDatasources.find(
          d => (d.alias || d.name) === connectionAlias
        ) || null;
        const datasourceName = this.aliasToName.get(connectionAlias) || connectionAlias;
        this.services.getDatasetNamesByDatasource(datasourceName).subscribe({
          next: (res: any[]) => {
            const items: any[] = Array.isArray(res) ? res : [];
            this.datasetItems = items;
            this.datasets = items
              .map((d: any) => d.alias || d.name)
              .filter(Boolean)
              .sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()));
            this.datasetsLoaded = true;
          },
          error: () => { this.datasetsLoaded = true; },
        });
      }
    });

    // Cascade: dataset → columns
    this.sourceForm.get('dataset').valueChanges.subscribe(datasetName => {
      this.selectedDatasetObj = this.datasetItems.find(
        d => (d.alias || d.name) === datasetName
      ) || null;
      this.sourceForm.patchValue({ targetCol: '' }, { emitEvent: false });
      this.targetColumns = [];
      this.targetColumnsLoaded = false;
      if (!datasetName) return;
      const containerType = this.sourceForm.value.outputContainer;
      const connectionAlias = this.sourceForm.value.connection;
      const org = sessionStorage.getItem('organization') || '';
      const datasetObj = { alias: datasetName };
      const dsourceObj = { type: containerType, alias: connectionAlias };
      const params = { page: 0, size: 50 };
      this.services.getProxyDbDatasetDetails(datasetObj as any, dsourceObj, params, org, true).subscribe({
        next: (rows: any[]) => {
          if (rows && rows.length > 0) {
            this.targetColumns = Object.keys(rows[0]);
            this.datasetRows = rows.slice(0, 3);
          }
          this.targetColumnsLoaded = true;
        },
        error: () => { this.targetColumnsLoaded = true; },
      });
    });

    this.loadLiveOptions();
    this.applyTypeDefaults('feature-engineering');
  }

  get selectedTypeMeta() {
    return this.pipelineTypes.find(p => p.value === this.identityForm.value.pipelineType);
  }

  get isSlmFlavour(): boolean {
    return !!this.selectedTypeMeta?.isSlm || this.identityForm.value.pipelineType === 'rag-ingestion';
  }

  get outputFormats(): string[] {
    return OUTPUT_FORMATS_BY_TYPE[this.identityForm.value.pipelineType] ?? [];
  }

  selectType(value: string): void {
    this.identityForm.patchValue({ pipelineType: value });
    this.applyTypeDefaults(value);
  }

  private applyTypeDefaults(type: string): void {
    const conn = this.sourceForm.get('connection');
    const cont = this.sourceForm.get('outputContainer');
    const dataset = this.sourceForm.get('dataset');
    const baseModel = this.sourceForm.get('baseModel');
    const teacherModel = this.sourceForm.get('teacherModel');
    const outputFormat = this.sourceForm.get('outputFormat');
    const isSlmCot = type === 'slm-cot';

    conn.setValidators(isSlmCot ? [] : [Validators.required]);
    cont.setValidators(isSlmCot ? [] : [Validators.required]);
    dataset.setValidators(isSlmCot ? [] : [Validators.required]);
    baseModel.setValidators(isSlmCot ? [Validators.required] : []);
    teacherModel.setValidators(isSlmCot ? [Validators.required] : []);
    outputFormat.setValidators(
      isSlmCot || OUTPUT_FORMATS_BY_TYPE[type] ? [Validators.required] : []
    );

    if (type === 'rag-ingestion') {
      this.sourceForm.patchValue({ outputFormat: 'qdrant-collection' });
    } else if (OUTPUT_FORMATS_BY_TYPE[type]) {
      this.sourceForm.patchValue({ outputFormat: OUTPUT_FORMATS_BY_TYPE[type][0] });
    } else {
      this.sourceForm.patchValue({ outputFormat: '' });
    }

    conn.updateValueAndValidity();
    cont.updateValueAndValidity();
    dataset.updateValueAndValidity();
    baseModel.updateValueAndValidity();
    teacherModel.updateValueAndValidity();
    outputFormat.updateValueAndValidity();
  }

  private loadLiveOptions(): void {
    this.services.getDatasources().subscribe({
      next: (res: any[]) => {
        this.allDatasources = Array.isArray(res) ? res : [];
        this.aliasToName.clear();
        this.allDatasources.forEach(d => {
          if (d.alias && d.name) this.aliasToName.set(d.alias, d.name);
          if (d.name) this.aliasToName.set(d.name, d.name);
        });
        const typeSet = new Set<string>();
        this.allDatasources.forEach(d => { if (d.type) typeSet.add(d.type); });
        this.outputContainers = Array.from(typeSet).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        this.outputContainersLoaded = true;
      },
      error: () => { this.outputContainersLoaded = true; },
    });
  }

  pickSchedule(value: string): void { this.executionForm.patchValue({ schedule: value }); }
  onGitLinkChange(v: GitLinkValue): void { this.gitLink = v; }
  onGitValidity(v: boolean): void { this.gitValid = v; }
  cancel(): void { this.dialogRef.close(); }

  createPipeline(): void {
    if (this.creating) return;
    if (this.identityForm.invalid || this.sourceForm.invalid || this.executionForm.invalid) return;

    const cfg = {
      ...this.identityForm.value,
      ...this.sourceForm.value,
      ...this.executionForm.value,
      git: this.gitLink,
    };

    const newSs = new StreamingServices();
    newSs.name = cfg.name;
    newSs.alias = cfg.alias;
    newSs.description = cfg.description || '';
    newSs.type = 'DataPipeline';
    newSs.interfacetype = 'pipeline';
    newSs.json_content = JSON.stringify({
      elements: [{
        attributes: {
          filetype: 'Python3',
          files: [],
          generatedCode: '',
        },
      }],
      pipeline_attributes: {
        wizard_version: 1,
        pipelineType: cfg.pipelineType,
        outputContainer: cfg.outputContainer,
        connection: cfg.connection,
        dataset: cfg.dataset,
        problemType: cfg.problemType,
        targetCol: cfg.targetCol,
        baseModel: cfg.baseModel,
        teacherModel: cfg.teacherModel,
        outputFormat: cfg.outputFormat,
        executor: cfg.executor,
        schedule: cfg.schedule,
        kind: 'data-pipeline',
        datasetColumns: this.targetColumns,
        datasetSample: this.datasetRows,
        freshlyCreated: true,
        selectedAgent: this.selectedAgent,
        selectedModel: this.selectedModel,
        git: cfg.git,
        datasourceConnectionDetails: this.selectedDatasourceObj
          ? (() => { try { return JSON.parse(this.selectedDatasourceObj.connectionDetails || '{}'); } catch { return {}; } })()
          : {},
        datasourceType: this.selectedDatasourceObj?.type || cfg.outputContainer,
        datasetLocation: this.selectedDatasetObj?.location
          || this.selectedDatasetObj?.filePath
          || this.selectedDatasetObj?.path
          || this.selectedDatasetObj?.name
          || cfg.dataset,
      },
    });

    this.creating = true;
    this.services.create(newSs).subscribe({
      next: (data) => {
        const org = data.organization || sessionStorage.getItem('organization') || '';
        const canonicalFile = `${data.name}_${org}.py`;
        try {
          const pc = JSON.parse(data.json_content || '{}');
          if (pc.elements?.[0]?.attributes) {
            pc.elements[0].attributes.files = [canonicalFile];
            data.json_content = JSON.stringify(pc);
          }
        } catch { /* non-critical */ }
        this.services.update(data).subscribe();
        this.services.message('Data Pipeline created!', 'success');
        this.dialogRef.close({ pipeline: data, kind: 'data-pipeline' });
      },
      error: (err: any) => {
        this.creating = false;
        const rawMsg = err?.error?.details || err?.error?.message || err?.error?.error
          || (typeof err?.error === 'string' && (err.error as string).length < 500 ? err.error : null);
        const msg = rawMsg || err?.message || 'Could not create pipeline';
        this.services.message(msg, 'error');
      },
    });
  }
}
