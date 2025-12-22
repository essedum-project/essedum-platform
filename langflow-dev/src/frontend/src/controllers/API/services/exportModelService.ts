// Service for Export modal API calls
// Provides two methods: get_agent_export (GET) and put_agent_export (POST with FormData)
// Centralized parent token - MUST match the token in api.tsx
//const SHARED_PARENT_TOKEN = '';

// Helper to read current session and local values at call-time
function getSessionInfo() {
  const sessionData = sessionStorage.getItem("parentSessionDetails");
  const parsedData = sessionData ? JSON.parse(sessionData) : {};
  return {
    // Use shared parent token (same as api.tsx) - for production use localStorage.getItem('baseParentToken') 
    parentToken: localStorage.getItem('baseParentToken'),
    pjwtToken: localStorage.getItem("jwtToken") || undefined,
    organization: localStorage.getItem("organization") || undefined,
    cname: sessionStorage.getItem('cname'),
    portfolioId: parsedData?.portfolioId,
    portfolioName: parsedData?.portfolioName,
    projectId: parsedData?.projectId,
    projectName: parsedData?.projectName,
    roleId: parsedData?.roleId,
    roleName: parsedData?.roleName,
    userId: parsedData?.userId,
    userName: parsedData?.userName,
    organisation:parsedData?.organisation
  };
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
  const url = `/api/aip/file/create/${pipelineName}/${organization}/${fileType}?file=${encodeURIComponent(fileName)}`;

  const session = getSessionInfo();

  // Match the working curl headers exactly
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Origin': window.location.origin,
    'Referer': window.location.href,
    'X-Requested-With': 'Leap',
    'User-Agent': navigator.userAgent,
  };

  // Note: Authorization header will be automatically added by the API interceptor for /api/aip URLs

  // Use hardcoded values that match the working curl (adjust these based on your session)
  headers['Project'] = session.projectId;;
  headers['ProjectName'] = session.projectName;
  headers['roleId'] = session.roleId;
  headers['roleName'] = session.roleName;
  
  // Validate FormData structure - match Java controller signature
  if (!scriptFormData.has('scriptFile')) {
    throw new Error('FormData must contain a "scriptFile" entry');
  }
  
  Array.from(scriptFormData.entries()).forEach(([key, value]) => {
    if (typeof globalThis !== 'undefined' && (globalThis as any).File && value instanceof (globalThis as any).File) {
      const f = value as File;
      console.log(`  ${key}: File(name="${f.name}", type="${f.type}", size=${f.size})`);
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).Blob && value instanceof (globalThis as any).Blob) {
      const b = value as Blob;
      console.log(`  ${key}: Blob(type="${b.type}", size=${b.size})`);
    } else {
      console.log(`  ${key}:`, value);
    }
  });

  // Don't set Content-Type - let browser handle multipart boundary
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
    interfacetype = 'pipeline-agent';
  

  const sess = getSessionInfo();
  const payload = {
    alias,
    description,
    type,
    interfacetype,
    is_template: isTemplate || false,
    json_content: jsonContent,
    groups: groups || [],
    organization: sess.organization,
    portfolioId: sess.portfolioId,
    portfolioName: sess.portfolioName,
    projectId: sess.projectId,
    projectName: sess.projectName,
    roleId: sess.roleId,
    roleName: sess.roleName,
    userId: sess.userId,
    userName: sess.userName,
    parentToken: sess.parentToken,
  };

  const sess2 = getSessionInfo();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'Leap',
    'Accept': 'application/json, text/plain, */*',
  };

  if (sess2.projectId) {
    headers['Project'] = String(sess2.projectId);
    headers['ProjectName'] = sess2.projectName;
  }

  if (sess2.roleId) {
    headers['roleId'] = String(sess2.roleId);
    headers['roleName'] = sess2.roleName;
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

  const sess = getSessionInfo();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'Leap',
    'Accept': 'application/json, text/plain, */*',
  };


  if (sess.projectId) {
    headers['Project'] = String(sess.projectId);
    headers['ProjectName'] = sess.projectName || sess.organization
  }

  if (sess.roleId) {
    headers['roleId'] = String(sess.roleId);
    headers['roleName'] = sess.roleName;
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

export type ExportToEssedumParams = {
  flowId: string;
  alias?: string;
  description?: string;
  type?: string;
  interfaceType?: string;
  isTemplate?: boolean;
  groups?: any[];
  token?: string;
};

export async function export_to_essedum(params: ExportToEssedumParams) {
  const { flowId, alias, description, type, interfaceType, isTemplate, groups, token } = params;
  const url = '/api/v1/essedum/export';

  const payload = {
    flow_id: flowId,
    alias,
    description,
    type: type || 'AIAgent',
    interface_type: interfaceType || 'pipeline-agent',
    is_template: isTemplate || false,
    groups: groups || [],
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
  };

  // Add token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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

// ========== EXPORT_LANG_ESSEDUM Button APIs ==========
// These functions route through Langflow backend to Essedum backend

export type ExportLangEssedumCreateParams = CreatePipelineParams;

export async function export_lang_essedum_create_pipeline(params: ExportLangEssedumCreateParams) {
  const { alias, description, type, interfaceType, isTemplate, jsonContent, groups, token } = params;
  const url = '/api/v1/essedum/create-pipeline';

  const sess = getSessionInfo();
  const payload = {
    alias,
    description,
    type,
    interface_type: interfaceType || 'pipeline-agent',
    is_template: isTemplate || false,
    json_content: jsonContent,
    groups: groups || [],
    // Include session info for backend to use
    session_info: {
      organization: sess.organization,
      portfolio_id: sess.portfolioId,
      portfolio_name: sess.portfolioName,
      project_id: sess.projectId,
      project_name: sess.projectName,
      role_id: sess.roleId,
      role_name: sess.roleName,
      user_id: sess.userId,
      user_name: sess.userName,
      parent_token: sess.parentToken,
    }
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'Leap',
    'Accept': 'application/json, text/plain, */*',
  };

  if (sess.projectId) {
    headers['Project'] = String(sess.projectId);
    headers['ProjectName'] = sess.projectName;
  }

  if (sess.roleId) {
    headers['roleId'] = String(sess.roleId);
    headers['roleName'] = sess.roleName;
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

export type ExportLangEssedumUpdateParams = UpdatePipelineParams;

export async function export_lang_essedum_update_pipeline(params: ExportLangEssedumUpdateParams) {
  const { cid, alias, name, description, jsonContent, type, organization, interfacetype, isTemplate, token } = params;
  const url = '/api/v1/essedum/update-pipeline';

  const sess = getSessionInfo();
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
    // Include session info for backend to use
    session_info: {
      organization: sess.organization,
      portfolio_id: sess.portfolioId,
      portfolio_name: sess.portfolioName,
      project_id: sess.projectId,
      project_name: sess.projectName,
      role_id: sess.roleId,
      role_name: sess.roleName,
      user_id: sess.userId,
      user_name: sess.userName,
      parent_token: sess.parentToken,
    }
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'Leap',
    'Accept': 'application/json, text/plain, */*',
  };

  if (sess.projectId) {
    headers['Project'] = String(sess.projectId);
    headers['ProjectName'] = sess.projectName || sess.organization;
  }

  if (sess.roleId) {
    headers['roleId'] = String(sess.roleId);
    headers['roleName'] = sess.roleName;
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

export type ExportLangEssedumCreateNativeParams = CreateNativeFileParams;

export async function export_lang_essedum_create_native_file(params: ExportLangEssedumCreateNativeParams) {
  const { pipelineName, organization, fileName, fileType, scriptFormData, token } = params;
  const url = '/api/v1/essedum/create-native-file';

  const sess = getSessionInfo();
  
  // Create a new FormData with session info included
  const enhancedFormData = new FormData();
  
  // Copy all existing form data
  Array.from(scriptFormData.entries()).forEach(([key, value]) => {
    enhancedFormData.append(key, value);
  });
  
  // Add additional parameters
  enhancedFormData.append('pipelineName', pipelineName);
  enhancedFormData.append('organization', organization);
  enhancedFormData.append('fileName', fileName);
  enhancedFormData.append('fileType', fileType);
  
  // Add session info as JSON string
  const sessionInfo = {
    organization: sess.organization,
    portfolio_id: sess.portfolioId,
    portfolio_name: sess.portfolioName,
    project_id: sess.projectId,
    project_name: sess.projectName,
    role_id: sess.roleId,
    role_name: sess.roleName,
    user_id: sess.userId,
    user_name: sess.userName,
    parent_token: sess.parentToken,
  };
  enhancedFormData.append('sessionInfo', JSON.stringify(sessionInfo));

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Origin': window.location.origin,
    'Referer': window.location.href,
    'X-Requested-With': 'Leap',
    'User-Agent': navigator.userAgent,
  };

  headers['Project'] = sess.projectId;
  headers['ProjectName'] = sess.projectName;
  headers['roleId'] = sess.roleId;
  headers['roleName'] = sess.roleName;
  
  // Don't set Content-Type - let browser handle multipart boundary
  const resp = await fetch(url, {
    method: "POST",
    body: enhancedFormData,
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

export default {
  create_pipeline,
  create_native_file,
  update_pipeline,
  export_to_essedum,
  // EXPORT_LANG_ESSEDUM button functions
  export_lang_essedum_create_pipeline,
  export_lang_essedum_update_pipeline,
  export_lang_essedum_create_native_file,
};