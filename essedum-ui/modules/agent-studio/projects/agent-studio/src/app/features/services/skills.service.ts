import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// ── Domain model — mirrors the API response shape exactly ─────────────────────

export interface Skill {
  id: number;
  skillUid?: string;
  skillName: string;
  skillAlias?: string;
  skillVersion: string;
  skillType: string;
  skillCategory: string;
  skillSubcategory?: string;
  tags?: string;
  triggerKeywords?: string;
  description: string;
  language?: string;
  framework?: string;
  runtime?: string;
  entrypoint?: string;
  inputSchema?: string;
  outputSchema?: string;
  pipelineScope: string;
  status: string;
  visibility: string;
  organization: string;
  projectId?: number;
  usageCount?: number;
  lastUsedDate?: string;
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}

// ── List API response ─────────────────────────────────────────────────────────

export interface SkillsListResponse {
  skills: Skill[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
  availableTypes: string[];
  availableCategories: string[];
  availableSubcategories: string[];
}

// ── Create / Update request body ──────────────────────────────────────────────

export interface SkillCreateRequest {
  skillName: string;
  skillAlias?: string;
  skillVersion: string;
  skillType: string;
  skillCategory: string;
  skillSubcategory?: string;
  tags?: string;
  triggerKeywords?: string;
  description: string;
  language?: string;
  framework?: string;
  runtime?: string;
  entrypoint?: string;
  inputSchema?: string;
  outputSchema?: string;
  pipelineScope: string;
  status: string;
  visibility: string;
}

// Create response is the full persisted Skill
export type SkillCreateResponse = Skill;

// Update request — same fields as create
export type SkillUpdateRequest = SkillCreateRequest;

// Update response is the full persisted Skill
export type SkillUpdateResponse = Skill;

export interface DeleteSkillResponse {
  message: string;
  id: number;
}

// ── Service messages ────────────────────────────────────────────────────────

export const SkillsServiceMessages = {
  FETCH_SUCCESS: 'Skills fetched successfully!',
  CREATE_SUCCESS: 'Skill created successfully!',
  UPDATE_SUCCESS: 'Skill updated successfully!',
  DELETE_SUCCESS: 'Skill deleted successfully!',
  CREATE_ERROR: 'Failed to create skill. Please try again.',
  UPDATE_ERROR: 'Failed to update skill. Please try again.',
  DELETE_ERROR: 'Failed to delete skill. Please try again.',
  FETCH_ERROR: 'Failed to fetch skills. Please try again.',
};

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class SkillsService {
  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    console.error(error);
    return throwError(() => error);
  }

  getSkills(
    org: string,
    page: number = 0,
    size: number = 10,
    type?: string,
    category?: string,
    subcategory?: string,
    search?: string,
  ): Observable<SkillsListResponse> {
    let params = new HttpParams()
      .set('org', org)
      .set('page', page.toString())
      .set('size', size.toString());

    if (type)        params = params.set('skillType', type);
    if (category)    params = params.set('skillCategory', category);
    if (subcategory) params = params.set('skillSubcategory', subcategory);
    if (search)      params = params.set('search', search);

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

  createSkill(org: string, projectId: number, body: SkillCreateRequest): Observable<SkillCreateResponse> {
    const params = new HttpParams()
      .set('org', org)
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
}
