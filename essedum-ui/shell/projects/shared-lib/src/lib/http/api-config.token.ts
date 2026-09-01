import { InjectionToken } from '@angular/core';

/**
 * Single source of API base-URLs consumed by every MFE.
 * Host registers a concrete value at app startup; remotes inject this token
 * instead of the legacy `envi`/`dataSets`/`sbx` string tokens.
 */
export interface ApiConfig {
  /** Primary backend (proxy-service) base — e.g. '/api/aip'. */
  baseUrl: string;
  /** Datasets backend base. Usually same as baseUrl. */
  datasetsUrl: string;
  /** Sandbox / experiments path — e.g. '/api/exp'. */
  sandboxUrl: string;
  /** Optional: Langflow embed URL used by agent-mfe. */
  agentDesignerUrl?: string;
  /** Optional: LiteLLM URL. */
  litellmUrl?: string;
  /** Optional: Langfuse URL. */
  langfuseUrl?: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');

/** Default fallback used by MFEs when the host hasn't registered a config yet. */
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: '/api/aip',
  datasetsUrl: '/api/aip',
  sandboxUrl: '/api/exp',
};
