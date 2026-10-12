import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModerationRequest {
  Prompt: string;
  ModerationChecks: string[];
  AccountName?: string;
  userid?: string;
  PortfolioName?: string;
}

export interface ModerationCheckResult {
  status: 'PASSED' | 'FAILED';
  score: number;
}

export interface ModerationResult {
  summary: { status: 'PASSED' | 'FAILED'; reason: string[] };
  checks: Record<string, ModerationCheckResult>;
}

export interface PrivacyEntity {
  entity_type: string;
  start: number;
  end: number;
  score: number;
  text: string;
}

export interface PrivacyAnalyzeRequest {
  inputText: string;
  piiEntitiesToBeRedacted: string[];
  scoreThreshold: number;
}

export interface PrivacyAnalyzeResult {
  entities: PrivacyEntity[];
  input_length: number;
}

export interface PrivacyAnonymizeRequest extends PrivacyAnalyzeRequest {
  redactionType: 'replace' | 'mask' | 'hash';
  fakeData?: boolean;
}

export interface PrivacyAnonymizeResult {
  anonymizedText: string;
  originalLength: number;
  anonymizedLength: number;
  redactedCount: number;
}

/** One guardrail evaluation recorded by the Salus dashboard service. */
export interface GuardrailEvent {
  timestamp: string;
  stage: string;
  text: string;
  checks: string[];
  failed_checks: string[];
  passed: boolean;
  model: string | null;
  trace_id?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RaiservicesService {

  private readonly moderationUrl = '/salus-mod/rai/v1/moderations';
  private readonly privacyAnalyzeUrl = '/salus-priv/v1/privacy/text/analyze';
  private readonly privacyAnonymizeUrl = '/salus-priv/v1/privacy/text/anonymize';

  constructor(
    private http: HttpClient,
    @Inject('dataSets') private dataUrl: string,
    @Inject('envi') private baseUrl: string,
  ) {}

  private modal = new BehaviorSubject<boolean>(null);
  currentModal = this.modal.asObservable();
  changeModalData(modal: boolean) {
    this.modal.next(modal);
  }

  moderate(req: ModerationRequest): Observable<{ moderationResults: ModerationResult }> {
    return this.http.post<{ moderationResults: ModerationResult }>(this.moderationUrl, req);
  }

  analyzePrivacy(req: PrivacyAnalyzeRequest): Observable<PrivacyAnalyzeResult> {
    return this.http.post<PrivacyAnalyzeResult>(this.privacyAnalyzeUrl, req);
  }

  anonymizePrivacy(req: PrivacyAnonymizeRequest): Observable<PrivacyAnonymizeResult> {
    return this.http.post<PrivacyAnonymizeResult>(this.privacyAnonymizeUrl, req);
  }

  guardrailEvents(salusUrl: string): Observable<GuardrailEvent[]> {
    return this.http.get<GuardrailEvent[]>(`${salusUrl.replace(/\/$/, '')}/events`);
  }
}
