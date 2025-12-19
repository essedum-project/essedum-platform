import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import * as fetchIntercept from "fetch-intercept";
import { useEffect } from "react";
import { Cookies } from "react-cookie";
import { IS_AUTO_LOGIN } from "@/constants/constants";
import { baseURL } from "@/customization/constants";
import { useCustomApiHeaders } from "@/customization/hooks/use-custom-api-headers";
import { customGetAccessToken } from "@/customization/utils/custom-get-access-token";
import useAuthStore from "@/stores/authStore";
import { useUtilityStore } from "@/stores/utilityStore";
import { BuildStatus, type EventDeliveryType } from "../../constants/enums";
import useAlertStore from "../../stores/alertStore";
import useFlowStore from "../../stores/flowStore";
import { checkDuplicateRequestAndStoreRequest } from "./helpers/check-duplicate-requests";
import { useLogout, useRefreshAccessToken } from "./queries/auth";

// Create a new Axios instance
const api: AxiosInstance = axios.create({
  baseURL: baseURL,
});

const _cookies = new Cookies();
function ApiInterceptor() {
  const autoLogin = useAuthStore((state) => state.autoLogin);
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const accessToken = useAuthStore((state) => state.accessToken);
  const authenticationErrorCount = useAuthStore(
    (state) => state.authenticationErrorCount,
  );
  const setAuthenticationErrorCount = useAuthStore(
    (state) => state.setAuthenticationErrorCount,
  );

  const { mutate: mutationLogout } = useLogout();
  const { mutate: mutationRenewAccessToken } = useRefreshAccessToken();
  const isLoginPage = location.pathname.includes("login");
  const customHeaders = useCustomApiHeaders();

  const setHealthCheckTimeout = useUtilityStore(
    (state) => state.setHealthCheckTimeout,
  );

  useEffect(() => {
    const unregister = fetchIntercept.register({
      request: (url, config) => {
        const accessToken = customGetAccessToken();
        const parentToken = localStorage.getItem('baseParentToken');
        // IMPORTANT: This token MUST match SHARED_PARENT_TOKEN in exportModelService.ts 
        // In production, use: localStorage.getItem('baseParentToken')
        //const parentToken='eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJaLUdreGFzcW00WEs5eGdUYWhjdjZTQW5OWTgzSXBtai1SMnZna2hSVFNnIn0.eyJleHAiOjE3NjYxMjQyMzksImlhdCI6MTc2NjEyMzkzOSwiYXV0aF90aW1lIjoxNzY2MTE3MzkzLCJqdGkiOiJvbnJ0YWM6NWIyNmE3YWItMjRhNi00ZTg5LTljMzQtMGI3MjY0MDc0ZTZjIiwiaXNzIjoiaHR0cHM6Ly9haXBsYXRmb3JtLmF6LmFkLmlkZW1vLXBwYy5jb206ODQ0My9yZWFsbXMvRVNTRURVTSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIwODFlYWZhZi00NmYwLTRmMTgtYjAxZS0xZjI0NGFiYzc5MzUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJlc3NlZHVtLTQ1Iiwic2lkIjoiY2NlZTZmOTgtYzJhZi00OWE2LTg1NTEtNDZmZmFmMTgyYjRhIiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2Vzc2VkdW0uYXouYWQuaWRlbW8tcHBjLmNvbSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1lc3NlZHVtIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJtYW1pbmRsYSB5YWRhdiIsInByZWZlcnJlZF91c2VybmFtZSI6Im1hbWluZGxhLnlhZGF2IiwiZ2l2ZW5fbmFtZSI6Im1hbWluZGxhIiwiZmFtaWx5X25hbWUiOiJ5YWRhdiIsImVtYWlsIjoibWFtaW5kbGEueWFkYXZAaW5mb3N5cy5jb20ifQ.VPYjnVV5a82xXfGn7bwiLMpA-tqFa4PjOdJDnnXpR_hnapX5RYgYMoh4qWuldf83UP_I8V4Oqj6nAGcNS9n6XmxnD1tzll_xHBHw5ukUGTiq7xFeZjkgSvGovujtPUL-gUoQs0Xqtdqfh0A4hV0ifOBtCLC7_UZ6Xb2SLx_a4oL910T-4CV7xVxjJ_8mb0zYARc2xFg5IrqvlDkSNDZCTxVs7PEzs14ZFAPb5xo-lj6Gq3akeTpdJr4SxY71ZVrxQnnjLb0HuZ2f9NQZJL6XssV-GSW8P1ZnQx-xm6FQ1XnsJJiV_gOgIztJjejbgDKXI5sZpGzLQ55NKdZMyUx1tQ';

        // Check if this is an AIP API call (relative or absolute URL)
        const isAipApi = url.includes('/api/aip') || 
                        url.includes('essedum.az.ad.idemo-ppc.com/api/aip');

        if (!isExternalURL(url) || isAipApi) {
          // Check if it's an AIP API (streaming services, file operations, etc.)
          if (isAipApi) {
            // Use parent token for AIP APIs
            if (parentToken) {
              config.headers["Authorization"] = `Bearer ${parentToken}`;
              config.headers["access-token"] = parentToken;
            }
            
            // Add project/role headers from parent session
            const parentSessionDetails = sessionStorage.getItem('parentSessionDetails');
            if (parentSessionDetails) {
              try {
                const sessionData = JSON.parse(parentSessionDetails);
                if (sessionData.Project) config.headers['Project'] = sessionData.Project;
                if (sessionData.ProjectName) config.headers['ProjectName'] = sessionData.ProjectName;
                if (sessionData.roleId) config.headers['roleId'] = sessionData.roleId;
                if (sessionData.roleName) config.headers['roleName'] = sessionData.roleName;
                if (sessionData.userId) config.headers['userId'] = sessionData.userId;
                if (sessionData.userName) config.headers['userName'] = sessionData.userName;
              } catch (e) {
                console.warn('Failed to parse parentSessionDetails:', e);
              }
            }
          } else {
            // Use access token for other internal APIs (like langflow)
            if (accessToken && !isAuthorizedURL(config?.url)) {
              config.headers["Authorization"] = `Bearer ${accessToken}`;
            }
          }

          if (!isExternalURL(url)) {
            for (const [key, value] of Object.entries(customHeaders)) {
              config.headers[key] = value;
            }
          }
        }

        // For external URLs, use parent token
        if (isExternalURL(url)) {
          if (parentToken) {
            config.headers["Authorization"] = `Bearer ${parentToken}`;
          }
        }

        return [url, config];
      },
    });

    const interceptor = api.interceptors.response.use(
      (response) => {
        setHealthCheckTimeout(null);
        return response;
      },
      async (error: AxiosError) => {
        const isAuthenticationError =
          error?.response?.status === 403 || error?.response?.status === 401;

        const shouldRetryRefresh =
          (isAuthenticationError && !IS_AUTO_LOGIN) ||
          (isAuthenticationError && !autoLogin && autoLogin !== undefined);

        if (shouldRetryRefresh) {
          if (
            error?.config?.url?.includes("github") ||
            error?.config?.url?.includes("public")
          ) {
            return Promise.reject(error);
          }
          const stillRefresh = checkErrorCount();
          if (!stillRefresh) {
            return Promise.reject(error);
          }

          await tryToRenewAccessToken(error);

          const accessToken = customGetAccessToken();

          if (!accessToken && error?.config?.url?.includes("login")) {
            return Promise.reject(error);
          }
        }

        await clearBuildVerticesState(error);

        if (!isAuthenticationError) {
          return Promise.reject(error);
        }
      },
    );

    const isAuthorizedURL = (url) => {
      const authorizedDomains = [
        "https://raw.githubusercontent.com/langflow-ai/langflow_examples/main/examples",
        "https://api.github.com/repos/langflow-ai/langflow_examples/contents/examples",
        "https://api.github.com/repos/langflow-ai/langflow",
        "auto_login",
      ];

      const authorizedEndpoints = ["auto_login"];

      try {
        const parsedURL = new URL(url);
        const isDomainAllowed = authorizedDomains.some(
          (domain) => parsedURL.origin === new URL(domain).origin,
        );
        const isEndpointAllowed = authorizedEndpoints.some((endpoint) =>
          parsedURL.pathname.includes(endpoint),
        );

        return isDomainAllowed || isEndpointAllowed;
      } catch (_e) {
        // Invalid URL
        return false;
      }
    };

    // Check for external url which we don't want to add custom headers to
    const isExternalURL = (url: string): boolean => {
      const EXTERNAL_DOMAINS = [
        "https://raw.githubusercontent.com",
        "https://api.github.com",
        "https://api.segment.io",
        "https://cdn.sprig.com",
      ];

      try {
        const parsedURL = new URL(url);
        return EXTERNAL_DOMAINS.some((domain) => parsedURL.origin === domain);
      } catch (_e) {
        return false;
      }
    };

    // Request interceptor to add access token to every request
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        const controller = new AbortController();
        try {
          checkDuplicateRequestAndStoreRequest(config);
        } catch (e) {
          const error = e as Error;
          controller.abort(error.message);
          console.error(error.message);
        }

        const accessToken = customGetAccessToken();
        // IMPORTANT: This token MUST match SHARED_PARENT_TOKEN in exportModelService.ts
        // In production, use: localStorage.getItem('baseParentToken')
        const parentToken = localStorage.getItem("baseParentToken");

        // Check if this is an AIP API call (relative or absolute URL)
        const isAipApi = config?.url?.includes('/api/aip') || 
                        config?.url?.includes('essedum.az.ad.idemo-ppc.com/api/aip');

        // Determine which token to use based on API type
        if (isAipApi) {
          // Use parent token for AIP APIs (streaming services, file operations, etc.)
          if (parentToken) {
            config.headers["Authorization"] = `Bearer ${parentToken}`;
            config.headers["access-token"] = parentToken;
          }
          
          // Add project/role headers from parent session for AIP calls
          const parentSessionDetails = sessionStorage.getItem('parentSessionDetails');
          if (parentSessionDetails) {
            try {
              const sessionData = JSON.parse(parentSessionDetails);
              if (sessionData.Project) config.headers['Project'] = sessionData.Project;
              if (sessionData.ProjectName) config.headers['ProjectName'] = sessionData.ProjectName;
              if (sessionData.roleId) config.headers['roleId'] = sessionData.roleId;
              if (sessionData.roleName) config.headers['roleName'] = sessionData.roleName;
              if (sessionData.userId) config.headers['userId'] = sessionData.userId;
              if (sessionData.userName) config.headers['userName'] = sessionData.userName;
            } catch (e) {
              console.warn('Failed to parse parentSessionDetails:', e);
            }
          }
          
          // Enable credentials for AIP requests to forward cookies
          config.withCredentials = true;
        } else if (isExternalURL(config?.url || "")) {
          // Use parent token for other external APIs
          if (parentToken) {
            config.headers["Authorization"] = `Bearer ${parentToken}`;
          }
        } else {
          // Use access token for other internal APIs (like langflow)
          if (accessToken && !isAuthorizedURL(config?.url)) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
          }
        }

          

        const currentOrigin = window.location.origin;
        const requestUrl = new URL(config?.url as string, currentOrigin);

        const urlIsFromCurrentOrigin = requestUrl.origin === currentOrigin;
        if (urlIsFromCurrentOrigin) {
          for (const [key, value] of Object.entries(customHeaders)) {
            config.headers[key] = value;
          }
        }

        return {
          ...config,
          signal: controller.signal,
        };
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    return () => {
      // Clean up the interceptors when the component unmounts
      api.interceptors.response.eject(interceptor);
      api.interceptors.request.eject(requestInterceptor);
      unregister();
    };
  }, [accessToken, setErrorData, customHeaders, autoLogin]);

  function checkErrorCount() {
    if (isLoginPage) return;

    setAuthenticationErrorCount(authenticationErrorCount + 1);

    if (authenticationErrorCount > 3) {
      setAuthenticationErrorCount(0);
      mutationLogout();
      return false;
    }

    return true;
  }

  async function tryToRenewAccessToken(error: AxiosError) {
    if (isLoginPage) return;
    if (error.config?.headers) {
      for (const [key, value] of Object.entries(customHeaders)) {
        error.config.headers[key] = value;
      }
    }
    mutationRenewAccessToken(undefined, {
      onSuccess: async () => {
        setAuthenticationErrorCount(0);
        await remakeRequest(error);
        setAuthenticationErrorCount(0);
      },
      onError: (error) => {
        console.error(error);
        mutationLogout();
        return Promise.reject("Authentication error");
      },
    });
  }

  async function clearBuildVerticesState(error) {
    if (error?.response?.status === 500) {
      const vertices = useFlowStore.getState().verticesBuild;
      useFlowStore
        .getState()
        .updateBuildStatus(vertices?.verticesIds ?? [], BuildStatus.BUILT);
      useFlowStore.getState().setIsBuilding(false);
    }
  }

  async function remakeRequest(error: AxiosError) {
    const originalRequest = error.config as AxiosRequestConfig;

    try {
      const accessToken = customGetAccessToken();

      if (!accessToken) {
        throw new Error("Access token not found in cookies");
      }

      // Modify headers in originalRequest
      originalRequest.headers = {
        ...(originalRequest.headers as Record<string, string>), // Cast to suppress TypeScript error
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.request(originalRequest);
      return response.data; // Or handle the response as needed
    } catch (err) {
      throw err; // Throw the error if request fails again
    }
  }

  return null;
}

export type StreamingRequestParams = {
  method: string;
  url: string;
  onData: (event: object) => Promise<boolean>;
  body?: object;
  onError?: (statusCode: number) => void;
  onNetworkError?: (error: Error) => void;
  buildController: AbortController;
  eventDeliveryConfig?: EventDeliveryType;
};

// Helper function to sanitize JSON strings
function sanitizeJsonString(jsonStr: string): string {
  // Replace NaN with null (valid JSON)
  return jsonStr
    .replace(/:\s*NaN\b/g, ": null")
    .replace(/\[\s*NaN\s*\]/g, "[null]")
    .replace(/,\s*NaN\s*,/g, ", null,")
    .replace(/,\s*NaN\s*\]/g, ", null]");
}

async function performStreamingRequest({
  method,
  url,
  onData,
  body,
  onError,
  onNetworkError,
  buildController,
}: StreamingRequestParams) {
  const headers = {
    "Content-Type": "application/json",
    // this flag is fundamental to ensure server stops tasks when client disconnects
    Connection: "close",
  };

  const params = {
    method: method,
    headers: headers,
    signal: buildController.signal,
  };
  if (body) {
    params["body"] = JSON.stringify(body);
  }
  let current: string[] = [];
  const textDecoder = new TextDecoder();

  try {
    const response = await fetch(url, params);
    if (!response.ok) {
      if (onError) {
        onError(response.status);
      } else {
        throw new Error("Error in streaming request.");
      }
    }
    if (response.body === null) {
      return;
    }
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const decodedChunk = textDecoder.decode(value);
      const all = decodedChunk.split("\n\n");
      for (const string of all) {
        if (string.endsWith("}")) {
          const allString = current.join("") + string;
          let data: object;
          try {
            const sanitizedJson = sanitizeJsonString(allString);
            data = JSON.parse(sanitizedJson);
            current = [];
          } catch (_e) {
            current.push(string);
            continue;
          }
          const shouldContinue = await onData(data);
          if (!shouldContinue) {
            buildController.abort();
            return;
          }
        } else {
          current.push(string);
        }
      }
    }
    if (current.length > 0) {
      const allString = current.join("");
      if (allString) {
        const sanitizedJson = sanitizeJsonString(allString);
        const data = JSON.parse(sanitizedJson);
        await onData(data);
      }
    }
  } catch (e: any) {
    if (onNetworkError) {
      onNetworkError(e);
    } else {
      throw e;
    }
  }
}

export { api, ApiInterceptor, performStreamingRequest };
