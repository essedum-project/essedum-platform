// Service for Export modal API calls
// Provides two methods: get_agent_export (GET) and put_agent_export (POST with FormData)

// Global session data retrieval
const sessionData = sessionStorage.getItem("parentSessionDetails");
const parsedData = sessionData ? JSON.parse(sessionData) : null;

// Extract all session data globally for easy access
const globalPortfolioId = parsedData?.portfolioId;
const globalPortfolioName = parsedData?.portfolioName;
const globalProjectId = parsedData?.projectId;
const globalProjectName = parsedData?.projectName;
const globalRoleId = parsedData?.roleId;
const globalRoleName = parsedData?.roleName;
const globalUserId = parsedData?.userId;
const globalUserName = parsedData?.userName;
const globalCname = sessionStorage.getItem('cname');

export type GetAgentExportParams = {
  token?: string;
};

export async function get_agent_export(params: GetAgentExportParams = {}) {
  const { token } = params;
  const url = "/api/aip/langflow/get_langflow_agent_export";

  const headers: Record<string, string> = {
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "X-Requested-With": "Leap",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const resp = await fetch(url, {
    method: "GET",
    headers,
    credentials: "include",
    mode: "cors",
  });

  const text = await resp.text().catch(() => null);
  if (!resp.ok) {
    const err = new Error(
      `GET ${url} failed: ${resp.status} ${resp.statusText} ${text ?? ""}`
    );
    // attach response body for debugging
    (err as any).responseBody = text;
    throw err;
  }

  try {
    return JSON.parse(text ?? "null");
  } catch (e) {
    return text;
  }
}

export type PutAgentExportParams = {
  flowJson?: object | string; // either already-serialized JSON or an object
  name?: string; 
  token?: string;
  // if you already have a FormData object you can pass it in `form` and skip flowJson/name/details`
  form?: FormData;
};

export async function put_agent_export(params: PutAgentExportParams = {}) {
  const { flowJson, name, token, form } = params;
  const url = "/api/aip/langflow/langflow_agent_export";

  let body: BodyInit;

  if (form instanceof FormData) {
    body = form;
  } else {
    const formData = new FormData();
    const jsonString =
      typeof flowJson === "string" ? flowJson : JSON.stringify(flowJson ?? {});
    const blob = new Blob([jsonString], { type: "application/json" });
    formData.append("json", blob, `${name || "flow"}.json`);
    if (name) formData.append("name", name);
    body = formData;
  }

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const resp = await fetch(url, {
    method: "POST",
    body,
    credentials: "include",
    headers: Object.keys(headers).length ? headers : undefined,
  });

  const text = await resp.text().catch(() => null);
  if (!resp.ok) {
    const err = new Error(
      `POST ${url} failed: ${resp.status} ${resp.statusText} ${text ?? ""}`
    );
    (err as any).responseBody = text;
    throw err;
  }

  try {
    return JSON.parse(text ?? "null");
  } catch (e) {
    return text;
  }
}

// New: post agent export file details 
export type PostAgentExportFileDetailsParams = {
  token?: string;
  alias?: string;
  loadFileName?: string;
};

export async function post_agent_export_file_details(
  params: PostAgentExportFileDetailsParams = {}
) {
  const { token, alias, loadFileName } = params;
  const url = "/api/aip/langflow/langflow_export_file_details";

  // Compute extension from alias (filename with extension)
  const extension = alias?.split(".").pop() || "json";
  const fileName = alias ?? "sample.json";

  const payload = {
    alias: alias,
    description: "",
    interfacetype: "ai agent",
    is_template: false,
    json_content: `{"elements":[{"attributes":{"filetype":"${extension}","files":["${fileName}"],"arguments":[]}}] }`,
    name: loadFileName,
    organization: "leo1311",
    filetype: extension,
    type: "ai-agent",
    portfolioId: globalPortfolioId,
    portfolioName: globalPortfolioName,
    projectId: globalProjectId,
    projectName: globalProjectName,
    roleId: globalRoleId,
    roleName: globalRoleName,
    userId: globalUserId,
    userName: globalUserName,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const text = await resp.text().catch(() => null);
  if (!resp.ok) {
    const err = new Error(
      `POST ${url} failed: ${resp.status} ${resp.statusText} ${text ?? ""}`
    );
    (err as any).responseBody = text;
    throw err;
  }

  try {
    return JSON.parse(text ?? "null");
  } catch (e) {
    return text;
  }
}

export type CreateNativeFileParams = {
  pipelineName: string;
  organization: string;
  fileName: string;
  fileType: string;
  scriptFormData: FormData;
  token?: string;
};

export async function create_native_file(params: CreateNativeFileParams) {
  const { pipelineName, organization, fileName, fileType, scriptFormData, token } = params;
  const url = `/api/aip/file/create/${pipelineName}/${organization}/${fileType}?file=${fileName}`;

  // Get session data for headers (similar to create_pipeline)
  const jwtToken = localStorage.getItem('jwtToken');

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'X-Requested-With': 'Leap',
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (jwtToken) headers['Authorization'] = `Bearer ${jwtToken}`;

  // Add project and role headers using global variables
  if (globalProjectId) {
    headers['Project'] = globalProjectId.toString();
    headers['ProjectName'] = globalProjectName || 'leo1311';
  } else {
    headers['Project'] = '2'; // fallback
    headers['ProjectName'] = 'leo1311';
  }

  if (globalRoleId) {
    headers['roleId'] = globalRoleId.toString();
    headers['roleName'] = globalRoleName || 'IT Portfolio Manager';
  } else {
    headers['roleId'] = '1'; // fallback
    headers['roleName'] = 'IT Portfolio Manager';
  }

  const resp = await fetch(url, {
    method: "POST",
    body: scriptFormData,
    headers,
    credentials: "include",
  });

  const text = await resp.text().catch(() => null);
  if (!resp.ok) {
    const err = new Error(
      `POST ${url} failed: ${resp.status} ${resp.statusText} ${text ?? ""}`
    );
    (err as any).responseBody = text;
    throw err;
  }

  try {
    return JSON.parse(text ?? "null");
  } catch (e) {
    return text;
  }
}

export type CreatePipelineParams = {
  alias?: string;
  description?: string;
  type?: string;
  interfaceType?: string;
  isTemplate?: boolean;
  jsonContent?: any;
  groups?: any[];
  token?: string;
};

export async function create_pipeline(params: CreatePipelineParams) {
  const { alias, description, type, interfaceType, isTemplate, jsonContent, groups, token } = params;
  const url = '/api/aip/service/v1/streamingServices/add';

  // Build payload similar to Angular saveDetails method
  let interfacetype = interfaceType;
    type === 'AIAgent';
    interfacetype = 'pipeline';
  

  const payload = {
    alias,
    description,
    type,
    interfacetype,
    is_template: isTemplate || false,
    json_content: jsonContent,
    groups: groups || [],
    organization: sessionStorage.getItem('organization') || 'leo1311',
    portfolioId: globalPortfolioId,
    portfolioName: globalPortfolioName,
    projectId: globalProjectId,
    projectName: globalProjectName,
    roleId: globalRoleId,
    roleName: globalRoleName,
    userId: globalUserId,
    userName: globalUserName,
  };



  // Get session data for headers (similar to Angular service)
  const jwtToken = localStorage.getItem('jwtToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'Leap',
    'Accept': 'application/json, text/plain, */*',
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (jwtToken) headers['Authorization'] = `Bearer ${jwtToken}`;

  // Add project and role headers using global variables
  if (globalProjectId) {
    headers['Project'] = globalProjectId.toString();
    headers['ProjectName'] = globalProjectName || 'leo1311';
  } else {
    headers['Project'] = '2'; // fallback
    headers['ProjectName'] = 'leo1311';
  }

  if (globalRoleId) {
    headers['roleId'] = globalRoleId.toString();
    headers['roleName'] = globalRoleName || 'IT Portfolio Manager';
  } else {
    headers['roleId'] = '1'; // fallback
    headers['roleName'] = 'IT Portfolio Manager';
  }
  

  const resp = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    credentials: 'include',
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

export type UpdatePipelineParams = {
  cid: number;
  alias?: string;
  name?: string;
  description?: string;
  jsonContent?: string;
  type?: string;
  organization?: string;
  interfacetype?: string;
  isTemplate?: boolean;
  token?: string;
};

export async function update_pipeline(params: UpdatePipelineParams) {
  const { cid, alias, name, description, jsonContent, type, organization, interfacetype, isTemplate, token } = params;
  const url = '/api/aip/service/v1/streamingServices/update';

  const payload = {
    cid,
    alias,
    name,
    description,
    json_content: jsonContent,
    type,
    organization,
    interfacetype,
    is_template: isTemplate || false,
  };

  // Get session data for headers (similar to create_pipeline)
  const jwtToken = localStorage.getItem('jwtToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'Leap',
    'Accept': 'application/json, text/plain, */*',
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (jwtToken) headers['Authorization'] = `Bearer ${jwtToken}`;

  // Add project and role headers using global variables
  if (globalProjectId) {
    headers['Project'] = globalProjectId.toString();
    headers['ProjectName'] = globalProjectName || 'leo1311';
  } else {
    headers['Project'] = '2'; // fallback
    headers['ProjectName'] = 'leo1311';
  }

  if (globalRoleId) {
    headers['roleId'] = globalRoleId.toString();
    headers['roleName'] = globalRoleName || 'IT Portfolio Manager';
  } else {
    headers['roleId'] = '1'; // fallback
    headers['roleName'] = 'IT Portfolio Manager';
  }

  const resp = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  const text = await resp.text().catch(() => null);
  if (!resp.ok) {
    const err = new Error(`PUT ${url} failed: ${resp.status} ${resp.statusText} ${text ?? ''}`);
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
// post_agent_export_details,
  post_agent_export_file_details,
  create_pipeline,
  create_native_file,
  update_pipeline,
};