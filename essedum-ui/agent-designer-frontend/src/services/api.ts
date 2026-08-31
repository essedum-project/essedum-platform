// In dev, use empty base URL so Vite proxies /api → backend (avoids CORS).
// In production builds, use the configured backend URL directly.
const API_BASE_URL: string = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || '');

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers, ...rest } = options;

  // Build query string
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const config: RequestInit = {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(url, config);

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new ApiError(response.status, errorBody, url);
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;
  body: string;
  url: string;

  constructor(status: number, body: string, url: string) {
    super(`API ${status}: ${body}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.url = url;
  }
}

export const api = {
  get: <T>(url: string, params?: Record<string, string | number | undefined>) =>
    request<T>(url, { method: 'GET', params }),

  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'POST', body }),

  put: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PUT', body }),

  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PATCH', body }),

  delete: <T = void>(url: string) =>
    request<T>(url, { method: 'DELETE' }),
};
