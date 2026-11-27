import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

export type MtaasRunState = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'PENDING';

export type MtaasWizardStepKey = 'template' | 'dataset' | 'parameters' | 'resources' | 'review';

export interface MtaasResources {
  gpus: number;
  gpuType?: string;
  cpu: string;
  memory: string;
}

export interface MtaasRun {
  runId: string;
  displayName?: string;
  projectId?: number;
  templateId?: number;
  templateName: string;
  templateVersion: number;
  datasetId: string;
  datasetVersion: string;
  gpus: number;
  gpuType?: string;
  cpu: string;
  memory: string;
  state: MtaasRunState;
  queuePosition?: number;
  createdAt: string;
}

export interface MtaasRunAttempt {
  attempt: number;
  state: MtaasRunState;
  startedAt: string;
  finishedAt?: string;
  message?: string;
}

export interface MtaasRunDetail extends MtaasRun {
  projectId: number;
  computeTargetId?: number;
  computeTargetName: string;
  priority: number;
  params: Record<string, unknown>;
  attempts: MtaasRunAttempt[];
}

export interface MtaasPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface MtaasRunQuery {
  state: MtaasRunState | '';
  projectId: number | null;
  page: number;
  size: number;
}

export interface MtaasJsonSchemaProperty {
  type?: string;
  title?: string;
  description?: string;
  enum?: unknown[];
  enumNames?: string[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  examples?: unknown[];
}

export interface MtaasJsonSchema {
  type?: string;
  properties?: Record<string, MtaasJsonSchemaProperty>;
  required?: string[];
}

export interface MtaasTemplate {
  id: number;
  name: string;
  version: number;
  framework: string;
  description: string;
  enabled: boolean;
  defaultCpu: string;
  defaultMemory: string;
  defaultGpus: number;
  defaultGpuType?: string;
  tags?: string[];
  paramSchema?: MtaasJsonSchema;
}

export interface MtaasDataset {
  id: string;
  name: string;
  versions: string[];
}

export interface MtaasComputeTarget {
  id: number;
  name: string;
  available: boolean;
  gpuTypes: string[];
}

export interface MtaasQuotaCapacity {
  projectId: number;
  quotaCpu: string;
  usedCpu: string;
  quotaMemory: string;
  usedMemory: string;
  quotaGpus: number;
  usedGpus: number;
  priorityCeiling: number;
  queuedRuns: number;
  estimatedWaitMinutes: number;
}

export interface MtaasSubmitRequest {
  projectId: number;
  templateId: number;
  templateVersion: number;
  computeTargetId: number;
  displayName: string;
  dataset: { id: string; version: string };
  params: Record<string, unknown>;
  resources: MtaasResources;
  priority: number;
}

export interface MtaasSubmitResponse {
  runId: string;
  state: 'QUEUED';
  queuePosition: number;
}

export interface MtaasProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  reason?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface MtaasFieldErrorMap {
  [field: string]: string[];
}

export const MTAAS_RUN_STATES: MtaasRunState[] = ['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED'];

// ---------------------------------------------------------------------------
// Helpers: run state / project
// ---------------------------------------------------------------------------

// Legacy pipeline jobs report STARTED/COMPLETED/ERROR; MTaaS uses QUEUED/RUNNING/SUCCEEDED/FAILED.
const LEGACY_STATE_MAP: Record<string, MtaasRunState> = {
  STARTED: 'RUNNING',
  INPROGRESS: 'RUNNING',
  COMPLETED: 'SUCCEEDED',
  SUCCESS: 'SUCCEEDED',
  ERROR: 'FAILED',
  CANCEL: 'CANCELLED',
  CANCELED: 'CANCELLED',
};

export function normalizeRunState(raw: string | null | undefined): MtaasRunState {
  const key = String(raw ?? '').trim().toUpperCase();
  if (LEGACY_STATE_MAP[key]) {
    return LEGACY_STATE_MAP[key];
  }
  const known: MtaasRunState[] = ['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'PENDING'];
  return known.find((s) => s === key) ?? 'PENDING';
}

export function currentProjectId(): number {
  try {
    const raw = sessionStorage.getItem('project');
    const parsed = raw ? JSON.parse(raw) : null;
    const id = Number(parsed?.id ?? sessionStorage.getItem('projectId') ?? sessionStorage.getItem('CURRENTPRJID'));
    return Number.isFinite(id) && id > 0 ? id : 1;
  } catch {
    return 1;
  }
}

// ---------------------------------------------------------------------------
// Helpers: RFC 7807 problem details
// ---------------------------------------------------------------------------

export function isProblemDetails(value: unknown): value is MtaasProblemDetails {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const candidate = value as { status?: unknown; title?: unknown };
  return typeof candidate.status === 'number' && typeof candidate.title === 'string';
}

function normalizeProblem(problem: MtaasProblemDetails): MtaasProblemDetails {
  return {
    ...problem,
    title: problem.title || 'Unexpected error',
    detail: problem.detail || problem.title || 'Unexpected error',
  };
}

export function mapProblemDetails(error: unknown): MtaasProblemDetails {
  if (isProblemDetails(error)) {
    return normalizeProblem(error);
  }
  if (error instanceof Error) {
    return { title: 'Unexpected error', status: 0, detail: error.message || 'Unexpected error' };
  }
  if (error && typeof error === 'object') {
    const httpError = error as { status?: unknown; error?: unknown };
    const payload = httpError.error;
    if (isProblemDetails(payload)) {
      return normalizeProblem(payload);
    }
    const status = typeof httpError.status === 'number' ? httpError.status : 0;
    const detail =
      (payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message?: unknown }).message)
        : undefined) ||
      (typeof payload === 'string' ? payload : undefined) ||
      `Request failed with status ${status}`;
    return { title: 'Unexpected error', status, detail };
  }
  if (typeof error === 'string' && error.length > 0) {
    return { title: 'Unexpected error', status: 0, detail: error };
  }
  return { title: 'Unexpected error', status: 0, detail: 'Unexpected error' };
}

export function isQuotaExceeded(problem: MtaasProblemDetails | null): boolean {
  if (!problem || problem.status !== 409) {
    return false;
  }
  if (problem.reason === 'QUOTA_EXCEEDED') {
    return true;
  }
  return `${problem.title ?? ''} ${problem.detail ?? ''}`.toLowerCase().includes('quota');
}

export function stepForFieldErrors(fieldErrors: MtaasFieldErrorMap): MtaasWizardStepKey | null {
  const key = Object.keys(fieldErrors ?? {})[0];
  if (!key) {
    return null;
  }
  if (key === 'params' || key.startsWith('params.')) {
    return 'parameters';
  }
  if (key.startsWith('dataset') || key === 'displayName') {
    return 'dataset';
  }
  if (key.startsWith('resources') || key === 'computeTargetId' || key === 'priority') {
    return 'resources';
  }
  if (key === 'templateId' || key === 'templateVersion') {
    return 'template';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helpers: JSON-schema driven params form
// ---------------------------------------------------------------------------

export type MtaasSchemaFieldType = 'string' | 'number' | 'boolean' | 'enum';

export interface MtaasSchemaField {
  key: string;
  label: string;
  type: MtaasSchemaFieldType;
  required: boolean;
  description: string;
  placeholder: string;
  defaultValue: unknown;
  options: { value: unknown; label: string }[];
  constraints: string;
}

export function humanizeKey(key: string): string {
  const spaced = key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
  if (!spaced) {
    return key;
  }
  return spaced
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function describeConstraints(prop: MtaasJsonSchemaProperty): string {
  const parts: string[] = [];
  if (prop.minimum != null) {
    parts.push(`min ${prop.minimum}`);
  }
  if (prop.maximum != null) {
    parts.push(`max ${prop.maximum}`);
  }
  if (prop.minLength != null) {
    parts.push(`min length ${prop.minLength}`);
  }
  if (prop.maxLength != null) {
    parts.push(`max length ${prop.maxLength}`);
  }
  if (prop.pattern) {
    parts.push(`pattern: ${prop.pattern}`);
  }
  if (prop.enum && prop.enum.length) {
    parts.push(`one of: ${prop.enum.join(', ')}`);
  }
  return parts.join(' | ');
}

function fieldTypeOf(prop: MtaasJsonSchemaProperty): MtaasSchemaFieldType {
  if (prop.type === 'boolean') {
    return 'boolean';
  }
  if (prop.enum && prop.enum.length) {
    return 'enum';
  }
  return prop.type === 'number' || prop.type === 'integer' ? 'number' : 'string';
}

export function schemaToFields(schema: MtaasJsonSchema | null | undefined): MtaasSchemaField[] {
  const required = schema?.required ?? [];
  const properties = schema?.properties ?? {};
  return Object.keys(properties).map((key) => {
    const prop = properties[key];
    return {
      key,
      label: prop.title || humanizeKey(key),
      type: fieldTypeOf(prop),
      required: required.includes(key),
      description: prop.description || '',
      placeholder: prop.examples?.length ? String(prop.examples[0]) : '',
      defaultValue: prop.default,
      options: (prop.enum ?? []).map((v, i) => ({ value: v, label: prop.enumNames?.[i] ?? String(v) })),
      constraints: describeConstraints(prop),
    };
  });
}

export function rangeValidator(min?: number, max?: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return null;
    }
    if (min != null && numeric < min) {
      return { min: { min } };
    }
    if (max != null && numeric > max) {
      return { max: { max } };
    }
    return null;
  };
}

export function enumValidator(allowed: unknown[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '' || allowed.includes(value)) {
      return null;
    }
    return { enum: { allowed } };
  };
}

export function schemaValidators(prop: MtaasJsonSchemaProperty, required: boolean): ValidatorFn[] {
  const validators: ValidatorFn[] = [];
  if (required) {
    validators.push(Validators.required);
  }
  const kind = fieldTypeOf(prop);
  if (kind === 'number') {
    validators.push(rangeValidator(prop.minimum, prop.maximum));
  } else if (kind === 'enum') {
    validators.push(enumValidator(prop.enum ?? []));
  } else if (kind === 'string') {
    if (prop.minLength != null) {
      validators.push(Validators.minLength(prop.minLength));
    }
    if (prop.maxLength != null) {
      validators.push(Validators.maxLength(prop.maxLength));
    }
    if (prop.pattern) {
      validators.push(Validators.pattern(prop.pattern));
    }
  }
  return validators;
}

export function defaultValueFor(field: MtaasSchemaField): unknown {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }
  switch (field.type) {
    case 'boolean':
      return false;
    case 'number':
      return null;
    case 'enum':
      return field.options[0]?.value ?? null;
    default:
      return '';
  }
}

export function buildSchemaFormGroup(schema: MtaasJsonSchema | null | undefined): FormGroup {
  const controls: Record<string, FormControl> = {};
  for (const field of schemaToFields(schema)) {
    const prop = schema?.properties?.[field.key] ?? {};
    controls[field.key] = new FormControl(defaultValueFor(field), schemaValidators(prop, field.required));
  }
  return new FormGroup(controls);
}

const VALIDATION_MESSAGES: Record<string, string> = {
  required: 'This field is required.',
  enum: 'Value is not one of the allowed options.',
  pattern: 'Value does not match the required format.',
  server: 'The server rejected this value.',
};

export function messagesForField(control: AbstractControl | null, submitted: boolean): string[] {
  if (!control || control.valid || (!control.touched && !submitted)) {
    return [];
  }
  const errors = control.errors ?? {};
  return Object.keys(errors).map((key) => {
    switch (key) {
      case 'min':
        return `Value must be at least ${errors['min']?.min}.`;
      case 'max':
        return `Value must be at most ${errors['max']?.max}.`;
      case 'minlength':
        return `Use at least ${errors['minlength']?.requiredLength} characters.`;
      case 'maxlength':
        return `Use at most ${errors['maxlength']?.requiredLength} characters.`;
      case 'server': {
        const value = errors['server'];
        return Array.isArray(value) ? value.join(' ') : VALIDATION_MESSAGES['server'];
      }
      default:
        return VALIDATION_MESSAGES[key] ?? `Invalid value (${key}).`;
    }
  });
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

function mockParamSchema(): MtaasJsonSchema {
  return {
    type: 'object',
    properties: {
      epochs: { type: 'number', title: 'Epochs', default: 3, minimum: 1, maximum: 100 },
      learningRate: { type: 'number', title: 'Learning Rate', default: 0.001, minimum: 0.00001, maximum: 1 },
      batchSize: { type: 'number', title: 'Batch Size', default: 32, minimum: 1, maximum: 1024 },
      optimizer: { type: 'string', title: 'Optimizer', enum: ['adam', 'sgd', 'rmsprop'], default: 'adam' },
      useAmp: { type: 'boolean', title: 'Mixed Precision', default: false },
      seed: { type: 'number', title: 'Random Seed', default: 42 },
      description: { type: 'string', title: 'Notes', maxLength: 200 },
    },
    required: ['epochs', 'learningRate', 'batchSize', 'optimizer'],
  };
}

const MOCK_TEMPLATES: MtaasTemplate[] = [
  { id: 101, name: 'PyTorch Image Classifier', version: 3, framework: 'PYTORCH', enabled: true, description: 'Fine-tune a ResNet image classifier on your dataset.', defaultCpu: '4', defaultMemory: '16Gi', defaultGpus: 1, defaultGpuType: 'NVIDIA_T4', tags: ['vision', 'pytorch'], paramSchema: mockParamSchema() },
  { id: 102, name: 'Hugging Face Text Fine-Tune', version: 2, framework: 'HF', enabled: true, description: 'Fine-tune a transformer for text classification.', defaultCpu: '8', defaultMemory: '32Gi', defaultGpus: 1, defaultGpuType: 'NVIDIA_A100', tags: ['nlp', 'transformers'], paramSchema: mockParamSchema() },
  { id: 103, name: 'XGBoost Tabular Trainer', version: 1, framework: 'XGBOOST', enabled: true, description: 'Train a gradient-boosted model on tabular data.', defaultCpu: '2', defaultMemory: '8Gi', defaultGpus: 0, tags: ['tabular'], paramSchema: mockParamSchema() },
  { id: 104, name: 'Custom Experiment Runner', version: 1, framework: 'CUSTOM', enabled: false, description: 'Run a custom training script (currently disabled).', defaultCpu: '2', defaultMemory: '4Gi', defaultGpus: 0, tags: ['custom'], paramSchema: mockParamSchema() },
];
const MOCK_DATASETS: MtaasDataset[] = [
  { id: 'ds-cifar10', name: 'CIFAR-10', versions: ['v1', 'v2', 'v3'] },
  { id: 'ds-imdb', name: 'IMDB Reviews', versions: ['v1', 'v2'] },
  { id: 'ds-tabular-churn', name: 'Customer Churn', versions: ['v1'] },
];
const MOCK_COMPUTE_TARGETS: MtaasComputeTarget[] = [
  { id: 1, name: 'k8s-gpu-pool-a', available: true, gpuTypes: ['NVIDIA_T4', 'NVIDIA_A100'] },
  { id: 2, name: 'k8s-gpu-pool-b', available: true, gpuTypes: ['NVIDIA_A100', 'NVIDIA_H100'] },
  { id: 3, name: 'k8s-cpu-pool', available: false, gpuTypes: [] },
];
const MOCK_RUN_COUNT = 26;
const MOCK_GPU_QUOTA = 4;

function paramDefaults(schema: MtaasJsonSchema | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of schemaToFields(schema)) {
    out[field.key] = defaultValueFor(field);
  }
  return out;
}

function hashRequest(request: unknown): string {
  const body = JSON.stringify(request);
  let hash = 5381;
  for (let i = 0; i < body.length; i++) {
    hash = ((hash << 5) + hash + body.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(16);
}

@Injectable()
export class MtaasService {
  // UI-only phase: flip once the backend endpoints exist.
  private readonly USE_MOCK = true;
  private readonly submittedRuns: MtaasRunDetail[] = [];

  constructor(
    private http: HttpClient,
    @Inject('envi') private baseUrl: string
  ) {}

  getRuns(query: MtaasRunQuery): Observable<MtaasPage<MtaasRun>> {
    if (!this.USE_MOCK) {
      const params: Record<string, string | number> = { page: query.page, size: query.size };
      if (query.state) {
        params['state'] = query.state;
      }
      if (query.projectId !== null && query.projectId !== undefined) {
        params['projectId'] = query.projectId;
      }
      return this.http
        .get<MtaasPage<MtaasRun>>(`${this.baseUrl}/training/runs`, { params })
        .pipe(map((page) => ({ ...page, content: page.content.map((r) => ({ ...r, state: normalizeRunState(r.state) })) })));
    }
    return of(this.mockRuns(query)).pipe(delay(300));
  }

  getRun(runId: string): Observable<MtaasRunDetail> {
    if (!this.USE_MOCK) {
      return this.http
        .get<MtaasRunDetail>(`${this.baseUrl}/training/runs/${encodeURIComponent(runId)}`)
        .pipe(map((r) => ({ ...r, state: normalizeRunState(r.state), attempts: r.attempts ?? [] })));
    }
    const found = this.allMockRuns().find((r) => r.runId === runId);
    if (!found) {
      const problem: MtaasProblemDetails = { title: 'Run not found', status: 404, detail: `No run with id ${runId}.` };
      return of(null).pipe(delay(300), switchMap(() => throwError(() => ({ status: 404, error: problem }))));
    }
    return of(found).pipe(delay(300));
  }

  getTemplates(): Observable<MtaasTemplate[]> {
    return this.USE_MOCK
      ? of(MOCK_TEMPLATES).pipe(delay(300))
      : this.http.get<MtaasTemplate[]>(`${this.baseUrl}/training/templates`);
  }

  getTemplate(id: number): Observable<MtaasTemplate> {
    if (!this.USE_MOCK) {
      return this.http.get<MtaasTemplate>(`${this.baseUrl}/training/templates/${id}`);
    }
    return of(MOCK_TEMPLATES.find((t) => t.id === id) ?? MOCK_TEMPLATES[0]).pipe(delay(300));
  }

  getDatasets(): Observable<MtaasDataset[]> {
    return this.USE_MOCK
      ? of(MOCK_DATASETS).pipe(delay(300))
      : this.http.get<MtaasDataset[]>(`${this.baseUrl}/training/datasets`);
  }

  getComputeTargets(): Observable<MtaasComputeTarget[]> {
    return this.USE_MOCK
      ? of(MOCK_COMPUTE_TARGETS).pipe(delay(300))
      : this.http.get<MtaasComputeTarget[]>(`${this.baseUrl}/training/compute-targets`);
  }

  getQuotaCapacity(projectId: number): Observable<MtaasQuotaCapacity> {
    if (!this.USE_MOCK) {
      return this.http.get<MtaasQuotaCapacity>(`${this.baseUrl}/training/quota-capacity`, {
        params: { projectId },
      });
    }
    const quota: MtaasQuotaCapacity = {
      projectId,
      quotaCpu: '32',
      usedCpu: '12',
      quotaMemory: '128Gi',
      usedMemory: '40Gi',
      quotaGpus: MOCK_GPU_QUOTA,
      usedGpus: 1,
      priorityCeiling: 5,
      queuedRuns: 3,
      estimatedWaitMinutes: 12,
    };
    return of(quota).pipe(delay(300));
  }

  submitRun(request: MtaasSubmitRequest): Observable<MtaasSubmitResponse> {
    if (!this.USE_MOCK) {
      // Same payload => same key, so a retried submit cannot create a second run.
      return this.http.post<MtaasSubmitResponse>(`${this.baseUrl}/training/runs`, request, {
        headers: { 'Idempotency-Key': `train-${hashRequest(request)}` },
      });
    }
    // Demo hook: asking for more GPUs than the mock quota returns an RFC 7807 QUOTA_EXCEEDED conflict.
    if (request.resources.gpus > MOCK_GPU_QUOTA) {
      const problem: MtaasProblemDetails = {
        type: 'https://essedum.io/problems/quota-exceeded',
        title: 'Quota exceeded',
        status: 409,
        detail: `Requested ${request.resources.gpus} GPUs but only 3 are available in the project quota.`,
        reason: 'QUOTA_EXCEEDED',
      };
      return of(null).pipe(delay(300), switchMap(() => throwError(() => ({ status: 409, error: problem }))));
    }
    const template = MOCK_TEMPLATES.find((t) => t.id === request.templateId) ?? MOCK_TEMPLATES[0];
    const response: MtaasSubmitResponse = {
      runId: `run-${Date.now()}`,
      state: 'QUEUED',
      queuePosition: this.submittedRuns.length + 1,
    };
    const compute = MOCK_COMPUTE_TARGETS.find((c) => c.id === request.computeTargetId);
    this.submittedRuns.unshift({
      runId: response.runId,
      displayName: request.displayName,
      projectId: request.projectId,
      templateId: template.id,
      templateName: template.name,
      templateVersion: request.templateVersion,
      datasetId: request.dataset.id,
      datasetVersion: request.dataset.version,
      gpus: request.resources.gpus,
      gpuType: request.resources.gpuType,
      cpu: request.resources.cpu,
      memory: request.resources.memory,
      state: 'QUEUED',
      queuePosition: response.queuePosition,
      createdAt: new Date().toISOString(),
      computeTargetId: request.computeTargetId,
      computeTargetName: compute?.name ?? 'k8s-gpu-pool-a',
      priority: request.priority,
      params: request.params,
      attempts: [],
    });
    return of(response).pipe(delay(300));
  }

  private allMockRuns(): MtaasRunDetail[] {
    const enabled = MOCK_TEMPLATES.filter((t) => t.enabled);
    const all: MtaasRunDetail[] = [...this.submittedRuns];
    for (let i = 0; i < MOCK_RUN_COUNT; i++) {
      const t = enabled[i % enabled.length];
      const ds = MOCK_DATASETS[i % MOCK_DATASETS.length];
      const state = MTAAS_RUN_STATES[i % MTAAS_RUN_STATES.length];
      const createdMs = Date.UTC(2026, 10, 24, 9, 0, 0) - i * 3600_000;
      const startedAt = new Date(createdMs + 60_000).toISOString();
      const finishedAt = new Date(createdMs + 20 * 60_000).toISOString();
      let attempts: MtaasRunAttempt[] = [];
      if (state === 'RUNNING') {
        attempts = [{ attempt: 1, state, startedAt }];
      } else if (state === 'SUCCEEDED' || state === 'CANCELLED') {
        attempts = [{ attempt: 1, state, startedAt, finishedAt }];
      } else if (state === 'FAILED') {
        attempts = [
          { attempt: 1, state, startedAt, finishedAt, message: 'Out of memory on worker node.' },
          { attempt: 2, state, startedAt: finishedAt, finishedAt: new Date(createdMs + 40 * 60_000).toISOString(), message: 'Out of memory on worker node.' },
        ];
      }
      all.push({
        runId: `run-${String(i + 1).padStart(4, '0')}`,
        displayName: `${t.name} run ${i + 1}`,
        projectId: (i % 2) + 1,
        templateId: t.id,
        templateName: t.name,
        templateVersion: t.version,
        datasetId: ds.id,
        datasetVersion: ds.versions[0],
        gpus: t.defaultGpus,
        gpuType: t.defaultGpuType,
        cpu: t.defaultCpu,
        memory: t.defaultMemory,
        state,
        queuePosition: state === 'QUEUED' ? (i % 8) + 1 : undefined,
        createdAt: new Date(createdMs).toISOString(),
        computeTargetId: MOCK_COMPUTE_TARGETS[i % 2].id,
        computeTargetName: MOCK_COMPUTE_TARGETS[i % 2].name,
        priority: (i % 5) + 1,
        params: paramDefaults(t.paramSchema),
        attempts,
      });
    }
    return all;
  }

  private mockRuns(query: MtaasRunQuery): MtaasPage<MtaasRun> {
    let filtered: MtaasRun[] = this.allMockRuns();
    if (query.state) {
      filtered = filtered.filter((r) => r.state === query.state);
    }
    if (query.projectId !== null && query.projectId !== undefined) {
      filtered = filtered.filter((r) => r.projectId === query.projectId);
    }
    const size = query.size > 0 ? query.size : 8;
    const page = Math.max(0, query.page);
    const start = page * size;
    return {
      content: filtered.slice(start, start + size),
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      number: page,
      size,
    };
  }
}
