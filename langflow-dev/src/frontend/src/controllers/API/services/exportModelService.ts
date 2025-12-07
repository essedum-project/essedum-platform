// Service for Export modal API calls
// Provides two methods: get_agent_export (GET) and put_agent_export (POST with FormData)

export type GetAgentExportParams = {
  token?: string;
};

export async function get_agent_export(params: GetAgentExportParams = {}) {
  const { token } = params;
  const url = '/api/aip/langflow/get_langflow_agent_export';

  const headers: Record<string, string> = {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'X-Requested-With': 'Leap',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
    mode: 'cors',
  });

  const text = await resp.text().catch(() => null);
  if (!resp.ok) {
    const err = new Error(`GET ${url} failed: ${resp.status} ${resp.statusText} ${text ?? ''}`);
    // attach response body for debugging
    (err as any).responseBody = text;
    throw err;
  }

  try {
    return JSON.parse(text ?? 'null');
  } catch (e) {
    return text;
  }
}

export type PutAgentExportParams = {
  flowJson?: object | string; // either already-serialized JSON or an object
  name?: string;
  details?: string;
  token?: string;
  // if you already have a FormData object you can pass it in `form` and skip flowJson/name/details`
  form?: FormData;
};

export async function put_agent_export(params: PutAgentExportParams = {}) {
  const { flowJson, name, details, token, form } = params;
  const url = '/api/aip/langflow/langflow_agent_export';

  let body: BodyInit;

  if (form instanceof FormData) {
    body = form;
  } else {
    const formData = new FormData();
    const jsonString = typeof flowJson === 'string' ? flowJson : JSON.stringify(flowJson ?? {});
    const blob = new Blob([jsonString], { type: 'application/json' });
    formData.append('json', blob, `${(name || 'flow')}.json`);
    if (name) formData.append('name', name);
    if (details) formData.append('details', details);
    body = formData;
  }

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(url, {
    method: 'POST',
    body,
    credentials: 'include',
    headers: Object.keys(headers).length ? headers : undefined,
  });

  const text = await resp.text().catch(() => null);
  if (!resp.ok) {
    const err = new Error(`POST ${url} failed: ${resp.status} ${resp.statusText} ${text ?? ''}`);
    (err as any).responseBody = text;
    throw err;
  }

  try {
    return JSON.parse(text ?? 'null');
  } catch (e) {
    return text;
  }
}

export default {
  get_agent_export,
  put_agent_export,
};
