import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum SkillType {
  CODE_GENERATION = 'CODE_GENERATION',
  TEST_GENERATION = 'TEST_GENERATION',
  DEBUGGING       = 'DEBUGGING',
  REFACTORING     = 'REFACTORING',
  DOCUMENTATION   = 'DOCUMENTATION',
  DEPLOYMENT      = 'DEPLOYMENT',
  CODE_REVIEW     = 'CODE_REVIEW',
  SECURITY_SCAN   = 'SECURITY_SCAN',
  DATA_PIPELINE   = 'DATA_PIPELINE',
  CUSTOM          = 'CUSTOM',
}

export enum SkillCategory {
  BACKEND  = 'Backend',
  FRONTEND = 'Frontend',
  ML       = 'ML',
  DEVOPS   = 'DevOps',
  DATA     = 'Data',
}

export enum SkillSubcategory {
  SPRING_BOOT = 'SpringBoot',
  FAST_API    = 'FastAPI',
  REACT       = 'React',
  ANGULAR     = 'Angular',
  LANG_CHAIN  = 'LangChain',
  DOCKER      = 'Docker',
  KUBERNETES  = 'Kubernetes',
  NODE        = 'Node',
  NEXTJS      = 'NextJS',
  VUE         = 'Vue',
}

export enum SkillStatus {
  ACTIVE     = 'ACTIVE',
  INACTIVE   = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
}

export enum SkillVisibility {
  GLOBAL  = 'GLOBAL',
  ORG     = 'ORG',
  PROJECT = 'PROJECT',
  PRIVATE = 'PRIVATE',
}

export enum PipelineScope {
  ALL      = 'ALL',
  SPECIFIC = 'SPECIFIC',
  NONE     = 'NONE',
}

export enum SkillLanguage {
  JAVA       = 'java',
  PYTHON     = 'python',
  TYPESCRIPT = 'typescript',
  JAVASCRIPT = 'javascript',
  GO         = 'go',
  SHELL      = 'shell',
  CSHARP     = 'csharp',
}

export enum SkillRuntime {
  JDK21      = 'jdk21',
  JDK17      = 'jdk17',
  PYTHON311  = 'python3.11',
  PYTHON310  = 'python3.10',
  NODE18     = 'node18',
  NODE20     = 'node20',
  DOCKER     = 'docker',
}

// ── Shared filter item (mirrors aip-filter's internal FilterItem) ─────────────

export interface SkillFilterItem {
  category: string;
  label:    string;
  value:    string;
  selected: boolean;
}

// ── Domain model — mirrors the API response shape exactly ─────────────────────

export interface Skill {
  id:                number;
  skillUid?:         string;
  skillName:         string;
  skillAlias?:       string;
  skillVersion:      string;
  skillType:         string;
  skillCategory:     string;
  skillSubcategory?: string;
  tags?:             string;
  triggerKeywords?:  string;
  description:       string;
  language?:         string;
  framework?:        string;
  runtime?:          string;
  entrypoint?:       string;
  inputSchema?:      string;
  outputSchema?:     string;
  pipelineScope:     string;
  status:            string;
  visibility:        string;
  organization:      string;
  projectId?:        number;
  usageCount?:       number;
  lastUsedDate?:     string;
  createdBy:         string;
  createdDate:       string;
  lastModifiedBy?:   string;
  lastModifiedDate?: string;
}

// ── List API response ─────────────────────────────────────────────────────────

export interface SkillsListResponse {
  skills:                  Skill[];
  totalCount:              number;
  page:                    number;
  size:                    number;
  totalPages:              number;
  availableTypes:          string[];
  availableCategories:     string[];
  availableSubcategories:  string[];
}

// ── Create / Update request ───────────────────────────────────────────────────

export interface SkillCreateRequest {
  skillName:         string;
  skillAlias?:       string;
  skillVersion:      string;
  skillType:         string;
  skillCategory:     string;
  skillSubcategory?: string;
  tags?:             string;
  triggerKeywords?:  string;
  description:       string;
  language?:         string;
  framework?:        string;
  runtime?:          string;
  entrypoint?:       string;
  inputSchema?:      string;
  outputSchema?:     string;
  pipelineScope:     string;
  status:            string;
  visibility:        string;
}

export type SkillUpdateRequest  = SkillCreateRequest;
export type SkillCreateResponse = Skill;
export type SkillUpdateResponse = Skill;

export interface DeleteSkillResponse {
  message: string;
  id:      number;
}

// ── Form model (used with ngModel in add / edit components) ───────────────────

export interface SkillFormModel extends SkillCreateRequest {}

// ── User-facing messages ──────────────────────────────────────────────────────

export const SkillsServiceMessages = {
  FETCH_SUCCESS:  'Skills fetched successfully!',
  CREATE_SUCCESS: 'Skill created successfully!',
  UPDATE_SUCCESS: 'Skill updated successfully!',
  DELETE_SUCCESS: 'Skill deleted successfully!',
  FETCH_ERROR:    'Failed to fetch skills. Please try again.',
  CREATE_ERROR:   'Failed to create skill. Please try again.',
  UPDATE_ERROR:   'Failed to update skill. Please try again.',
  DELETE_ERROR:   'Failed to delete skill. Please try again.',
};

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class SkillsService {
  private refreshListSubject = new Subject<void>();
  refreshList$ = this.refreshListSubject.asObservable();
  needsRefreshWithDelay = false;

  constructor(private http: HttpClient) {}

  triggerListRefresh(): void {
    this.needsRefreshWithDelay = true;
    this.refreshListSubject.next();
  }

  private handleError(error: any) {
    console.error(error);
    return throwError(() => error);
  }

  getSkills(
    org:          string,
    page:         number = 0,
    size:         number = 10,
    type?:        string,
    category?:    string,
    subcategory?: string,
    search?:      string,
  ): Observable<SkillsListResponse> {
    let params = new HttpParams()
      .set('org',  org)
      .set('page', page.toString())
      .set('size', size.toString());

    if (type)        params = params.set('skillType',        type);
    if (category)    params = params.set('skillCategory',    category);
    if (subcategory) params = params.set('skillSubcategory', subcategory);
    if (search)      params = params.set('search',           search);

    return this.http
      .get<SkillsListResponse>('/api/aip/skills', {
        params,
        headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
        observe: 'response',
      })
      .pipe(
        map(res => res.body as SkillsListResponse),
        catchError(err => this.handleError(err)),
      );
  }

  getSkillById(id: number): Observable<Skill> {
    return this.http
      .get<Skill>(`/api/aip/skills/${id}`, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
        observe: 'response',
      })
      .pipe(
        map(res => res.body as Skill),
        catchError(err => this.handleError(err)),
      );
  }

  createSkill(org: string, projectId: number, body: SkillCreateRequest): Observable<SkillCreateResponse> {
    const params = new HttpParams()
      .set('org',       org)
      .set('projectId', projectId.toString());

    return this.http
      .post<SkillCreateResponse>('/api/aip/skills/create', body, {
        params,
        headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
        observe: 'response',
      })
      .pipe(
        map(res => res.body as SkillCreateResponse),
        catchError(err => this.handleError(err)),
      );
  }

  updateSkill(id: number, body: SkillUpdateRequest): Observable<SkillUpdateResponse> {
    return this.http
      .put<SkillUpdateResponse>(`/api/aip/skills/${id}`, body, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
        observe: 'response',
      })
      .pipe(
        map(res => res.body as SkillUpdateResponse),
        catchError(err => this.handleError(err)),
      );
  }

  deleteSkill(id: number): Observable<DeleteSkillResponse> {
    return this.http
      .delete<DeleteSkillResponse>(`/api/aip/skills/${id}`, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
        observe: 'response',
      })
      .pipe(
        map(res => res.body as DeleteSkillResponse),
        catchError(err => this.handleError(err)),
      );
  }
}
